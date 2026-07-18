/* =====================================================
   For Mahbuba, With Love — script.js
   Reusable functions power every flow (marriage / kiss / hug)
   so the same code drives the calendar, choice chips, and the
   playful "dodging No button" across all three pages.
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------
     1. AMBIENT BACKGROUND — hearts, petals, sparkles, ribbons
     --------------------------------------------------- */
  const ambientLayer = document.getElementById('ambientLayer');
  const AMBIENT_SYMBOLS = ['❤️', '💕', '💖', '💝', '🌸', '✨', '💫', '🎀'];

  function spawnAmbientItem() {
    const el = document.createElement('span');
    const symbol = AMBIENT_SYMBOLS[Math.floor(Math.random() * AMBIENT_SYMBOLS.length)];
    el.textContent = symbol;
    el.className = 'ambient-item' + (symbol === '✨' || symbol === '💫' ? ' sparkle' : '');

    const size = 14 + Math.random() * 22;
    const left = Math.random() * 100;
    const duration = 9 + Math.random() * 10;
    const drift = (Math.random() * 120 - 60) + 'px';

    el.style.left = left + 'vw';
    el.style.fontSize = size + 'px';
    el.style.setProperty('--drift', drift);
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * 4) + 's';

    ambientLayer.appendChild(el);

    // Clean up after the animation finishes so the DOM doesn't grow forever
    setTimeout(() => el.remove(), (duration + 4) * 1000);
  }

  // Seed the sky, then keep a gentle drip of new elements coming
  for (let i = 0; i < 18; i++) setTimeout(spawnAmbientItem, i * 260);
  setInterval(spawnAmbientItem, 900);

  /* ---------------------------------------------------
     2. MOUSE GLOW
     --------------------------------------------------- */
  const mouseGlow = document.getElementById('mouseGlow');
  window.addEventListener('pointermove', (e) => {
    mouseGlow.style.left = e.clientX + 'px';
    mouseGlow.style.top = e.clientY + 'px';
  });

  /* ---------------------------------------------------
     3. PAGE / NAVIGATION SYSTEM
     --------------------------------------------------- */
  const pages = document.querySelectorAll('.page');
  const floatingNav = document.getElementById('floatingNav');
  const navOrbs = document.querySelectorAll('.nav-orb');

  function goToPage(pageId) {
    pages.forEach(p => p.classList.toggle('active', p.id === 'page-' + pageId));
    navOrbs.forEach(o => o.classList.toggle('active', o.dataset.target === pageId));
    floatingNav.classList.toggle('visible', pageId !== 'welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => goToPage(btn.dataset.target));
  });

  document.getElementById('startJourneyBtn').addEventListener('click', () => {
    goToPage('home');
  });

  /* ---------------------------------------------------
     4. FLOW STEP HELPERS
     Each flow (marriage / kiss / hug) is a set of
     [data-step] elements inside one <section class="page">.
     showStep() reveals exactly one step within its page.
     --------------------------------------------------- */
  function showStep(stepId) {
    const el = document.querySelector(`[data-step="${stepId}"]`);
    if (!el) return;
    const page = el.closest('.page');
    page.querySelectorAll('.flow-step').forEach(s => s.hidden = true);
    el.hidden = false;
  }

  document.querySelectorAll('.btn-continue').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      showStep(btn.dataset.next);
    });
  });

  function resetFlow(prefix) {
    showStep(prefix + '-1');
    // Clear selections
    document.querySelectorAll(`[data-step^="${prefix}-"] .choice-chip.selected`)
      .forEach(c => c.classList.remove('selected'));
    document.querySelectorAll(`[data-step^="${prefix}-"] .btn-continue`)
      .forEach(b => b.disabled = true);
  }

  /* ---------------------------------------------------
     5. THE DODGING "NO" BUTTON
     Reusable across marriage / kiss / hug — attaches the
     same playful runaway behaviour to every .btn-no.
     --------------------------------------------------- */
  const DODGE_MESSAGES = ['Catch me! 😝', 'Almost!', 'Nope! ❤️', 'You need faster hands!', "I'm too shy!"];
  const dodgeMessageEl = document.getElementById('dodgeMessage');

  function setupDodgingButton(noBtn, yesBtn) {
    let dodging = false;

    function randomSafePosition() {
      const margin = 24;
      const w = noBtn.offsetWidth || 120;
      const h = noBtn.offsetHeight || 50;
      const maxX = window.innerWidth - w - margin;
      const maxY = window.innerHeight - h - margin;

      let x, y, tries = 0;
      const yesRect = yesBtn.getBoundingClientRect();

      do {
        x = margin + Math.random() * Math.max(1, maxX - margin);
        y = margin + Math.random() * Math.max(1, maxY - margin);
        tries++;
      } while (
        tries < 12 &&
        x < yesRect.right + 30 && x + w > yesRect.left - 30 &&
        y < yesRect.bottom + 30 && y + h > yesRect.top - 30
      );

      return { x, y };
    }

    function showDodgeMessage(x, y) {
      dodgeMessageEl.textContent = DODGE_MESSAGES[Math.floor(Math.random() * DODGE_MESSAGES.length)];
      dodgeMessageEl.style.left = x + 'px';
      dodgeMessageEl.style.top = y + 'px';
      dodgeMessageEl.classList.add('visible');
      clearTimeout(dodgeMessageEl._hideTimer);
      dodgeMessageEl._hideTimer = setTimeout(() => dodgeMessageEl.classList.remove('visible'), 900);
    }

    function dodge() {
      const { x, y } = randomSafePosition();
      const rotate = (Math.random() * 30 - 15).toFixed(1);
      noBtn.style.position = 'fixed';
      noBtn.style.left = x + 'px';
      noBtn.style.top = y + 'px';
      noBtn.style.transform = `rotate(${rotate}deg)`;
      showDodgeMessage(x + noBtn.offsetWidth / 2, y);
      dodging = true;
    }

    // Desktop: move away when the cursor comes near
    noBtn.addEventListener('mouseenter', dodge);
    noBtn.addEventListener('pointermove', () => {
      if (Math.random() < 0.3) dodge();
    });

    // Touch: move away on the touch attempt itself (before the tap registers)
    noBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      dodge();
    }, { passive: false });

    // Reset to static in-flow position whenever a fresh question is shown
    noBtn._resetPosition = () => {
      dodging = false;
      noBtn.style.position = '';
      noBtn.style.left = '';
      noBtn.style.top = '';
      noBtn.style.transform = '';
    };
  }

  document.querySelectorAll('.btn-no').forEach(noBtn => {
    const row = noBtn.closest('.answer-row');
    const yesBtn = row.querySelector('.btn-yes');
    setupDodgingButton(noBtn, yesBtn);
  });

  // Reset every dodging button's position whenever we land on a question step
  function resetAllNoButtons() {
    document.querySelectorAll('.btn-no').forEach(b => b._resetPosition && b._resetPosition());
  }
  const originalShowStep = showStep;
  showStep = function (stepId) {
    originalShowStep(stepId);
    resetAllNoButtons();
  };

  /* ---------------------------------------------------
     6. REUSABLE CALENDAR COMPONENT
     Mounts a small month-view calendar into any
     [data-calendar-for] container and calls back with
     the chosen date string.
     --------------------------------------------------- */
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DOW = ['S','M','T','W','T','F','S'];

  function createCalendar(mount, onSelect) {
    let viewDate = new Date();
    viewDate.setDate(1);
    let selected = null;

    function render() {
      mount.innerHTML = '';
      const cal = document.createElement('div');
      cal.className = 'calendar';

      const header = document.createElement('div');
      header.className = 'calendar-header';
      const prev = document.createElement('button');
      prev.className = 'calendar-nav-btn';
      prev.textContent = '‹';
      prev.type = 'button';
      const label = document.createElement('span');
      label.textContent = `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
      const next = document.createElement('button');
      next.className = 'calendar-nav-btn';
      next.textContent = '›';
      next.type = 'button';
      header.append(prev, label, next);

      const grid = document.createElement('div');
      grid.className = 'calendar-grid';
      DOW.forEach(d => {
        const el = document.createElement('div');
        el.className = 'calendar-dow';
        el.textContent = d;
        grid.appendChild(el);
      });

      const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
      const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
      const today = new Date(); today.setHours(0,0,0,0);

      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.className = 'calendar-day';
        dayBtn.textContent = d;
        const thisDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);

        if (selected && thisDate.toDateString() === selected.toDateString()) {
          dayBtn.classList.add('selected');
        }
        dayBtn.addEventListener('click', () => {
          selected = thisDate;
          render();
          onSelect(formatDate(thisDate));
        });
        grid.appendChild(dayBtn);
      }

      cal.append(header, grid);

      if (selected) {
        const label2 = document.createElement('div');
        label2.className = 'calendar-selected-label';
        label2.textContent = '💜 ' + formatDate(selected);
        cal.appendChild(label2);
      }

      mount.appendChild(cal);

      prev.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); render(); });
      next.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); render(); });
    }

    render();
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* ---------------------------------------------------
     7. CHOICE CHIP GROUPS (single-select, reusable)
     --------------------------------------------------- */
  function setupChoiceGroup(groupEl, { onChange, customInputEl } = {}) {
    const chips = groupEl.querySelectorAll('.choice-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const isCustom = chip.dataset.value === 'custom';
        if (customInputEl) customInputEl.hidden = !isCustom;
        if (!isCustom) {
          onChange(chip.dataset.value);
        } else {
          // Wait for the custom field to be filled in
          onChange(null);
        }
      });
    });
  }

  /* =====================================================
     MARRIAGE FLOW
     ===================================================== */
  const marriageState = { date: null, dress: null, groomOutfit: null };

  document.querySelectorAll('[data-flow="marriage"]').forEach(btn => {
    if (btn.dataset.answer === 'yes') {
      btn.addEventListener('click', () => {
        burstHearts(btn);
        showStep('marriage-2');
      });
    }
  });

  createCalendar(document.querySelector('[data-calendar-for="marriage-date"]'), (dateStr) => {
    marriageState.date = dateStr;
    document.querySelector('[data-step="marriage-2"] .btn-continue').disabled = false;
  });

  const dressGroup = document.querySelector('[data-choice-group="dress"]');
  const dressCustomRow = document.getElementById('dressCustomRow');
  const dressCustomColor = document.getElementById('dressCustomColor');
  const dressContinueBtn = document.querySelector('[data-step="marriage-3"] .btn-continue');

  setupChoiceGroup(dressGroup, {
    customInputEl: dressCustomRow,
    onChange: (val) => {
      if (val) {
        marriageState.dress = val;
        dressContinueBtn.disabled = false;
      } else {
        marriageState.dress = 'a custom shade of ' + dressCustomColor.value;
        dressContinueBtn.disabled = false;
      }
    }
  });
  dressCustomColor.addEventListener('input', () => {
    marriageState.dress = 'a custom shade of ' + dressCustomColor.value;
    dressContinueBtn.disabled = false;
  });

  const groomGroup = document.querySelector('[data-choice-group="groom"]');
  const groomCustomRow = document.getElementById('groomCustomRow');
  const groomCustomText = document.getElementById('groomCustomText');
  const groomContinueBtn = document.querySelector('[data-step="marriage-4"] .btn-continue');

  setupChoiceGroup(groomGroup, {
    customInputEl: groomCustomRow,
    onChange: (val) => {
      if (val) {
        marriageState.groomOutfit = val;
        groomContinueBtn.disabled = false;
      } else {
        groomContinueBtn.disabled = !groomCustomText.value.trim();
      }
    }
  });
  groomCustomText.addEventListener('input', () => {
    marriageState.groomOutfit = groomCustomText.value.trim() || null;
    groomContinueBtn.disabled = !marriageState.groomOutfit;
  });

  groomContinueBtn.addEventListener('click', () => {
    document.getElementById('wcDate').textContent = marriageState.date || '—';
    document.getElementById('wcDress').textContent = marriageState.dress || '—';
    document.getElementById('wcGroomOutfit').textContent = marriageState.groomOutfit || '—';
    setTimeout(() => celebrate('hearts'), 200);
  });

  document.getElementById('redoMarriageBtn').addEventListener('click', () => resetFlow('marriage'));

  /* Wedding card download as PNG — drawn directly on canvas
     so no external screenshot library is required. */
  document.getElementById('downloadCardBtn').addEventListener('click', () => {
    drawWeddingCardToPng(marriageState);
  });

  document.getElementById('shareCardBtn').addEventListener('click', async () => {
    const shareText = `Our wedding: ${marriageState.date || 'a date to be treasured'} 💍`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Our Wedding Invitation', text: shareText }); }
      catch (e) { /* user cancelled — no action needed */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        flashButtonLabel(document.getElementById('shareCardBtn'), 'Copied! ✅');
      } catch (e) { /* clipboard unavailable — silently ignore */ }
    }
  });

  function flashButtonLabel(btn, text) {
    const original = btn.textContent;
    btn.textContent = text;
    setTimeout(() => { btn.textContent = original; }, 1500);
  }

  /* =====================================================
     KISS FLOW
     ===================================================== */
  const kissState = { style: null, date: null };

  document.querySelectorAll('[data-flow="kiss"]').forEach(btn => {
    if (btn.dataset.answer === 'yes') {
      btn.addEventListener('click', () => {
        burstHearts(btn);
        showStep('kiss-2');
      });
    }
  });

  const kissStyleGroup = document.querySelector('[data-choice-group="kissStyle"]');
  const kissStyleContinue = document.querySelector('[data-step="kiss-2"] .btn-continue');
  setupChoiceGroup(kissStyleGroup, {
    onChange: (val) => { kissState.style = val; kissStyleContinue.disabled = !val; }
  });

  createCalendar(document.querySelector('[data-calendar-for="kiss-date"]'), (dateStr) => {
    kissState.date = dateStr;
    document.querySelector('[data-step="kiss-3"] .btn-continue').disabled = false;
  });

  document.querySelector('[data-step="kiss-3"] .btn-continue').addEventListener('click', () => {
    document.getElementById('kissStyleOut').textContent = kissState.style || '—';
    document.getElementById('kissDateOut').textContent = kissState.date || '—';
    setTimeout(() => celebrate('confetti'), 150);
  });

  document.getElementById('redoKissBtn').addEventListener('click', () => resetFlow('kiss'));

  /* =====================================================
     HUG FLOW
     ===================================================== */
  const hugState = { style: null, date: null };

  document.querySelectorAll('[data-flow="hug"]').forEach(btn => {
    if (btn.dataset.answer === 'yes') {
      btn.addEventListener('click', () => {
        burstHearts(btn);
        showStep('hug-2');
      });
    }
  });

  const hugStyleGroup = document.querySelector('[data-choice-group="hugStyle"]');
  const hugStyleContinue = document.querySelector('[data-step="hug-2"] .btn-continue');
  setupChoiceGroup(hugStyleGroup, {
    onChange: (val) => { hugState.style = val; hugStyleContinue.disabled = !val; }
  });

  createCalendar(document.querySelector('[data-calendar-for="hug-date"]'), (dateStr) => {
    hugState.date = dateStr;
    document.querySelector('[data-step="hug-3"] .btn-continue').disabled = false;
  });

  document.querySelector('[data-step="hug-3"] .btn-continue').addEventListener('click', () => {
    document.getElementById('hugStyleOut').textContent = hugState.style || '—';
    document.getElementById('hugDateOut').textContent = hugState.date || '—';
    setTimeout(() => celebrate('hearts'), 150);
  });

  document.getElementById('redoHugBtn').addEventListener('click', () => resetFlow('hug'));

  /* ---------------------------------------------------
     8. CELEBRATIONS — heart explosion + confetti canvas
     --------------------------------------------------- */
  const canvas = document.getElementById('celebrationCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function celebrate(kind) {
    const particles = [];
    const count = kind === 'confetti' ? 90 : 60;
    const colors = ['#ef8cb3', '#b79bf0', '#f7dfa8', '#cf9aa0', '#d9c9f2'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() * 200 - 100),
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 4,
        gravity: 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        size: kind === 'confetti' ? 6 + Math.random() * 6 : 12 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        shape: kind === 'confetti' ? 'rect' : 'heart'
      });
    }

    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= 0.012;
        if (p.life > 0 && p.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            drawHeartPath(ctx, p.size);
            ctx.fill();
          }
          ctx.restore();
        }
      });
      frame++;
      if (alive && frame < 220) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    tick();
  }

  function drawHeartPath(context, size) {
    const s = size / 16;
    context.beginPath();
    context.moveTo(0, 4 * s);
    context.bezierCurveTo(0, 2 * s, -2 * s, 0, -6 * s, 0);
    context.bezierCurveTo(-10 * s, 0, -10 * s, 6 * s, -10 * s, 6 * s);
    context.bezierCurveTo(-10 * s, 10 * s, -6 * s, 13 * s, 0, 18 * s);
    context.bezierCurveTo(6 * s, 13 * s, 10 * s, 10 * s, 10 * s, 6 * s);
    context.bezierCurveTo(10 * s, 6 * s, 10 * s, 0, 6 * s, 0);
    context.bezierCurveTo(2 * s, 0, 0, 2 * s, 0, 4 * s);
    context.closePath();
  }

  // Small heart burst right where a "Yes" was clicked
  function burstHearts(sourceBtn) {
    const rect = sourceBtn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: originX, y: originY,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 8 - 2,
        gravity: 0.3,
        size: 10 + Math.random() * 10,
        life: 1,
        color: ['#ef8cb3', '#b79bf0', '#cf9aa0'][Math.floor(Math.random() * 3)]
      });
    }
    let frame = 0;
    function tick() {
      let alive = false;
      particles.forEach(p => {
        p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        if (p.life > 0) alive = true;
      });
      ctx.save();
      particles.forEach(p => {
        if (p.life <= 0) return;
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        drawHeartPath(ctx, p.size);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      });
      ctx.restore();
      frame++;
      if (alive && frame < 60) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // Clear before drawing this quick burst so it doesn't fight the full celebrate()
    const loop = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); tick(); };
    loop();
  }

  /* ---------------------------------------------------
     9. WEDDING CARD → PNG (canvas-drawn, no external libs)
     --------------------------------------------------- */
  function drawWeddingCardToPng(state) {
    const W = 900, H = 1150;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');

    // Background gradient
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#fffaf3');
    bg.addColorStop(0.55, '#fdf1f8');
    bg.addColorStop(1, '#f6ecff');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // Gold outer border
    g.strokeStyle = '#d9a95e';
    g.lineWidth = 10;
    g.strokeRect(24, 24, W - 48, H - 48);
    g.strokeStyle = 'rgba(217,169,94,0.5)';
    g.lineWidth = 2;
    g.strokeRect(44, 44, W - 88, H - 88);

    g.textAlign = 'center';

    // Eyebrow
    g.fillStyle = '#a5824a';
    g.font = '700 22px Quicksand, sans-serif';
    g.fillText('TOGETHER WITH OUR FAMILIES', W / 2, 150);

    // Names
    g.fillStyle = '#5a2f92';
    g.font = '700 54px "Playfair Display", serif';
    g.fillText('Habibul Bashar', W / 2, 250);
    g.fillStyle = '#c98b93';
    g.font = 'italic 34px "Playfair Display", serif';
    g.fillText('&', W / 2, 305);
    g.fillStyle = '#5a2f92';
    g.font = '700 48px "Playfair Display", serif';
    g.fillText('Mahbuba Sultana Mahi', W / 2, 375);

    g.fillStyle = '#7a5a86';
    g.font = '26px Quicksand, sans-serif';
    g.fillText('request the pleasure of your company', W / 2, 425);

    g.fillStyle = '#c98b93';
    g.font = '28px Quicksand, sans-serif';
    g.fillText('✦ ❦ ✦', W / 2, 480);

    // Detail rows
    const details = [
      ['Wedding Date', state.date || '—'],
      ["Bride's Dress", state.dress || '—'],
      ["Groom's Outfit", state.groomOutfit || '—']
    ];
    let y = 560;
    details.forEach(([label, value]) => {
      g.fillStyle = 'rgba(255,255,255,0.7)';
      roundRect(g, W / 2 - 320, y - 42, 640, 68, 16);
      g.fill();
      g.textAlign = 'left';
      g.fillStyle = '#a5824a';
      g.font = '700 24px Quicksand, sans-serif';
      g.fillText(label, W / 2 - 290, y);
      g.textAlign = 'right';
      g.fillStyle = '#3a2445';
      g.font = '600 24px Quicksand, sans-serif';
      wrapRightAlignedText(g, value, W / 2 + 290, y, 320);
      g.textAlign = 'center';
      y += 96;
    });

    g.fillStyle = '#c98b93';
    g.font = '24px Quicksand, sans-serif';
    g.fillText('✦', W / 2, y + 20);

    g.fillStyle = '#a5824a';
    g.font = 'italic 30px "Playfair Display", serif';
    g.fillText('With all our love', W / 2, y + 80);

    // Decorative corner hearts
    g.font = '30px sans-serif';
    g.fillText('❤️', 90, 90);
    g.fillText('❤️', W - 90, 90);
    g.fillText('❤️', 90, H - 60);
    g.fillText('❤️', W - 90, H - 60);

    const link = document.createElement('a');
    link.download = 'our-wedding-invitation.png';
    link.href = c.toDataURL('image/png');
    link.click();
  }

  function roundRect(context, x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  function wrapRightAlignedText(context, text, rightX, y, maxWidth) {
    if (context.measureText(text).width <= maxWidth) {
      context.fillText(text, rightX, y);
      return;
    }
    // Simple shrink-to-fit for long custom text
    let fontSize = 24;
    do {
      fontSize -= 2;
      context.font = `600 ${fontSize}px Quicksand, sans-serif`;
    } while (context.measureText(text).width > maxWidth && fontSize > 12);
    context.fillText(text, rightX, y);
  }

});
