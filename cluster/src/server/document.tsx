function Document({
  children,
  title,
  pathname,
}: {
  children: React.ReactNode;
  title?: string;
  pathname: string;
}) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.purple.min.css"
        />
        <title>{title || "Películas"}</title>
      </head>
      <body>
        <header className="container">
          <nav>
            <ul>
              <li>
                <strong>Películas</strong>
              </li>
            </ul>
            <ul>
              <li>
                <a
                  href="/"
                  aria-current={pathname === "/" ? "page" : undefined}
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="/movies"
                  aria-current={pathname === "/movies" ? "page" : undefined}
                >
                  Listado
                </a>
              </li>
              <li>
                <a
                  href="/movies/new"
                  aria-current={pathname === "/movies/new" ? "page" : undefined}
                >
                  Agregar
                </a>
              </li>
              <li>
                <a
                  href="/info"
                  aria-current={pathname === "/info" ? "page" : undefined}
                >
                  Info
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="container"></footer>
      </body>
    </html>
  );
}

export default Document;
