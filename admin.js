import { supabase } from './supabase.js';

const $ = (id) => document.getElementById(id);
const pageNames = { '/': 'Laundry status', '/about': 'About', '/mess-menu': 'Mess menu', '/bus-timings': 'Bus timings', '/campus-map': 'Campus map', '/curriculum': 'B.Tech curriculum' };

function showLogin(message = '') { $('adminLogin').classList.remove('hidden'); $('analyticsPanel').classList.add('hidden'); $('adminMessage').textContent = message; }
function showDashboard() { $('adminLogin').classList.add('hidden'); $('analyticsPanel').classList.remove('hidden'); }
function startOfDay(daysAgo = 0) { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - daysAgo); return date.toISOString(); }
async function countViews(from) { const query = supabase.from('site_page_views').select('id', { count: 'exact', head: true }); if (from) query.gte('created_at', from); const { count, error } = await query; if (error) throw error; return count ?? 0; }
async function loadDashboard() {
  try {
    const weekStart = startOfDay(6);
    const [today, week, all, recent] = await Promise.all([countViews(startOfDay()), countViews(weekStart), countViews(), supabase.from('site_page_views').select('page_path').gte('created_at', weekStart)]);
    if (recent.error) throw recent.error;
    $('todayViews').textContent = today; $('weekViews').textContent = week; $('allViews').textContent = all;
    const counts = recent.data.reduce((result, { page_path }) => ({ ...result, [page_path]: (result[page_path] ?? 0) + 1 }), {});
    $('trafficBreakdown').replaceChildren(...Object.entries(pageNames).map(([path, name]) => { const row = document.createElement('div'); row.className = 'traffic-row'; row.innerHTML = `<span>${name}</span><span>${counts[path] ?? 0} views</span>`; return row; }));
  } catch { showLogin('This account is not allowed to view analytics.'); }
}
async function checkAdmin() { const { data: { session } } = await supabase.auth.getSession(); if (!session) return showLogin(); if (session.user.app_metadata?.role !== 'admin') { await supabase.auth.signOut(); return showLogin('This account is not an admin account.'); } showDashboard(); loadDashboard(); }
$('adminLoginForm').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; const { error } = await supabase.auth.signInWithPassword({ email: $('adminEmail').value.trim(), password: $('adminPassword').value }); button.disabled = false; if (error) return showLogin('Check the email and password, then try again.'); checkAdmin(); });
$('adminSignOut').addEventListener('click', async () => { await supabase.auth.signOut(); showLogin(); });
checkAdmin();
