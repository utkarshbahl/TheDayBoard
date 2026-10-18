import { supabase } from "./supabase.js";

const mount = document.querySelector("#surveyMount");
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function showEmpty() {
  mount.innerHTML = `<div class="survey-empty"><p class="section-kicker">NOTHING OPEN RIGHT NOW</p><h2>No current opinions</h2><p>There are no campus opinions to share at the moment. Please check back soon.</p></div>`;
}

function renderSurvey(survey, questions) {
  mount.innerHTML = `<p class="section-kicker">OPEN OPINION</p><h2>${escapeHtml(survey.title)}</h2>${survey.description ? `<p class="survey-description">${escapeHtml(survey.description)}</p>` : ""}<form id="surveyForm">${survey.collect_name ? `<label class="survey-question"><span>Your name</span><input name="respondentName" type="text" maxlength="120" required autocomplete="name"></label>` : ""}${questions.map((question, index) => `<fieldset class="survey-question"><legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>${question.question_type === "mcq" ? question.options.map((option) => `<label><input type="radio" name="${question.id}" value="${escapeHtml(option)}" required> <span>${escapeHtml(option)}</span></label>`).join("") : `<textarea name="${question.id}" maxlength="3000" required placeholder="Write your answer"></textarea>`}</fieldset>`).join("")}<button class="survey-submit" type="submit">Submit opinion</button><p class="survey-message" role="status"></p></form>`;
  mount.querySelector("#surveyForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    const message = form.querySelector(".survey-message");
    const data = new FormData(form);
    const answers = Object.fromEntries(questions.map((question) => [question.id, String(data.get(question.id) || "")]));
    button.disabled = true; message.classList.remove("is-error"); message.textContent = "Submitting…";
    const { error } = await supabase.rpc("submit_survey_response", { p_survey_id: survey.id, p_name: String(data.get("respondentName") || ""), p_answers: answers });
    button.disabled = false;
    if (error) { message.classList.add("is-error"); message.textContent = error.message || "Your opinion could not be submitted."; return; }
    form.reset(); button.remove(); message.textContent = "Thank you — your opinion has been submitted.";
  });
}

async function loadSurvey() {
  const { data: surveys, error } = await supabase.from("surveys").select("id,title,description,collect_name").eq("is_published", true).order("published_at", { ascending: false }).limit(1);
  if (error || !surveys?.length) { showEmpty(); return; }
  const survey = surveys[0];
  const { data: questions, error: questionsError } = await supabase.from("survey_questions").select("id,prompt,question_type,options,position").eq("survey_id", survey.id).order("position");
  if (questionsError || !questions?.length) { showEmpty(); return; }
  renderSurvey(survey, questions);
}
loadSurvey();
