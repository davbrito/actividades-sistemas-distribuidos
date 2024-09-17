import { Fragment } from "react";
import { Movie } from "../database/movies.js";
import DeleteDialog from "./delete-dialog.js";

function MovieList({ movies, search }: { movies: Movie[]; search?: string }) {
  return (
    <section>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "space-between",
        }}
      >
        <h1>Lista de Películas</h1>
        <a href="/movies/new">
          {"\u002b "}
          Agregar Película
        </a>
      </header>
      {!movies.length && !search ? (
        <>
          <p>
            No hay películas registradas. <a href="/movies/new">Agrega una</a>.
          </p>
        </>
      ) : (
        <>
          <form role="search" action="/movies" method="GET">
            <input
              name="search"
              type="search"
              placeholder="Título..."
              autoComplete="off"
              defaultValue={search}
            />
            <input type="submit" value="Buscar" />
          </form>
          {!movies.length ? (
            <p>No hay películas que coincidan con la búsqueda.</p>
          ) : (
            <div>
              {movies.map((movie) => {
                const { rating } = movie;
                return (
                  <Fragment key={movie.id}>
                    <article>
                      <header
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <h2
                          style={{
                            margin: 0,
                          }}
                        >
                          {movie.title}
                        </h2>
                        <div style={{ marginLeft: "auto" }} />
                        <div>
                          {"⭐".repeat(rating) + "☆".repeat(5 - rating)}
                        </div>
                        <a href={`/movies/${movie.id}`}>Editar</a>
                        <button
                          type="button"
                          data-delete-movie-id={movie.id}
                          style={{
                            width: "fit-content",
                            padding: "0.1rem 0.3rem",
                            fontSize: "0.8rem",
                            margin: 0,
                          }}
                        >
                          Borrar
                        </button>
                      </header>
                      <p
                        style={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {movie.comments}
                      </p>
                    </article>
                    <hr />
                  </Fragment>
                );
              })}
            </div>
          )}
        </>
      )}
      <DeleteDialog />
    </section>
  );
}

export default MovieList;
