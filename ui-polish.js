// Shared visual treatment for public, admin, and staff pages. It does not
// alter content, data requests, or form behaviour.
if (!document.getElementById("dayboard-ui-polish")) {
  const style = document.createElement("style");
  style.id = "dayboard-ui-polish";
  style.textContent = `
    :root { --polish-shadow: 0 14px 32px rgba(20,40,31,.08); }
    ::selection { background: var(--lime); color: var(--ink); }
    body { background-image: radial-gradient(circle at 10% -15%, rgba(215,250,82,.16), transparent 28rem); }
    main { position: relative; }
    button, input, textarea, select { transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
    input:focus, textarea:focus, select:focus { border-color: var(--ink) !important; box-shadow: 0 0 0 3px rgba(215,250,82,.5); outline: none; }
    button:not(:disabled):active { transform: translateY(1px); }
    .site-footer-update { border-top: 1px solid rgba(20,40,31,.08); }
    .table-wrap, .menu-wrap, .course-table-wrap { box-shadow: 0 8px 24px rgba(20,40,31,.035); }
    .admin-page .analytics-panel, .admin-page .admin-login, .staff-page .desk-card { border: 1px solid rgba(255,255,255,.18); }
    .admin-page .traffic-stat { box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 8px 20px rgba(20,40,31,.08); }
    .staff-page .desk-card { transition: transform .25s ease, box-shadow .25s ease; }
    .staff-page .desk-card:hover { transform: translateY(-3px); box-shadow: 13px 15px 0 var(--lime); }
    @media (max-width: 700px) { body { background-image: none; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; } }
  `;
  document.head.append(style);
}

const revealPage = () => document.documentElement.classList.add("dayboard-ready");
if (document.readyState === "complete") {
  window.setTimeout(revealPage, 180);
} else {
  window.addEventListener("load", () => window.setTimeout(revealPage, 180), { once: true });
  window.setTimeout(revealPage, 12_000);
}
