/* Wedding details used by the countdown and share action. Date includes the India offset. */
const wedding = {
  names: "Gopu Kunjumon & Aavani L.H",
  ceremony: "2026-11-16T09:42:00+05:30",
  invitation: "Monday, 16 November 2026",
};

const timer = Object.fromEntries(["days", "hours", "minutes", "seconds"].map((unit) => [unit, document.getElementById(unit)]));
const countdownNote = document.getElementById("countdown-note");
const weddingTime = new Date(wedding.ceremony).getTime();
function updateCountdown() {
  const left = weddingTime - Date.now();
  if (!Number.isFinite(weddingTime) || left <= 0) {
    Object.values(timer).forEach((item) => { if (item) item.textContent = "00"; });
    if (countdownNote) countdownNote.textContent = "Our wedding day is here — 16 November 2026 ♡";
    return;
  }
  const secondsLeft = Math.floor(left / 1000);
  const values = [Math.floor(secondsLeft / 86400), Math.floor((secondsLeft % 86400) / 3600), Math.floor((secondsLeft % 3600) / 60), secondsLeft % 60];
  Object.values(timer).forEach((item, i) => { if (item) item.textContent = String(values[i]).padStart(2, "0"); });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
function closeMenu() {
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open menu");
  nav?.classList.remove("open");
}
menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav?.classList.toggle("open", open);
});
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

const revealItems = document.querySelectorAll(".letter-grid, .story-photos-heading, .story-photo, .countdown-inner, .celebration-heading, .event-card, .departure, .family-intro, .family-card, .journey-heading, .journey-line article, .gallery-heading, .gallery-item, .share > *");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); currentObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  revealItems.forEach((element) => { element.classList.add("reveal"); observer.observe(element); });
}

// Full-screen gallery viewer. All photos stay local to the site and the originals are untouched.
const galleryButtons = [...document.querySelectorAll(".gallery-item")];
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxCount = document.querySelector(".lightbox-count");
let currentPhoto = 0;
function showPhoto(index) {
  if (!galleryButtons.length) return;
  currentPhoto = (index + galleryButtons.length) % galleryButtons.length;
  const button = galleryButtons[currentPhoto];
  const source = button.querySelector("img");
  lightboxImage.src = source.currentSrc || source.src;
  lightboxImage.alt = source.alt;
  lightboxCaption.textContent = button.querySelector("span").textContent;
  lightboxCount.textContent = `${String(currentPhoto + 1).padStart(2, "0")} / ${String(galleryButtons.length).padStart(2, "0")}`;
}
galleryButtons.forEach((button, index) => button.addEventListener("click", () => {
  showPhoto(index);
  lightbox.showModal();
}));
document.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox.close());
document.querySelector(".lightbox-prev")?.addEventListener("click", () => showPhoto(currentPhoto - 1));
document.querySelector(".lightbox-next")?.addEventListener("click", () => showPhoto(currentPhoto + 1));
lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
  if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
});

const shareButton = document.getElementById("share-button");
const shareNote = document.getElementById("share-note");
shareButton?.addEventListener("click", async () => {
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = "";
  const message = `With love, Gopu & Aavani invite you to celebrate our wedding on ${wedding.invitation}. We hope you can join us!`;
  const payload = { title: `${wedding.names} — Wedding Invitation`, text: message, url: shareUrl.href };
  if (navigator.share) {
    try { await navigator.share(payload); if (shareNote) shareNote.textContent = "Thank you for sharing our invitation ♡"; }
    catch (error) { if (error.name !== "AbortError" && shareNote) shareNote.textContent = "You can share our invitation with family and friends."; }
  } else {
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl.href}`)}`;
    window.open(whatsapp, "_blank", "noopener,noreferrer");
    if (shareNote) shareNote.textContent = "WhatsApp is ready with our invitation.";
  }
});

