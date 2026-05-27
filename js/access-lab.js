'use strict';

/* ================================================================
   ACCESS LAB — Interaction Logic
   Vanilla JS, no external dependencies.
   ================================================================ */

// ── State ─────────────────────────────────────────────────────────

const state = {
  station: 0,
  s1: { revealed: false, srOn: false, speaking: false, copied: false },
  s2: { mode: 'image', srOn: false, copyResult: null, searchResult: null, speaking: false },
};

// s3 state lives as plain vars (simpler for the onclick-on-div pattern)
let s3Selected = null;
let s3Revealed = false;

// ── Speech synthesis ───────────────────────────────────────────────

function speak(text, onEnd) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0;
  u.pitch = 1.05;
  u.onend = onEnd;
  u.onerror = onEnd;
  window.speechSynthesis.speak(u);
}

function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ── Station navigation ─────────────────────────────────────────────

function goToStation(n) {
  const panels = document.querySelectorAll('[role="tabpanel"]');
  const tabs   = document.querySelectorAll('.station__tab');
  const prev   = document.getElementById('btn-prev');
  const next   = document.getElementById('btn-next');
  const LAST   = 3;

  stopSpeech();
  state.s1.speaking = false;
  state.s2.speaking = false;

  // Show/hide panels
  panels.forEach((p, i) => { p.hidden = (i !== n); });

  // Update tab ARIA selected state
  tabs.forEach((t, i) => {
    t.setAttribute('aria-selected', String(i === n));
  });

  // Prev/Next buttons
  prev.disabled = (n === 0);
  if (n === LAST) {
    next.disabled = true;
    next.textContent = 'You\'ve reached the end';
    next.classList.remove('btn--primary');
    next.classList.add('btn--ghost');
  } else {
    next.disabled = false;
    next.textContent = 'Next station →';
    next.classList.add('btn--primary');
    next.classList.remove('btn--ghost');
  }

  state.station = n;

  // Move focus to the panel heading for keyboard/SR users
  const heading = document.querySelector('#panel-' + n + ' h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: false });
  }
}

// ── Station 1 ──────────────────────────────────────────────────────

const S1_SR_TEXT =
  'Heading level 3: Library Hours. ' +
  'Monday through Friday, 8 AM to 10 PM. ' +
  'Saturday, 10 AM to 6 PM. ' +
  'Sunday, noon to 8 PM. ' +
  'Holiday hours may vary. ' +
  'Library events, button. ' +
  'Holiday closures, button.';

function renderS1() {
  const { revealed, srOn, speaking, copied } = state.s1;

  // Color transition on hidden text
  document.querySelectorAll('#panel-0 .al-hidden-text').forEach(el => {
    el.classList.toggle('is-revealed', revealed);
  });

  // Visible badge (updates with reveal state)
  const badge = document.getElementById('s1-badge-visible');
  if (badge) {
    badge.className = revealed ? 'badge badge--success' : 'badge badge--danger';
    badge.textContent = revealed ? '✓ Visible to you' : '✗ Visible to you';
  }

  // SR button label
  const srBtn = document.getElementById('s1-sr-btn');
  if (srBtn) srBtn.innerHTML = srOn ? SVG_VOL_ON + ' Screen reader on' : SVG_VOL_OFF + ' Simulate screen reader';

  // Reveal button: toggle label; never hides (it's a toggle, not a one-shot action)
  const revealBtn = document.getElementById('s1-reveal-btn');
  if (revealBtn) {
    revealBtn.textContent = revealed ? '← Hide from sighted reader' : 'Reveal to sighted reader →';
  }

  // Copy result
  const copyOk = document.getElementById('s1-copy-ok');
  if (copyOk) copyOk.hidden = !copied;

  // Badge outcome: visible once text has been revealed (toggles with reveal)
  const badgeOutcome = document.getElementById('s1-badge-outcome');
  if (badgeOutcome) badgeOutcome.hidden = !revealed;

  // SR panel visibility
  const srPanel = document.getElementById('s1-sr-panel');
  if (srPanel) srPanel.hidden = !srOn;

  // "Hear it" button state
  const hearBtn = document.getElementById('s1-hear-btn');
  if (hearBtn) {
    hearBtn.textContent = speaking ? '◼ Stop' : '▶ Hear it';
    hearBtn.classList.toggle('is-speaking', speaking);
  }
}

// ── Station 2 ──────────────────────────────────────────────────────

const S2_HOURS_TEXT =
  'Library Hours\n' +
  'Monday–Friday: 8:00 AM – 10:00 PM\n' +
  'Saturday: 10:00 AM – 6:00 PM\n' +
  'Sunday: Noon – 8:00 PM\n' +
  'Holiday hours may vary.';

const S2_SR_IMAGE = '"Image."';
const S2_SR_TEXT  =
  '"Heading level 3: Library Hours." ' +
  '"Monday through Friday, 8 AM to 10 PM." ' +
  '"Saturday, 10 AM to 6 PM." ' +
  '"Sunday, noon to 8 PM." ' +
  '"Holiday hours may vary."';

const SVG_VOL_OFF =
  '<svg class="al-sr-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
  '<line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>';
