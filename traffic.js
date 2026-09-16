import { supabase } from './supabase.js';

const trackedPages = new Set(['/', '/mess-menu', '/bus-timings', '/campus-map', '/curriculum']);
const path = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';

function getVisitorId() {
  try {
    const storedId = localStorage.getItem('lnmiit-campus-visitor-id');
    if (storedId) return storedId;
    if (!crypto.randomUUID) return null;
    const visitorId = crypto.randomUUID();
    localStorage.setItem('lnmiit-campus-visitor-id', visitorId);
    return visitorId;
  } catch {
    return null;
  }
}

const visitorId = getVisitorId();
if (trackedPages.has(path) && visitorId) {
  supabase.from('site_page_views').insert({ page_path: path, visitor_id: visitorId }).then(() => {});
}
