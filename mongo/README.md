# Cluster de Réplicas en MongoDB

Este proyecto implementa un sistema de batallas entre Pokémon utilizando una base de datos distribuida en MongoDB. El objetivo principal es demostrar cómo se gestiona una base de datos distribuida en un clúster de réplicas, a la vez que se implementa un bot que simula batallas entre Pokémon y almacena los resultados en la base de datos.

## Tecnologías Utilizadas

- **MongoDB**: Base de datos NoSQL orientada a documentos, utilizada para almacenar la información de los Pokémon y los resultados de las batallas.
- **Node.js**: Entorno de ejecución utilizado para desarrollar el bot que maneja las batallas.
- **TypeScript**: Lenguaje utilizado para desarrollar el bot, aprovechando el tipado estático.
- **Docker Compose**: Utilizado para levantar el clúster de réplicas de MongoDB en un entorno multi-contenedor.

## Requisitos

- **Docker** y **Docker Compose** instalados en el sistema.
- **Node.js** y **npm** instalados.

## Instrucciones para Correr el Proyecto

1. **Instalar las dependencias**

   Instala las dependencias del proyecto con `npm`:

   ```bash
   npm install
   ```

2. **Levantar el clúster de MongoDB con Docker Compose**

   Ejecuta el siguiente comando para iniciar el clúster:

   ```bash
    npm start run
   ```

   Esto iniciará tres contenedores de Docker, uno para cada instancia de MongoDB en el clúster de réplicas. Configurará el replica set de MongoDB y los nodos se conectarán entre sí. Y finalmente, rellenará la base de datos con los datos de los Pokémon.

   Puedes verificar que los contenedores están corriendo con el siguiente comando:

   ```bash
    docker compose ps
   ```

3. **Configurar el replica set de MongoDB**

   Ejecuta el siguiente comando para inicializar el replica set:

   ```bash
   npm start replica-set
   ```

4. **Cargar la base de datos con la información de los Pokémon**

   Ejecuta el script que inserta los datos de los Pokémon en la base de datos:

   ```bash
   npm start seed
   ```

5. **Ejecutar el bot de pruebas**

   Ejecuta el bot que realiza las pruebas correspondientes sobre la base de datos:

   ```bash
   npm start bot
   ```

6. **Verificar los resultados**

   Los resultados de las batallas se almacenarán en la base de datos MongoDB. Puedes conectarte a la base de datos para verificar los registros de las batallas.

   Para conectarte a la base de datos, ejecuta el siguiente comando:

   ```bash
   npm start mongosh
   ```
