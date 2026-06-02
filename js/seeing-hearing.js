'use strict';

/* ================================================================
   SEEING AND HEARING — Interaction Logic
   Experience 1: Color contrast + image vs. text
   ================================================================ */

// ── State ─────────────────────────────────────────────────────────

const state = {
  station: 0,
  s1: { revealed: false, srOn: false, speaking: false, copied: false },
  s2: { mode: 'image', srOn: false, copyResult: null, searchResult: null, speaking: false },
  s3: { srOn: false, speaking: false, copied: false },
};

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

// ── Station navigation (2 activities: index 0 and 1) ──────────────

function goToStation(n) {
  const panels = document.querySelectorAll('[role="tabpanel"]');
  const tabs   = document.querySelectorAll('.station__tab');
  const prev   = document.getElementById('btn-prev');
  const next   = document.getElementById('btn-next');
  const LAST   = 2;

  stopSpeech();
  state.s1.speaking = false;
  state.s2.speaking = false;
  state.s3.speaking = false;

  // Show / hide panels
  panels.forEach((p, i) => { p.hidden = (i !== n); });

  // ARIA selected + roving tabindex (APG tablist pattern)
  tabs.forEach((t, i) => {
    t.setAttribute('aria-selected', String(i === n));
    t.setAttribute('tabindex', i === n ? '0' : '-1');
  });

  // Prev / Next button states
  if (prev) prev.disabled = (n === 0);
  if (next) {
    if (n === LAST) {
      next.disabled = true;
      next.textContent = 'Last activity ✓';
      next.classList.remove('btn--primary');
      next.classList.add('btn--ghost');
    } else {
      next.disabled = false;
      next.textContent = 'Next activity →';
      next.classList.add('btn--primary');
      next.classList.remove('btn--ghost');
    }
  }

  state.station = n;

  // Move focus to the panel heading for keyboard / SR users
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

const SVG_VOL_OFF =
  '<svg class="al-sr-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
  '<line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>';
const SVG_VOL_ON =
  '<svg class="al-sr-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
  '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
  '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

function renderS1() {
  const { revealed, srOn, speaking, copied } = state.s1;

  // Color transition on hidden text
  document.querySelectorAll('#panel-0 .al-hidden-text').forEach(el => {
    el.classList.toggle('is-revealed', revealed);
  });

  // Visible badge
  const badge = document.getElementById('s1-badge-visible');
  if (badge) {
    badge.className = revealed ? 'badge badge--success' : 'badge badge--danger';
    badge.textContent = revealed ? '✓ Visible to you' : '✗ Visible to you';
  }

  // SR button label
  const srBtn = document.getElementById('s1-sr-btn');
  if (srBtn) srBtn.innerHTML = srOn ? SVG_VOL_ON + ' Screen reader on' : SVG_VOL_OFF + ' Simulate screen reader';

  // Reveal button label
  const revealBtn = document.getElementById('s1-reveal-btn');
  if (revealBtn) {
    revealBtn.textContent = revealed ? '← Hide from sighted reader' : 'Reveal to sighted reader →';
  }

  // Copy result
  const copyOk = document.getElementById('s1-copy-ok');
  if (copyOk) copyOk.hidden = !copied;

  // Badge outcome row
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
  const { mode, srOn, copyResult, speaking } = state.s2;
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
  const imageBox = document.getElementById('s2-image-box');
  if (imageBox) {
    imageBox.classList.toggle('is-image-mode', isImage);
    imageBox.classList.toggle('is-text-mode', !isImage);
  }

  // Status label
  const statusLabel = document.getElementById('s2-status-label');
  if (statusLabel) statusLabel.textContent = isImage ? 'image only' : 'text layer present';

  // Badges
  const badges = [
    { id: 's2-badge-sr',   text: 'Screen reader' },
    { id: 's2-badge-copy', text: 'Copy / cite'   },
    { id: 's2-badge-search', text: 'Searchable'  },
  ];
  badges.forEach(({ id, text }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = isImage ? 'badge badge--danger' : 'badge badge--success';
    el.textContent = (isImage ? '✗ ' : '✓ ') + text;
  });

  // SR button
  const srBtn = document.getElementById('s2-sr-btn');
  if (srBtn) srBtn.innerHTML = srOn ? SVG_VOL_ON + ' Screen reader on' : SVG_VOL_OFF + ' Simulate screen reader';

  // SR panel
  const srPanel = document.getElementById('s2-sr-panel');
  if (srPanel) srPanel.hidden = !srOn;

  // SR lines
  renderS2SRLines(mode);

  // "Hear it" button
  const hearBtn = document.getElementById('s2-hear-btn');
  if (hearBtn) {
    hearBtn.textContent = speaking ? '◼ Stop' : '▶ Hear it';
    hearBtn.classList.toggle('is-speaking', speaking);
  }

  // Copy result alerts
  const copyFail = document.getElementById('s2-copy-fail');
  if (copyFail) copyFail.hidden = (copyResult !== 'fail');
  const copyOk = document.getElementById('s2-copy-ok');
  if (copyOk) copyOk.hidden = (copyResult !== 'success');
}

// ── Station 3 ──────────────────────────────────────────────────────

// Same content as S1 — real HTML means screen readers get everything.
const S3_SR_TEXT = S1_SR_TEXT;

function renderS3() {
  const { srOn, speaking, copied } = state.s3;

  // SR toggle button
  const srBtn = document.getElementById('s3-sr-btn');
  if (srBtn) srBtn.innerHTML = srOn ? SVG_VOL_ON + ' Screen reader on' : SVG_VOL_OFF + ' Simulate screen reader';

  // SR panel
  const srPanel = document.getElementById('s3-sr-panel');
  if (srPanel) srPanel.hidden = !srOn;

  // "Hear it" button
  const hearBtn = document.getElementById('s3-hear-btn');
  if (hearBtn) {
    hearBtn.textContent = speaking ? '◼ Stop' : '▶ Hear it';
    hearBtn.classList.toggle('is-speaking', speaking);
  }

  // Copy result
  const copyOk = document.getElementById('s3-copy-ok');
  if (copyOk) copyOk.hidden = !copied;
}

// ── Event wiring ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  // Hide "Hear it" buttons if Web Speech API is unavailable
  if (!window.speechSynthesis) {
    ['s1-hear-btn', 's2-hear-btn', 's3-hear-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.hidden = true;
    });
  }

  // ── Tab navigation (APG tablist pattern) ────────────────────────

  const tabs = document.querySelectorAll('.station__tab');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => goToStation(i));

    // Arrow-key navigation with automatic activation
    tab.addEventListener('keydown', function (e) {
      const all = [...document.querySelectorAll('.station__tab')];
      const idx = all.indexOf(e.target);
      let target = null;
      if (e.key === 'ArrowRight') target = all[(idx + 1) % all.length];
      if (e.key === 'ArrowLeft')  target = all[(idx - 1 + all.length) % all.length];
      if (e.key === 'Home')       target = all[0];
      if (e.key === 'End')        target = all[all.length - 1];
      if (target) {
        e.preventDefault();
        target.focus();
        goToStation(all.indexOf(target));
      }
    });
  });

  // ── Prev / Next ─────────────────────────────────────────────────
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  if (btnPrev) btnPrev.addEventListener('click', () => goToStation(state.station - 1));
  if (btnNext) btnNext.addEventListener('click', () => goToStation(state.station + 1));

  // ── Station 1 event listeners ───────────────────────────────────

  const s1SrBtn = document.getElementById('s1-sr-btn');
  if (s1SrBtn) {
    s1SrBtn.addEventListener('click', () => {
      state.s1.srOn = !state.s1.srOn;
      if (!state.s1.srOn && state.s1.speaking) {
        stopSpeech();
        state.s1.speaking = false;
      }
      renderS1();
    });
  }

  const s1CopyBtn = document.getElementById('s1-copy-btn');
  if (s1CopyBtn) {
    s1CopyBtn.addEventListener('click', () => {
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
  }

  const s1RevealBtn = document.getElementById('s1-reveal-btn');
  if (s1RevealBtn) {
    s1RevealBtn.addEventListener('click', () => {
      state.s1.revealed = !state.s1.revealed;
      renderS1();
    });
  }

  const s1HearBtn = document.getElementById('s1-hear-btn');
  if (s1HearBtn) {
    s1HearBtn.addEventListener('click', () => {
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
  }

  // ── Station 2 event listeners ───────────────────────────────────

  const s2BtnImage = document.getElementById('s2-btn-image');
  if (s2BtnImage) {
    s2BtnImage.addEventListener('click', () => {
      stopSpeech();
      state.s2 = { mode: 'image', srOn: false, copyResult: null, searchResult: null, speaking: false };
      renderS2();
    });
  }

  const s2BtnText = document.getElementById('s2-btn-text');
  if (s2BtnText) {
    s2BtnText.addEventListener('click', () => {
      stopSpeech();
      state.s2 = { mode: 'text', srOn: false, copyResult: null, searchResult: null, speaking: false };
      renderS2();
    });
  }

  const s2SrBtn = document.getElementById('s2-sr-btn');
  if (s2SrBtn) {
    s2SrBtn.addEventListener('click', () => {
      state.s2.srOn = !state.s2.srOn;
      if (!state.s2.srOn && state.s2.speaking) {
        stopSpeech();
        state.s2.speaking = false;
      }
      renderS2();
    });
  }

  const s2HearBtn = document.getElementById('s2-hear-btn');
  if (s2HearBtn) {
    s2HearBtn.addEventListener('click', () => {
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
  }

  const s2CopyBtn = document.getElementById('s2-copy-btn');
  if (s2CopyBtn) {
    s2CopyBtn.addEventListener('click', () => {
      if (state.s2.mode === 'image') {
        state.s2.copyResult = 'fail';
      } else {
        navigator.clipboard.writeText(S2_HOURS_TEXT).catch(() => {});
        state.s2.copyResult = 'success';
      }
      renderS2();
    });
  }

  // ── Station 3 event listeners ───────────────────────────────────

  const s3SrBtn = document.getElementById('s3-sr-btn');
  if (s3SrBtn) {
    s3SrBtn.addEventListener('click', () => {
      state.s3.srOn = !state.s3.srOn;
      if (!state.s3.srOn && state.s3.speaking) {
        stopSpeech();
        state.s3.speaking = false;
      }
      renderS3();
    });
  }

  const s3HearBtn = document.getElementById('s3-hear-btn');
  if (s3HearBtn) {
    s3HearBtn.addEventListener('click', () => {
      if (state.s3.speaking) {
        stopSpeech();
        state.s3.speaking = false;
        renderS3();
      } else {
        state.s3.speaking = true;
        renderS3();
        speak(S3_SR_TEXT, () => { state.s3.speaking = false; renderS3(); });
      }
    });
  }

  const s3CopyBtn = document.getElementById('s3-copy-btn');
  if (s3CopyBtn) {
    s3CopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(S2_HOURS_TEXT).catch(() => {});
      state.s3.copied = true;
      renderS3();
    });
  }

  // ── Initial render ───────────────────────────────────────────────
  renderS1();
  renderS2();
  renderS3();
});
