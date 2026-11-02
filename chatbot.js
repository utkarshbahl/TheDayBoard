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
  const context = "You are TheDayBoard's helpful campus assistant for LNMIIT. Answer briefly and clearly about campus services, laundry, mess, buses, academics, campus map, clubs, and surveys. If you do not know something, say so instead of inventing details.";
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
    status.textContent = "Free to use. Please do not share passwords or private information.";
  } catch (error) {
    console.error("Chatbot request failed.", error);
    addMessage("I could not connect right now. Please try again in a moment.", "assistant", "error");
    status.textContent = "The free AI service is temporarily unavailable.";
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
});
