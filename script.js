import { supabase } from './supabase.js';
const $ = (id) => document.getElementById(id);
const number = $('readyNumber');
const range = $('rangeText');
const themeToggle = $('themeToggle');
let statusUpdatedAt;

function setTheme(isDark) {
  document.body.classList.toggle('customer-dark', isDark);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.querySelector('[aria-hidden="true"]').textContent = isDark ? '☀' : '☾';
  themeToggle.querySelector('.theme-toggle-text').textContent = isDark ? 'Light' : 'Dark';
}

setTheme(localStorage.getItem('customer-theme') === 'dark');
themeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('customer-dark');
  localStorage.setItem('customer-theme', isDark ? 'dark' : 'light');
  setTheme(isDark);
});

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
  $('tokenCard').setAttribute('aria-busy', 'false');
}
async function loadStatus() {
  const { data, error } = await supabase.from('laundry_status').select('ready_token, updated_at').eq('id', 1).single();
  if (error) {
    console.warn('Laundry status could not be loaded.', error.message);
    $('rangeText').textContent = 'temporarily unavailable';
    $('updatedTime').textContent = 'unavailable';
    $('tokenCard').setAttribute('aria-busy', 'false');
    return;
  }
  setStatus(data.ready_token, data.updated_at);
}
supabase.channel('laundry-status-live')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'laundry_status', filter: 'id=eq.1' },
    (payload) => setStatus(payload.new.ready_token, payload.new.updated_at))
  .subscribe();

loadStatus();
setInterval(() => statusUpdatedAt && ($('updatedTime').textContent = timeAgo(statusUpdatedAt)), 60000);
