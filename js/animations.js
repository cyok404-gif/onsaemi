// 온새미 — GSAP 애니메이션
// ScrollSmoother(부드러운 스크롤 + data-speed/data-lag 패럴랙스), ScrollTrigger(스크롤 등장), SplitText(글자 등장)
(function () {
  var root = document.documentElement;
  function showPage() { root.classList.remove('is-loading'); }

  // GSAP을 못 불러왔거나, 사용자가 "동작 줄이기"를 켜 두었으면 애니메이션 없이 보여 줌
  if (!window.gsap || !window.ScrollTrigger || !window.ScrollSmoother || !window.SplitText) { showPage(); return; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { showPage(); return; }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  // ---------- 부드러운 스크롤 ----------
  var smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.2,        // 스크롤이 따라오는 시간(초)
    effects: true,      // data-speed / data-lag 패럴랙스 사용
    smoothTouch: 0.1    // 터치 기기는 아주 약하게
  });
  root.classList.add('has-smoother');

  // ---------- 앵커 링크(#collection 등)를 부드러운 스크롤로 ----------
  document.querySelectorAll('a[href*="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname) return; // 다른 페이지로 가는 링크는 그대로
      e.preventDefault();
      if (url.hash.length > 1) {
        var target = document.querySelector(url.hash);
        if (target) smoother.scrollTo(target, true, 'top 20px');
      }
    });
  });

  // 다른 페이지에서 index.html#why 처럼 들어온 경우
  window.addEventListener('load', function () {
    if (location.hash.length > 1) {
      var target = document.querySelector(location.hash);
      if (target) setTimeout(function () { smoother.scrollTo(target, true, 'top 20px'); }, 300);
    }
  });

  // ---------- 공통 헬퍼 ----------
  // 컨테이너 안의 이미지가 더 느리게 움직이는 패럴랙스 (이미지 높이 120% 기준)
  function parallaxImage(img, trigger) {
    if (!document.querySelector(img)) return;
    gsap.fromTo(img, { yPercent: -15 }, {
      yPercent: 0,
      ease: 'none',
      scrollTrigger: { trigger: trigger, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  // 화면에 들어오면 아래에서 떠오르기
  function reveal(targets, trigger, opts) {
    if (!document.querySelector(trigger)) return;
    gsap.from(targets, Object.assign({
      y: 60,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: trigger, start: 'top 82%' }
    }, opts || {}));
  }

  // 글꼴이 로드된 뒤 글자를 쪼개야 위치가 정확함 (최대 1.5초 대기)
  var fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 1500); })
  ]);

  fontsReady.then(function () {
    var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // ---------- 헤더 ----------
    intro.from('.site-header > *', { y: -20, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0);

    // ---------- 메인: 히어로 ----------
    if (document.querySelector('.hero')) {
      var heroSplit = SplitText.create('.hero-word', { type: 'chars', mask: 'chars' });
      intro
        .from(heroSplit.chars, { yPercent: 110, duration: 1.2, stagger: 0.035, ease: 'expo.out' }, 0.15)
        .from('.hero-intro > *, .hero-stats .stat', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.55)
        .fromTo('.hero-photo',
          { clipPath: 'inset(22% 8% 0% 8% round 18px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.5, ease: 'expo.inOut' }, 0.3)
        .from('.hero-photo img', { scale: 1.15, duration: 1.8, ease: 'expo.out' }, 0.3)
        .from('.hero-cutout', { yPercent: 18, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.9)
        .from('.hero-cta', { y: 12, autoAlpha: 0, duration: 0.8 }, 1.3);

      parallaxImage('.hero-photo img', '.hero-visual');

      // 소파 컷아웃은 배경보다 빠르게 올라가 입체감
      gsap.to('.hero-cutout', {
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: '.hero-visual', start: 'top 60%', end: 'bottom top', scrub: true }
      });
    }

    // ---------- 메인: 선언 문장 (한 줄씩 떠오르며 진해짐) ----------
    if (document.querySelector('.statement')) {
      gsap.utils.toArray('.statement-text p').forEach(function (line) {
        gsap.from(line, {
          y: 50,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: line, start: 'top 88%' }
        });
      });
    }

    // ---------- 메인: 기능 카드 + 사진 ----------
    reveal('.feature-card', '.features');
    if (document.querySelector('.feature-photo')) {
      gsap.fromTo('.feature-photo',
        { clipPath: 'inset(12% 0% 12% 0% round 18px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 18px)',
          ease: 'none',
          scrollTrigger: { trigger: '.feature-photo', start: 'top 95%', end: 'top 40%', scrub: true }
        });
      parallaxImage('.feature-photo img', '.feature-photo');
    }

    // ---------- 메인: 왜 온새미인가 ----------
    if (document.querySelector('.why')) {
      gsap.fromTo('.why-img', { yPercent: 18, rotate: -6 }, {
        yPercent: -12,
        rotate: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.why-panel', start: 'top bottom', end: 'bottom top', scrub: true }
      });
      var whySplit = SplitText.create('.why-body h2', { type: 'lines', mask: 'lines' });
      gsap.from(whySplit.lines, {
        yPercent: 100,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.why-panel', start: 'top 75%' }
      });
      reveal('.why-body .pill, .why-body p', '.why-panel', { y: 30, delay: 0.3, scrollTrigger: { trigger: '.why-panel', start: 'top 75%' } });
    }

    // ---------- 메인: 컬렉션 ----------
    if (document.querySelector('.collection')) {
      var colSplit = SplitText.create('.collection-head h2', { type: 'chars', mask: 'chars' });
      gsap.from(colSplit.chars, {
        yPercent: 110,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.03,
        scrollTrigger: { trigger: '.collection', start: 'top 80%' }
      });
      reveal('.see-all', '.collection', { y: 20 });
      reveal('.product-card', '.product-grid', { y: 80, stagger: 0.12 });
    }

    // ---------- 상세 페이지 ----------
    if (document.querySelector('.pdp')) {
      intro
        .fromTo('.pdp-hero',
          { clipPath: 'inset(10% 10% 10% 10% round 18px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease: 'expo.inOut' }, 0.2)
        .from('.pdp-hero img', { scale: 0.9, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.6)
        .from('.pdp-info > *', { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.4);

      reveal('.pdp-thumbs img', '.pdp-thumbs', { y: 100, stagger: 0.15, scrollTrigger: { trigger: '.pdp-thumbs', start: 'top 90%' } });

      // 넓은 화면에서 오른쪽 정보 영역을 고정 (sticky 대체)
      var mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', function () {
        var info = document.querySelector('.pdp-info');
        var gallery = document.querySelector('.pdp-gallery');
        ScrollTrigger.create({
          trigger: info,
          start: 'top 24px',
          end: function () { return '+=' + Math.max(0, gallery.offsetHeight - info.offsetHeight); },
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true
        });
      });
    }

    // ---------- 푸터: 큰 워드마크 글자 올라오기 ----------
    if (document.querySelector('.footer-wordmark')) {
      var footSplit = SplitText.create('.footer-wordmark', { type: 'chars', mask: 'chars' });
      gsap.from(footSplit.chars, {
        yPercent: 100,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.05,
        scrollTrigger: { trigger: '.site-footer', start: 'top 85%' }
      });
    }

    // 시작 상태가 모두 적용된 뒤 화면 표시 → 깜빡임 없음
    showPage();
    ScrollTrigger.refresh();
  });
})();
