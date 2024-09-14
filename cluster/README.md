# Web Service Distribuido

## Descripción del Proyecto

Este proyecto es una aplicación web distribuida que demuestra cómo gestionar un servicio web con alta disponibilidad y escalabilidad mediante la replicación de servidores. Utiliza un servidor HTTP replicado para manejar una mayor carga de peticiones, garantizando que el servicio permanezca disponible incluso en caso de fallos. La aplicación implementa un balanceo de carga que distribuye las solicitudes entre varios servidores para optimizar el rendimiento y la disponibilidad.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para construir el backend de la aplicación con JavaScript.
- **Hono.js**: Framework minimalista para construir aplicaciones web de alto rendimiento.
- **Docker Compose**: Herramienta para definir y ejecutar entornos Docker multi-contenedor de forma sencilla.
- **MySQL**: Sistema de gestión de bases de datos relacional utilizado para almacenar la información de las películas.
- **React**: Biblioteca JavaScript para construir la interfaz de usuario interactiva y dinámica.

## Funcionalidades de la Aplicación

La aplicación web permite realizar las siguientes operaciones en la base de datos "Movies":

- **Crear**: Los usuarios pueden registrar nuevas películas con un título, una calificación de 1 a 5, y comentarios opcionales.
- **Leer**: Se puede consultar el listado de películas y ver detalles sobre cada una.
- **Filtrar**: Filtrar las películas por su título.
- **Actualizar**: Los usuarios pueden modificar la información de una película existente.
- **Eliminar**: Permite eliminar películas del listado.

Además, la aplicación ofrece una sección para consultar cuántas peticiones ha gestionado cada servidor, proporcionando transparencia sobre la distribución de carga en el sistema.

## Arquitectura e Implementación

La arquitectura del sistema sigue un modelo distribuido con redundancia en los servidores para garantizar alta disponibilidad y balanceo de carga. Consta de los siguientes servicios:

- **3 Réplicas del Servidor Web**: Las solicitudes se distribuyen entre tres réplicas del servidor HTTP, que manejan las peticiones de forma simultánea para mejorar el rendimiento.
- **Balanceador de Carga**: Un cuarto servidor actúa como balanceador de carga, usando un algoritmo de round robin para distribuir equitativamente las peticiones entre los servidores.
- **Base de Datos Centralizada**: Todas las réplicas se conectan a una base de datos MySQL centralizada, que almacena la información de las películas, garantizando que todas las instancias del servidor tengan acceso a los mismos datos.

## Requisitos Previos

Asegúrate de tener los siguientes componentes instalados en tu sistema:

- **Docker** y **Docker Compose**
- **Node.js** y **npm**

## Instrucciones para Ejecutar el Proyecto

Sigue los siguientes pasos para ejecutar la aplicación en tu entorno local:

1. **Instala las dependencias del proyecto:**

   ```bash
   npm install
   ```

2. **Crea el directorio de datos de MySQL:**

   Crea un directorio llamado `.database/data` en la raíz del proyecto para almacenar los datos de la base de datos MySQL:

   ```bash
    mkdir -p .database/data
   ```

3. **Construye y ejecuta los contenedores:**

   Utiliza Docker Compose para levantar la infraestructura de la aplicación:

   ```bash
   docker-compose up
   ```

   Esto iniciará los contenedores de los servidores web y el balanceador de carga, así como el contenedor de la base de datos MySQL.

4. **Inicializa la base de datos:**

   Ejecuta el siguiente comando para crear las tablas necesarias en la base de datos MySQL:

   ```bash
   npm run db:init
   ```

5. **Accede a la aplicación:**

   Una vez que los contenedores estén corriendo, accede a la aplicación en tu navegador a través de la siguiente URL: [http://localhost:3000](http://localhost:3000)

6. **Opcional:** Consultar el estado del balanceador de carga:

   Puedes ver cuántas peticiones ha gestionado cada servidor en la siguiente URL: [http://localhost:3000/info](http://localhost:3000/info)

7. **Opcional:** Ingresa a la base de datos MySQL en la terminal:

   Para acceder a la base de datos MySQL desde la terminal, ejecuta el siguiente comando:

   ```bash
   npm run db:admin
   ```

8. **Opcional:** Detener y limpiar los contenedores:

   Para detener y eliminar los contenedores de Docker, ejecuta el siguiente comando:

   ```bash
   docker-compose down
   ```
