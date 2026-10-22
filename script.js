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

// A quiet original chime loop. Sound begins only after a guest asks for it.
const musicButton = document.getElementById("music-toggle");
let audioContext;
let musicInterval;
let musicEnabled = false;
let noteIndex = 0;
const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 392];
function playChime() {
  if (!musicEnabled || !audioContext) return;
  const time = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = notes[noteIndex++ % notes.length];
  volume.gain.setValueAtTime(0, time);
  volume.gain.linearRampToValueAtTime(0.018, time + 0.14);
  volume.gain.exponentialRampToValueAtTime(0.0001, time + 2.3);
  oscillator.connect(volume).connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + 2.35);
}
musicButton?.addEventListener("click", async () => {
  musicEnabled = !musicEnabled;
  const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
  if (musicEnabled && AudioContextImpl) {
    audioContext ||= new AudioContextImpl();
    if (audioContext.state === "suspended") await audioContext.resume();
    playChime();
    musicInterval = window.setInterval(playChime, 1250);
  } else {
    musicEnabled = false;
    window.clearInterval(musicInterval);
  }
  musicButton.setAttribute("aria-pressed", String(musicEnabled));
  musicButton.setAttribute("aria-label", musicEnabled ? "Pause gentle celebration chimes" : "Play gentle celebration chimes");
  musicButton.querySelector(".music-label").textContent = musicEnabled ? "SOUND ON" : "SOUND OFF";
});
