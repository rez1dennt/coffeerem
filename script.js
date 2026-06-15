const root = document.documentElement;
const body = document.body;

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a, .header__contacts a");
const modal = document.querySelector("#request-modal");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
const leadTriggers = document.querySelectorAll('a[href="#lead"]');
const cookieBanner = document.querySelector("[data-cookie-banner]");
const cookieAcceptButton = document.querySelector("[data-cookie-accept]");
const COOKIE_CONSENT_KEY = "coffee-master-cookie-consent";
const PHONE_DIGIT_LENGTH = 11;

function updateScrollbarCompensation() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  root.style.setProperty("--scrollbar-compensation", `${Math.max(scrollbarWidth, 0)}px`);
}

function clearScrollbarCompensation() {
  if (!body.classList.contains("menu-open") && !body.classList.contains("modal-open")) {
    root.style.setProperty("--scrollbar-compensation", "0px");
  }
}

function openMenu() {
  updateScrollbarCompensation();
  body.classList.add("menu-open");
  menuToggle?.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  clearScrollbarCompensation();
}

function openModal() {
  if (!modal) return;
  closeMenu();
  updateScrollbarCompensation();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
  window.setTimeout(() => modal.querySelector("input")?.focus(), 80);
}

function closeModal() {
  if (!modal) return;
  clearFormFeedback(modal.querySelector("form"));
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
  clearScrollbarCompensation();
}

menuToggle?.addEventListener("click", () => {
  if (body.classList.contains("menu-open")) {
    closeMenu();
  } else {
    openMenu();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

leadTriggers.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });
});

function getStoredCookieConsent() {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return null;
  }
}

function storeCookieConsent() {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
  } catch {
    document.cookie = `${COOKIE_CONSENT_KEY}=accepted; max-age=31536000; path=/; samesite=lax`;
  }
}

function showCookieBanner() {
  if (!cookieBanner || getStoredCookieConsent() === "accepted") return;
  cookieBanner.hidden = false;
  requestAnimationFrame(() => cookieBanner.classList.add("is-visible"));
}

function hideCookieBanner() {
  if (!cookieBanner) return;
  cookieBanner.classList.remove("is-visible");
  window.setTimeout(() => {
    cookieBanner.hidden = true;
  }, 240);
}

cookieAcceptButton?.addEventListener("click", () => {
  storeCookieConsent();
  hideCookieBanner();
});

showCookieBanner();

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabId = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll(".price-list").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === tabId);
    });
    document.querySelectorAll(".price-photo__image").forEach((photo) => {
      photo.classList.toggle("is-active", photo.dataset.photoPanel === tabId);
    });
    tab.classList.add("is-active");
  });
});

function scrollTrack(trackSelector, direction) {
  const track = document.querySelector(trackSelector);
  if (!track) return;
  const firstItem = track.firstElementChild;
  const amount = firstItem ? firstItem.getBoundingClientRect().width + 16 : 240;
  track.scrollBy({ left: direction * amount, behavior: "smooth" });
}

document.querySelector(".review-prev")?.addEventListener("click", () => scrollTrack(".review-track", -1));
document.querySelector(".review-next")?.addEventListener("click", () => scrollTrack(".review-track", 1));

let remainingSeconds = 20 * 60;
const minutesNode = document.querySelector("#minutes");
const secondsNode = document.querySelector("#seconds");

function renderTimer() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  if (minutesNode) minutesNode.textContent = String(minutes).padStart(2, "0");
  if (secondsNode) secondsNode.textContent = String(seconds).padStart(2, "0");
  remainingSeconds = remainingSeconds <= 0 ? 20 * 60 : remainingSeconds - 1;
}

renderTimer();
setInterval(renderTimer, 1000);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
  revealObserver.observe(element);
});

function animateCounter(element) {
  if (element.dataset.animated === "true") return;
  element.dataset.animated = "true";

  const target = Number(element.dataset.count || element.textContent);
  const duration = target > 1000 ? 1500 : 1100;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = String(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = String(target);
    }
  }

  element.textContent = "0";
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".stat-number").forEach(animateCounter);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.45 }
);

const statsBlock = document.querySelector(".stats");
if (statsBlock) {
  statObserver.observe(statsBlock);
}

function getDigits(value) {
  return value.replace(/\D/g, "");
}

