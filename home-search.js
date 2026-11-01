const input = document.querySelector("#serviceSearch");
const status = document.querySelector("#serviceSearchStatus");
const cards = () => [...document.querySelectorAll(".service-grid .service-card")];
const PINNED_KEY = "dayboard-pinned-services";

const updateRightNow = () => {
  const title = document.querySelector("#rightNowTitle");
  const text = document.querySelector("#rightNowText");
  const link = document.querySelector("#rightNowLink");
  const clock = document.querySelector("#currentTime");
  if (!title || !text || !link || !clock) return;
  const hour = new Date().getHours();
  const suggestion = hour < 6
    ? ["Campus map", "Find your way around campus.", "campus-map.html"]
    : hour < 10
      ? ["Mess menu", "Check breakfast before you head out.", "mess-menu.html"]
      : hour < 14
        ? ["Academic help", "Plan your classes and curriculum.", "curriculum.html"]
        : hour < 17
          ? ["Laundry status", "Check your collection token.", "laundry.html"]
          : hour < 20
            ? ["Bus timings", "Plan your evening journey.", "bus-timings.html"]
            : ["Campus clubs", "See what is happening around campus.", "clubs.html"];
  title.textContent = suggestion[0];
  text.textContent = suggestion[1];
  link.href = suggestion[2];
  link.textContent = `Open ${suggestion[0].toLowerCase()}`;
  clock.textContent = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date());
};
updateRightNow();
window.setInterval(updateRightNow, 60000);

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
  cards().forEach((card) => {
    const path = new URL(card.href, location.href).pathname;
    const button = card.querySelector(".pin-service");
    if (button) {
      const active = pinned.includes(path);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", active ? "Unpin service" : "Pin service");
      button.textContent = active ? "★" : "☆";
    }
  });
};

cards().forEach((card) => {
  const path = new URL(card.href, location.href).pathname;
  const button = document.createElement("button");
  button.className = "pin-service";
  button.type = "button";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const pinned = readPinned();
    const next = pinned.includes(path) ? pinned.filter((item) => item !== path) : [...pinned, path].slice(-5);
    writePinned(next);
    renderQuickAccess();
  });
  card.append(button);
  const shareButton = document.createElement("button");
  shareButton.className = "share-service";
  shareButton.type = "button";
  shareButton.textContent = "↗";
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
        window.setTimeout(() => { shareButton.textContent = "↗"; }, 1400);
      }
    } catch (error) {
      if (error?.name !== "AbortError") console.error("Service link could not be shared.", error);
    }
  });
  card.append(shareButton);
});
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
