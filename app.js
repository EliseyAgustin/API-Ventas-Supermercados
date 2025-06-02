import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const app = express();
const PORT = 7050;
app.use(express.json());
app.use(express.static('public'));

// Crear/conectar a la base de datos SQLite
const db = new sqlite3.Database('./data/ventas.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    indice_tiempo TEXT UNIQUE,
    Carnes INTEGER,
    Verduras INTEGER,
    Frutas INTEGER,
    Bebidas INTEGER,
    Lacteos INTEGER,
    Panificados INTEGER,
    Limpieza INTEGER,
    Perfumeria INTEGER,
    "Alimentos Secos" INTEGER,
    Congelados INTEGER,
    Fiambres INTEGER,
    "Ventas online" INTEGER,
    "Ventas salon" INTEGER,
    "Ventas efectivo" INTEGER,
    "Ventas tarjeta de debito" INTEGER,
    "Ventas tarjeta de credito" INTEGER,
    "Ventas totales" INTEGER
  )`);
});

// Función para cargar datos del CSV a SQLite
function cargarDatosCSV() {
  const csvPath = './data/VentasProductosSupermercados.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.log('Archivo CSV no encontrado');
    return;
  }

  // Verificar si ya hay datos
  db.get("SELECT COUNT(*) as count FROM ventas", (err, row) => {
    if (err) {
      console.error('Error verificando datos:', err);
      return;
    }

    if (row.count > 0) {
      console.log('Datos ya cargados en SQLite');
      return;
    }

    // Cargar datos del CSV
    console.log('Cargando datos del CSV a SQLite...');
    fs.createReadStream(csvPath)
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

        // Insertar en SQLite
        const columnas = Object.keys(fila).map(col => `"${col}"`).join(', ');
        const valores = Object.keys(fila).map(() => '?').join(', ');
        const sql = `INSERT OR IGNORE INTO ventas (${columnas}) VALUES (${valores})`;
        
        db.run(sql, Object.values(fila), (err) => {
          if (err) {
            console.error('Error insertando fila:', err);
          }
        });
      })
      .on('end', () => {
        console.log('CSV cargado correctamente en SQLite');
      });
  });
}

// Cargar datos al iniciar
cargarDatosCSV();

// Endpoint 1: Devuelve las ventas de un producto a lo largo del tiempo
app.get('/producto/:nombre', (req, res) => {
  const nombre = req.params.nombre;
  
  db.all(`SELECT indice_tiempo, "${nombre}" as ventas FROM ventas ORDER BY indice_tiempo`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const resultado = rows.map(row => ({
      fecha: row.indice_tiempo,
      ventas: row.ventas
    }));

    res.json({ producto: nombre, ventas: resultado });
  });
});

// Endpoint 2: Devuelve la cantidad de ventas por medio de pago en una fecha específica
app.get('/ventas/:fecha/:medio_pago', (req, res) => {
  const { fecha, medio_pago } = req.params;

  const sql = `SELECT indice_tiempo, "${medio_pago}" as cantidad FROM ventas WHERE indice_tiempo = ?`;
  
  db.get(sql, [fecha], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Fecha no encontrada. Usa formato YYYY-MM-DD' });
    }

    res.json({
      fecha: row.indice_tiempo,
      medio_pago,
      cantidad: row.cantidad
    });
  });
});

// Endpoint 3: Devuelve la fecha con mayor venta total
app.get('/mayor-venta', (req, res) => {
  const sql = `
    SELECT indice_tiempo, 
           (Carnes + Verduras + Frutas + Bebidas + Lacteos + Panificados + 
            Limpieza + Perfumeria + "Alimentos Secos" + Congelados + Fiambres) as total_ventas
    FROM ventas 
    ORDER BY total_ventas DESC 
    LIMIT 1
  `;
  
  db.get(sql, (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    res.json({ 
      fecha: row.indice_tiempo, 
      total_ventas: row.total_ventas 
    });
  });
});

// Endpoint 4: Devuelve la fecha con menor venta total
app.get('/menor-venta', (req, res) => {
  const sql = `
    SELECT indice_tiempo, 
           (Carnes + Verduras + Frutas + Bebidas + Lacteos + Panificados + 
            Limpieza + Perfumeria + "Alimentos Secos" + Congelados + Fiambres) as total_ventas
    FROM ventas 
    ORDER BY total_ventas ASC 
    LIMIT 1
  `;
  
  db.get(sql, (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    res.json({ 
      fecha: row.indice_tiempo, 
      total_ventas: row.total_ventas 
    });
  });
});

// Endpoint 5: Agrega una nueva fila
app.post('/crear', (req, res) => {
  const nuevaFila = req.body;

  if (!nuevaFila.indice_tiempo) {
    return res.status(400).json({ error: 'Falta el campo "indice_tiempo"' });
  }

  // Verificar si ya existe
  db.get('SELECT indice_tiempo FROM ventas WHERE indice_tiempo = ?', [nuevaFila.indice_tiempo], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    if (row) {
      return res.status(409).json({ error: 'Ya existe una fila con esa fecha' });
    }

    // Preparar datos con valores por defecto
    const filaCompleta = {
      indice_tiempo: nuevaFila.indice_tiempo,
      Carnes: nuevaFila.Carnes || 0,
      Verduras: nuevaFila.Verduras || 0,
      Frutas: nuevaFila.Frutas || 0,
      Bebidas: nuevaFila.Bebidas || 0,
      Lacteos: nuevaFila.Lacteos || 0,
      Panificados: nuevaFila.Panificados || 0,
      Limpieza: nuevaFila.Limpieza || 0,
      Perfumeria: nuevaFila.Perfumeria || 0,
      "Alimentos Secos": nuevaFila["Alimentos Secos"] || 0,
      Congelados: nuevaFila.Congelados || 0,
      Fiambres: nuevaFila.Fiambres || 0,
      "Ventas online": nuevaFila["Ventas online"] || 0,
      "Ventas salon": nuevaFila["Ventas salon"] || 0,
      "Ventas efectivo": nuevaFila["Ventas efectivo"] || 0,
      "Ventas tarjeta de debito": nuevaFila["Ventas tarjeta de debito"] || 0,
      "Ventas tarjeta de credito": nuevaFila["Ventas tarjeta de credito"] || 0,
      "Ventas totales": nuevaFila["Ventas totales"] || 0
    };

    const columnas = Object.keys(filaCompleta).map(col => `"${col}"`).join(', ');
    const valores = Object.keys(filaCompleta).map(() => '?').join(', ');
    const sql = `INSERT INTO ventas (${columnas}) VALUES (${valores})`;

    db.run(sql, Object.values(filaCompleta), function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error insertando datos' });
      }
      
      res.status(201).json({ 
        mensaje: 'Fila agregada correctamente', 
        fila: filaCompleta 
      });
    });
  });
});

// Endpoint 6: Elimina una fila por fecha
app.delete('/eliminar/:fecha', (req, res) => {
  const fecha = req.params.fecha;
  
  // Primero obtener la fila para devolverla
  db.get('SELECT * FROM ventas WHERE indice_tiempo = ?', [fecha], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Fecha no encontrada. Usa el formato YYYY-MM-DD' });
    }

    // Eliminar la fila
    db.run('DELETE FROM ventas WHERE indice_tiempo = ?', [fecha], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error eliminando datos' });
      }
      
      res.json({ 
        mensaje: 'Fila eliminada correctamente', 
        fila: row 
      });
    });
  });
});

// Endpoint 7: Actualiza una fila existente por fecha
app.put('/actualizar/:fecha', (req, res) => {
  const fecha = req.params.fecha;
  const nuevaData = req.body;

  // Verificar si existe
  db.get('SELECT * FROM ventas WHERE indice_tiempo = ?', [fecha], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Fecha no encontrada. Usa el formato YYYY-MM-DD' });
    }

    // Preparar datos actualizados
    const datosActualizados = { ...row };
    for (let campo in nuevaData) {
      if (campo !== 'indice_tiempo' && typeof nuevaData[campo] === 'number') {
        datosActualizados[campo] = nuevaData[campo];
      }
    }

    // Construir query de actualización
    const campos = Object.keys(datosActualizados)
      .filter(campo => campo !== 'indice_tiempo' && campo !== 'id')
      .map(campo => `"${campo}" = ?`)
      .join(', ');
    
    const valores = Object.keys(datosActualizados)
      .filter(campo => campo !== 'indice_tiempo' && campo !== 'id')
      .map(campo => datosActualizados[campo]);
    
    valores.push(fecha);

    const sql = `UPDATE ventas SET ${campos} WHERE indice_tiempo = ?`;

    db.run(sql, valores, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error actualizando datos' });
      }
      
      res.json({ 
        mensaje: 'Fila actualizada correctamente', 
        fila: datosActualizados 
      });
    });
  });
});

// Endpoint adicional: Obtener todas las ventas
app.get('/ventas', (req, res) => {
  db.all('SELECT * FROM ventas ORDER BY indice_tiempo', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    res.json({ data: rows });
  });
});

// Inicia el servidor en el puerto indicado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});