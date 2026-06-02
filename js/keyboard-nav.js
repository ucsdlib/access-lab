'use strict';

/* ================================================================
   KEYBOARD NAVIGATION — Interaction Logic
   Experience 2: Keyboard accessibility with library services widget
   ================================================================ */

// ── State ──────────────────────────────────────────────────────────

let s3Selected = null;
let s3Revealed = false;

// ── Service items ─────────────────────────────────────────────────
//
// Three services in a library CTA widget. Item 2 is intentionally
// inaccessible — a <div onclick>, not a <button>. Do not change.

const S3_ITEMS = [
  { id: 1, label: 'Reserve a study room', keyboard: true  },
  { id: 2, label: 'Interlibrary loan',    keyboard: false }, // INTENTIONALLY inaccessible
  { id: 3, label: 'Ask a librarian',      keyboard: true  },
];

// ── selectItem ─────────────────────────────────────────────────────
// Exposed on window for use by the intentionally-inaccessible div's
// onclick attribute. This is the only global in this file.

function selectItem(id) {
  s3Selected = id;
  renderS3();
}
window.selectItem = selectItem;

// ── renderS3 ───────────────────────────────────────────────────────

function renderS3() {
  // Highlight selected item and show/hide the "mouse only" label
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
      // Inaccessible item — danger alert
      feedback.hidden = false;
      feedback.innerHTML =
        '<div class="alert alert--danger" role="status">' +
        '<div class="alert__body"><div class="alert__desc">' +
        '&#x2717; &#8220;Interlibrary loan&#8221; can only be activated by mouse click. ' +
        'Tab navigation skips it entirely.' +
        '</div></div></div>';
    } else {
      // Accessible item — success alert
      const label = S3_ITEMS.find(i => i.id === s3Selected)?.label ?? '';
      feedback.hidden = false;
      feedback.innerHTML =
        '<div class="alert alert--success" role="status">' +
        '<div class="alert__body"><div class="alert__desc">' +
        '&#x2713; &#8220;' + label + '&#8221; &#8212; reachable by keyboard and mouse.' +
        '</div></div></div>';
    }
  }

  // Reveal button: show once any item has been clicked
  const revealBtn = document.getElementById('s3-reveal-btn');
  if (revealBtn) {
    revealBtn.hidden = (s3Selected === null && !s3Revealed);
    revealBtn.textContent = s3Revealed ? 'Hide explanation' : 'Show what\'s happening →';
  }

  // Code explanation box
  const explanation = document.getElementById('s3-explanation');
  if (explanation) explanation.hidden = !s3Revealed;
}

// ── Event wiring ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  // Service item buttons (keyboard-accessible items only —
  // the inaccessible div calls selectItem via its onclick attribute)
  document.querySelectorAll('button.al-service-item').forEach(btn => {
    btn.addEventListener('click', () => selectItem(Number(btn.dataset.item)));
  });

  // Reveal / hide explanation
  const revealBtn = document.getElementById('s3-reveal-btn');
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      s3Revealed = !s3Revealed;
      renderS3();
    });
  }

  // Initial render
  renderS3();
});