const SVG_VOL_ON =
  '<svg class="al-sr-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
  '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
  '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

function renderS2SRLines(mode) {
  const container = document.getElementById('s2-sr-lines');
  if (!container) return;
  if (mode === 'image') {
    container.innerHTML = '<div class="al-sr-line">"Image."</div>';
  } else {
    container.innerHTML =
      '<div class="al-sr-line">"Heading level 3: Library Hours."</div>' +
      '<div class="al-sr-line al-sr-line--indent">"Monday through Friday, 8 AM to 10 PM."</div>' +
      '<div class="al-sr-line al-sr-line--indent">"Saturday, 10 AM to 6 PM."</div>' +
      '<div class="al-sr-line al-sr-line--indent">"Sunday, noon to 8 PM."</div>' +
      '<div class="al-sr-line al-sr-line--indent">"Holiday hours may vary."</div>';
  }
}

function renderS2() {
  const { mode, srOn, copyResult, searchResult, speaking } = state.s2;
  const isImage = mode === 'image';

  // Mode toggle buttons
  const imgBtn = document.getElementById('s2-btn-image');
  const txtBtn = document.getElementById('s2-btn-text');
  if (imgBtn) {
    imgBtn.classList.toggle('is-active-image', isImage);
    imgBtn.classList.toggle('is-active-text', false);
    imgBtn.setAttribute('aria-pressed', String(isImage));
  }
  if (txtBtn) {
    txtBtn.classList.toggle('is-active-text', !isImage);
    txtBtn.classList.toggle('is-active-image', false);
    txtBtn.setAttribute('aria-pressed', String(!isImage));
  }

  // Image box classes
  const citation = document.getElementById('s2-image-box');
  if (citation) {
    citation.classList.toggle('is-image-mode', isImage);
    citation.classList.toggle('is-text-mode', !isImage);
  }

  // Status label text
  const statusLabel = document.getElementById('s2-status-label');
  if (statusLabel) statusLabel.textContent = isImage ? 'image only' : 'text layer present';

  // Badges
  const badges = [
    { id: 's2-badge-sr',     text: 'Screen reader' },
    { id: 's2-badge-copy',   text: 'Copy / cite'   },
    { id: 's2-badge-search', text: 'Searchable'    },
  ];
  badges.forEach(({ id, text }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = isImage ? 'badge badge--danger' : 'badge badge--success';
    el.textContent = (isImage ? '✗ ' : '✓ ') + text;
  });

  // SR button label
  const srBtn = document.getElementById('s2-sr-btn');
  if (srBtn) srBtn.innerHTML = srOn ? SVG_VOL_ON + ' Screen reader on' : SVG_VOL_OFF + ' Simulate screen reader';

  // SR panel
  const srPanel = document.getElementById('s2-sr-panel');
  if (srPanel) srPanel.hidden = !srOn;

  // SR line content (dynamic based on mode)
  renderS2SRLines(mode);

  // "Hear it" button
  const hearBtn = document.getElementById('s2-hear-btn');
  if (hearBtn) {
    hearBtn.textContent = speaking ? '◼ Stop' : '▶ Hear it';
    hearBtn.classList.toggle('is-speaking', speaking);
  }

  // Result alerts (null-safe: search elements removed in this iteration)
  const copyFail = document.getElementById('s2-copy-fail');
  if (copyFail) copyFail.hidden = (copyResult !== 'fail');
  const copyOk = document.getElementById('s2-copy-ok');
  if (copyOk) copyOk.hidden = (copyResult !== 'success');
}

// ── Station 3 ──────────────────────────────────────────────────────

const S3_ITEMS = [
  { id: 1, label: 'Library events',   keyboard: true  },
  { id: 2, label: 'Holiday closures', keyboard: false },
];

function selectItem(id) {
  s3Selected = id;
  renderS3();
}
// Exposed on window for the intentionally-inaccessible div's onclick attribute
window.selectItem = selectItem;

function renderS3() {
  // Highlight selected item
  S3_ITEMS.forEach(item => {
    const el = document.querySelector('[data-item="' + item.id + '"]');
    if (!el) return;
    el.classList.toggle('is-selected', s3Selected === item.id);
    if (!item.keyboard) {
      const lbl = el.querySelector('.al-mouse-only-label');
      if (lbl) lbl.hidden = !s3Revealed;
    }
  });

  // Feedback message
  const feedback = document.getElementById('s3-feedback');
  if (feedback) {
    if (s3Selected === null) {
      feedback.hidden = true;
      feedback.innerHTML = '';
    } else if (s3Selected === 2) {
      feedback.hidden = false;
      feedback.innerHTML =
        '<div class="alert alert--danger" role="status">' +
        '<div class="alert__body"><div class="alert__desc">' +
        '✗ "Holiday closures" can only be activated by mouse click. ' +
        'Keyboard users reach a dead end.' +
        '</div></div></div>';
    } else {
      const label = S3_ITEMS.find(i => i.id === s3Selected)?.label ?? '';
      feedback.hidden = false;
      feedback.innerHTML =
        '<div class="alert alert--success" role="status">' +
        '<div class="alert__body"><div class="alert__desc">' +
        '✓ "' + label + '" — reachable by keyboard and mouse.' +
        '</div></div></div>';
    }
  }

  // Reveal button: show once any item has been clicked
  const revealBtn = document.getElementById('s3-reveal-btn');
  if (revealBtn) {
    revealBtn.hidden = (s3Selected === null && !s3Revealed);
    revealBtn.textContent = s3Revealed ? 'Hide explanation' : 'Show what\'s happening →';
  }

  // Explanation box
  const explanation = document.getElementById('s3-explanation');
  if (explanation) explanation.hidden = !s3Revealed;
}

