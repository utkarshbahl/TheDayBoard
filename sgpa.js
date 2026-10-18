const gradePoints = {
  A: 10,
  AB: 9,
  B: 8,
  BC: 7,
  C: 6,
  CD: 5,
  D: 4,
  F: 0,
};

const rowsElement = document.querySelector("#sgpaRows");
const courseRowsElement = document.querySelector("#courseRows");
const valueElement = document.querySelector("#sgpaValue");
const summaryElement = document.querySelector("#sgpaSummary");

if (rowsElement && courseRowsElement && valueElement && summaryElement) {
  const gradeOptions = Object.keys(gradePoints)
    .map((grade) => `<option value="${grade}">${grade} · ${gradePoints[grade]}</option>`)
    .join("");

  const calculate = () => {
    let weightedPoints = 0;
    let gradedCredits = 0;
    let gradedCourses = 0;

    rowsElement.querySelectorAll(".sgpa-grade").forEach((select) => {
      if (!select.value) return;
      const credits = Number(select.dataset.credits);
      weightedPoints += gradePoints[select.value] * credits;
      gradedCredits += credits;
      gradedCourses += 1;
    });

    valueElement.textContent = gradedCredits ? (weightedPoints / gradedCredits).toFixed(2) : "0.00";
    summaryElement.textContent = gradedCredits
      ? `${gradedCourses} course${gradedCourses === 1 ? "" : "s"} · ${gradedCredits} graded credits`
      : "Select grades to see your weighted average.";
  };

  const render = () => {
    const courses = [...courseRowsElement.querySelectorAll("tr")]
      .map((row) => {
        const cells = row.querySelectorAll("td");
        return {
          code: cells[0]?.textContent.trim() || "",
          name: cells[1]?.textContent.trim() || "",
          credits: Number(cells[2]?.textContent.trim()),
        };
      })
      .filter((course) => course.name && Number.isFinite(course.credits));

    rowsElement.innerHTML = courses
      .map(
        (course, index) => `
          <label class="sgpa-row">
            <span class="sgpa-course"><strong>${course.name}</strong><span>${course.code}</span></span>
            <span class="sgpa-credits">${course.credits} credits</span>
            <select class="sgpa-grade" data-credits="${course.credits}" aria-label="Grade for ${course.name}">
              <option value="">Grade</option>${gradeOptions}
            </select>
          </label>`,
      )
      .join("");

    rowsElement.querySelectorAll(".sgpa-grade").forEach((select) => {
      select.addEventListener("change", calculate);
    });
    calculate();
  };

  const observer = new MutationObserver(render);
  observer.observe(courseRowsElement, { childList: true });
  render();
}
