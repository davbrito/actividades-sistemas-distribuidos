import { Connection, ResultSetHeader } from "mysql2/promise";

export interface Movie {
  id: number;
  title: string;
  comments: string;
  rating: number;
}

export type MovieInput = Omit<Movie, "id">;

export async function createTable(connection: Connection) {
  await connection.query("DROP TABLE IF EXISTS Movies");
  await connection.query(`
          CREATE TABLE IF NOT EXISTS Movies (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255),
            comments TEXT,
            rating INT
          )
        `);

  await seed(connection);
}

export function seed(connection: Connection) {
  const data = [
    {
      id: 24,
      title: "Inception",
      comments:
        "Un thriller de ciencia ficción visualmente deslumbrante con una trama compleja que invita a la reflexión sobre la naturaleza de los sueños y la realidad. Christopher Nolan ofrece una historia emocionante con giros inesperados.",
      rating: 5,
    },
    {
      id: 25,
      title: "Avengers: Endgame",
      comments:
        "Un épico cierre para la saga de los Vengadores, lleno de emoción, acción y fan service. Aunque algunas decisiones de la trama pueden ser debatibles, es una experiencia conmovedora y un homenaje a más de una década de películas del Universo Marvel.",
      rating: 5,
    },
    {
      id: 35,
      title: "The Godfather",
      comments:
        "Un clásico del cine, considerado una de las mejores películas de todos los tiempos. La narrativa sobre poder, lealtad y familia en el mundo del crimen organizado es impresionante, con actuaciones icónicas de Marlon Brando y Al Pacino.",
      rating: 5,
    },
    {
      id: 36,
      title: "Parasite",
      comments:
        "Esta película surcoreana es una obra maestra que mezcla géneros de manera única, explorando temas de desigualdad social con ingenio y suspenso. Cada giro en la trama es inesperado, haciendo que el espectador quede cautivado hasta el final.",
      rating: 5,
    },
    {
      id: 37,
      title: "The Dark Knight",
      comments:
        "Un enfoque oscuro y realista del mito de Batman, con una actuación inolvidable de Heath Ledger como el Joker. La película es intensa, llena de acción y presenta dilemas morales profundos, lo que la convierte en un hito del cine de superhéroes.",
      rating: 4,
    },
    {
      id: 38,
      title: "La La Land",
      comments:
        "Un homenaje visual y musical a los clásicos de Hollywood, con una historia de amor encantadora y emotiva. Las actuaciones de Emma Stone y Ryan Gosling destacan, aunque su final melancólico podría no ser para todos.",
      rating: 4,
    },
    {
      id: 39,
      title: "Star Wars: Episode IV - A New Hope",
      comments:
        "La película que lanzó una franquicia icónica y revolucionó el cine de ciencia ficción. Con personajes memorables, un universo expansivo y efectos especiales innovadores para su tiempo, es una joya atemporal del cine.",
      rating: 5,
    },
  ];

  return connection.query(
    "INSERT INTO Movies (id, title, comments, rating) VALUES ?",
    [
      data.map((movie) => [
        movie.id,
        movie.title,
        movie.comments,
        movie.rating,
      ]),
    ],
  );
}

export async function insertMovie(connection: Connection, movie: MovieInput) {
  const [result] = await connection.query<ResultSetHeader>(
    "INSERT INTO Movies (title, comments, rating) VALUES (?, ?, ?)",
    [movie.title, movie.comments, movie.rating],
  );

  return result.insertId;
}

export interface GetMoviesOptions {
  search?: string;
}

export async function getMovies(connection: Connection, ops: GetMoviesOptions) {
  if (ops.search) {
    const [rows] = await connection.query(
      "SELECT * FROM Movies WHERE title LIKE ?",
      [`%${ops.search}%`],
    );
    return rows as Movie[];
  }

  const [rows] = await connection.query("SELECT * FROM Movies");
  return rows as Movie[];
}

export async function getMovie(connection: Connection, id: number) {
  const [rows] = await connection.query<any[]>(
    "SELECT * FROM Movies WHERE id = ?",
    [id],
  );
  return rows[0] as Movie;
}

export async function updateMovie(
  connection: Connection,
  id: number,
  movie: MovieInput,
) {
  await connection.query(
    "UPDATE Movies SET title = ?, comments = ?, rating = ? WHERE id = ?",
    [movie.title, movie.comments, movie.rating, id],
  );
}

export async function deleteMovie(connection: Connection, id: number) {
  await connection.query("DELETE FROM Movies WHERE id = ?", [id]);
}

export async function deleteAllMovies(connection: Connection) {
  await connection.query("DELETE FROM Movies");
}
