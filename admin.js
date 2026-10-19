import { supabase } from "./supabase.js";

const byId = (id) => document.getElementById(id);
let adminSurveys = [];
let selectedAdminSurveyId = null;
let surveyResultsLoaded = false;
const pageNames = {
  "/": "Home",
  "/laundry": "Laundry status",
  "/mess-menu": "Mess menu",
  "/bus-timings": "Bus timings",
  "/campus-map": "Campus map",
  "/curriculum": "Academic Help",
  "/clubs": "Campus clubs",
  "/surveys": "Campus opinions",
};
const sections = [
  ["laundry", "Laundry status"],
  ["mess", "Mess menu"],
  ["bus", "Bus timings"],
  ["curriculum", "Academic Help"],
  ["campus-map", "Campus map"],
  ["clubs", "Campus clubs"],
  ["surveys", "Campus opinions"],
];

const themeToggle = byId("adminThemeToggle");
const themeLabel = themeToggle?.querySelector("[data-theme-toggle-label]");
const adminStyle = document.createElement("style");
adminStyle.textContent = `
  .admin-section-nav { display: flex; gap: 8px; max-width: 760px; margin: 0 auto 18px; }
  .admin-section-nav button, .admin-section-select { padding: 10px 13px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 700 12px Manrope; cursor: pointer; }
  .admin-section-nav button.is-active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .admin-section-select { display: none; width: 100%; }
  .is-admin-section-hidden { display: none; }
  .survey-admin { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); }
  .survey-admin h2 { margin: 0 0 8px; font-size: 18px; } .survey-admin p { color: var(--muted); font-size: 13px; line-height: 1.6; }
  .survey-admin label { display: block; margin-top: 14px; font-size: 12px; font-weight: 800; } .survey-admin input[type=text], .survey-admin textarea, .survey-admin select { display: block; width: 100%; margin-top: 6px; padding: 10px; border: 1px solid var(--line); border-radius: 5px; background: #fff; color: var(--ink); font: 13px Manrope; }
  .survey-admin textarea { min-height: 80px; resize: vertical; } .survey-admin input[type=checkbox] { margin-right: 8px; accent-color: var(--ink); }
  .survey-question-editor { margin-top: 18px; padding: 16px; border: 1px solid var(--line); border-radius: 7px; } .survey-question-editor-header { display: flex; justify-content: space-between; gap: 12px; align-items: center; } .survey-question-editor-header strong { font-size: 13px; } .survey-question-editor button, .survey-admin-action { padding: 9px 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 800 12px Manrope; cursor: pointer; } .survey-publish { margin-top: 18px; border: 0; background: var(--ink); color: #fff; }
  .survey-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; } .survey-options input { margin-top: 0 !important; } .survey-admin-message { min-height: 18px; margin: 12px 0 0 !important; } .survey-results { margin-top: 34px; } .survey-result-card { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--line); } .survey-result-card h3 { margin: 0; font-size: 14px; } .survey-bar-row { display: grid; grid-template-columns: minmax(90px, .8fr) minmax(0, 2fr) 38px; gap: 10px; align-items: center; margin-top: 10px; font-size: 12px; } .survey-bar { height: 9px; overflow: hidden; border-radius: 999px; background: var(--line); } .survey-bar i { display: block; height: 100%; background: var(--ink); } .survey-written-answer { margin: 10px 0 0; padding: 11px; border-radius: 5px; background: var(--surface-muted); color: var(--ink) !important; font-size: 12px !important; white-space: pre-wrap; } .survey-written-answer small { display: block; margin-bottom: 5px; color: var(--muted); font: 10px "DM Mono", monospace; }
  @media (max-width: 700px) { .admin-section-nav { display: block; } .admin-section-nav button { display: none; } .admin-section-select { display: block; } }
`;
document.head.append(adminStyle);

function initializeTheme() {
  if (!themeToggle || !themeLabel) return;
  const root = document.documentElement;
  const applyTheme = (theme) => {
    root.toggleAttribute("data-theme", theme === "dusk");
    themeToggle.setAttribute("aria-pressed", String(theme === "dusk"));
    themeLabel.textContent = theme === "dusk" ? "Dusk" : "Lime";
  };
  let theme = "lime";
  try { theme = localStorage.getItem("lnmiit-theme") || "lime"; } catch (error) { console.error("Theme preference could not be read.", error); }
  applyTheme(theme);
  themeToggle.addEventListener("click", () => {
    const next = root.hasAttribute("data-theme") ? "lime" : "dusk";
    try { localStorage.setItem("lnmiit-theme", next); } catch (error) { console.error("Theme preference could not be saved.", error); }
    applyTheme(next);
  });
}

