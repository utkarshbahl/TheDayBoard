// Shared visual treatment for public, admin, and staff pages. It does not
// alter content, data requests, or form behaviour.
if (!document.getElementById("dayboard-ui-polish")) {
  const style = document.createElement("style");
  style.id = "dayboard-ui-polish";
  style.textContent = `
    :root { --polish-shadow: 0 14px 32px rgba(20,40,31,.08); }
    ::selection { background: var(--accent); color: var(--ink); }
    body { background-image: radial-gradient(circle at 10% -15%, rgba(200,139,85,.16), transparent 28rem); }
    main { position: relative; }
    button, input, textarea, select { transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
    input:focus, textarea:focus, select:focus { border-color: var(--ink) !important; box-shadow: 0 0 0 3px rgba(200,139,85,.5); outline: none; }
    button:not(:disabled):active { transform: translateY(1px); }
    .site-footer-update { border-top: 1px solid rgba(20,40,31,.08); }
    .table-wrap, .menu-wrap, .course-table-wrap { box-shadow: 0 8px 24px rgba(20,40,31,.035); }
    .admin-page .analytics-panel, .admin-page .admin-login, .staff-page .desk-card { border: 1px solid rgba(255,255,255,.18); }
    .admin-page .traffic-stat { box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 8px 20px rgba(20,40,31,.08); }
    .staff-page .desk-card { transition: transform .25s ease, box-shadow .25s ease; }
    .staff-page .desk-card:hover { transform: translateY(-3px); box-shadow: 13px 15px 0 var(--accent); }
    html[data-theme="dusk"] body { background-image: linear-gradient(135deg, rgba(230,184,102,.05), transparent 35%), linear-gradient(315deg, rgba(108,124,170,.08), transparent 38%); }
    html[data-theme="dusk"] .site-footer-update { border-top-color: var(--line); }
    html[data-theme="dusk"] .table-wrap, html[data-theme="dusk"] .menu-wrap, html[data-theme="dusk"] .course-table-wrap { box-shadow: 0 12px 28px rgba(0,0,0,.2); }
    html[data-theme="dusk"] .admin-page .traffic-stat { box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 8px 20px rgba(0,0,0,.22); }
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
