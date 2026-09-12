import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://xlepegdbvdrtyvjzhgxm.supabase.co',
  'sb_publishable_7ZGpCpVSNZsy0Y5D6pz7Ew_nPV-AJP2'
);
const $ = (id) => document.getElementById(id);
const number = $('readyNumber');
const range = $('rangeText');
let statusUpdatedAt;

function padded(value) { return String(value).padStart(3, '0'); }
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} min ago`;
  return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
function setStatus(value, timestamp) {
  const display = padded(value);
  number.textContent = display;
  range.textContent = `${display} or lower`;
  statusUpdatedAt = timestamp;
  $('updatedTime').textContent = timeAgo(timestamp);
}
async function loadStatus() {
  const { data, error } = await supabase.from('laundry_status').select('ready_token, updated_at').eq('id', 1).single();
  if (error) { console.warn('Laundry status could not be loaded.', error.message); return; }
  setStatus(data.ready_token, data.updated_at);
}
function showUpdate(user) {
  $('loginPanel').classList.add('hidden');
  $('updatePanel').classList.remove('hidden');
  $('signedInName').textContent = user.email.split('@')[0];
  $('newNumber').value = Number(number.textContent);
}

$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  $('loginMessage').textContent = '';
  button.disabled = true; button.textContent = 'Signing in…';
  const { data, error } = await supabase.auth.signInWithPassword({
    email: $('staffEmail').value.trim(), password: $('staffPassword').value
  });
  button.disabled = false; button.innerHTML = 'Sign in <span>→</span>';
  if (error) { $('loginMessage').textContent = 'Could not sign in. Check your email and password.'; return; }
  showUpdate(data.user);
});

$('updateForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const value = Number($('newNumber').value);
  const button = event.submitter;
  $('updateMessage').textContent = '';
  button.disabled = true; button.textContent = 'Publishing…';
  const { error } = await supabase.from('laundry_status').update({ ready_token: value }).eq('id', 1);
  button.disabled = false; button.innerHTML = 'Publish update <span>→</span>';
  if (error) {
    $('updateMessage').style.color = '#e65a43';
    $('updateMessage').textContent = 'Update failed. Please try again.';
    return;
  }
  $('updateMessage').style.color = '#438022';
  $('updateMessage').textContent = 'Live status published successfully.';
});

$('signOut').addEventListener('click', async () => {
  await supabase.auth.signOut();
  $('updatePanel').classList.add('hidden');
  $('loginPanel').classList.remove('hidden');
  $('staffPassword').value = '';
});

supabase.channel('laundry-status-live')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'laundry_status', filter: 'id=eq.1' },
    (payload) => setStatus(payload.new.ready_token, payload.new.updated_at))
  .subscribe();

const { data: { session } } = await supabase.auth.getSession();
if (session) showUpdate(session.user);
loadStatus();
setInterval(() => statusUpdatedAt && ($('updatedTime').textContent = timeAgo(statusUpdatedAt)), 60000);
