import { Connection, ResultSetHeader } from "mysql2/promise";

export interface Movie {
  id: number;
  title: string;
  comments: string;
  rating: number;
}

export type MovieInput = Omit<Movie, "id">;

export function createTable(connection: Connection) {
  return connection.query(`
          CREATE TABLE IF NOT EXISTS Movies (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255),
            comments TEXT,
            rating INT
          )
        `);
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
