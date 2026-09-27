import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { doc, getFirestore, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

// This is the public live-status record used by laundry-lnm.web.app.
const laundrySource = initializeApp({
  apiKey: 'AIzaSyCtvIAHZs-8Dx-5E0tawonsIOCFF9P4uRs',
  authDomain: 'laundry-lnm.firebaseapp.com',
  projectId: 'laundry-lnm',
  storageBucket: 'laundry-lnm.firebasestorage.app',
  messagingSenderId: '133361113684',
  appId: '1:133361113684:web:dfec439cc08d55c9edebc1',
});
const laundryStatus = doc(getFirestore(laundrySource), 'laundry', 'status');

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
  const dashboardToken = $('dashboardToken');
  if (dashboardToken) dashboardToken.textContent = display;
  $('tokenCard').setAttribute('aria-busy', 'false');
}

onSnapshot(laundryStatus, (snapshot) => {
  const readyToken = Number(snapshot.data()?.readyThrough);
  if (!snapshot.exists() || !Number.isInteger(readyToken) || readyToken < 0) {
    console.warn('Laundry status is unavailable or invalid.');
    $('rangeText').textContent = 'temporarily unavailable';
    $('updatedTime').textContent = 'unavailable';
    $('tokenCard').setAttribute('aria-busy', 'false');
    return;
  }

  setStatus(readyToken, snapshot.updateTime?.toDate() ?? new Date());
}, (error) => {
  console.warn('Laundry status could not be loaded.', error.message);
  $('rangeText').textContent = 'temporarily unavailable';
  $('updatedTime').textContent = 'unavailable';
  $('tokenCard').setAttribute('aria-busy', 'false');
});

setInterval(() => statusUpdatedAt && ($('updatedTime').textContent = timeAgo(statusUpdatedAt)), 60000);
