const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const sendButton = document.querySelector("#chatSend");
const messages = document.querySelector("#chatMessages");
const status = document.querySelector("#chatStatus");
const conversation = [];

const addMessage = (text, role, extraClass = "") => {
  const message = document.createElement("div");
  message.className = `chat-message ${role} ${extraClass}`.trim();
  message.textContent = text;
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
};

const askAssistant = async (question) => {
  const context = `You are TheDayBoard's website assistant for LNMIIT.
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
Do not invent schedules, menus, tokens, locations, policies, or other campus facts that are not shown on the website. If the website does not provide the answer, say that clearly. Keep answers brief and helpful.`;
  const transcript = conversation.slice(-6).map(({ role, text }) => `${role}: ${text}`).join("\n");
  const prompt = `${context}\n${transcript}\nuser: ${question}\nassistant:`;
  const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
    headers: { Accept: "text/plain" },
  });
  if (!response.ok) throw new Error(`AI service returned ${response.status}`);
  const answer = (await response.text()).trim();
  if (!answer) throw new Error("AI service returned an empty answer");
  return answer;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question || sendButton.disabled) return;
  input.value = "";
  addMessage(question, "user");
  conversation.push({ role: "user", text: question });
  sendButton.disabled = true;
  status.textContent = "Thinking...";
  try {
    const answer = await askAssistant(question);
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