// The couple's chosen music starts only after a guest asks for it.
const musicButton = document.getElementById("music-toggle");
const weddingMusic = new Audio("audio/wedding-music.mp3");
weddingMusic.loop = true;
weddingMusic.preload = "none";
weddingMusic.volume = 0.35;
musicButton?.addEventListener("click", async () => {
  const label = musicButton.querySelector(".music-label");
  if (weddingMusic.paused) {
    try {
      await weddingMusic.play(); // Starts only in response to the guest's tap.
      musicButton.setAttribute("aria-pressed", "true");
      musicButton.setAttribute("aria-label", "Pause wedding music");
      label.textContent = "SOUND ON";
    } catch {
      musicButton.setAttribute("aria-pressed", "false");
      musicButton.setAttribute("aria-label", "Play wedding music");
      label.textContent = "TAP TO PLAY";
    }
  } else {
    weddingMusic.pause();
    musicButton.setAttribute("aria-pressed", "false");
    musicButton.setAttribute("aria-label", "Play wedding music");
    label.textContent = "SOUND OFF";
  }
});

// The wishes service only publishes messages that Gopu and Aavani approve.
const wishesConfig = window.WEDDING_WISHES_CONFIG || {};
const wishesEndpoint = String(wishesConfig.functionUrl || "").replace(/\/$/, "");
async function requestWishesJson(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  } finally {
    window.clearTimeout(timeout);
  }
}
const wishesSection = document.getElementById("wishes");
const wishWall = document.getElementById("wishes-wall");
const wishAll = document.getElementById("wishes-all");
const wishesTotal = document.getElementById("wishes-total");
const wishesEmpty = document.getElementById("wishes-empty");
const wishesStatus = document.getElementById("wishes-status");
const wishesControls = document.getElementById("wishes-controls");
const wishesPosition = document.getElementById("wish-position");
const wishDialog = document.getElementById("wish-dialog");
const wishForm = document.getElementById("wish-form");
const wishSubmit = document.getElementById("wish-submit");
const wishFormStatus = document.getElementById("wish-form-status");
const wishSuccess = document.getElementById("wish-success");
const wishMessageInput = document.getElementById("wish-message");
const wishCharCount = document.getElementById("wish-char-count");
const wishAllButton = document.getElementById("view-all-wishes");
const wishLoadMore = document.getElementById("wish-load-more");
const wishes = [];
let wishOffset = 0;
let wishesTotalCount = 0;
let turnstileWidgetId = null;
let turnstileToken = "";
let wishesRequesting = false;
let pendingSubmissionId = "";
let toastTimer = 0;
let toastRotation = 0;
let toastPaused = false;
let toastInterval = 0;
let wishCarouselInterval = 0;
const toast = document.getElementById("wish-toast");

function makeWishCard(wish) {
  const card = document.createElement("article");
  card.className = "wish-card";
  const quote = document.createElement("blockquote");
  quote.textContent = wish.message;
  const name = document.createElement("cite");
  name.textContent = wish.name;
  card.append(quote, name);
  if (wish.created_at) {
    const time = document.createElement("time");
    const date = new Date(wish.created_at);
    if (Number.isFinite(date.getTime())) {
      time.dateTime = date.toISOString();
      time.textContent = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
      card.append(time);
    }
  }
  return card;
}

function paintWishes(total = wishesTotalCount || wishes.length) {
  if (!wishWall) return;
  wishWall.replaceChildren();
  if (wishAll) wishAll.replaceChildren();
  wishesTotalCount = total;
  wishesTotal.textContent = String(total);
  wishesEmpty.hidden = wishes.length > 0;
  wishesControls.hidden = wishes.length <= 3;
  wishAllButton.hidden = total <= 3;
  if (!wishes.length) {
    wishesPosition.textContent = "";
    return;
  }
  const visible = Math.min(3, wishes.length);
  for (let i = 0; i < visible; i += 1) wishWall.append(makeWishCard(wishes[(wishOffset + i) % wishes.length]));
  wishesPosition.textContent = `${String((wishOffset % wishes.length) + 1).padStart(2, "0")} / ${String(wishes.length).padStart(2, "0")}`;
  if (wishAll && !wishAll.hidden) wishes.forEach((wish) => wishAll.append(makeWishCard(wish)));
}

