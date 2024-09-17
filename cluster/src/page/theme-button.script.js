const themeToggle = document.getElementById("themeToggle");

const currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
updateTooltip();

themeToggle.addEventListener("click", () => {
  toggleTheme();
});

function toggleTheme() {
  const oldTheme = getTheme();
  const newTheme = oldTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);

  updateTooltip();
}

function getTheme() {
  return document.documentElement.getAttribute("data-theme") || currentTheme;
}

function updateTooltip() {
  const currentTheme = getTheme();
  themeToggle
    .querySelector("svg")
    .classList.toggle("moon", currentTheme === "dark");
  if (currentTheme === "dark") {
    themeToggle.setAttribute("data-tooltip", "Cambiar a tema claro");
  } else {
    themeToggle.setAttribute("data-tooltip", "Cambiar a tema oscuro");
  }
}
