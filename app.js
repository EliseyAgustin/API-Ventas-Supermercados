import express from 'express';
import fs from 'fs';
import csv from 'csv-parser';

const app = express();
const PORT = 7050;
app.use(express.json());

let datos = [];
let columnas = [];

// Leer el archivo CSV al iniciar el servidor
fs.createReadStream('./data/VentasProductosSupermercados.csv')
  .pipe(csv())
  .on('data', (row) => {
    const fila = {};

    for (let clave in row) {
      const valor = row[clave].trim();

      if (clave === 'indice_tiempo') {
        const partes = valor.split('/');
        if (partes.length === 3) {
          const [mes, dia, anio] = partes;
          fila[clave] = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        } else {
          fila[clave] = valor;
        }
      } else {
        const num = parseFloat(valor);
        fila[clave] = isNaN(num) ? valor : Math.round(num);
      }
    }

    datos.push(fila);
  })
  .on('end', () => {
    console.log('CSV cargado correctamente');
    if (datos.length > 0) {
      columnas = Object.keys(datos[0]);
    }
  });

// Endpoint 1: Devuelve las ventas de un producto a lo largo del tiempo
app.get('/producto/:nombre', (req, res) => {
  const nombre = req.params.nombre;
  if (!columnas.includes(nombre)) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const resultado = datos.map(row => ({
    fecha: row.indice_tiempo,
    ventas: row[nombre]
  }));

  res.json({ producto: nombre, ventas: resultado });
});

// Endpoint 2: Devuelve la cantidad de ventas por medio de pago en una fecha especifica
app.get('/ventas/:fecha/:medio_pago', (req, res) => {
  const { fecha, medio_pago } = req.params;

  if (!columnas.includes(medio_pago)) {
    return res.status(404).json({ error: 'Medio de pago no encontrado' });
  }

  const fila = datos.find(row => row.indice_tiempo === fecha);

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

  const columnasIgnorar = [
    'Ventas online',
    'Ventas salon',
    'Ventas efectivo',
    'Ventas tarjeta de debito',
    'Ventas tarjeta de credito',
    'Ventas totales',
    'indice_tiempo'
  ];

  datos.forEach(row => {
    const total = columnas.reduce((sum, col) => {
      if (!columnasIgnorar.includes(col) && typeof row[col] === 'number') {
        return sum + row[col];
      }
      return sum;
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

  const columnasIgnorar = [
    'Ventas online',
    'Ventas salon',
    'Ventas efectivo',
    'Ventas tarjeta de debito',
    'Ventas tarjeta de credito',
    'Ventas totales',
    'indice_tiempo'
  ];

  datos.forEach(row => {
    const total = columnas.reduce((sum, col) => {
      if (!columnasIgnorar.includes(col) && typeof row[col] === 'number') {
        return sum + row[col];
      }
      return sum;
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
  const nuevaFila = req.body;

  if (!nuevaFila.indice_tiempo) {
    return res.status(400).json({ error: 'Falta el campo "indice_tiempo"' });
  }

  if (datos.some(row => row.indice_tiempo === nuevaFila.indice_tiempo)) {
    return res.status(409).json({ error: 'Ya existe una fila con esa fecha' });
  }

  const filaCompleta = {};

  for (const col of columnas) {
    if (col === 'indice_tiempo') {
      filaCompleta[col] = nuevaFila[col];
    } else {
      if (typeof nuevaFila[col] === 'number') {
        filaCompleta[col] = nuevaFila[col];
      } else {
        filaCompleta[col] = 0;
      }
    }
  }

  datos.push(filaCompleta);

  const filaCSV = columnas.map(col => filaCompleta[col]).join(',');

  fs.appendFile('./data/VentasProductosSupermercados.csv', `\n${filaCSV}`, err => {
    if (err) console.error('Error al guardar en CSV:', err);
  });

  res.status(201).json({ mensaje: 'Fila agregada correctamente', fila: filaCompleta });
});

// Endpoint 6: Elimina una fila por fecha
app.delete('/eliminar/:fecha', (req, res) => {
  const fecha = req.params.fecha;
  const index = datos.findIndex(row => row.indice_tiempo === fecha);

  if (index === -1) {
    return res.status(404).json({ error: 'Fecha no encontrada. Usa el formato YYYY-MM-DD' });
  }

  const eliminada = datos.splice(index, 1)[0];

  const nuevoContenidoCSV = [
    columnas.join(','),
    ...datos.map(row => columnas.map(col => row[col]).join(','))
  ].join('\n');

  fs.writeFile('./data/VentasProductosSupermercados.csv', nuevoContenidoCSV, err => {
    if (err) {
      console.error('Error al escribir el archivo CSV:', err);
      return res.status(500).json({ error: 'Error al actualizar el archivo CSV' });
    }

    res.json({ mensaje: 'Fila eliminada correctamente', fila: eliminada });
  });
});

// Endpoint 7: Actualiza una fila existente por fecha
app.put('/actualizar/:fecha', (req, res) => {
  const fecha = req.params.fecha;
  const nuevaData = req.body;

  const index = datos.findIndex(row => row.indice_tiempo === fecha);
  if (index === -1) {
    return res.status(404).json({ error: 'Fecha no encontrada. Usa el formato YYYY-MM-DD' });
  }

  const filaExistente = datos[index];
  const filaActualizada = {};

  for (const col of columnas) {
    if (col === 'indice_tiempo') {
      filaActualizada[col] = fecha;
    } else {
      const nuevoValor = nuevaData[col];
      filaActualizada[col] = typeof nuevoValor === 'number' ? nuevoValor : filaExistente[col];
    }
  }

  datos[index] = filaActualizada;

  const csvContent = [
    columnas.join(','),
    ...datos.map(row => columnas.map(col => row[col]).join(','))
  ].join('\n');

  fs.writeFile('./data/VentasProductosSupermercados.csv', csvContent, err => {
    if (err) {
      console.error('Error al actualizar el archivo CSV:', err);
      return res.status(500).json({ error: 'Error al escribir en el archivo CSV' });
    }

    res.json({ mensaje: 'Fila actualizada correctamente', fila: filaActualizada });
  });
});

// Inicia el servidor en el puerto indicado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});