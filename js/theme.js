/* ================================================================
   DX TOOLS — THEME TOGGLE
   Manages dark/light mode via data-theme on <html>.
   localStorage key: "dx-theme"

   FOUC prevention: add this inline in <head> BEFORE stylesheets:
     <script>
       const t = localStorage.getItem('dx-theme');
       if (t) document.documentElement.setAttribute('data-theme', t);
     </script>
   ================================================================ */

(function () {
  const STORAGE_KEY = 'dx-theme';
  const root = document.documentElement;

  function getTheme() {
    return root.getAttribute('data-theme') || 'light';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateAllToggles(theme);
    document.dispatchEvent(new CustomEvent('dx:themechange', { detail: { theme } }));
  }

  function updateAllToggles(theme) {
    const isDark = theme !== 'light';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      const moon = btn.querySelector('.icon-moon');
      const sun  = btn.querySelector('.icon-sun');
      if (moon) moon.hidden = !isDark;
      if (sun)  sun.hidden  = isDark;
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', String(!isDark));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* Restore from storage (stylesheet already applied via inline script in <head>) */
    const stored = localStorage.getItem(STORAGE_KEY);
    const theme  = stored || 'light';
    if (!stored) root.setAttribute('data-theme', theme);
    updateAllToggles(theme);

    /* Initialize Lucide icons if the library is loaded */
    if (typeof lucide !== 'undefined') lucide.createIcons();

    /* Wire up all toggle buttons */
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(getTheme() === 'light' ? 'dark' : 'light');
      });
    });
  });
})();
