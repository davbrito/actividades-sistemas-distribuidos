import { Movie } from "../database/movies.js";
import DeleteDialog from "./delete-dialog.js";

function MovieList({ movies }: { movies: Movie[] }) {
  return (
    <div>
      <h1>Lista de Películas</h1>
      {!movies.length ? (
        <>
          <p>
            No hay películas registradas. <a href="/movies/new">Agrega una</a>.
          </p>
        </>
      ) : (
        <>
          <p>
            <a href="/movies/new">Agregar Película</a>
          </p>
          <ul>
            {movies.map((movie) => {
              const { rating } = movie;
              return (
                <li key={movie.id}>
                  <div
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
                  </div>
                  <div>{"⭐".repeat(rating) + "☆".repeat(5 - rating)}</div>
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {movie.comments}
                  </p>
                  <hr />
                </li>
              );
            })}
          </ul>
        </>
      )}
      <DeleteDialog />
    </div>
  );
}

export default MovieList;
