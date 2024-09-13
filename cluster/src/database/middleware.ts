import { createMiddleware } from "hono/factory";
import { Connection } from "mysql2/promise";
import { creatDbConnection } from "./config.js";
import * as movies from "./movies.js";

const createDb = () => {
  let connPromise: Promise<Connection>;
  let conn: Connection;

  const getConn = async () => {
    if (!connPromise) {
      connPromise = creatDbConnection();
    }

    if (!conn) {
      conn = await connPromise;
    }

    return conn;
  };

  return {
    getMovies: async (ops: movies.GetMoviesOptions) =>
      movies.getMovies(await getConn(), ops),
    getMovie: async (id: number) => movies.getMovie(await getConn(), id),
    insertMovie: async (movie: movies.MovieInput) =>
      movies.insertMovie(await getConn(), movie),
    updateMovie: async (id: number, movie: movies.MovieInput) =>
      movies.updateMovie(await getConn(), id, movie),
    deleteMovie: async (id: number) => movies.deleteMovie(await getConn(), id),
    end: async () => {
      if (conn) {
        await conn.end();
      }
    },
    get conn() {
      return getConn();
    },
  };
};

export const db = createMiddleware<{
  Variables: { db: ReturnType<typeof createDb> };
}>(async (c, next) => {
  const db = createDb();

  try {
    c.set("db", db);
    return await next();
  } finally {
    await db.end();
  }
});
