import { supabase } from './supabase.js';

const trackedPages = new Set(['/', '/about', '/mess-menu', '/bus-timings', '/campus-map', '/curriculum']);
const path = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';

if (trackedPages.has(path)) {
  supabase.from('site_page_views').insert({ page_path: path }).then(() => {});
}