function normalizePhoneDigits(value) {
  let digits = getDigits(value);
  if (!digits) return "";

  if (digits[0] === "8") {
    digits = `7${digits.slice(1)}`;
  } else if (digits[0] === "9") {
    digits = `7${digits}`;
  } else if (digits[0] !== "7") {
    digits = `7${digits}`;
  }

  return digits.slice(0, PHONE_DIGIT_LENGTH);
}

function formatPhone(digits) {
  if (!digits) return "";

  const localDigits = digits[0] === "7" ? digits.slice(1) : digits;
  let result = "+7";

  if (localDigits.length > 0) result += ` (${localDigits.slice(0, 3)}`;
  if (localDigits.length >= 3) result += ")";
  if (localDigits.length > 3) result += ` ${localDigits.slice(3, 6)}`;
  if (localDigits.length > 6) result += `-${localDigits.slice(6, 8)}`;
  if (localDigits.length > 8) result += `-${localDigits.slice(8, 10)}`;

  return result;
}

function clearPhoneInput(input) {
  input.value = "";
  if (document.activeElement === input) {
    input.setSelectionRange(0, 0);
  }
}

function getPhoneLocalDigits(value) {
  const digits = normalizePhoneDigits(value);
  return digits.startsWith("7") ? digits.slice(1) : digits;
}

function getPhoneLocalDigitPositions(value) {
  const positions = [];
  let digitOrder = 0;

  [...value].forEach((char, charIndex) => {
    if (!/\d/.test(char)) return;

    if (digitOrder > 0) {
      positions.push({ charIndex, digitIndex: digitOrder - 1 });
    }

    digitOrder += 1;
  });

  return positions;
}

function handlePhoneDelete(input, direction = "backward") {
  const localDigits = getPhoneLocalDigits(input.value);

  if (!localDigits) {
    clearPhoneInput(input);
    return true;
  }

  const selectionStart = input.selectionStart ?? input.value.length;
  const selectionEnd = input.selectionEnd ?? input.value.length;
  const hasSelection = selectionStart !== selectionEnd;
  const positions = getPhoneLocalDigitPositions(input.value);
  let indexesToRemove = [];

  if (hasSelection) {
    indexesToRemove = positions
      .filter((position) => position.charIndex >= selectionStart && position.charIndex < selectionEnd)
      .map((position) => position.digitIndex);
  }

  if (!indexesToRemove.length) {
    const targetPosition = direction === "forward"
      ? positions.find((position) => position.charIndex >= selectionStart)
      : [...positions].reverse().find((position) => position.charIndex < selectionStart);

    if (targetPosition) {
      indexesToRemove = [targetPosition.digitIndex];
    }
  }

  if (!indexesToRemove.length) {
    clearPhoneInput(input);
    return true;
  }

  const removeSet = new Set(indexesToRemove);
  const nextLocalDigits = [...localDigits]
    .filter((_, index) => !removeSet.has(index))
    .join("");

  if (!nextLocalDigits) {
    clearPhoneInput(input);
    return true;
  }

  input.value = formatPhone(`7${nextLocalDigits}`);
  if (document.activeElement === input) {
    input.setSelectionRange(input.value.length, input.value.length);
  }

  return true;
}

