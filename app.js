import express from 'express';
import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 7050;

// Middleware para parsear JSON
app.use(express.json());
// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Datos cargados desde el CSV
let ventasData = [];

// Función para cargar los datos del CSV
const cargarDatos = () => {
  return new Promise((resolve, reject) => {
    const resultados = [];
    fs.createReadStream('./data/ventas-totales-supermercados-2.csv')
      .pipe(parse({ columns: true, delimiter: ',' }))
      .on('data', (data) => {
        // Convertir strings a números donde corresponda
        Object.keys(data).forEach(key => {
          if (key !== 'indice_tiempo') {
            data[key] = parseFloat(data[key]);
          }
        });
        resultados.push(data);
      })
      .on('end', () => {
        resolve(resultados);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Ruta principal - Página HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET - Obtener todos los registros
app.get('/api/ventas', (req, res) => {
  res.status(200).json({
    status: 'success',
    count: ventasData.length,
    data: ventasData
  });
});

// GET - Obtener un registro por fecha
app.get('/api/ventas/:fecha', (req, res) => {
  const fecha = req.params.fecha;
  const venta = ventasData.find(v => v.indice_tiempo === fecha);
  
  if (!venta) {
    return res.status(404).json({
      status: 'error',
      message: `No se encontró registro para la fecha ${fecha}`
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: venta
  });
});

// POST - Crear un nuevo registro
app.post('/api/ventas', (req, res) => {
  const nuevoRegistro = req.body;
  
  // Validación básica
  if (!nuevoRegistro.indice_tiempo) {
    return res.status(400).json({
      status: 'error',
      message: 'El campo indice_tiempo es obligatorio'
    });
  }
  
  // Verificar si ya existe un registro con esa fecha
  const existeRegistro = ventasData.some(v => v.indice_tiempo === nuevoRegistro.indice_tiempo);
  if (existeRegistro) {
    return res.status(400).json({
      status: 'error',
      message: `Ya existe un registro para la fecha ${nuevoRegistro.indice_tiempo}`
    });
  }
  
  ventasData.push(nuevoRegistro);
  
  res.status(201).json({
    status: 'success',
    message: 'Registro creado correctamente',
    data: nuevoRegistro
  });
});

// PUT - Actualizar un registro existente
app.put('/api/ventas/:fecha', (req, res) => {
  const fecha = req.params.fecha;
  const datosActualizados = req.body;
  
  const indice = ventasData.findIndex(v => v.indice_tiempo === fecha);
  
  if (indice === -1) {
    return res.status(404).json({
      status: 'error',
      message: `No se encontró registro para la fecha ${fecha}`
    });
  }
  
  // Mantener la fecha original
  datosActualizados.indice_tiempo = fecha;
  
  // Actualizar el registro
  ventasData[indice] = { ...ventasData[indice], ...datosActualizados };
  
  res.status(200).json({
    status: 'success',
    message: 'Registro actualizado correctamente',
    data: ventasData[indice]
  });
});

// DELETE - Eliminar un registro
app.delete('/api/ventas/:fecha', (req, res) => {
  const fecha = req.params.fecha;
  
  const indiceInicial = ventasData.length;
  ventasData = ventasData.filter(v => v.indice_tiempo !== fecha);
  
  if (ventasData.length === indiceInicial) {
    return res.status(404).json({
      status: 'error',
      message: `No se encontró registro para la fecha ${fecha}`
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: `Registro de fecha ${fecha} eliminado correctamente`
  });
});

// FILTROS ADICIONALES

// GET - Filtrar ventas por rango de fechas
app.get('/api/ventas/filtro/fecha', (req, res) => {
  const { desde, hasta } = req.query;
  
  if (!desde || !hasta) {
    return res.status(400).json({
      status: 'error',
      message: 'Los parámetros desde y hasta son obligatorios'
    });
  }
  
  const ventasFiltradas = ventasData.filter(v => 
    v.indice_tiempo >= desde && v.indice_tiempo <= hasta
  );
  
  res.status(200).json({
    status: 'success',
    count: ventasFiltradas.length,
    data: ventasFiltradas
  });
});

// GET - Obtener ventas por canal (online vs salón)
app.get('/api/ventas/filtro/canal', (req, res) => {
  const { canal } = req.query;
  
  if (!canal || (canal !== 'online' && canal !== 'salon')) {
    return res.status(400).json({
      status: 'error',
      message: 'El parámetro canal es obligatorio y debe ser "online" o "salon"'
    });
  }
  
  const resultado = ventasData.map(v => ({
    indice_tiempo: v.indice_tiempo,
    ventas: canal === 'online' ? v.canales_on_line : v.salon_ventas
  }));
  
  res.status(200).json({
    status: 'success',
    count: resultado.length,
    canal: canal,
    data: resultado
  });
});

// GET - Obtener ventas por medio de pago
app.get('/api/ventas/filtro/medio-pago', (req, res) => {
  const { medio } = req.query;
  const mediosValidos = ['efectivo', 'tarjetas_debito', 'tarjetas_credito', 'otros_medios'];
  
  if (!medio || !mediosValidos.includes(medio)) {
    return res.status(400).json({
      status: 'error',
      message: `El parámetro medio es obligatorio y debe ser uno de: ${mediosValidos.join(', ')}`
    });
  }
  
  const resultado = ventasData.map(v => ({
    indice_tiempo: v.indice_tiempo,
    ventas: v[medio]
  }));
  
  res.status(200).json({
    status: 'success',
    count: resultado.length,
    medio_pago: medio,
    data: resultado
  });
});

// GET - Obtener ventas por categoría de producto
app.get('/api/ventas/filtro/categoria', (req, res) => {
  const { categoria } = req.query;
  const categoriasValidas = [
    'bebidas', 'almacen', 'panaderia', 'lacteos', 'carnes', 
    'verduleria_fruteria', 'alimentos_preparados_rotiseria', 
    'articulos_limpieza_perfumeria', 'indumentaria_calzado_textiles_hogar', 
    'electronicos_articulos_hogar', 'otros'
  ];
  
  if (!categoria || !categoriasValidas.includes(categoria)) {
    return res.status(400).json({
      status: 'error',
      message: `El parámetro categoria es obligatorio y debe ser uno de: ${categoriasValidas.join(', ')}`
    });
  }
  
  const resultado = ventasData.map(v => ({
    indice_tiempo: v.indice_tiempo,
    ventas: v[categoria]
  }));
  
  res.status(200).json({
    status: 'success',
    count: resultado.length,
    categoria: categoria,
    data: resultado
  });
});

// GET - Estadísticas generales
app.get('/api/estadisticas', (req, res) => {
  if (ventasData.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'No hay datos disponibles para calcular estadísticas'
    });
  }
  
  // Calcular totales por canal
  const totalOnline = ventasData.reduce((sum, v) => sum + v.canales_on_line, 0);
  const totalSalon = ventasData.reduce((sum, v) => sum + v.salon_ventas, 0);
  
  // Calcular totales por medio de pago
  const totalEfectivo = ventasData.reduce((sum, v) => sum + v.efectivo, 0);
  const totalDebito = ventasData.reduce((sum, v) => sum + v.tarjetas_debito, 0);
  const totalCredito = ventasData.reduce((sum, v) => sum + v.tarjetas_credito, 0);
  const totalOtrosMedios = ventasData.reduce((sum, v) => sum + v.otros_medios, 0);
  
  // Calcular ventas máximas y mínimas
  const ventasMaximas = Math.max(...ventasData.map(v => v.ventas_precios_corrientes));
  const ventasMinimas = Math.min(...ventasData.map(v => v.ventas_precios_corrientes));
  
  // Fecha con mayores ventas
  const fechaMayoresVentas = ventasData.find(v => v.ventas_precios_corrientes === ventasMaximas).indice_tiempo;
  
  res.status(200).json({
    status: 'success',
    data: {
      total_registros: ventasData.length,
      canales: {
        online: totalOnline,
        salon: totalSalon,
        porcentaje_online: (totalOnline / (totalOnline + totalSalon) * 100).toFixed(2) + '%'
      },
      medios_pago: {
        efectivo: totalEfectivo,
        debito: totalDebito,
        credito: totalCredito,
        otros: totalOtrosMedios
      },
      ventas: {
        maximas: ventasMaximas,
        minimas: ventasMinimas,
        fecha_mayores_ventas: fechaMayoresVentas
      }
    }
  });
});

// Iniciar el servidor después de cargar los datos
const iniciarServidor = async () => {
  try {
    ventasData = await cargarDatos();
    console.log(`Datos cargados: ${ventasData.length} registros`);
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al cargar los datos:', error);
  }
};

iniciarServidor();

export default app;