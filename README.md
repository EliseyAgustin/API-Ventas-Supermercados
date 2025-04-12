# API de Ventas de Supermercados

Este es un trabajo práctico para la materia de NodeJS. Consiste en una aplicación que permite gestionar y consultar datos de ventas de supermercados.

## Descripción

La aplicación permite:
- Ver todos los registros de ventas
- Buscar un registro por fecha
- Crear nuevos registros
- Actualizar registros existentes
- Eliminar registros
- Filtrar por rango de fechas, canal de venta y medio de pago
- Ver estadísticas generales

## Origen de los datos

Los datos utilizados provienen de un archivo CSV que contiene información sobre ventas de supermercados. Elegimos este dataset porque tiene muchos datos interesantes como:
- Ventas por canal (online vs salón de ventas)
- Ventas por medio de pago (efectivo, tarjetas, etc.)
- Ventas por categoría de productos

## Cómo instalar y ejecutar

1. Descargar el código
2. Crear una carpeta llamada "datos" en la raíz del proyecto
3. Colocar el archivo CSV en la carpeta "datos"
4. Instalar las dependencias con el comando:
   ```
   npm install
   ```
5. Iniciar la aplicación con el comando:
   ```
   npm start
   ```
6. Abrir el navegador en http://localhost:7050

## Estructura del proyecto

```
api-ventas-supermercados/
├── app.js                # Archivo principal de la aplicación
├── package.json          # Dependencias y scripts
├── datos/                # Carpeta para el archivo CSV
│   └── ventas-totales-supermercados-2.csv
└── public/               # Archivos estáticos
    ├── index.html        # Página web
    ├── estilos.css       # Estilos CSS
    └── script.js         # JavaScript para la página
```

## Endpoints de la API

### Operaciones básicas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/ventas | Ver todos los registros |
| GET | /api/ventas/:fecha | Ver un registro por fecha |
| POST | /api/ventas | Crear un nuevo registro |
| PUT | /api/ventas/:fecha | Actualizar un registro |
| DELETE | /api/ventas/:fecha | Eliminar un registro |

### Filtros adicionales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/filtro/fecha?desde=YYYY-MM-DD&hasta=YYYY-MM-DD | Filtrar por rango de fechas |
| GET | /api/filtro/canal?canal=online|salon | Filtrar por canal de venta |
| GET | /api/filtro/medio-pago?medio=efectivo|tarjetas_debito|tarjetas_credito|otros_medios | Filtrar por medio de pago |
| GET | /api/estadisticas | Ver estadísticas generales |

## Códigos de respuesta HTTP

La API utiliza los siguientes códigos de respuesta:

- 200: OK - La petición se realizó correctamente
- 201: Created - Se creó un nuevo recurso
- 400: Bad Request - La petición es incorrecta
- 404: Not Found - No se encontró el recurso solicitado

## Ejemplos de uso

### Ver todos los registros

```
GET /api/ventas
```

### Filtrar por rango de fechas

```
GET /api/filtro/fecha?desde=2022-01-01&hasta=2022-12-31
```

### Ver estadísticas generales

```
GET /api/estadisticas
```

## Integrantes del grupo

- [Nombre del estudiante 1]
- [Nombre del estudiante 2]
- [Nombre del estudiante 3]

## Conclusión

Este trabajo nos permitió aprender a crear una API con NodeJS y Express, y a trabajar con datos en formato CSV. También aprendimos a implementar los métodos HTTP (GET, POST, PUT, DELETE) y a devolver códigos de respuesta adecuados.
