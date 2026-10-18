const clubs = [
  ["tech", "Astronomy", "Astronomy and space science", "Observations, outreach, and curiosity about the universe."],
  ["tech", "Cipher", "Cryptology and cyber security", "Security learning, awareness, and technical problem-solving."],
  ["tech", "Cybros", "Competitive programming", "Coding practice, contests, and collaborative problem-solving."],
  ["tech", "E-Cell", "Entrepreneurship", "Startup thinking, founder conversations, and enterprise initiatives."],
  ["tech", "Finlogue", "Finance and fintech", "Financial literacy, markets, and technology-driven finance."],
  ["tech", "Phoenix", "Robotics", "Robotics projects, design, and hands-on engineering."],
  ["tech", "Qbit", "Quantum computing", "Quantum concepts, algorithms, and emerging computation."],
  ["tech", "TEDxLNMIIT", "Ideas and public dialogue", "Independent talks and conversations around ideas worth spreading."],
  ["cultural", "Aaveg", "Street theatre", "Performance-led social awareness and campus expression."],
  ["cultural", "Capriccio", "Music", "Vocal and instrumental music, performances, and practice."],
  ["cultural", "Eminence", "Fashion", "Fashion, styling, and stage presentation."],
  ["cultural", "Fundoo", "Festival community", "Celebrating festivals and building a sense of community."],
  ["cultural", "Imagination", "Photography and cinematography", "Visual storytelling, photography, and film-making."],
  ["cultural", "Insignia", "Dance", "Dance practice, choreography, and stage performances."],
  ["cultural", "Rendition", "Theatre", "Theatre, mime, monologues, and live performance."],
  ["cultural", "Sankalp", "Social welfare", "Community service and social-impact initiatives."],
  ["cultural", "Vignette", "Art and design", "Art, illustration, design, and creative workshops."],
  ["sports", "Badminton", "Racquet sport", "Practice sessions and inter-college competition."],
  ["sports", "Basketball", "Team sport", "Training, tournaments, and campus competition."],
  ["sports", "Carrom", "Indoor sport", "Precision, strategy, and friendly competition."],
  ["sports", "Chess", "Mind sport", "Chess practice, strategy, and competitive play."],
  ["sports", "Cricket", "Team sport", "Campus cricket, training, and tournaments."],
  ["sports", "Football", "Team sport", "Training, fixtures, and inter-college play."],
  ["sports", "Kabaddi", "Team sport", "Practice and competitive kabaddi."],
  ["sports", "Lawn Tennis", "Racquet sport", "Coaching, practice, and match play."],
  ["sports", "Squash", "Racquet sport", "A campus community for regular squash practice."],
  ["sports", "Table Tennis", "Indoor sport", "Practice, tournaments, and competitive play."],
  ["sports", "Volleyball", "Team sport", "Team training and inter-college tournaments."],
  ["sports", "Zenith", "Fitness", "Fitness routines, wellness activities, and active living."],
];

const labels = { tech: "Science & technology", cultural: "Cultural", sports: "Sports" };
const directory = document.querySelector("#clubDirectory");
const count = document.querySelector(".club-count");
const filters = document.querySelectorAll(".club-filter");

function card([type, name, focus, description]) {
  return `<article class="club-card"><span class="club-card-category">${labels[type]}</span><h2>${name}</h2><p>${description}</p><p class="club-card-focus">${focus}</p></article>`;
}

function render(category) {
  const categories = category === "all" ? Object.keys(labels) : [category];
  const visible = category === "all" ? clubs : clubs.filter(([type]) => type === category);
  directory.innerHTML = categories.map((type) => {
    const group = clubs.filter(([clubType]) => clubType === type);
    return `<section class="club-group" aria-labelledby="${type}Clubs"><div class="club-group-heading"><h2 id="${type}Clubs">${labels[type]}</h2><span>${group.length} clubs</span></div><div class="club-grid">${group.map(card).join("")}</div></section>`;
  }).join("");
  count.textContent = `${visible.length} ${visible.length === 1 ? "club" : "clubs"} shown`;
}

filters.forEach((filter) => filter.addEventListener("click", () => {
  filters.forEach((item) => item.classList.toggle("is-active", item === filter));
  render(filter.dataset.category);
}));

render("all");
