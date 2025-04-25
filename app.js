import express from 'express'; // Importa el framework Express para crear la API
import fs from 'fs'; // Importa el módulo de sistema de archivos de Node.js
import csv from 'csv-parser'; // Importa el módulo para leer archivos CSV

const app = express(); // Crea una instancia de una aplicación Express
const PORT = 7050; // Define el puerto en el que correrá el servidor
app.use(express.json()); // Middleware para poder leer datos JSON en requests

let datos = []; // Array donde se almacenarán los datos leídos del CSV
let columnas = []; // Array para guardar los nombres de las columnas del CSV

// Leer el archivo CSV al iniciar el servidor
fs.createReadStream('./data/VentasProductosSupermercados.csv') // Crea un stream de lectura desde el archivo CSV
  .pipe(csv()) // Pasa el stream por el parser CSV
  .on('data', (row) => { // Por cada fila leída del CSV...
    const fila = {};

    for (let clave in row) {
      const valor = row[clave].trim(); // Quita espacios al inicio y final

      if (clave === 'indice_tiempo') {
        // Si la clave es 'indice_tiempo', intenta convertir la fecha de MM/DD/YYYY a YYYY-MM-DD
        const partes = valor.split('/');
        if (partes.length === 3) {
          const [mes, dia, anio] = partes;
          fila[clave] = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        } else {
          fila[clave] = valor; // Si ya está en formato correcto, lo deja igual
        }
      } else {
        const num = parseFloat(valor); // Intenta convertir el valor a número
        fila[clave] = isNaN(num) ? valor : Math.round(num); // Si no es número, deja el texto; si es número, lo redondea
      }
    }

    datos.push(fila); // Agrega la fila procesada al array de datos
  })
  .on('end', () => {
    console.log('CSV cargado correctamente');
    if (datos.length > 0) {
      columnas = Object.keys(datos[0]); // Guarda los nombres de las columnas usando la primera fila
    }
  });

// Endpoint 1: Devuelve las ventas de un producto a lo largo del tiempo
app.get('/producto/:nombre', (req, res) => {
  const nombre = req.params.nombre; // Obtiene el nombre del producto desde la URL
  if (!columnas.includes(nombre)) {
    return res.status(404).json({ error: 'Producto no encontrado' }); // Si el producto no existe, error
  }

  // Crea un array con la fecha y las ventas para ese producto
  const resultado = datos.map(row => ({
    fecha: row.indice_tiempo,
    ventas: row[nombre]
  }));

  res.json({ producto: nombre, ventas: resultado }); // Devuelve el resultado como JSON
});

// Endpoint 2: Devuelve la cantidad de ventas por medio de pago en una fecha específica
app.get('/ventas/:fecha/:medio_pago', (req, res) => {
  const { fecha, medio_pago } = req.params;

  if (!columnas.includes(medio_pago)) {
    return res.status(404).json({ error: 'Medio de pago no encontrado' });
  }

  const fila = datos.find(row => row.indice_tiempo === fecha); // Busca la fila por fecha

  if (!fila) {
    return res.status(404).json({ error: 'Fecha no encontrada. Usa formato YYYY-MM-DD' });
  }

  res.json({
    fecha: fila.indice_tiempo,
    medio_pago,
    cantidad: fila[medio_pago]
  });
});

// Endpoint 3: Devuelve la fecha con mayor venta total
app.get('/mayor-venta', (req, res) => {
  let maxVenta = 0;
  let fechaMax = '';

  datos.forEach(row => {
    // Suma las ventas de todas las columnas (excepto la fecha)
    const total = columnas.reduce((sum, col) => {
      return col !== 'indice_tiempo' && typeof row[col] === 'number' ? sum + row[col] : sum;
    }, 0);

    if (total > maxVenta) {
      maxVenta = total;
      fechaMax = row.indice_tiempo;
    }
  });

  res.json({ fecha: fechaMax, total_ventas: maxVenta });
});

// Endpoint 4: Devuelve la fecha con menor venta total
app.get('/menor-venta', (req, res) => {
  let minVenta = Infinity;
  let fechaMin = '';

  datos.forEach(row => {
    // Suma las ventas de todas las columnas (excepto la fecha)
    const total = columnas.reduce((sum, col) => {
      return col !== 'indice_tiempo' && typeof row[col] === 'number' ? sum + row[col] : sum;
    }, 0);

    if (total < minVenta) {
      minVenta = total;
      fechaMin = row.indice_tiempo;
    }
  });

  res.json({ fecha: fechaMin, total_ventas: minVenta });
});

// Endpoint 5: Agrega una nueva fila al CSV
app.post('/crear', (req, res) => {
  const nuevaFila = req.body; // Lee la nueva fila desde el cuerpo del request

  // Verifica que venga el campo de fecha
  if (!nuevaFila.indice_tiempo) {
    return res.status(400).json({ error: 'Falta el campo "indice_tiempo"' });
  }

  // Verifica que no exista ya una fila con esa misma fecha
  if (datos.some(row => row.indice_tiempo === nuevaFila.indice_tiempo)) {
    return res.status(409).json({ error: 'Ya existe una fila con esa fecha' });
  }

  // Completa la fila con 0 para las columnas que falten
  const filaCompleta = {}; // Crea un objeto vacío que representará la nueva fila completa

  for (const col of columnas) { // Recorre todas las columnas esperadas
    filaCompleta[col] = col === 'indice_tiempo' // Si la columna es 'indice_tiempo' (la fecha)
      ? nuevaFila[col] // Usa el valor enviado para la fecha
      : typeof nuevaFila[col] === 'number' ? nuevaFila[col] : 0; // Usa el valor si es número, si no, pone 0
  } 

  datos.push(filaCompleta); // Agrega la nueva fila a los datos en memoria

  // Prepara la fila en formato CSV para guardar en el archivo
  const filaCSV = columnas.map(col => filaCompleta[col]).join(',');

  // Agrega la nueva fila al final del archivo CSV
  fs.appendFile('./data/VentasProductosSupermercados.csv', `\n${filaCSV}`, err => {
    if (err) console.error('Error al guardar en CSV:', err);
  });

  // Responde con éxito
  res.status(201).json({ mensaje: 'Fila agregada correctamente', fila: filaCompleta });
});


// Endpoint 6: Elimina una fila por fecha
app.delete('/eliminar/:fecha', (req, res) => {
  const fecha = req.params.fecha;
  const index = datos.findIndex(row => row.indice_tiempo === fecha); // Busca la fila por fecha

  if (index === -1) {
    return res.status(404).json({ error: 'Fecha no encontrada. Usá el formato YYYY-MM-DD' });
  }

  const eliminada = datos.splice(index, 1)[0]; // Elimina la fila del array
  res.json({ mensaje: 'Fila eliminada correctamente', fila: eliminada });
});

// Inicia el servidor en el puerto indicado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});