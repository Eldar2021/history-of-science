/** Theme persistence shared by the layout (pre-paint script) and the ThemeToggle client component. */
export const THEME_KEY = "uchkun-theme";
export type Theme = "light" | "dark";

/** Inlined in <head> so a stored choice applies before first paint and never flashes the other theme.
 *  Nothing stored means light: the OS preference is not consulted (ADR-022). */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}})();`;
