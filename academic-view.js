const tabs = [...document.querySelectorAll(".academic-view-tab")];
const panels = {
  curriculum: document.querySelector("#curriculumView"),
  sgpa: document.querySelector("#sgpaView"),
};

const setView = (view, focusTab = false) => {
  const isCurriculum = view === "curriculum";
  panels.curriculum.hidden = !isCurriculum;
  panels.sgpa.hidden = isCurriculum;

  tabs.forEach((tab) => {
    const selected = tab.id === `${view}Tab`;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focusTab) tab.focus();
  });

  try {
    localStorage.setItem("academic-help-view", view);
  } catch (_) {}
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.id === "sgpaTab" ? "sgpa" : "curriculum"));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextView = event.key === "ArrowLeft" || event.key === "Home" ? "curriculum" : "sgpa";
    setView(nextView, true);
  });
});

try {
  setView(localStorage.getItem("academic-help-view") === "sgpa" ? "sgpa" : "curriculum");
} catch (_) {
  setView("curriculum");
}
