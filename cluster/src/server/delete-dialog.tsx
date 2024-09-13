import { readFile } from "node:fs/promises";
import { createScript } from "./script.js";

const Script = await createScript(new URL("./dialog.js", import.meta.url));

function DeleteDialog() {
  return (
    <>
      <dialog id="deleteDialog">
        <article>
          <header>
            <button
              type="button"
              id="closeDelete"
              aria-label="Cerrar"
              rel="prev"
            ></button>
            <p>
              <strong>¿Estás seguro que deseas borrar esta pelicula?</strong>
            </p>
          </header>
          <p>Esta acción no se puede deshacer</p>
          <footer>
            <button id="cancelDelete" type="button" className="secondary">
              Cancelar
            </button>
            <button
              id="confirmDelete"
              form="deleteForm"
              type="submit"
              name="id"
              style={{ width: "auto" }}
            >
              Borrar
            </button>
          </footer>
        </article>
      </dialog>

      <form
        id="deleteForm"
        method="POST"
        action="/movies"
        className="container"
        hidden
      >
        <input type="hidden" name="_method" value="DELETE" />
      </form>
      <Script />
    </>
  );
}

export default DeleteDialog;
