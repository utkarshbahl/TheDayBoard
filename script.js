const $ = (id) => document.getElementById(id);
const number = $('readyNumber');
const range = $('rangeText');
const saved = localStorage.getItem('lnmiitLaundryToken');

function padded(value) { return String(value).padStart(3, '0'); }
function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} min ago`;
  return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
function setStatus(value, timestamp = Date.now()) {
  const display = padded(value);
  number.textContent = display;
  range.textContent = `${display} or lower`;
  $('updatedTime').textContent = timeAgo(timestamp);
}
if (saved) {
  const data = JSON.parse(saved);
  setStatus(data.number, data.updatedAt);
}

$('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('staffName').value.trim();
  const password = $('staffPassword').value;
  // Demo-only authentication. Replace with server-side authentication before production use.
  if (password !== 'lnmiitlaundry') {
    $('loginMessage').textContent = 'That password is not recognised.';
    return;
  }
  sessionStorage.setItem('lnmiitLaundryStaff', name);
  showUpdate(name);
});
function showUpdate(name) {
  $('loginPanel').classList.add('hidden');
  $('updatePanel').classList.remove('hidden');
  $('signedInName').textContent = name;
  $('newNumber').value = Number(number.textContent);
}
$('updateForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const value = Number($('newNumber').value);
  localStorage.setItem('lnmiitLaundryToken', JSON.stringify({ number: value, updatedAt: Date.now() }));
  setStatus(value);
  $('updateMessage').style.color = '#438022';
  $('updateMessage').textContent = 'Live status published successfully.';
  setTimeout(() => { $('updateMessage').textContent = ''; }, 3000);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
$('signOut').addEventListener('click', () => {
  sessionStorage.removeItem('lnmiitLaundryStaff');
  $('updatePanel').classList.add('hidden');
  $('loginPanel').classList.remove('hidden');
  $('staffPassword').value = '';
});
const activeStaff = sessionStorage.getItem('lnmiitLaundryStaff');
if (activeStaff) showUpdate(activeStaff);
