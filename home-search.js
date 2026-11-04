const input = document.querySelector("#serviceSearch");
const status = document.querySelector("#serviceSearchStatus");
const cards = () => [...document.querySelectorAll(".service-grid .service-card")];
const PINNED_KEY = "dayboard-pinned-services";
const pinIcon = (pinned) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" ${pinned ? 'fill="currentColor"' : 'fill="none" stroke="currentColor"'} stroke-width="1.7" stroke-linejoin="round"/></svg>`;
const shareIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 19 19 5M10 5h9v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const readPinned = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(PINNED_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter((path) => typeof path === "string") : [];
  } catch (error) {
    console.error("Pinned services could not be read.", error);
    return [];
  }
};

const writePinned = (pinned) => {
  try { localStorage.setItem(PINNED_KEY, JSON.stringify(pinned)); } catch (error) { console.error("Pinned services could not be saved.", error); }
};

const renderQuickAccess = () => {
  const section = document.querySelector("#quickAccess");
  const target = document.querySelector("#quickAccessGrid");
  if (!section || !target) return;
  const pinned = readPinned();
  const pinnedCards = pinned.map((path) => cards().find((card) => new URL(card.href, location.href).pathname === path)).filter(Boolean);
  section.hidden = !pinnedCards.length;
  target.replaceChildren(...pinnedCards.map((card) => {
    const link = document.createElement("a");
    link.className = "quick-access-link";
    link.href = card.href;
    link.textContent = card.querySelector("strong")?.textContent.replace(/\s+/g, " ").trim() || "Campus service";
    return link;
  }));
};

const enhanceCard = (card) => {
  if (card.dataset.enhanced === "true") return;
  card.dataset.enhanced = "true";
  const path = new URL(card.href, location.href).pathname;
  const button = document.createElement("button");
  button.className = "pin-service";
  button.type = "button";
  const isPinned = readPinned().includes(path);
  button.innerHTML = pinIcon(isPinned);
  button.setAttribute("aria-pressed", String(isPinned));
  button.setAttribute("aria-label", button.getAttribute("aria-pressed") === "true" ? "Unpin service" : "Pin service");
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const pinned = readPinned();
    const next = pinned.includes(path) ? pinned.filter((item) => item !== path) : [...pinned, path].slice(-5);
    writePinned(next);
    const nextPinned = next.includes(path);
    button.innerHTML = pinIcon(nextPinned);
    button.setAttribute("aria-pressed", String(nextPinned));
    button.setAttribute("aria-label", nextPinned ? "Unpin service" : "Pin service");
    renderQuickAccess();
  });
  card.append(button);
  const shareButton = document.createElement("button");
  shareButton.className = "share-service";
  shareButton.type = "button";
  shareButton.innerHTML = shareIcon;
  shareButton.setAttribute("aria-label", "Share service");
  shareButton.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const title = card.querySelector("strong")?.textContent.replace(/\s+/g, " ").trim() || "Campus service";
    const url = new URL(card.href, location.href).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `TheDayBoard — ${title}`, text: `Open ${title} on TheDayBoard`, url });
      } else {
        await navigator.clipboard.writeText(url);
        shareButton.textContent = "✓";
        window.setTimeout(() => { shareButton.innerHTML = shareIcon; }, 1400);
      }
    } catch (error) {
      if (error?.name !== "AbortError") console.error("Service link could not be shared.", error);
    }
  });
  card.append(shareButton);
};
cards().forEach(enhanceCard);
const serviceGrid = document.querySelector(".service-grid");
if (serviceGrid) {
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement && node.matches(".service-card")) enhanceCard(node);
    }));
    renderQuickAccess();
  }).observe(serviceGrid, { childList: true });
}
document.querySelector("#clearQuickAccess")?.addEventListener("click", () => { writePinned([]); renderQuickAccess(); });
renderQuickAccess();

if (input && status) {
  const update = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    cards().forEach((card) => {
      const matches = !query || card.textContent.toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    status.textContent = query && visible === 0
      ? "No matching service found."
      : query
        ? `${visible} service${visible === 1 ? "" : "s"} found.`
        : "";
  };
  input.addEventListener("input", update);
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== input && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      input.focus();
    }
    if (event.key === "Escape" && document.activeElement === input && input.value) {
      input.value = "";
      update();
      input.blur();
    }
  });
}
