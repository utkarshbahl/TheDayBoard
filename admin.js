import { supabase } from './supabase.js';

const $ = (id) => document.getElementById(id);
const pageNames = { '/': 'Laundry status', '/mess-menu': 'Mess menu', '/bus-timings': 'Bus timings', '/campus-map': 'Campus map', '/curriculum': 'B.Tech curriculum' };

function showLogin(message = '') { $('adminLogin').classList.remove('hidden'); $('analyticsPanel').classList.add('hidden'); $('adminMessage').textContent = message; }
function showDashboard() { $('adminLogin').classList.add('hidden'); $('analyticsPanel').classList.remove('hidden'); }
async function loadDashboard() {
  try {
    const { data, error } = await supabase.rpc('get_site_traffic_analytics');
    if (error) throw error;
    $('todayViews').textContent = data.today ?? 0; $('weekViews').textContent = data.week ?? 0; $('allViews').textContent = data.all ?? 0;
    const counts = data.breakdown ?? {};
    $('trafficBreakdown').replaceChildren(...Object.entries(pageNames).map(([path, name]) => { const row = document.createElement('div'); row.className = 'traffic-row'; row.innerHTML = `<span>${name}</span><span>${counts[path] ?? 0} views</span>`; return row; }));
  } catch { showLogin('This account is not allowed to view analytics.'); }
}
async function checkAdmin() { const { data: { session } } = await supabase.auth.getSession(); if (!session) return showLogin(); if (session.user.app_metadata?.role !== 'admin') { await supabase.auth.signOut(); return showLogin('This account is not an admin account.'); } showDashboard(); loadDashboard(); }
$('adminLoginForm').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; const { error } = await supabase.auth.signInWithPassword({ email: $('adminEmail').value.trim(), password: $('adminPassword').value }); button.disabled = false; if (error) return showLogin('Check the email and password, then try again.'); checkAdmin(); });
$('adminSignOut').addEventListener('click', async () => { await supabase.auth.signOut(); showLogin(); });
checkAdmin();
