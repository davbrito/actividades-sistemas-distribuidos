import { renderToStaticMarkup } from "react-dom/server";
import Document from "./document.js";

export function renderDocument(
  node: React.ReactNode,
  options: { title?: string; pathname: string },
) {
  return (
    "<!DOCTYPE html>" +
    renderToStaticMarkup(
      <Document pathname={options.pathname} title={options.title}>
        {node}
      </Document>,
    )
  );
}
