import { Movie } from "../database/movies.js";
import DeleteDialog from "./delete-dialog.js";

function MovieForm({ movie }: { movie?: Movie }) {
  return (
    <>
      <div>
        <h1>{movie ? "Editar" : "Agregar"} Película</h1>
        <form action={movie ? `/movies/${movie.id}` : "/movies"} method="POST">
          <input type="hidden" name="_method" value={movie ? "PUT" : "POST"} />
          <label>
            Título
            <input type="text" name="title" defaultValue={movie?.title} />
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
          <button type="submit">{movie ? "Actualizar" : "Agregar"}</button>
          {movie && (
            <button
              type="button"
              name="id"
              value={movie.id}
              className="secondary"
              data-delete-movie-id={movie.id}
              style={{ width: "100%" }}
            >
              Borrar
            </button>
          )}
          <p
            style={{
              textAlign: "center",
            }}
          >
            <a href="/movies">Volver</a>
          </p>
        </form>
      </div>
      {movie && <DeleteDialog />}
    </>
  );
}

export default MovieForm;
