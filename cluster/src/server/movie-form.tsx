import { useId } from "react";
import { Movie } from "../database/movies.js";
import DeleteDialog from "./delete-dialog.js";

function MovieForm({ movie }: { movie?: Movie }) {
  const formId = useId();
  return (
    <>
      <article>
        <header>
          <h1>{movie ? "Editar" : "Agregar"} Película</h1>
        </header>
        <form
          action={movie ? `/movies/${movie.id}` : "/movies"}
          method="POST"
          id={formId}
        >
          <input type="hidden" name="_method" value={movie ? "PUT" : "POST"} />
          <label>
            Título
            <input
              type="text"
              name="title"
              defaultValue={movie?.title}
              autoFocus
            />
          </label>
          <label>
            Puntuación
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type="range"
                name="rating"
                min="1"
                max="5"
                step="1"
                defaultValue={movie?.rating ?? 3}
                style={{ margin: "0" }}
              />
              <div>⭐</div>
            </div>
          </label>
          <label>
            Opinión
            <textarea name="comments" defaultValue={movie?.comments} />
          </label>
        </form>
        <footer
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <a href="/movies">
            {"\uFFE9 "}
            Volver
          </a>
          <div style={{ flex: "1" }} />
          <button type="submit" form={formId} style={{ width: "auto" }}>
            {movie ? "Actualizar" : "Agregar"}
          </button>
          {movie && (
            <button
              type="button"
              name="id"
              value={movie.id}
              className="secondary"
              data-delete-movie-id={movie.id}
            >
              Borrar
            </button>
          )}
        </footer>
      </article>
      {movie && <DeleteDialog />}
    </>
  );
}

export default MovieForm;
