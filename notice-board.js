import { supabase } from "./supabase.js";

const board = document.getElementById("noticeBoard");
const empty = document.getElementById("noticeBoardEmpty");

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function render(notices) {
  board.replaceChildren();
  empty.classList.toggle("hidden", notices.length > 0);

  notices.forEach((notice) => {
    const article = document.createElement("article");
    article.className = "notice-card";

    const heading = document.createElement("div");
    heading.className = "notice-card-heading";
    const title = document.createElement("h3");
    title.textContent = notice.title;
    const posted = document.createElement("time");
    posted.dateTime = notice.created_at;
    posted.textContent = formatDate(notice.created_at);
    heading.append(title, posted);
    article.append(heading);

    if (notice.image_url) {
      const image = document.createElement("img");
      image.src = notice.image_url;
      image.alt = notice.title;
      image.loading = "lazy";
      article.append(image);
    }

    const body = document.createElement("p");
    body.textContent = notice.body;
    article.append(body);

    if (notice.event_at) {
      const event = document.createElement("p");
      event.className = "notice-event";
      event.dataset.eventAt = notice.event_at;
      article.append(event);
    }

    board.append(article);
  });
}

async function loadNotices() {
  const { data, error } = await supabase
    .from("campus_notices")
    .select("id,title,body,image_url,event_at,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Notices could not be loaded.", error.message);
    empty.textContent = "Notices are temporarily unavailable.";
    empty.classList.remove("hidden");
    return;
  }
  render(data ?? []);
}

function updateCountdowns() {
  document.querySelectorAll("[data-event-at]").forEach((element) => {
    const remaining = new Date(element.dataset.eventAt).getTime() - Date.now();
    if (remaining <= 0) {
      element.textContent = "Event is now";
      return;
    }
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    element.textContent = `Starts in ${days}d ${hours}h ${minutes}m ${seconds}s`;
  });
}

loadNotices();
setInterval(updateCountdowns, 1000);
supabase
  .channel("public-campus-notices")
  .on("postgres_changes", { event: "*", schema: "public", table: "campus_notices" }, loadNotices)
  .subscribe();
