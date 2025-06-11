import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const app = express();
const PORT = 7050;
app.use(express.json());
app.use(express.static('public'));

// Conectar a la base de datos
const dbPath = './data/ventas';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Alimentos (
    id_alimento INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS Ventas (
    id_venta INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    id_alimento INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    FOREIGN KEY (id_alimento) REFERENCES Alimentos(id_alimento)
  )`);
});

function cargarDatosCSV() {
  db.get('SELECT COUNT(*) as count FROM Ventas', (err, row) => {
    if (err || row.count > 0) return;

    console.log('Cargando y transformando datos desde el CSV...');
    const categoriasAlimentos = ['Carnes', 'Verduras', 'Frutas', 'Bebidas', 'Lacteos', 'Panificados', 'Limpieza', 'Perfumeria', 'Alimentos Secos', 'Congelados', 'Fiambres'];
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      const stmtAlimentos = db.prepare('INSERT OR IGNORE INTO Alimentos (nombre, descripcion) VALUES (?, ?)');
      categoriasAlimentos.forEach(cat => stmtAlimentos.run(cat, `Categoría: ${cat}`));
      stmtAlimentos.finalize();

      db.all('SELECT id_alimento, nombre FROM Alimentos', (err, alimentos) => {
        if (err) { db.run('ROLLBACK'); return; }
        const mapaAlimentos = alimentos.reduce((acc, alim) => ({...acc, [alim.nombre]: alim.id_alimento}), {});
        const stmtVentas = db.prepare('INSERT INTO Ventas (fecha, id_alimento, cantidad) VALUES (?, ?, ?)');
        fs.createReadStream('./data/VentasProductosSupermercados.csv')
          .pipe(csv())
          .on('data', (row) => {
            for (const categoria in mapaAlimentos) {
              if (row[categoria]) {
                stmtVentas.run(row.indice_tiempo, mapaAlimentos[categoria], parseInt(row[categoria], 10));
              }
            }
          })
          .on('end', () => {
            stmtVentas.finalize(() => {
              db.run('COMMIT');
              console.log('Carga de datos completada.');
            });
          });
      });
    });
  });
}

// GET: Obtener todos los tipos de alimentos
app.get('/api/alimentos', (req, res) => {
  db.all('SELECT * FROM Alimentos ORDER BY nombre', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al consultar alimentos' });
    res.json({ data: rows });
  });
});

// GET: Obtener todas las ventas
app.get('/api/ventas', (req, res) => {
  const sql = `
    SELECT V.id_venta, V.fecha, A.nombre as producto, V.cantidad 
    FROM Ventas V JOIN Alimentos A ON V.id_alimento = A.id_alimento
    ORDER BY V.fecha, producto
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al consultar ventas' });
    res.json({ data: rows });
  });
});

// GET: Filtrar ventas por fecha específica
app.get('/api/ventas/fecha/:fecha', (req, res) => {
  const { fecha } = req.params;
  const sql = `
    SELECT V.id_venta, V.fecha, A.nombre as producto, V.cantidad 
    FROM Ventas V JOIN Alimentos A ON V.id_alimento = A.id_alimento
    WHERE V.fecha = ? ORDER BY producto
  `;
  db.all(sql, [fecha], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al consultar ventas por fecha' });
    if (!rows.length) return res.status(404).json({ mensaje: 'No se encontraron ventas para esa fecha.' });
    res.json({ data: rows });
  });
});

// GET: Filtrar ventas por rango de fechas
app.get('/api/ventas/rango_fecha', (req, res) => {
  const { desde, hasta } = req.query;
  if (!desde || !hasta) return res.status(400).json({ error: 'Se requieren fechas "desde" y "hasta".' });
  const sql = `
    SELECT V.id_venta, V.fecha, A.nombre as producto, V.cantidad 
    FROM Ventas V JOIN Alimentos A ON V.id_alimento = A.id_alimento
    WHERE V.fecha BETWEEN ? AND ? ORDER BY V.fecha, producto
  `;
  db.all(sql, [desde, hasta], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al consultar ventas por rango de fecha' });
    res.json({ data: rows });
  });
});


// POST: Agregar una nueva venta
app.post('/api/ventas', (req, res) => {
  const { fecha, id_alimento, cantidad } = req.body;
  if (!fecha || !id_alimento || cantidad == null) return res.status(400).json({ error: 'Faltan datos.' });
  const sql = 'INSERT INTO Ventas (fecha, id_alimento, cantidad) VALUES (?, ?, ?)';
  db.run(sql, [fecha, id_alimento, cantidad], function(err) {
    if (err) return res.status(500).json({ error: 'Error al crear la venta' });
    res.status(201).json({ mensaje: 'Venta agregada', id_venta: this.lastID, ...req.body });
  });
});

// PUT: Actualizar una venta por su ID
app.put('/api/ventas/:id', (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;
    if (cantidad == null) return res.status(400).json({ error: 'Se requiere la nueva cantidad.' });
    const sql = 'UPDATE Ventas SET cantidad = ? WHERE id_venta = ?';
    db.run(sql, [cantidad, id], function(err) {
        if (err) return res.status(500).json({ error: `Error al actualizar la venta ${id}`});
        if (this.changes === 0) return res.status(404).json({ error: `Venta con ID ${id} no encontrada.`});
        res.json({ mensaje: 'Venta actualizada', cambios: this.changes });
    });
});

// DELETE: Eliminar una venta por su ID
app.delete('/api/ventas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Ventas WHERE id_venta = ?';
    db.run(sql, id, function(err) {
        if (err) return res.status(500).json({ error: `Error al eliminar la venta ${id}`});
        if (this.changes === 0) return res.status(404).json({ error: `Venta con ID ${id} no encontrada.`});
        res.json({ mensaje: 'Venta eliminada', cambios: this.changes });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  cargarDatosCSV();
});