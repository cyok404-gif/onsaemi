// Shared cart counter: keeps the header count in sync across pages.
(function () {
  var KEY = 'onsaemi-cart-count';

  function read() {
    try { return parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) { return 0; }
  }

  function render(n) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
    });
  }

  window.OnsaemiCart = {
    count: read,
    add: function () {
      var n = read() + 1;
      try { localStorage.setItem(KEY, String(n)); } catch (e) { /* storage unavailable */ }
      render(n);
      return n;
    }
  };

  render(read());
})();
