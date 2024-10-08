import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { db } from "../database/middleware.js";
import { renderDocument } from "../page/index.js";
import MovieForm from "../page/movie-form.js";
import MovieList from "../page/movie-list.js";
import { HOST, PORT } from "./config.js";

const app = new Hono().use(logger()).use(db);

let handleCount = 0;

app.use(async (c, next) => {
  return await next();
});

app.get("/heartbeat", () => {
  return new Response(null, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
});

app.get("/serverinfo", (c) => {
  return c.json({ count: handleCount });
});

app.use(async (c, next) => {
  try {
    await next();
  } finally {
    handleCount++;
  }
});

app.get("/movies/new", (c) => {
  c.status(200);

  return c.html(renderDocument(<MovieForm />, { pathname: c.req.path }));
});

app
  .get("/movies/:id", async (c) => {
    const id = parseInt(c.req.param("id"));

    const movie = await c.var.db.getMovie(id);

    if (!movie) {
      c.status(404);

      return c.html(
        renderDocument(<h2>Movie not found</h2>, { pathname: c.req.path }),
      );
    }

    c.status(200);
    return c.html(
      renderDocument(<MovieForm movie={movie} />, { pathname: c.req.path }),
    );
  })
  .post(async (c, next) => {
    const formData = await c.req.formData();
    const method = formData.get("_method") || c.req.method;
    const id = parseInt(c.req.param("id"));

    if (method === "DELETE") {
      await c.var.db.deleteMovie(id);
      return c.redirect("/movies", 303);
    }

    if (method === "PUT") {
      const title = formData.get("title") as string;
      const rating = parseInt(formData.get("rating") as string);
      const comments = formData.get("comments") as string;

      await c.var.db.updateMovie(id, { title, rating, comments });

      return c.redirect("/movies", 303);
    }

    return next();
  });

app
  .get("/movies", async (c) => {
    c.status(200);

    const search = c.req.query("search")?.trim().toLowerCase();

    const movies = await c.var.db.getMovies({ search });

    return c.html(
      renderDocument(<MovieList movies={movies} search={search} />, {
        pathname: c.req.path,
      }),
    );
  })
  .post(async (c, next) => {
    const formData = await c.req.formData();
    const method = formData.get("_method") || c.req.method;
    const id = parseInt(formData.get("id") as string);

    if (method === "DELETE") {
      await c.var.db.deleteMovie(id);
      return c.redirect("/movies", 303);
    }

    if (method === "POST") {
      const title = formData.get("title") as string;
      const rating = parseInt(formData.get("rating") as string);
      const comments = formData.get("comments") as string;

      await c.var.db.insertMovie({ title, rating, comments });

      return c.redirect("/movies", 303);
    }

    return await next();
  });

app.get("/", async (c) => {
  c.status(200);

  return c.html(
    renderDocument(
      <div>
        <div>Respondiendo desde servidor: {HOST}</div>
        <div>El servidor ha respondido {handleCount} veces</div>
      </div>,
      { pathname: c.req.path },
    ),
  );
});

const server = serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: HOST,
  },
  (address) => {
    console.log(`server listening on ${address.address}:${address.port}`);
  },
);

const shutdownServer = async () => {
  server.close((err) => {
    if (err) {
      console.error("error closing server", err);
      process.exit(1);
    }
    console.log("server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdownServer);
process.on("SIGINT", shutdownServer);
