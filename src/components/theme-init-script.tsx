import Script from "next/script";

const THEME_INIT = `
(function () {
  try {
    var stored = localStorage.getItem("wadiwise-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

/** Sets data-theme before paint to avoid a light/dark flash on load. */
export function ThemeInitScript() {
  return (
    // beforeInteractive in the root layout is the documented App Router
    // pattern; this lint rule only accounts for the Pages Router.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="theme-init" strategy="beforeInteractive">
      {THEME_INIT}
    </Script>
  );
}
