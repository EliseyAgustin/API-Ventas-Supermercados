# API de Ventas de Supermercados

Este proyecto es una aplicacion que permite gestionar y consultar datos de ventas de supermercados a partir de un archivo CSV.

## Descripción

La aplicación permite:

-   Ver las ventas de un producto a lo largo del tiempo
-   Consultar la cantidad de ventas por medio de pago en una fecha específica
-   Identificar la fecha con mayor venta total
-   Identificar la fecha con menor venta total
-   Crear nuevos registros de ventas
-   Eliminar registros existentes

## Origen de los datos

Los datos utilizados provienen de un archivo CSV llamado `VentasProductosSupermercados.csv`. Este archivo contiene información detallada sobre ventas de supermercados, incluyendo:

-   Ventas por categoria de productos (Carnes, Verduras, Frutas, etc.)
-   Ventas por canal (online vs salón de ventas)
-   Ventas por medio de pago (efectivo, tarjetas de debito, tarjetas de credito)
-   Ventas totales por fecha

## Cómo instalar y ejecutar

1.  Descargar el código del proyecto.
2.  Crear una carpeta llamada "data" en la raíz del proyecto.
3.  Colocar el archivo CSV "VentasProductosSupermercados.csv" en la carpeta "data".
4.  Instalar las dependencias con el comando:

    ```bash
    npm install
    ```

5.  Iniciar la aplicación con el comando:

    ```bash
    npm start
    ```

6.  La API estará disponible en [http://localhost:7050](http://localhost:7050).

## Endpoints de la API

### Operaciones básicas

| Método | Endpoint                        | Descripción                                                  |
| :----- | :------------------------------ | :----------------------------------------------------------- |
| GET    | `/producto/:nombre`             | Ver las ventas de un producto a lo largo del tiempo          |
| GET    | `/ventas/:fecha/:medio_pago`    | Ver la cantidad de ventas por medio de pago en una fecha específica |
| GET    | `/mayor-venta`                  | Obtener la fecha con mayor venta total                       |
| GET    | `/menor-venta`                  | Obtener la fecha con menor venta total                       |
| POST   | `/crear`                        | Crear un nuevo registro de ventas                            |
| DELETE | `/eliminar/:fecha`              | Eliminar un registro por fecha                               |

## Ejemplos de Uso

Aquí se muestran algunos ejemplos de cómo interactuar con la API:

### Obtener las ventas de un producto a lo largo del tiempo

-   **Request:**
    ```
    GET http://localhost:7050/producto/Carnes
    ```
-   **Respuesta (Éxito - 200 OK):**
    ```json
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

### Obtener el año donde se hizo la cantidad mayor de ventas:

-   **Request:**
    ```
    GET http://localhost:7050/mayor-venta
    ```
-   **Respuesta (Éxito - 200 OK):**
    ```json
    {
    "fecha": "2025-01-01",
    "total_ventas": 168265522
    }
    ```

## Códigos de respuesta HTTP

La API utiliza los siguientes códigos de respuesta:

-   `200`: OK - La petición se realizó correctamente
-   `201`: Created - Se creó un nuevo recurso
-   `400`: Bad Request - La petición es incorrecta
-   `404`: Not Found - No se encontró el recurso solicitado
-   `409`: Conflict - Ya existe un recurso con esos datos
-   `500`: Internal Server Error - Error interno del servidor

## Estructura del CSV

El archivo CSV de origen (`VentasProductosSupermercados.csv`) debe contener los siguientes campos como columnas:

-   `indice_tiempo`: Fecha en formato `%Y-%m-%d`
-   `Carnes`: Ventas de productos cárnicos
-   `Verduras`: Ventas de verduras
-   `Frutas`: Ventas de frutas
-   `Bebidas`: Ventas de bebidas
-   `Lacteos`: Ventas de productos lácteos
-   `Panificados`: Ventas de productos de panadería
-   `Limpieza`: Ventas de productos de limpieza
-   `Perfumeria`: Ventas de productos de perfumería
-   `Alimentos Secos`: Ventas de alimentos secos
-   `Congelados`: Ventas de productos congelados
-   `Fiambres`: Ventas de fiambres
-   `Ventas online`: Total de ventas realizadas online
-   `Ventas salon`: Total de ventas realizadas en salón
-   `Ventas efectivo`: Total de ventas pagadas en efectivo
-   `Ventas tarjeta de debito`: Total de ventas pagadas con tarjeta de débito
-   `Ventas tarjeta de credito`: Total de ventas pagadas con tarjeta de crédito
-   `Ventas totales`: Suma total de todas las ventas

## Integrantes del grupo

- Agustin Elisey Larco
- Juan Babarro
- Nahuel Nauza
- Nicolas Villanueva

## Conclusión

Este trabajo nos permitio aprender a crear una API con NodeJS y Express, y a trabajar con datos en formato CSV. Tambien aprendimos a implementar los metodos HTTP (GET, POST, PUT, DELETE) y a devolver codigos de respuesta adecuados.