function showLogin(message = "") {
  byId("adminLogin").classList.remove("hidden");
  byId("analyticsPanel").classList.add("hidden");
  byId("adminSectionNav")?.classList.add("hidden");
  byId("adminMessage").textContent = message;
}

function showAdmin() {
  byId("adminLogin").classList.add("hidden");
  byId("analyticsPanel").classList.remove("hidden");
  byId("adminSectionNav")?.classList.remove("hidden");
}

function createSectionNav() {
  if (byId("adminSectionNav")) return;
  const nav = document.createElement("nav");
  nav.id = "adminSectionNav";
  nav.className = "admin-section-nav";
  nav.setAttribute("aria-label", "Admin sections");
  nav.innerHTML = `<button type="button" data-section="traffic" class="is-active">Traffic</button><button type="button" data-section="surveys">Opinions</button><button type="button" data-section="visibility">Hide tabs</button><select class="admin-section-select" aria-label="Admin section"><option value="traffic">Traffic</option><option value="surveys">Opinions</option><option value="visibility">Hide tabs</option></select>`;
  byId("analyticsPanel").before(nav);
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");
    if (button) setSection(button.dataset.section);
  });
  nav.querySelector("select").addEventListener("change", (event) => setSection(event.target.value));
}

function setSection(section) {
  [".analytics-topline", ".analytics-subtitle", ".traffic-stats", ".traffic-breakdown"].forEach((selector) => {
    document.querySelector(selector)?.classList.toggle("is-admin-section-hidden", section !== "traffic");
  });
  byId("sectionVisibilityPanel")?.classList.toggle("is-admin-section-hidden", section !== "visibility");
  byId("surveyAdminPanel")?.classList.toggle("is-admin-section-hidden", section !== "surveys");
  if (section === "surveys" && !surveyResultsLoaded) { surveyResultsLoaded = true; loadSurveyResults(); }
  document.querySelectorAll("[data-section]").forEach((button) => button.classList.toggle("is-active", button.dataset.section === section));
  const select = document.querySelector(".admin-section-select");
  if (select) select.value = section;
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function questionEditor(number) {
  const question = document.createElement("fieldset");
  question.className = "survey-question-editor";
  question.innerHTML = `<div class="survey-question-editor-header"><strong>Question ${number}</strong><button type="button" class="remove-survey-question">Remove</button></div><label>Question<input class="survey-question-prompt" type="text" maxlength="500" required></label><label>Answer type<select class="survey-question-type"><option value="mcq">Multiple choice</option><option value="written">Written answer</option></select></label><div class="survey-options"><input type="text" maxlength="200" placeholder="Option 1" required><input type="text" maxlength="200" placeholder="Option 2" required><input type="text" maxlength="200" placeholder="Option 3"><input type="text" maxlength="200" placeholder="Option 4"></div>`;
  question.querySelector(".survey-question-type").addEventListener("change", (event) => {
    const options = question.querySelector(".survey-options");
    const isMcq = event.target.value === "mcq";
    options.hidden = !isMcq;
    options.querySelectorAll("input").forEach((input, index) => { input.required = isMcq && index < 2; });
  });
  question.querySelector(".remove-survey-question").addEventListener("click", () => { question.remove(); renumberQuestions(); });
  return question;
}

function renumberQuestions() { document.querySelectorAll(".survey-question-editor").forEach((question, index) => { question.querySelector("strong").textContent = `Question ${index + 1}`; }); }

function createSurveyPanel() {
  if (byId("surveyAdminPanel")) return byId("surveyAdminPanel");
  const panel = document.createElement("section");
  panel.id = "surveyAdminPanel";
  panel.className = "survey-admin is-admin-section-hidden";
  panel.innerHTML = `<h2>Publish an opinion</h2><p>Create one or more multiple-choice or written questions. Publishing a new opinion closes any currently published one.</p><form id="surveyEditor"><label>Title<input id="surveyTitle" type="text" maxlength="140" required></label><label>Description <textarea id="surveyDescription" maxlength="1000"></textarea></label><label><input id="surveyCollectName" type="checkbox">Collect respondent names (leave unchecked for anonymous opinions)</label><div id="surveyQuestionEditors"></div><button class="survey-admin-action" id="addSurveyQuestion" type="button">Add question</button><button class="survey-admin-action survey-publish" type="submit">Publish opinion</button><p class="survey-admin-message" role="status"></p></form><div class="survey-results"><h2>Opinion results</h2><div id="surveyResults"><p>Loading results…</p></div></div>`;
  panel.querySelector("p").textContent = "Publish as many open opinions as needed. Each can contain multiple-choice and written questions.";
  byId("analyticsPanel").append(panel);
  const editors = panel.querySelector("#surveyQuestionEditors");
  const password = document.createElement("label");
  password.innerHTML = `Survey password (optional)<input id="surveyPassword" type="password" maxlength="200" autocomplete="new-password" placeholder="Leave blank for public access">`;
  editors.before(password);
  editors.append(questionEditor(1));
  panel.querySelector("#addSurveyQuestion").addEventListener("click", () => editors.append(questionEditor(editors.children.length + 1)));
  panel.querySelector("#surveyEditor").addEventListener("submit", publishSurvey);
  return panel;
}

async function publishSurvey(event) {
  event.preventDefault();
  const form = event.currentTarget, message = form.querySelector(".survey-admin-message"), button = event.submitter;
  const questionNodes = [...form.querySelectorAll(".survey-question-editor")];
  const questions = questionNodes.map((node, index) => {
    const type = node.querySelector(".survey-question-type").value;
    const options = type === "mcq" ? [...node.querySelectorAll(".survey-options input")].map((input) => input.value.trim()).filter(Boolean) : [];
    return { position: index + 1, prompt: node.querySelector(".survey-question-prompt").value.trim(), question_type: type, options };
  });
  if (!questions.length || questions.some((question) => !question.prompt || (question.question_type === "mcq" && question.options.length < 2))) { message.textContent = "Every question needs a prompt, and multiple-choice questions need at least two options."; return; }
  button.disabled = true; message.textContent = "Publishing…";
  supabase.rpc("clean_abandoned_survey_drafts").catch((error) => console.warn("Abandoned survey drafts could not be cleaned.", error));
  const { data: survey, error: surveyError } = await supabase.from("surveys").insert({ title: byId("surveyTitle").value.trim(), description: byId("surveyDescription").value.trim(), collect_name: byId("surveyCollectName").checked, is_published: false }).select("id").single();
  const { error: questionsError } = surveyError ? { error: surveyError } : await supabase.from("survey_questions").insert(questions.map((question) => ({ ...question, survey_id: survey.id })));
  const enteredPassword = byId("surveyPassword").value;
  const { error: passwordError } = questionsError || !enteredPassword ? { error: questionsError } : await supabase.rpc("set_survey_password", { p_survey_id: survey.id, p_password: enteredPassword });
  button.disabled = false;
  if (passwordError) { if (survey?.id) await supabase.from("surveys").delete().eq("id", survey.id); message.textContent = "The opinion could not be published."; return; }
  const { error: publishError } = await supabase.from("surveys").update({ is_published: true, published_at: new Date().toISOString() }).eq("id", survey.id);
  if (publishError) { await supabase.from("surveys").delete().eq("id", survey.id); message.textContent = "The opinion could not be published."; return; }
  form.reset(); form.querySelector("#surveyQuestionEditors").replaceChildren(questionEditor(1)); message.textContent = "Opinion published."; selectedAdminSurveyId = survey.id; surveyResultsLoaded = true; loadSurveyResults(true);
}

async function loadSurveyResults(refresh = false) {
  const target = byId("surveyResults"); if (!target) return;
  let surveys = adminSurveys, error = null;
  if (refresh || !surveys.length) ({ data: surveys, error } = await supabase.from("surveys").select("id,title,description,collect_name,is_published,created_at").order("created_at", { ascending: false }));
  if (error || !surveys?.length) { target.innerHTML = "<p>No opinions have been published yet.</p>"; return; }
  adminSurveys = surveys;
  if (!selectedAdminSurveyId || !surveys.some((item) => item.id === selectedAdminSurveyId)) selectedAdminSurveyId = surveys[0].id;
  const survey = surveys.find((item) => item.id === selectedAdminSurveyId);
  const [{ data: questions }, { data: responses }] = await Promise.all([supabase.from("survey_questions").select("id,prompt,question_type,options,position").eq("survey_id", survey.id).order("position"), supabase.from("survey_responses").select("id,respondent_name,submitted_at").eq("survey_id", survey.id)]);
  const responseIds = (responses ?? []).map((response) => response.id);
  const { data: answers } = responseIds.length ? await supabase.from("survey_answers").select("response_id,question_id,answer_text").in("response_id", responseIds) : { data: [] };
  const responseById = new Map((responses ?? []).map((response) => [response.id, response]));
  target.innerHTML = `<p><strong>${escapeHtml(survey.title)}</strong> · ${responses?.length ?? 0} response${responses?.length === 1 ? "" : "s"}${survey.is_published ? " · currently open" : ""}</p>${(questions ?? []).map((question) => {
    const questionAnswers = (answers ?? []).filter((answer) => answer.question_id === question.id);
    if (question.question_type === "mcq") { const counts = new Map(question.options.map((option) => [option, 0])); questionAnswers.forEach((answer) => counts.set(answer.answer_text, (counts.get(answer.answer_text) ?? 0) + 1)); const max = Math.max(1, ...counts.values()); return `<article class="survey-result-card"><h3>${escapeHtml(question.prompt)}</h3>${[...counts].map(([option, count]) => `<div class="survey-bar-row"><span>${escapeHtml(option)}</span><div class="survey-bar"><i style="width:${Math.round(count / max * 100)}%"></i></div><strong>${count}</strong></div>`).join("")}</article>`; }
    return `<article class="survey-result-card"><h3>${escapeHtml(question.prompt)}</h3>${questionAnswers.length ? questionAnswers.map((answer) => `<p class="survey-written-answer">${survey.collect_name ? `<small>${escapeHtml(responseById.get(answer.response_id)?.respondent_name || "Unnamed")}</small>` : ""}${escapeHtml(answer.answer_text)}</p>`).join("") : "<p>No written responses yet.</p>"}</article>`;
  }).join("")}`;
  target.insertAdjacentHTML("afterbegin", `<label class="survey-result-picker">View or manage opinion<select id="surveyResultPicker">${surveys.map((item) => `<option value="${item.id}"${item.id === survey.id ? " selected" : ""}>${escapeHtml(item.title)}${item.is_published ? " (open)" : ""}</option>`).join("")}</select></label><div class="survey-result-actions"><button type="button" id="editSurvey">Edit details</button><button type="button" id="deleteSurvey">Delete survey</button></div>`);
  byId("surveyResultPicker").addEventListener("change", (event) => { selectedAdminSurveyId = event.target.value; loadSurveyResults(); });
  byId("editSurvey").addEventListener("click", editSelectedSurvey);
  byId("deleteSurvey").addEventListener("click", deleteSelectedSurvey);
}

async function editSelectedSurvey() {
  const survey = adminSurveys.find((item) => item.id === selectedAdminSurveyId); if (!survey) return;
  const title = prompt("Opinion title", survey.title); if (title === null || !title.trim()) return;
  const description = prompt("Opinion description", survey.description || ""); if (description === null) return;
  const collectName = confirm("Select OK to collect respondent names. Select Cancel to keep responses anonymous.");
  const password = prompt("Enter a new password. Leave it blank to remove password protection."); if (password === null) return;
  const { error } = await supabase.from("surveys").update({ title: title.trim(), description: description.trim(), collect_name: collectName }).eq("id", survey.id);
  if (error) { alert("The opinion could not be updated."); return; }
  const { error: passwordError } = await supabase.rpc("set_survey_password", { p_survey_id: survey.id, p_password: password });
  if (passwordError) { alert("The survey details changed, but its password could not be saved."); }
  loadSurveyResults(true);
}

async function deleteSelectedSurvey() {
  const survey = adminSurveys.find((item) => item.id === selectedAdminSurveyId);
  if (!survey || !confirm(`Delete “${survey.title}” and all of its responses? This cannot be undone.`)) return;
  const { error } = await supabase.from("surveys").delete().eq("id", survey.id);
  if (error) { alert("The opinion could not be deleted."); return; }
  selectedAdminSurveyId = null; loadSurveyResults(true);
}

async function loadAnalytics() {
  const { data, error } = await supabase.rpc("get_site_traffic_analytics");
  if (error) throw error;
  byId("todayViews").textContent = data.today ?? 0;
  byId("weekViews").textContent = data.week ?? 0;
  byId("allViews").textContent = data.all ?? 0;
  const breakdown = data.breakdown ?? {};
  byId("trafficBreakdown").replaceChildren(...Object.entries(pageNames).map(([path, name]) => {
    const row = document.createElement("div");
    row.className = "traffic-row";
    row.innerHTML = `<span>${name}</span><span>${breakdown[path] ?? 0} views</span>`;
    return row;
  }));
}

function createVisibilityPanel() {
  const panel = document.createElement("section");
  panel.id = "sectionVisibilityPanel";
  panel.className = "section-visibility";
  panel.innerHTML = `<h2>Public section visibility</h2><p>Temporarily hide any campus section from visitors. Hidden sections are removed from navigation and direct visits show an unavailable message.</p><div class="section-visibility-list"></div><p class="section-visibility-message" role="status"></p>`;
  byId("analyticsPanel").append(panel);
  panel.addEventListener("click", (event) => {
    const button = event.target.closest(".visibility-toggle");
    if (button) updateVisibility(panel, button);
  });
  return panel;
}

function renderVisibility(panel, rows) {
  const visibility = new Map(rows.map((row) => [row.section_key, row.is_public]));
  panel.querySelector(".section-visibility-list").replaceChildren(...sections.map(([key, label]) => {
    const row = document.createElement("div");
    row.className = "section-visibility-row";
    const name = document.createElement("strong");
    name.textContent = label;
    const button = document.createElement("button");
    const isPublic = visibility.get(key) !== false;
    button.type = "button";
    button.className = "visibility-toggle";
    button.dataset.sectionKey = key;
    button.dataset.isPublic = String(isPublic);
    button.textContent = isPublic ? "Public" : "Hidden";
    button.setAttribute("aria-pressed", String(isPublic));
    row.append(name, button);
    return row;
  }));
}

async function loadVisibility(panel) {
  const { data, error } = await supabase.from("site_section_visibility").select("section_key, is_public").order("section_key");
  if (error) throw error;
  renderVisibility(panel, data ?? []);
}

async function updateVisibility(panel, button) {
  const nextValue = button.dataset.isPublic !== "true";
  button.disabled = true;
  const { data, error } = await supabase.from("site_section_visibility").update({ is_public: nextValue }).eq("section_key", button.dataset.sectionKey).select("section_key, is_public").maybeSingle();
  button.disabled = false;
  if (error || !data) {
    panel.querySelector(".section-visibility-message").textContent = "Could not save that visibility change.";
    console.error("Section visibility could not be updated.", error ?? "No row was updated.");
    return;
  }
  button.dataset.isPublic = String(data.is_public);
  button.textContent = data.is_public ? "Public" : "Hidden";
  button.setAttribute("aria-pressed", String(data.is_public));
}

async function initializeAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return showLogin();
  const { data: profile, error } = await supabase.from("user_profiles").select("is_active").eq("id", session.user.id).maybeSingle();
  if (error || profile?.is_active !== true || session.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return showLogin("This account is not authorized for the admin dashboard.");
  }
  showAdmin();
  createSectionNav();
  const visibilityPanel = byId("sectionVisibilityPanel") || createVisibilityPanel();
  createSurveyPanel();
  setSection("traffic");
  try { await Promise.all([loadAnalytics(), loadVisibility(visibilityPanel)]); } catch (loadError) { console.error("Admin data could not be loaded.", loadError); }
}

supabase.auth.onAuthStateChange((event, session) => {
  if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) initializeAdmin();
  if (!session && event === "SIGNED_OUT") showLogin();
});

byId("adminLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  const { error } = await supabase.auth.signInWithPassword({ email: byId("adminEmail").value.trim(), password: byId("adminPassword").value });
  button.disabled = false;
  if (error) showLogin("Check the email and password, then try again.");
});
byId("adminGoogleLogin").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/admin.html` } });
  if (error) { event.currentTarget.disabled = false; byId("adminMessage").textContent = "Google sign-in could not be started."; }
});
byId("adminSignOut").addEventListener("click", () => supabase.auth.signOut());

initializeTheme();
initializeAdmin();