// ── Event wiring ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  // Hide "Hear it" buttons if Web Speech API is unavailable
  if (!window.speechSynthesis) {
    ['s1-hear-btn', 's2-hear-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.hidden = true;
    });
  }

  // ── Station tab navigation ──────────────────────────────────────

  const tabs = document.querySelectorAll('.station__tab');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => goToStation(i));

    // Arrow-key navigation (ARIA tablist pattern — APG)
    tab.addEventListener('keydown', function (e) {
      const all = [...document.querySelectorAll('.station__tab')];
      const idx = all.indexOf(e.target);
      let next = null;
      if (e.key === 'ArrowRight') next = all[(idx + 1) % all.length];
      if (e.key === 'ArrowLeft')  next = all[(idx - 1 + all.length) % all.length];
      if (e.key === 'Home')       next = all[0];
      if (e.key === 'End')        next = all[all.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  });

  // ── Prev / Next ─────────────────────────────────────────────────
  document.getElementById('btn-prev').addEventListener('click', () => goToStation(state.station - 1));
  document.getElementById('btn-next').addEventListener('click', () => goToStation(state.station + 1));

  // ── Station 1 ───────────────────────────────────────────────────

  document.getElementById('s1-sr-btn').addEventListener('click', () => {
    state.s1.srOn = !state.s1.srOn;
    if (!state.s1.srOn && state.s1.speaking) {
      stopSpeech();
      state.s1.speaking = false;
    }
    renderS1();
  });

  document.getElementById('s1-copy-btn').addEventListener('click', () => {
    const text =
      'Library Hours\n' +
      'Monday–Friday: 8:00 AM – 10:00 PM\n' +
      'Saturday: 10:00 AM – 6:00 PM\n' +
      'Sunday: Noon – 8:00 PM\n' +
      'Holiday hours may vary.';
    navigator.clipboard.writeText(text).catch(() => {});
    state.s1.copied = true;
    renderS1();
  });

  document.getElementById('s1-reveal-btn').addEventListener('click', () => {
    state.s1.revealed = !state.s1.revealed;
    renderS1();
  });

  document.getElementById('s1-hear-btn').addEventListener('click', () => {
    if (state.s1.speaking) {
      stopSpeech();
      state.s1.speaking = false;
      renderS1();
    } else {
      state.s1.speaking = true;
      renderS1();
      speak(S1_SR_TEXT, () => { state.s1.speaking = false; renderS1(); });
    }
  });

  // ── Station 2 ───────────────────────────────────────────────────

  document.getElementById('s2-btn-image').addEventListener('click', () => {
    stopSpeech();
    state.s2 = { mode: 'image', srOn: false, copyResult: null, searchResult: null, speaking: false };
    renderS2();
  });

  document.getElementById('s2-btn-text').addEventListener('click', () => {
    stopSpeech();
    state.s2 = { mode: 'text', srOn: false, copyResult: null, searchResult: null, speaking: false };
    renderS2();
  });

  document.getElementById('s2-sr-btn').addEventListener('click', () => {
    state.s2.srOn = !state.s2.srOn;
    if (!state.s2.srOn && state.s2.speaking) {
      stopSpeech();
      state.s2.speaking = false;
    }
    renderS2();
  });

  document.getElementById('s2-hear-btn').addEventListener('click', () => {
    if (state.s2.speaking) {
      stopSpeech();
      state.s2.speaking = false;
      renderS2();
    } else {
      state.s2.speaking = true;
      renderS2();
      const text = state.s2.mode === 'image' ? S2_SR_IMAGE : S2_SR_TEXT;
      speak(text, () => { state.s2.speaking = false; renderS2(); });
    }
  });

  document.getElementById('s2-copy-btn').addEventListener('click', () => {
    if (state.s2.mode === 'image') {
      state.s2.copyResult = 'fail';
    } else {
      navigator.clipboard.writeText(S2_HOURS_TEXT).catch(() => {});
      state.s2.copyResult = 'success';
    }
    renderS2();
  });

  // ── Station 3 ───────────────────────────────────────────────────

  document.querySelectorAll('#panel-2 button.al-hours-btn').forEach(btn => {
    btn.addEventListener('click', () => selectItem(Number(btn.dataset.item)));
  });

  document.getElementById('s3-reveal-btn').addEventListener('click', () => {
    s3Revealed = !s3Revealed;
    renderS3();
  });

  // ── Initial render (sync DOM to initial state) ──────────────────
  renderS1();
  renderS2();
  renderS3();
});
