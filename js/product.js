// 머묾 소파 — option picker, live price, add to cart.
(function () {
  var BASE = 6200000;

  var OPTIONS = {
    size: {
      '2': { label: '2인', add: 0, width: '1,900mm' },
      '3': { label: '3인', add: 1400000, width: '2,300mm' },
      '4': { label: '4인', add: 2800000, width: '2,700mm' }
    },
    wood: {
      oak: { label: '화이트 오크', add: 0 },
      walnut: { label: '월넛', add: 900000 }
    },
    fabric: {
      linen: { label: '리넨 내추럴', add: 0 },
      wool: { label: '울 차콜', add: 300000 },
      leather: { label: '천연 가죽 코냑', add: 1800000 }
    }
  };

  var state = { size: '3', wood: 'oak', fabric: 'linen' };

  var priceEl = document.querySelector('[data-price]');
  var statusEl = document.querySelector('[data-cart-status]');
  var specEls = {
    width: document.querySelector('[data-spec="width"]'),
    wood: document.querySelector('[data-spec="wood"]'),
    fabric: document.querySelector('[data-spec="fabric"]')
  };

  function fmt(n) { return '₩' + n.toLocaleString('ko-KR'); }

  function current() {
    return {
      size: OPTIONS.size[state.size],
      wood: OPTIONS.wood[state.wood],
      fabric: OPTIONS.fabric[state.fabric]
    };
  }

  function render() {
    var c = current();
    priceEl.textContent = fmt(BASE + c.size.add + c.wood.add + c.fabric.add);
    specEls.width.textContent = c.size.width;
    specEls.wood.textContent = c.wood.label;
    specEls.fabric.textContent = c.fabric.label;

    document.querySelectorAll('.option[data-group]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(state[btn.dataset.group] === btn.dataset.id));
    });
  }

  document.querySelectorAll('.option[data-group]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state[btn.dataset.group] = btn.dataset.id;
      statusEl.hidden = true;
      render();
    });
  });

  document.querySelector('[data-add-to-cart]').addEventListener('click', function () {
    var c = current();
    if (window.OnsaemiCart) window.OnsaemiCart.add();
    statusEl.textContent = '장바구니에 담았습니다 · ' + c.size.label + ' · ' + c.wood.label + ' · ' + c.fabric.label;
    statusEl.hidden = false;
  });

  render();
})();
