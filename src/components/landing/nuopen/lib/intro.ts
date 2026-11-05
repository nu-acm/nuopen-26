export const INTRO_KEY = 'nuopen:intro-seen';
export const INTRO_TITLE = 'nuopen:intro-title';
export const INTRO_DONE = 'nuopen:intro-done';

// Inline in <head>: marks a first visit before paint, so the hero never flashes before the intro covers it.
export const INTRO_SCRIPT = `try{if(location.pathname==="/"&&!sessionStorage.getItem("${INTRO_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&location.hash.replace("#","")==="")document.documentElement.dataset.intro="1"}catch(e){}`;
