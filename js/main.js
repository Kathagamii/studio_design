(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Sticky header background on scroll
  --------------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------------------
     Scroll reveal animations
  --------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(
    ".feature-card, .timeline-step, .portfolio-card, .testi-card, .about-inner, .section-head"
  );
  revealTargets.forEach(function (el) { el.setAttribute("data-reveal", ""); });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------------
     Optional animated stat counters (disabled until real numbers
     are confirmed by the studio — see TODO in index.html #trust)
  --------------------------------------------------------------- */
  function initCounters() {
    document.querySelectorAll("[data-count-to]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      var duration = 1200;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  // initCounters(); // включить, когда появятся подтверждённые цифры студии

  /* ---------------------------------------------------------------
     Hero city toggle (Ярославль / Москва)
  --------------------------------------------------------------- */
  var cityBtns = document.querySelectorAll(".city-btn");
  var heroSub = document.getElementById("heroSub");
  var citySubs = {
    yar: "Проектируем жилые и коммерческие интерьеры под ключ — с авторским надзором на каждом этапе. Работаем в Ярославле и выезжаем на объекты в Москве.",
    msk: "Проектируем жилые и коммерческие интерьеры под ключ — с авторским надзором на каждом этапе. Выезжаем на объекты в Москве, основная студия — в Ярославле."
  };
  cityBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      cityBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var city = btn.getAttribute("data-city");
      if (citySubs[city]) heroSub.innerHTML = citySubs[city];
    });
  });

  /* ---------------------------------------------------------------
     Portfolio filter
  --------------------------------------------------------------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var portfolioCards = document.querySelectorAll(".portfolio-card");

  function applyFilter(filter) {
    portfolioCards.forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-cat") === filter;
      card.classList.toggle("is-visible", match);
    });
  }
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      applyFilter(btn.getAttribute("data-filter"));
    });
  });
  applyFilter("all");

  /* ---------------------------------------------------------------
     Portfolio card photo galleries (prev/next + dots)
  --------------------------------------------------------------- */
  document.querySelectorAll(".portfolio-gallery").forEach(function (gallery) {
    var imgs = gallery.querySelectorAll(".gallery-img");
    var dots = gallery.querySelectorAll(".dot");
    var current = 0;

    function show(index) {
      current = (index + imgs.length) % imgs.length;
      imgs.forEach(function (img, i) { img.classList.toggle("is-active", i === current); });
      dots.forEach(function (dot, i) { dot.classList.toggle("is-active", i === current); });
    }

    var prevBtn = gallery.querySelector(".gallery-prev");
    var nextBtn = gallery.querySelector(".gallery-next");
    if (prevBtn) prevBtn.addEventListener("click", function (e) { e.preventDefault(); show(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function (e) { e.preventDefault(); show(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function (e) { e.preventDefault(); show(i); });
    });

    // Swipe support (touch devices)
    var touchStartX = 0;
    var touchStartY = 0;
    var touching = false;
    gallery.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touching = true;
    }, { passive: true });
    gallery.addEventListener("touchend", function (e) {
      if (!touching) return;
      touching = false;
      var touch = e.changedTouches[0];
      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) show(current + 1);
      else show(current - 1);
    });
  });

  /* ---------------------------------------------------------------
     Price calculator / lead form
     NOTE: rates below are placeholders for layout purposes only —
     replace with real studio pricing before launch (see TODO in
     index.html #calculator).
  --------------------------------------------------------------- */
  var calcForm = document.getElementById("calcForm");
  var calcSteps = calcForm.querySelectorAll(".calc-step");
  var areaRange = document.getElementById("areaRange");
  var areaOutput = document.getElementById("areaOutput");
  var calcResultValue = document.getElementById("calcResultValue");

  var calcState = { type: null, area: parseInt(areaRange.value, 10), scope: null };

  var RATES_PER_SQM = {
    design: [1800, 2500],
    supervision: [2500, 3400],
    turnkey: [4200, 6000]
  };

  function goToStep(n) {
    calcSteps.forEach(function (step) {
      step.classList.toggle("is-active", parseInt(step.getAttribute("data-step"), 10) === n);
    });
  }

  calcForm.querySelectorAll(".calc-options").forEach(function (group) {
    group.querySelectorAll(".calc-option").forEach(function (opt) {
      opt.addEventListener("click", function () {
        group.querySelectorAll(".calc-option").forEach(function (o) { o.classList.remove("is-selected"); });
        opt.classList.add("is-selected");
        var key = group.getAttribute("data-group");
        calcState[key] = opt.getAttribute("data-value");

        if (key === "type") goToStep(2);
        if (key === "scope") {
          updateResult();
          goToStep(4);
        }
      });
    });
  });

  areaRange.addEventListener("input", function () {
    calcState.area = parseInt(areaRange.value, 10);
    areaOutput.textContent = calcState.area + " м²";
  });

  calcForm.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var current = parseInt(btn.closest(".calc-step").getAttribute("data-step"), 10);
      goToStep(current + 1);
    });
  });
  calcForm.querySelectorAll("[data-back]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var current = parseInt(btn.closest(".calc-step").getAttribute("data-step"), 10);
      goToStep(Math.max(1, current - 1));
    });
  });

  function updateResult() {
    var rate = RATES_PER_SQM[calcState.scope];
    if (!rate || !calcState.area) {
      calcResultValue.textContent = "—";
      return;
    }
    var low = Math.round((rate[0] * calcState.area) / 1000) * 1000;
    var high = Math.round((rate[1] * calcState.area) / 1000) * 1000;
    calcResultValue.textContent =
      low.toLocaleString("ru-RU") + " – " + high.toLocaleString("ru-RU") + " ₽";
  }

  calcForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // TODO(студия): подключить реальную отправку заявки (Telegram-бот / email / CRM).
    alert("Заявка получена! Мы свяжемся с вами в течение рабочего дня.\n\n(Демо-форма — подключите приём заявок в js/main.js)");
    calcForm.reset();
    goToStep(1);
    calcForm.querySelectorAll(".calc-option").forEach(function (o) { o.classList.remove("is-selected"); });
  });

  /* ---------------------------------------------------------------
     Contact form (demo submit — see TODO)
  --------------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Заявка получена! Мы свяжемся с вами в течение рабочего дня.\n\n(Демо-форма — подключите приём заявок в js/main.js)");
    contactForm.reset();
  });

  /* ---------------------------------------------------------------
     Testimonials slider (simple scroll-by)
  --------------------------------------------------------------- */
  var testiTrack = document.getElementById("testiTrack");
  var testiPrev = document.getElementById("testiPrev");
  var testiNext = document.getElementById("testiNext");
  function testiScroll(dir) {
    var card = testiTrack.querySelector(".testi-card");
    var step = card ? card.getBoundingClientRect().width + 28 : 400;
    testiTrack.scrollBy({ left: dir * step, behavior: "smooth" });
  }
  testiPrev.addEventListener("click", function () { testiScroll(-1); });
  testiNext.addEventListener("click", function () { testiScroll(1); });

})();
