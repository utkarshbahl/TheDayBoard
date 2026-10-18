const holidays = [
  { date: "2026-01-14", name: "Makar Sankranti" },
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-04", name: "Holi" },
  { date: "2026-03-21", name: "Id-Ul-Fitr", note: "Subject to appearance of moon" },
  { date: "2026-03-26", name: "Ram Navami" },
  { date: "2026-03-31", name: "Mahavir Jayanti" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-14", name: "Ambedkar Jayanti" },
  { date: "2026-05-01", name: "Buddha Purnima" },
  { date: "2026-05-27", name: "Id-Ul-Zuha", note: "Subject to appearance of moon" },
  { date: "2026-06-26", name: "Muharram", note: "Subject to appearance of moon" },
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-08-26", name: "Milad-Un-Nabi / Id-E-Milad", note: "Subject to appearance of moon" },
  { date: "2026-08-28", name: "Raksha Bandhan" },
  { date: "2026-09-04", name: "Krishna Janmashtami" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-20", name: "Dussehra" },
  { date: "2026-11-08", name: "Diwali" },
  { date: "2026-11-09", name: "Govardhan Puja" },
  { date: "2026-11-24", name: "Guru Nanak Jayanti" },
  { date: "2026-12-25", name: "Christmas" },
];

const dateInIndia = () => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts();
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const list = document.querySelector("#upcomingHolidaysList");
const summary = document.querySelector("#upcomingHolidaysSummary");

if (list && summary) {
  const upcoming = holidays.filter((holiday) => holiday.date >= dateInIndia());
  const formatter = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

  summary.textContent = upcoming.length ? `${upcoming.length} remaining in 2026` : "No remaining 2026 holidays";
  list.innerHTML = upcoming.length
    ? upcoming.map((holiday) => `<li><time datetime="${holiday.date}">${formatter.format(new Date(`${holiday.date}T12:00:00+05:30`))}</time><span><strong>${holiday.name}</strong>${holiday.note ? `<small>${holiday.note}</small>` : ""}</span></li>`).join("")
    : "<li class=upcoming-holidays-empty>There are no remaining holidays in the official 2026 list.</li>";
}