function applyPhoneMask(input, event) {
  const rawDigits = getDigits(input.value);
  const isDeleteAction = event?.inputType?.startsWith("delete");

  if (!rawDigits || rawDigits === "7" || (isDeleteAction && rawDigits.length <= 1)) {
    clearPhoneInput(input);
    return;
  }

  const digits = normalizePhoneDigits(input.value);
  input.value = formatPhone(digits);

  if (document.activeElement === input) {
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

function getFieldHolder(field) {
  return field.closest("label") || field.parentElement || field;
}

function clearFieldError(field) {
  const holder = getFieldHolder(field);
  holder.querySelector(".field-error")?.remove();
  field.classList.remove("is-invalid");
  holder.classList.remove("is-invalid");
  field.removeAttribute("aria-invalid");
}

function setFieldError(field, message) {
  const holder = getFieldHolder(field);
  clearFieldError(field);
  field.classList.add("is-invalid");
  holder.classList.add("is-invalid");
  field.setAttribute("aria-invalid", "true");

  const error = document.createElement("span");
  error.className = "field-error";
  error.textContent = message;
  holder.append(error);
}

function clearFormValidation(form) {
  if (!form) return;
  form.querySelectorAll(".field-error").forEach((error) => error.remove());
  form.querySelectorAll(".is-invalid").forEach((field) => field.classList.remove("is-invalid"));
  form.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
}

function clearFormSuccess(form) {
  if (!form) return;
  form.querySelector(".form-success")?.remove();
  form.classList.remove("is-sent");
}

function clearFormFeedback(form) {
  clearFormValidation(form);
  clearFormSuccess(form);
}

function showFormSuccess(form) {
  clearFormSuccess(form);

  const success = document.createElement("div");
  success.className = "form-success";
  success.setAttribute("role", "status");
  success.setAttribute("aria-live", "polite");
  success.innerHTML = `
    <span class="form-success__icon" aria-hidden="true">✓</span>
    <span><strong>Заявка отправлена</strong><span>Мастер скоро свяжется с вами для уточнения деталей.</span></span>
  `;

  const button = form.querySelector("button[type='submit']");
  form.insertBefore(success, button);
  form.classList.add("is-sent");
}

function validateForm(form) {
  let isValid = true;

  clearFormFeedback(form);

  const nameInput = form.querySelector("input[name='name']");
  const phoneInput = form.querySelector("input[type='tel']");
  const commentInput = form.querySelector("textarea[name='comment']");
  const consentInput = form.querySelector("input[name='personal-data-consent']");

  if (nameInput) {
    const nameValue = nameInput.value.trim().replace(/\s+/g, " ");
    nameInput.value = nameValue;

    if (nameValue.length < 2 || !/[A-Za-zА-Яа-яЁё]/.test(nameValue)) {
      setFieldError(nameInput, "Укажите имя, чтобы мастер понял, как к вам обращаться.");
      isValid = false;
    }
  }

  if (phoneInput) {
    const phoneDigits = normalizePhoneDigits(phoneInput.value);
    phoneInput.value = formatPhone(phoneDigits);

    if (phoneDigits.length !== PHONE_DIGIT_LENGTH) {
      setFieldError(phoneInput, "Введите телефон полностью: +7 (___) ___-__-__.");
      isValid = false;
    }
  }

  if (commentInput && commentInput.value.trim().length > 500) {
    setFieldError(commentInput, "Сократите комментарий до 500 символов.");
    isValid = false;
  }

  if (consentInput && !consentInput.checked) {
    setFieldError(consentInput, "Подтвердите согласие на обработку персональных данных.");
    isValid = false;
  }

  const firstInvalidField = form.querySelector("input.is-invalid, textarea.is-invalid");
  if (firstInvalidField) {
    firstInvalidField.focus({ preventScroll: true });
  }

  return isValid;
}

document.querySelectorAll("input[type='tel']").forEach((input) => {
  input.setAttribute("inputmode", "tel");
  input.setAttribute("autocomplete", "tel");

  input.addEventListener("beforeinput", (event) => {
    if (!event.inputType?.startsWith("delete")) return;

    const direction = event.inputType === "deleteContentForward" ? "forward" : "backward";
    if (handlePhoneDelete(input, direction)) {
      event.preventDefault();
      clearFieldError(input);
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Backspace" && event.key !== "Delete") return;

    const direction = event.key === "Delete" ? "forward" : "backward";
    if (handlePhoneDelete(input, direction)) {
      event.preventDefault();
      clearFieldError(input);
    }
  });

  input.addEventListener("input", (event) => {
    applyPhoneMask(input, event);
    clearFieldError(input);
  });

  input.addEventListener("blur", () => {
    const digits = normalizePhoneDigits(input.value);
    input.value = formatPhone(digits);
  });
});

document.querySelectorAll("input[name='name'], textarea[name='comment']").forEach((field) => {
  field.addEventListener("input", () => clearFieldError(field));
});

document.querySelectorAll("input[name='personal-data-consent']").forEach((checkbox) => {
  checkbox.addEventListener("change", () => clearFieldError(checkbox));
});

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm(form)) return;

    const button = form.querySelector("button[type='submit']");
    if (!button) return;
    const previousText = button.textContent;
    showFormSuccess(form);
    button.textContent = "Отправлено";
    button.disabled = true;

    setTimeout(() => {
      button.textContent = previousText;
      button.disabled = false;
      form.reset();
      if (form.classList.contains("modal-form")) {
        closeModal();
      } else {
        clearFormValidation(form);
      }
    }, 2200);

    if (!form.classList.contains("modal-form")) {
      setTimeout(() => clearFormSuccess(form), 5200);
    }
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeMenu();
  }
});
