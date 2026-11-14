// Light and dark. Follows the system setting until the reader picks one with the header switch; the choice
// is kept in this browser (localStorage "ai-base-theme"). ?theme=light|dark forces it for one page load.
// A classic script (not a module) loaded in <head>, so the right colours are in place before first paint;
// the prerendered pages load it too, and it is the only script they carry.
(function () {
  var KEY = "ai-base-theme", root = document.documentElement;
  var ok = function (v) { return v === "light" || v === "dark" ? v : null; };
  var forced = ok(new URLSearchParams(location.search).get("theme"));
  var stored = function () { try { return ok(localStorage.getItem(KEY)); } catch (e) { return null; } };
  var isDark = function () { var t = root.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
  function apply() {
    var t = forced || stored();
    if (t) root.dataset.theme = t; else delete root.dataset.theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = isDark() ? "#1c120c" : "#fbf6ec";
  }
  apply();
  document.addEventListener("DOMContentLoaded", apply);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", apply);
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-theme-toggle]");
    if (!b) return;
    var next = isDark() ? "light" : "dark";
    forced = null;
    try { localStorage.setItem(KEY, next); } catch (err) { /* private mode */ }
    apply();
  });
  window.aiBaseTheme = { isDark: isDark };
})();
