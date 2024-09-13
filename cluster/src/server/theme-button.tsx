import { css } from "hono/css";
import { createScript } from "./script.js";

const Script = await createScript(
  new URL("./theme-button.script.js", import.meta.url),
);

function ThemeButton() {
  return (
    <>
      <button className="outline" id="themeToggle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="currentColor"
          className="icon-theme-toggle theme-toggle moon"
        >
          <clipPath id="theme-toggle-cutout">
            <path d="M0-11h25a1 1 0 0017 13v30H0Z"></path>
          </clipPath>
          <g clipPath="url(#theme-toggle-cutout)">
            <circle cx="16" cy="16" r="8.4"></circle>
            <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z"></path>
          </g>
        </svg>
      </button>
      <Script />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .icon-theme-toggle {
              --theme-toggle-duration: 400ms;
            }

            .icon-theme-toggle :first-child path {
              transition-duration: calc(var(--theme-toggle-duration) * 0.6);
              transition-property: transform, d;
              transition-timing-function: cubic-bezier(0, 0, 0.5, 1);
            }

            .icon-theme-toggle g :where(circle, path) {
              transform-origin: center;
              transition: transform calc(var(--theme-toggle-duration) * 0.65)
                cubic-bezier(0, 0, 0, 1.25)
                calc(var(--theme-toggle-duration) * 0.35);
            }

            .icon-theme-toggle.moon g circle {
              transform: scale(1.4);
              transition-delay: 0s;
            }
            .icon-theme-toggle.moon g path {
              transform: scale(0.75);
              transition-delay: 0s;
            }

            .icon-theme-toggle.moon :first-child path {
              d: path("M-9 3h25a1 1 0 0017 13v30H0Z");
              transition-delay: calc(var(--theme-toggle-duration) * 0.4);
              transition-timing-function: cubic-bezier(0, 0, 0, 1.25);
            }

            @supports not (d: path("")) {
              .icon-theme-toggle.moon :first-child path {
                transform: translate3d(-9px, 14px, 0);
              }
            }
          `,
        }}
      />
    </>
  );
}

export default ThemeButton;
