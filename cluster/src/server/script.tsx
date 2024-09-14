import { readFile } from "node:fs/promises";

export async function createScript(url: string | URL) {
  const file = await readFile(url, "utf8");

  return function Script() {
    return <script type="module" dangerouslySetInnerHTML={{ __html: file }} />;
  };
}

export function Script({ children }: { children: string }) {
  return (
    <script type="module" dangerouslySetInnerHTML={{ __html: children }} />
  );
}
