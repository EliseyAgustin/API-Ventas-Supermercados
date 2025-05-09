# API de Ventas de Supermercados

Este proyecto es una aplicación que permite gestionar y consultar datos de ventas de supermercados a partir de un archivo CSV.

## Descripción

La aplicación implementa una API REST que permite:

- Ver las ventas de un producto específico a lo largo del tiempo
- Consultar la cantidad de ventas por medio de pago en una fecha específica
- Identificar la fecha con mayor venta total
- Identificar la fecha con menor venta total
- Crear nuevos registros de ventas
- Eliminar registros existentes
- Actualizar registros existentes

## Origen de los datos

Los datos utilizados provienen de un archivo CSV llamado `VentasProductosSupermercados.csv`. Este archivo contiene información detallada sobre ventas de supermercados, incluyendo:

- Ventas por categoría de productos (Carnes, Verduras, Frutas, etc.)
- Ventas por canal (online vs salón de ventas)
- Ventas por medio de pago (efectivo, tarjetas de débito, tarjetas de crédito)
- Ventas totales por fecha

## Cómo instalar y ejecutar

1. Descargar el código del proyecto.
2. Crear una carpeta llamada "data" en la raíz del proyecto.
3. Colocar el archivo CSV "VentasProductosSupermercados.csv" en la carpeta "data".
4. Instalar las dependencias con el comando:

   ```bash
   npm install
   ```

5. Iniciar la aplicación con el comando:

   ```bash
   npm start
   ```

6. La API estará disponible en [http://localhost:7050](http://localhost:7050).

## Endpoints de la API

### Operaciones disponibles

| Método | Endpoint                     | Descripción                                                  |
| :----- | :--------------------------- | :----------------------------------------------------------- |
| GET    | `/producto/:nombre`          | Ver las ventas de un producto a lo largo del tiempo          |
| GET    | `/ventas/:fecha/:medio_pago` | Ver la cantidad de ventas por medio de pago en una fecha específica |
| GET    | `/mayor-venta`               | Obtener la fecha con mayor venta total                       |
| GET    | `/menor-venta`               | Obtener la fecha con menor venta total                       |
| POST   | `/crear`                     | Crear un nuevo registro de ventas                            |
| DELETE | `/eliminar/:fecha`           | Eliminar un registro por fecha                               |
| PUT    | `/actualizar/:fecha`         | Actualizar un registro existente por fecha                   |

## Ejemplos de Uso

Aquí se muestran algunos ejemplos de cómo interactuar con la API:

### Obtener las ventas de un producto a lo largo del tiempo

- **Request:**
  ```
  GET http://localhost:7050/producto/Carnes
  ```
- **Respuesta (Éxito - 200 OK):**
  ```json
  {
    "producto": "Carnes",
    "ventas": [
      {
        "fecha": "2017-01-01",
        "ventas": 3434450
      },
      {
        "fecha": "2017-02-01",
        "ventas": 6089405
      },
      {
        "fecha": "2017-03-01",
        "ventas": 8018135
      },
      ...
    ]
  }
  ```

### Obtener ventas por medio de pago en una fecha específica

- **Request:**
  ```
  GET http://localhost:7050/ventas/2023-05-01/Ventas tarjeta de credito
  ```
- **Respuesta (Éxito - 200 OK):**
  ```json
  {
    "fecha": "2023-05-01",
    "medio_pago": "Ventas tarjeta de credito",
    "cantidad": 45678912
  }
  ```

### Obtener la fecha con mayor venta total

- **Request:**
  ```
  GET http://localhost:7050/mayor-venta
  ```
- **Respuesta (Éxito - 200 OK):**
  ```json
  {
    "fecha": "2023-12-01",
    "total_ventas": 168265522
  }
  ```

### Crear un nuevo registro de ventas

- **Request:**
  ```
  POST http://localhost:7050/crear
  ```
  ```json
  {
    "indice_tiempo": "2025-01-01",
    "Carnes": 5000000,
    "Verduras": 3000000,
    "Frutas": 2500000
  }
  ```
- **Respuesta (Éxito - 201 Created):**
  ```json
  {
    "mensaje": "Fila agregada correctamente",
    "fila": {
      "indice_tiempo": "2025-01-01",
      "Carnes": 5000000,
      "Verduras": 3000000,
      "Frutas": 2500000,
      "Bebidas": 0,
      ...
    }
  }
  ```

### Actualizar un registro existente

- **Request:**
  ```
  PUT http://localhost:7050/actualizar/2023-01-01
  ```
  ```json
  {
    "Carnes": 6000000,
    "Verduras": 3500000
  }
  ```
- **Respuesta (Éxito - 200 OK):**
  ```json
  {
    "mensaje": "Fila actualizada correctamente",
    "fila": {
      "indice_tiempo": "2023-01-01",
      "Carnes": 6000000,
      "Verduras": 3500000,
      ...
    }
  }
  ```

## Códigos de respuesta HTTP

La API utiliza los siguientes códigos de respuesta:

- `200`: OK - La petición se realizó correctamente
- `201`: Created - Se creó un nuevo recurso
- `400`: Bad Request - La petición es incorrecta
- `404`: Not Found - No se encontró el recurso solicitado
- `409`: Conflict - Ya existe un recurso con esos datos
- `500`: Internal Server Error - Error interno del servidor

## Estructura del CSV

El archivo CSV de origen (`VentasProductosSupermercados.csv`) contiene los siguientes campos como columnas:

- `indice_tiempo`: Fecha en formato `YYYY-MM-DD`
- `Carnes`: Ventas de productos cárnicos
- `Verduras`: Ventas de verduras
- `Frutas`: Ventas de frutas
- `Bebidas`: Ventas de bebidas
- `Lacteos`: Ventas de productos lácteos
- `Panificados`: Ventas de productos de panadería
- `Limpieza`: Ventas de productos de limpieza
- `Perfumeria`: Ventas de productos de perfumería
- `Alimentos Secos`: Ventas de alimentos secos
- `Congelados`: Ventas de productos congelados
- `Fiambres`: Ventas de fiambres
- `Ventas online`: Total de ventas realizadas online
- `Ventas salon`: Total de ventas realizadas en salón
- `Ventas efectivo`: Total de ventas pagadas en efectivo
- `Ventas tarjeta de debito`: Total de ventas pagadas con tarjeta de débito
- `Ventas tarjeta de credito`: Total de ventas pagadas con tarjeta de crédito
- `Ventas totales`: Suma total de todas las ventas

## Funcionamiento interno

La aplicación realiza las siguientes operaciones al iniciarse:

1. Carga el archivo CSV en memoria
2. Formatea las fechas en formato estándar (YYYY-MM-DD)
3. Convierte los valores numéricos
4. Expone los endpoints para consultar y manipular los datos

Al realizar operaciones de escritura (crear, actualizar, eliminar), los cambios se guardan en el archivo CSV para mantener la persistencia de los datos.

## Tecnologías utilizadas

- Node.js
- Express.js
- csv-parser
- fs (File System)

## Integrantes del grupo

- Agustin Elisey Larco
- Juan Babarro
- Nahuel Nauza
- Nicolas Villanueva