async function loadWishes() {
  if (!wishesEndpoint || !wishWall) {
    wishesTotal.textContent = "—";
    wishesEmpty.hidden = true;
    wishesStatus.textContent = "Our memory book is ready; guest wishes will open once it is connected.";
    return;
  }
  wishesStatus.textContent = "Opening our memory book…";
  try {
    const { response, data } = await requestWishesJson(`${wishesEndpoint}?offset=0`, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error("The wishes could not be loaded just now.");
    wishes.splice(0, wishes.length, ...(Array.isArray(data.wishes) ? data.wishes.filter((wish) => typeof wish.name === "string" && typeof wish.message === "string") : []));
    paintWishes(Number.isSafeInteger(data.total) && data.total >= wishes.length ? data.total : wishes.length);
    wishesStatus.textContent = "Every approved wish is kept here with love.";
    if (wishes.length) {
      startWishToasts();
      if (wishes.length > 3 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        wishCarouselInterval = window.setInterval(() => {
          if (!document.hidden && !wishDialog?.open && wishAll.hidden && !wishWall.matches(":hover")) rotateWishes(1);
        }, 8000);
      }
    }
  } catch {
    wishesStatus.textContent = "Our memory book is taking a quiet moment. The invitation, photos, music, and directions are still here.";
    wishesEmpty.hidden = true;
  }
}

function rotateWishes(direction = 1) {
  if (wishes.length < 2) return;
  wishOffset = (wishOffset + direction + wishes.length) % wishes.length;
  paintWishes();
}
document.getElementById("wish-prev")?.addEventListener("click", () => rotateWishes(-1));
document.getElementById("wish-next")?.addEventListener("click", () => rotateWishes(1));
document.getElementById("wish-prev")?.addEventListener("keydown", (event) => { if (event.key === "ArrowLeft") rotateWishes(-1); });
document.getElementById("wish-next")?.addEventListener("keydown", (event) => { if (event.key === "ArrowRight") rotateWishes(1); });
wishAllButton?.addEventListener("click", () => {
  wishAll.hidden = !wishAll.hidden;
  wishAllButton.textContent = wishAll.hidden ? "Read all wishes" : "Show less";
  if (!wishAll.hidden) {
    wishAll.replaceChildren(...wishes.map(makeWishCard));
    wishLoadMore.hidden = wishes.length >= wishesTotalCount;
    wishAll.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    wishLoadMore.hidden = true;
  }
});
wishLoadMore?.addEventListener("click", async () => {
  if (!wishesEndpoint || wishLoadMore.disabled || wishes.length >= wishesTotalCount) return;
  wishLoadMore.disabled = true;
  wishLoadMore.textContent = "Loading wishes…";
  try {
    const { response, data } = await requestWishesJson(`${wishesEndpoint}?offset=${wishes.length}`, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error("Could not load more wishes.");
    const next = Array.isArray(data.wishes) ? data.wishes.filter((wish) => typeof wish.name === "string" && typeof wish.message === "string") : [];
    wishes.push(...next);
    wishesTotalCount = Number.isSafeInteger(data.total) && data.total >= wishes.length ? data.total : wishes.length;
    wishesTotal.textContent = String(wishesTotalCount);
    next.forEach((wish) => wishAll.append(makeWishCard(wish)));
    wishLoadMore.hidden = wishes.length >= wishesTotalCount || next.length === 0;
    wishesStatus.textContent = "Every approved wish is kept here with love.";
  } catch {
    wishesStatus.textContent = "We couldn’t load more wishes just now. The rest of the invitation is unaffected; please try again later.";
  } finally {
    wishLoadMore.disabled = false;
    wishLoadMore.textContent = "Load more wishes";
  }
});

function setTurnstileToken(token) {
  turnstileToken = token || "";
  if (wishSubmit) wishSubmit.disabled = wishesRequesting || !wishesEndpoint || !turnstileToken;
}

function loadTurnstile() {
  if (!wishesConfig.turnstileSiteKey || !window.turnstile || turnstileWidgetId !== null) return;
  const container = document.getElementById("turnstile-container");
  turnstileWidgetId = window.turnstile.render(container, {
    sitekey: wishesConfig.turnstileSiteKey,
    theme: "light",
    callback: (token) => setTurnstileToken(token),
    "expired-callback": () => setTurnstileToken(""),
    "error-callback": () => { setTurnstileToken(""); wishFormStatus.textContent = "Please refresh this page and try the security check again."; },
  });
}
if (wishesConfig.turnstileSiteKey) {
  const turnstileScript = document.createElement("script");
  turnstileScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  turnstileScript.async = true;
  turnstileScript.defer = true;
  turnstileScript.onload = loadTurnstile;
  turnstileScript.onerror = () => { wishFormStatus.textContent = "The wishes security check is temporarily unavailable. The rest of the invitation still works."; };
  document.head.append(turnstileScript);
}

document.getElementById("open-wish-form")?.addEventListener("click", () => {
  if (!wishesEndpoint || !wishesConfig.turnstileSiteKey) {
    wishesStatus.textContent = "We’re preparing our memory book. Please check back soon.";
    return;
  }
  wishForm.hidden = false;
  wishSuccess.hidden = true;
  wishFormStatus.textContent = "";
  if (wishDialog?.showModal) wishDialog.showModal();
  else wishDialog?.setAttribute("open", "");
  loadTurnstile();
});
document.querySelector(".wish-dialog-close")?.addEventListener("click", () => wishDialog?.close());
document.getElementById("wish-success-close")?.addEventListener("click", () => wishDialog?.close());
wishDialog?.addEventListener("click", (event) => { if (event.target === wishDialog) wishDialog.close(); });
wishMessageInput?.addEventListener("input", () => { wishCharCount.textContent = `${wishMessageInput.value.length} / 500`; });

wishForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!wishForm.reportValidity()) return;
  if (!wishesEndpoint || !turnstileToken) {
    wishFormStatus.textContent = "Please complete the security check before sending your wish.";
    return;
  }
  if (wishesRequesting) return;
  const formData = new FormData(wishForm);
  const name = String(formData.get("name") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const honeypot = String(formData.get("website") || "");
  if (!name || name.length > 60 || !message || message.length > 500 || !formData.get("consent")) {
    wishFormStatus.textContent = "Please check your name, message, and sharing permission.";
    return;
  }
  wishesRequesting = true;
  pendingSubmissionId ||= crypto.randomUUID();
  wishSubmit.disabled = true;
  wishSubmit.setAttribute("aria-busy", "true");
  wishSubmit.firstChild.textContent = "Sending your love… ";
  wishFormStatus.textContent = "Saving your wish securely…";
  try {
    const { response, data } = await requestWishesJson(wishesEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, message, consent: Boolean(formData.get("consent")), website: honeypot, turnstileToken, submissionId: pendingSubmissionId }),
    }, 12000);
    if (!response.ok || data.saved !== true) throw new Error(data.error || "We couldn’t save your wish. Please try again.");
    pendingSubmissionId = "";
    wishForm.hidden = true;
    wishSuccess.hidden = false;
    wishFormStatus.textContent = "";
    wishesStatus.textContent = "A new note has arrived and is waiting for our approval.";
    wishForm.reset();
    wishCharCount.textContent = "0 / 500";
    setTurnstileToken("");
    if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
  } catch (error) {
    wishFormStatus.textContent = error.name === "AbortError"
      ? "The wishes service is taking too long. Your wish was not confirmed as saved; the rest of the invitation still works. Please try again later."
      : error instanceof TypeError
        ? "We couldn’t reach the wishes service. Your wish was not confirmed as saved; the rest of the invitation still works. Please try again later."
        : error.message;
    setTurnstileToken("");
    if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
  } finally {
    wishesRequesting = false;
    wishSubmit.removeAttribute("aria-busy");
    wishSubmit.firstChild.textContent = "Send our note ";
    wishSubmit.disabled = !turnstileToken;
  }
});

function showNextWishToast() {
  if (!toast || toastPaused || document.hidden || wishes.length < 2 || wishDialog?.open) return;
  const wish = wishes[toastRotation % wishes.length];
  toastRotation += 1;
  document.getElementById("wish-toast-message").textContent = `“${wish.message}”`;
  document.getElementById("wish-toast-name").textContent = `With love, ${wish.name}`;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 9000);
}
function startWishToasts() {
  if (wishes.length < 2 || toastPaused) return;
  if (toastInterval) window.clearInterval(toastInterval);
  window.setTimeout(showNextWishToast, 45000);
  toastInterval = window.setInterval(() => {
    if (toast.hidden) showNextWishToast();
  }, 90000);
}
document.getElementById("wish-toast-dismiss")?.addEventListener("click", () => { toast.hidden = true; window.clearTimeout(toastTimer); });
document.getElementById("wish-toast-pause")?.addEventListener("click", (event) => {
  toastPaused = !toastPaused;
  event.currentTarget.setAttribute("aria-pressed", String(toastPaused));
  event.currentTarget.textContent = toastPaused ? "Resume notes" : "Pause notes";
  if (toastPaused) { toast.hidden = true; window.clearTimeout(toastTimer); }
  else startWishToasts();
});

loadWishes();
