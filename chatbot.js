import { supabase } from "./supabase.js";

const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const sendButton = document.querySelector("#chatSend");
const messages = document.querySelector("#chatMessages");
const status = document.querySelector("#chatStatus");
const conversation = [];
let chatbotSettings = {
  enabled: true,
  name: "TheDayBoard AI",
  welcome: "Hi! I’m your campus assistant. What would you like to know?",
  model: "openai-fast",
  instructions: "",
};

const addMessage = (text, role, extraClass = "") => {
  const message = document.createElement("div");
  message.className = `chat-message ${role} ${extraClass}`.trim();
  message.textContent = text;
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
};

const getQuickAnswer = (question) => {
  const text = question.toLowerCase();
  if (/\b(laundry|token|collection)\b/.test(text)) return "Open Laundry Status from the home page to see the current collection token.";
  if (/\b(mess|food|menu)\b/.test(text)) return "Open Mess Menu from the home page to view the available mess menu.";
  if (/\b(bus|transport|timing|schedule)\b/.test(text)) return "Open Bus Timings from the home page to check campus bus information.";
  if (/\b(curriculum|course|academic|subject|sgpa)\b/.test(text)) return "Open Academic Help to view curriculum and course resources.";
  if (/\b(map|location|where)\b/.test(text)) return "Open Campus Map to find places on campus.";
  if (/\b(club|society)\b/.test(text)) return "Open Campus Clubs to explore campus clubs.";
  if (/\b(survey|opinion|feedback)\b/.test(text)) return "Open Campus Opinions to view or submit surveys.";
  if (/\b(sign in|signin|login|google)\b/.test(text)) return "Use the Sign in button in the navigation to continue with Google.";
  if (/\b(dark|light|theme|dusk)\b/.test(text)) return "Use the theme toggle in the top navigation to switch between Light and Dark mode.";
  if (/\b(search|find)\b/.test(text)) return "Use the Find a service search field on the home page to quickly locate a feature.";
  return "";
};

const askAssistant = async (question) => {
  const context = `You are ${chatbotSettings.name}, TheDayBoard's website assistant for LNMIIT.
Only answer questions about features and information available on TheDayBoard:
- Laundry Status: checking the current collection token.
- Mess Menu: viewing today's mess menu.
- Bus Timings: planning campus bus journeys.
- Academic Help: viewing curriculum and course resources.
- Campus Map: finding places on campus.
- Campus Clubs: exploring clubs.
- Campus Opinions: viewing or submitting surveys.
- AI Chat: asking this assistant website-feature questions.
- Sign in: Google sign-in for personalized preferences and campus features.
- Theme toggle, service search, and navigation.
Do not answer general knowledge, entertainment, coding, personal advice, politics, or unrelated questions. For those, say: "I can only help with TheDayBoard's website features and campus services."
Do not invent schedules, menus, tokens, locations, policies, or other campus facts that are not shown on the website. If the website does not provide the answer, say that clearly. Keep answers brief and helpful.
Additional administrator instruction: ${chatbotSettings.instructions || "None"}`;
  const transcript = conversation.slice(-4).map(({ role, text }) => `${role}: ${text.slice(0, 240)}`).join("\n");
  const prompt = `${context}\n${transcript}\nuser: ${question}\nassistant:`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  let response;
  try {
    const model = chatbotSettings.model ? `?model=${encodeURIComponent(chatbotSettings.model)}` : "";
    response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}${model}`, {
      headers: { Accept: "text/plain" },
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`AI service returned ${response.status}`);
  const answer = (await response.text()).trim();
  if (!answer) throw new Error("AI service returned an empty answer");
  return answer;
};

const loadChatbotSettings = async () => {
  const { data, error } = await supabase.from("site_settings").select("key,value").in("key", [
    "chatbot_enabled", "chatbot_name", "chatbot_welcome", "chatbot_model", "chatbot_instructions",
  ]);
  if (error) {
    console.error("Chatbot settings could not be loaded.", error);
    return;
  }
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  chatbotSettings = {
    enabled: values.chatbot_enabled !== "false",
    name: values.chatbot_name || chatbotSettings.name,
    welcome: values.chatbot_welcome || chatbotSettings.welcome,
    model: values.chatbot_model || chatbotSettings.model,
    instructions: values.chatbot_instructions || "",
  };
  const welcome = messages.querySelector(".assistant");
  if (welcome) welcome.textContent = chatbotSettings.welcome;
  if (!chatbotSettings.enabled) {
    input.disabled = true;
    sendButton.disabled = true;
    document.querySelectorAll(".floating-chat-link").forEach((link) => link.remove());
    status.textContent = "AI Chat is currently hidden by the administrator.";
    addMessage("AI Chat is currently unavailable.", "assistant", "error");
  }
};

const recordRequest = () => {
  supabase.from("chatbot_requests").insert({}).then(({ error }) => {
    if (error) console.error("Chatbot request could not be recorded.", error);
  });
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question || sendButton.disabled || !chatbotSettings.enabled) return;
  input.value = "";
  addMessage(question, "user");
  conversation.push({ role: "user", text: question });
  recordRequest();
  sendButton.disabled = true;
  status.textContent = "Thinking...";
  try {
    const quickAnswer = getQuickAnswer(question);
    const answer = quickAnswer || await askAssistant(question);
    addMessage(answer, "assistant");
    conversation.push({ role: "assistant", text: answer });
    status.textContent = "Website and campus-service questions only. Please do not share passwords or private information.";
  } catch (error) {
    console.error("Chatbot request failed.", error);
    addMessage("I could not connect right now. Please try again in a moment.", "assistant", "error");
    status.textContent = "The free AI service is temporarily unavailable.";
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
});

loadChatbotSettings();
