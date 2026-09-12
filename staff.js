import { supabase } from './supabase.js';

const $ = (id) => document.getElementById(id);
function showUpdate() {
  $('loginPanel').classList.add('hidden');
  $('updatePanel').classList.remove('hidden');
  $('newNumber').focus();
}
async function currentNumber() {
  const { data } = await supabase.from('laundry_status').select('ready_token').eq('id', 1).single();
  if (data) $('newNumber').value = data.ready_token;
}
$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true; button.textContent = 'Signing in…';
  const { error } = await supabase.auth.signInWithPassword({ email: $('staffEmail').value.trim(), password: $('staffPassword').value });
  button.disabled = false; button.textContent = 'Sign in';
  if (error) { $('loginMessage').textContent = 'Check the email and password, then try again.'; return; }
  showUpdate(); currentNumber();
});
$('updateForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true; button.textContent = 'Updating…';
  const { error } = await supabase.from('laundry_status').update({ ready_token: Number($('newNumber').value) }).eq('id', 1);
  button.disabled = false; button.textContent = 'Update live board';
  $('updateMessage').style.color = error ? '#b94331' : '#438022';
  $('updateMessage').textContent = error ? 'Could not update. Try again.' : 'Done! Students can see the new number.';
});
$('signOut').addEventListener('click', async () => { await supabase.auth.signOut(); location.reload(); });
const { data: { session } } = await supabase.auth.getSession();
if (session) { showUpdate(); currentNumber(); }
