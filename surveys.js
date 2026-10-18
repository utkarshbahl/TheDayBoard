import { supabase } from "./supabase.js";

const mount = document.querySelector("#surveyMount");
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function showEmpty() {
  mount.innerHTML = `<div class="survey-empty"><p class="section-kicker">NOTHING OPEN RIGHT NOW</p><h2>No current opinions</h2><p>There are no campus opinions to share at the moment. Please check back soon.</p></div>`;
}

function renderSurvey(survey, questions, surveys, password = "") {
  mount.innerHTML = `<button class="survey-back" type="button">← All opinions</button><p class="section-kicker">OPEN OPINION</p><h2>${escapeHtml(survey.title)}</h2>${survey.description ? `<p class="survey-description">${escapeHtml(survey.description)}</p>` : ""}<form id="surveyForm">${survey.collect_name ? `<label class="survey-question"><span>Your name</span><input name="respondentName" type="text" maxlength="120" required autocomplete="name"></label>` : ""}${questions.map((question, index) => `<fieldset class="survey-question"><legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>${question.question_type === "mcq" ? question.options.map((option) => `<label><input type="radio" name="${question.id}" value="${escapeHtml(option)}" required> <span>${escapeHtml(option)}</span></label>`).join("") : `<textarea name="${question.id}" maxlength="3000" required placeholder="Write your answer"></textarea>`}</fieldset>`).join("")}<button class="survey-submit" type="submit">Submit opinion</button><p class="survey-message" role="status"></p></form>`;
  mount.querySelector(".survey-back").addEventListener("click", () => renderSurveyChoices(surveys));
  mount.querySelector("#surveyForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    const message = form.querySelector(".survey-message");
    const data = new FormData(form);
    const answers = Object.fromEntries(questions.map((question) => [question.id, String(data.get(question.id) || "")]));
    button.disabled = true; message.classList.remove("is-error"); message.textContent = "Submitting…";
    const { error } = await supabase.rpc("submit_survey_response", { p_survey_id: survey.id, p_name: String(data.get("respondentName") || ""), p_answers: answers, p_password: password });
    button.disabled = false;
    if (error) { message.classList.add("is-error"); message.textContent = error.message || "Your opinion could not be submitted."; return; }
    form.reset(); button.remove(); message.textContent = "Thank you — your opinion has been submitted.";
  });
}

function renderSurveyChoices(surveys) {
  mount.innerHTML = `<div class="survey-choice-heading"><p class="section-kicker">OPEN OPINIONS</p><h2>Choose an opinion</h2><p>Select an open campus opinion to share your feedback.</p></div><div class="survey-choice-list">${surveys.map((survey) => `<button class="survey-choice" type="button" data-survey-id="${survey.id}"><span>${survey.password_protected ? "PASSWORD PROTECTED" : "OPEN TO ALL"}</span><strong>${escapeHtml(survey.title)}</strong>${survey.description ? `<small>${escapeHtml(survey.description)}</small>` : ""}<b aria-hidden="true">→</b></button>`).join("")}</div>`;
  mount.querySelectorAll(".survey-choice").forEach((button) => button.addEventListener("click", () => renderSelectedSurvey(surveys.find((survey) => survey.id === button.dataset.surveyId), surveys)));
}

async function renderSelectedSurvey(survey, surveys) {
  if (!survey) return;
  mount.innerHTML = "<p class=survey-loading>Loading opinion…</p>";
  let password = "";
  if (survey.password_protected) {
    mount.innerHTML = `<button class="survey-back" type="button">← All opinions</button><div class="survey-lock"><p class="section-kicker">PASSWORD PROTECTED</p><h2>${escapeHtml(survey.title)}</h2><p>Enter the password shared by the survey organiser to continue.</p><form id="surveyUnlock"><input type="password" required autocomplete="current-password" placeholder="Survey password"><button class="survey-submit" type="submit">Continue</button><p class="survey-message" role="status"></p></form></div>`;
    mount.querySelector(".survey-back").addEventListener("click", () => renderSurveyChoices(surveys));
    mount.querySelector("#surveyUnlock").addEventListener("submit", async (event) => { event.preventDefault(); password = event.currentTarget.querySelector("input").value; const { data, error } = await supabase.rpc("get_survey_questions", { p_survey_id: survey.id, p_password: password }); if (error || !data?.length) { event.currentTarget.querySelector(".survey-message").classList.add("is-error"); event.currentTarget.querySelector(".survey-message").textContent = "Incorrect password."; return; } renderSurvey(survey, data, surveys, password); });
    return;
  }
  const { data: questions, error } = await supabase.rpc("get_survey_questions", { p_survey_id: survey.id, p_password: password });
  if (error) { mount.innerHTML = `<div class="survey-empty"><p class="section-kicker">COULD NOT OPEN OPINION</p><h2>Unable to load this opinion</h2><p>Please refresh and try again. If this continues, the administrator needs to rerun the password migration.</p></div>`; console.error("Survey questions could not be loaded.", error); return; }
  if (!questions?.length) { mount.innerHTML = `<div class="survey-empty"><p class="section-kicker">NO QUESTIONS</p><h2>This opinion is not ready yet</h2><p>Please choose another opinion or check back later.</p></div>`; return; }
  renderSurvey(survey, questions, surveys, password);
}

async function loadSurvey() {
  const { data: surveys, error } = await supabase.from("open_survey_index").select("id,title,description,collect_name,password_protected").order("published_at", { ascending: false });
  if (error || !surveys?.length) { showEmpty(); return; }
  renderSurveyChoices(surveys);
}
loadSurvey();
