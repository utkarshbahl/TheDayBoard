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
    #dayboard-loader { position: fixed; z-index: 9999; inset: 0; display: grid; place-items: center; background: var(--paper); color: var(--ink); opacity: 1; transition: opacity .36s ease, visibility .36s ease; }
    #dayboard-loader.is-leaving { visibility: hidden; opacity: 0; pointer-events: none; }
    .dayboard-loader-content { display: grid; justify-items: center; gap: 17px; padding: 28px; text-align: center; }
    .dayboard-loader-mark { position: relative; display: grid; width: 78px; height: 78px; place-items: center; }
    .dayboard-loader-mark::before { position: absolute; inset: 0; border: 1px solid var(--line); border-top-color: var(--lime); border-radius: 50%; content: ""; animation: dayboard-loader-spin 1.2s linear infinite; }
    .dayboard-loader-mark img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 18px rgba(20,40,31,.15); animation: dayboard-loader-breathe 1.45s ease-in-out infinite; }
    .dayboard-loader-title { margin: 0; font-size: 12px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
    .dayboard-loader-copy { margin: -9px 0 0; color: var(--muted); font: 10px "DM Mono", monospace; letter-spacing: .4px; }
    @keyframes dayboard-loader-spin { to { transform: rotate(360deg); } }
    @keyframes dayboard-loader-breathe { 50% { transform: scale(.91); } }
    @media (max-width: 700px) { body { background-image: none; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; } }
  `;
  document.head.append(style);
}

if (!document.getElementById("dayboard-loader")) {
  const loader = document.createElement("div");
  loader.id = "dayboard-loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-live", "polite");
  loader.setAttribute("aria-label", "Loading TheDayBoard");
  loader.innerHTML = `
    <div class="dayboard-loader-content">
      <div class="dayboard-loader-mark"><img src="assets/ethers-club-icon.png" alt=""></div>
      <p class="dayboard-loader-title">TheDayBoard</p>
      <p class="dayboard-loader-copy">Loading campus services</p>
    </div>`;
  document.body.append(loader);
  document.body.setAttribute("aria-busy", "true");

  let finished = false;
  const dismissLoader = () => {
    if (finished) return;
    finished = true;
    document.body.removeAttribute("aria-busy");
    loader.classList.add("is-leaving");
    window.setTimeout(() => loader.remove(), 400);
  };

  if (document.readyState === "complete") {
    window.setTimeout(dismissLoader, 180);
  } else {
    window.addEventListener("load", () => window.setTimeout(dismissLoader, 180), { once: true });
    window.setTimeout(dismissLoader, 12_000);
  }
}
