import { supabase } from './supabase.js';

const trackedPages = new Set(['/', '/mess-menu', '/bus-timings', '/campus-map', '/curriculum']);
const path = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';

function getSessionId() {
  try {
    const storedId = sessionStorage.getItem('lnmiit-campus-session-id');
    if (storedId) return storedId;
    if (!crypto.randomUUID) return null;
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem('lnmiit-campus-session-id', sessionId);
    return sessionId;
  } catch {
    return null;
  }
}

const sessionId = getSessionId();
if (trackedPages.has(path) && sessionId) {
  supabase.from('site_page_views').insert({ page_path: path, visitor_id: sessionId }).then(() => {});
}
