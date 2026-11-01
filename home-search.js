const input = document.querySelector("#serviceSearch");
const status = document.querySelector("#serviceSearchStatus");
const cards = () => [...document.querySelectorAll(".service-grid .service-card")];

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
}
