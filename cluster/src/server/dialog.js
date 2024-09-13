const dialog = document.getElementById("deleteDialog");
const cancelButton = document.getElementById("cancelDelete");
const deleteButton = document.getElementById("confirmDelete");
const closeButton = document.getElementById("closeDelete");

const open = (id) => {
  deleteButton.value = id;
  document.body.classList.add("modal-is-open");
  document.body.classList.add("modal-is-opening");
  dialog.showModal();

  dialog.addEventListener(
    "animationend",
    () => {
      document.body.classList.remove("modal-is-opening");
    },
    { once: true },
  );
};

const close = () => {
  document.body.classList.add("modal-is-closing");

  dialog.addEventListener(
    "animationend",
    () => {
      dialog.close();
      document.body.classList.remove("modal-is-open");
      document.body.classList.remove("modal-is-closing");
    },
    { once: true },
  );
};

dialog.addEventListener("close", () => {
  deleteButton.value = "";
});

cancelButton.addEventListener("click", close);

deleteButton.addEventListener("click", close);

closeButton.addEventListener("click", close);

document.body.addEventListener("click", (e) => {
  if (e.target.matches("[data-delete-movie-id]")) {
    const id = e.target.getAttribute("data-delete-movie-id");
    open(id);
  }
});
