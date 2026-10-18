import { supabase } from "./supabase.js";

const form = document.getElementById("updateForm");
const number = document.getElementById("newNumber");
const message = document.getElementById("updateMessage");

async function loadToken() {
  const { data, error } = await supabase.from("laundry_status").select("ready_token").eq("id", 1).single();
  if (error) throw error;
  number.value = data.ready_token;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  button.textContent = "Updating…";
  const { error } = await supabase.from("laundry_status").update({ ready_token: Number(number.value) }).eq("id", 1);
  button.disabled = false;
  button.textContent = "Update live board";
  message.style.color = error ? "#b94331" : "#438022";
  message.textContent = error ? `Could not update: ${error.message}` : "Done! Students can see the new number.";
});

loadToken().catch((error) => {
  message.style.color = "#b94331";
  message.textContent = "Could not load the current token.";
  console.error("Laundry token could not be loaded.", error);
});
