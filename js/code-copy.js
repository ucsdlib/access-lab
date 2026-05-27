/* ================================================================
   DX TOOLS — CODE COPY BUTTON
   Wires up .code-block__copy buttons to copy the sibling <pre>.
   ================================================================ */

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.code-block__copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const block = btn.closest('.code-block');
        const pre   = block && block.querySelector('pre');
        if (!pre) return;

        const text = pre.innerText;

        navigator.clipboard.writeText(text).then(function () {
          const original = btn.innerHTML;
          btn.textContent = 'Copied!';
          btn.classList.add('code-block__copy--copied');
          btn.setAttribute('aria-label', 'Copied to clipboard');
          setTimeout(function () {
            btn.innerHTML = original;
            btn.classList.remove('code-block__copy--copied');
            btn.setAttribute('aria-label', 'Copy code');
          }, 2000);
        }).catch(function () {
          btn.textContent = 'Failed';
          setTimeout(function () {
            btn.textContent = 'Copy';
          }, 2000);
        });
      });
    });
  });
})();
