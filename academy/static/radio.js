const menu = document.querySelector(".menu");
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  document.querySelector(".header").classList.toggle("open", !open);
});
document.querySelectorAll("[data-busy]").forEach(form => {
  form.addEventListener("submit", event => {
    if (event.submitter) {
      event.submitter.disabled = true;
      event.submitter.textContent = "Please wait…";
    }
  });
});
document.querySelector("[data-print]")?.addEventListener("click", () => window.print());
const timer = document.querySelector("[data-deadline]");
if (timer) {
  const form = document.querySelector("#assessment");
  const deadline = Date.parse(timer.dataset.deadline);
  let expiry;
  function tick() {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    timer.textContent = "Time remaining " + Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    if (!seconds) {
      clearInterval(expiry);
      location.reload();
    }
  }
  let pending;
  let saving = Promise.resolve();
  form.addEventListener("change", () => {
    clearTimeout(pending);
    pending = setTimeout(() => {
      const body = new FormData(form);
      body.set("action", "save");
      saving = saving.then(() => fetch(location.href, {method: "POST", body}))
        .catch(() => { form.dataset.saveError = "true"; });
    }, 150);
  });
  form.addEventListener("submit", async event => {
    if (!event.submitter || form.dataset.sending) return;
    event.preventDefault();
    clearTimeout(pending);
    await saving;
    form.dataset.sending = "true";
    form.requestSubmit(event.submitter);
  });
  expiry = setInterval(tick, 500);
  tick();
}
