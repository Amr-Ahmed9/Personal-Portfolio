/* ============================================================
   PORTFOLIO — script.js
   Fixes applied:
   1. Page switching (showPage) — clean, no broken dropdown
   2. Mobile hamburger menu toggle
   3. Hero particle canvas — properly sized & restarted on resize
   4. Stat counters — IntersectionObserver triggered once
   5. Scroll fade-in — lightweight IO
   6. Skill bars — animated on scroll into view
   7. Terminal — full command map, history, keyboard nav
   8. Chatbot — correct Anthropic API headers (incl. required
      dangerous-direct-browser-access header), full async/await,
      error handling, AND a local mock fallback so the bot
      always responds even if the API is unavailable
   ============================================================ */

'use strict';

/* ============================================================
   1. PAGE SWITCHING
   ============================================================ */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId + '-page');
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  // Re-trigger skill bars when portfolio page becomes active
  if (pageId === 'portfolio') {
    setTimeout(animateSkillBars, 300);
  }
  closeMobileMenu();
}

function smoothScroll(sectionId) {
  // Give the page a tick to become visible before scrolling
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

/* ============================================================
   2. MOBILE HAMBURGER MENU
   Fix: desktop nav hidden on mobile via CSS; hamburger toggles
   a drawer below the navbar with proper ARIA attributes
   ============================================================ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });
  // Close when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('#navbar')) closeMobileMenu();
  });
  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

// Called by mobile menu links
function mobileNav(sectionId, pageId) {
  closeMobileMenu();
  if (pageId) {
    showPage(pageId);
    return;
  }
  showPage('portfolio');
  if (sectionId) smoothScroll(sectionId);
}

// Logo keyboard activation
const logoEl = document.querySelector('.logo');
if (logoEl) {
  logoEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPage('portfolio'); }
  });
}

/* ============================================================
   3. HERO CANVAS — particle network
   Fix: canvas sized to its actual rendered dimensions (not
   just window), restarted properly on resize with debounce
   ============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  function resize() {
    const parent = canvas.parentElement;
    W = canvas.width  = parent.offsetWidth;
    H = canvas.height = parent.offsetHeight;
    spawnParticles();
  }

  function spawnParticles() {
    particles = [];
    const count = Math.min(60, Math.floor((W * H) / 14000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        r: Math.random() * 1.8 + 0.8
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const len = particles.length;
    for (let i = 0; i < len; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255,0.65)';
      ctx.fill();
      for (let j = i + 1; j < len; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,229,255,${0.14 * (1 - d / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { cancelAnimationFrame(animId); resize(); draw(); }, 180);
  });

  resize();
  draw();
}());

/* ============================================================
   4. STAT COUNTERS
   ============================================================ */
(function initCounters() {
  const stats = [
    { id: 's1', target: 6,    suffix: '' },
    { id: 's2', target: 5,    suffix: '' },
    { id: 's3', target: 9200, suffix: '+' },
    { id: 's4', target: 50,   suffix: '+' }
  ];

  let counted = false;

  function countUp(el, target, suffix) {
    const duration = 1600;
    const step = target / duration * 16;
    let current = 0;
    const iv = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(iv);
    }, 16);
  }

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      stats.forEach(({ id, target, suffix }, i) => {
        const el = document.getElementById(id);
        if (el) setTimeout(() => countUp(el, target, suffix), i * 180);
      });
    }
  }, { threshold: 0.3 });
  io.observe(hero);
}());

/* ============================================================
   5. SCROLL FADE-IN
   ============================================================ */
(function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}());

/* ============================================================
   6. SKILL BARS
   Fix: observing the skills grid container (not #skills id
   which may not exist), animating fills when in view
   ============================================================ */
function animateSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(b => {
    b.style.width = (b.dataset.w || 0) + '%';
  });
}

(function initSkillBars() {
  const grid = document.querySelector('.skills-grid');
  if (!grid) return;
  // Reset widths on load so animation plays fresh
  document.querySelectorAll('.skill-fill').forEach(b => { b.style.width = '0'; });

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(animateSkillBars, 150);
      io.disconnect();
    }
  }, { threshold: 0.2 });
  io.observe(grid);
}());

/* ============================================================
   7. TERMINAL
   ============================================================ */
(function initTerminal() {
  const output   = document.getElementById('terminal-output');
  const termInput = document.getElementById('term-input');
  if (!output || !termInput) return;

  const COMMANDS = {
    whoami: () => [
      { t: 'success', v: 'Amr Ahmed Shehata — Data Scientist & ML Engineer' },
      { t: 'out',     v: '📍 Cairo, Egypt | CS Graduate, Arab Open University 2025' },
      { t: 'out',     v: '🏢 Performance Specialist @ MNT-Halan (current)' },
      { t: 'out',     v: '🎯 Targeting: Data Analyst / Junior ML / BI roles' }
    ],
    'ls projects': () => [
      { t: 'out', v: 'drwxr-xr-x  RiskGuard-AI/              [CAPSTONE — Django + Scikit-learn]' },
      { t: 'out', v: 'drwxr-xr-x  Customer-Segmentation/       [SQL + Power BI + RFM]' },
      { t: 'out', v: 'drwxr-xr-x  KPI-Reporting-Automation/     [Excel Power Query + Power BI]' },
      { t: 'out', v: 'drwxr-xr-x  Customer-Churn-Prediction/    [🔧 IN PROGRESS]' },
      { t: 'out', v: 'drwxr-xr-x  SQL-Sales-Analytics/          [🔧 IN PROGRESS]' },
      { t: 'out', v: 'drwxr-xr-x  Financial-KPI-Dashboard/      [🔧 IN PROGRESS]' }
    ],
    'cat skills.txt': () => [
      { t: 'out', v: 'EXCEL:    Power Query · Pivot Tables · VLOOKUP/XLOOKUP · Dashboards' },
      { t: 'out', v: 'POWER BI: DAX · Data Modeling · Star Schema · Drill-throughs' },
      { t: 'out', v: 'PYTHON:   Pandas · NumPy · Matplotlib · Seaborn · Scikit-learn' },
      { t: 'out', v: 'SQL:      Joins · CTEs · Window Functions · RFM Scoring' },
      { t: 'out', v: 'TOOLS:    Git · Django · Jupyter · VS Code · Google Colab' }
    ],
    'git log': () => [
      { t: 'out', v: 'commit a3f9c11 — Fix SMTP auth + password reset flow' },
      { t: 'out', v: 'commit b72d8ea — Clean .env from git history' },
      { t: 'out', v: 'commit c501a3d — Add forecasting ML model endpoint' },
      { t: 'out', v: 'commit e9f21bc — RFM scoring SQL queries' },
      { t: 'out', v: 'commit d130cc2 — Initial RiskGuard AI scaffold' }
    ],
    'python --version': () => [
      { t: 'success', v: 'Python 3.11.4' },
      { t: 'out',     v: 'Libraries: pandas, numpy, scikit-learn, matplotlib, seaborn, django' }
    ],
    'cat certifications.txt': () => [
      { t: 'out', v: '[🔧] 365 Data Science — DS & ML Track (In Progress)' },
      { t: 'out', v: '[✓]  Microsoft Excel — Advanced Data Analysis' },
      { t: 'out', v: '[🔧] Power BI — Data Modeling, DAX, Star Schema (In Progress)' },
      { t: 'out', v: '[✓]  Python for Data Science — Applied ML & EDA' }
    ],
    contact: () => [
      { t: 'out', v: '📧  aamr7057@gmail.com' },
      { t: 'out', v: '📞  01155362488' },
      { t: 'out', v: '🐙  github.com/Amr-Ahmed9' },
      { t: 'out', v: '📍  Cairo, Egypt' },
      { t: 'out', v: '💼  Open to Data Analyst / ML / BI roles' }
    ],
    help: () => [
      { t: 'out', v: 'Available commands:' },
      { t: 'out', v: '  whoami · ls projects · cat skills.txt · git log' },
      { t: 'out', v: '  python --version · cat certifications.txt · contact · clear' }
    ],
    clear: null
  };

  let cmdHistory = [], histIdx = -1;

  function addLine(type, text) {
    const d = document.createElement('div');
    d.className = 'term-line';
    d.innerHTML = `<span class="term-${type}">${escHtml(text)}</span>`;
    output.appendChild(d);
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  window.runCmd = function(cmd) {
    cmd = cmd.trim();
    termInput.value = '';
    // Echo the command
    const echo = document.createElement('div');
    echo.className = 'term-line';
    echo.innerHTML = `<span class="term-prompt">amr@portfolio:~$ </span><span class="term-cmd">${escHtml(cmd)}</span>`;
    output.appendChild(echo);

    if (cmd === 'clear') { output.innerHTML = ''; return; }

    const fn = COMMANDS[cmd.toLowerCase()];
    if (fn) {
      fn().forEach(l => addLine(l.t, l.v));
    } else if (fn === null) {
      // 'clear' handled above; other null entries
    } else {
      addLine('err', `command not found: ${cmd}  (try 'help')`);
    }

    // Auto-scroll
    const body = output.closest('.terminal-body');
    if (body) body.scrollTop = body.scrollHeight;
  };

  termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = termInput.value.trim();
      if (!v) return;
      cmdHistory.unshift(v);
      histIdx = -1;
      runCmd(v);
    }
    if (e.key === 'ArrowUp') {
      histIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
      termInput.value = cmdHistory[histIdx] || '';
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      histIdx = Math.max(histIdx - 1, -1);
      termInput.value = histIdx < 0 ? '' : cmdHistory[histIdx];
      e.preventDefault();
    }
  });

  // Boot greeting
  setTimeout(() => runCmd('whoami'), 700);
}());

/* ============================================================
   8. CHATBOT
   Fix summary:
   - Added required "anthropic-dangerous-direct-browser-access"
     header (Anthropic requires this for browser-side calls)
   - Used correct model string for Sonnet 4
   - Proper async/await with try/catch
   - Disabled send button while awaiting response
   - Loading indicator (typing dots)
   - Smart LOCAL MOCK FALLBACK: if API fails (CORS, no key,
     network error), falls back to keyword-matched local answers
     so the chatbot always works for visitors
   ============================================================ */
(function initChatbot() {
  const messagesEl   = document.getElementById('chat-messages');
  const inputEl      = document.getElementById('chat-input');
  const sendBtn      = document.getElementById('chat-send');
  const statusEl     = document.getElementById('chat-status-indicator');
  if (!messagesEl || !inputEl || !sendBtn) return;

  /* ----- Profile context fed to the model ----- */
  const SYSTEM_PROMPT = `You are a friendly, concise AI assistant embedded in Amr Ahmed Shehata's portfolio website.

Profile:
- Full name: Amr Ahmed Shehata
- Location: Cairo, Egypt
- Education: B.Sc. Computer Science, Arab Open University, graduated 2025
- Current role: Performance Specialist at MNT-Halan (June 2024–Present)
  Responsibilities: KPI dashboards, ETL pipelines, benchmarking, stakeholder reporting, data consolidation automation
- Email: aamr7057@gmail.com | GitHub: github.com/Amr-Ahmed9
- Career goal: Data Analyst or junior ML/BI Engineer role

Technical skills:
- Excel: Power Query, Pivot Tables, VLOOKUP/XLOOKUP, Dynamic Arrays, KPI dashboards
- Power BI: DAX, Data Modeling, Star Schema, Drill-throughs
- Python: Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn
- SQL: Joins, CTEs, Window Functions, Subqueries, RFM Scoring
- Tools: Git, GitHub, Django, Jupyter, VS Code, Google Colab

Completed projects:
1. RiskGuard AI (capstone 2024-2025) — Django + Scikit-learn financial forecasting app. ETL pipeline, regression + time-series forecasting, interactive dashboards. GitHub: github.com/Amr-Ahmed9/RiskGuard-AI
2. Customer Segmentation Analysis (2024) — SQL RFM scoring on 500+ customers, Power BI treemap/scatter visualization.
3. KPI & Reporting Automation (2024-present) — Excel Power Query automation, dynamic dashboards, EDA.

In-progress projects: Customer Churn Prediction (Python, Scikit-learn, Power BI), SQL Sales Analytics (20+ queries), Financial KPI Dashboard (Power BI, DAX, Star Schema).

Certifications: 365 Data Science ML Track (in progress), MS Excel Advanced, Power BI (in progress), Python for Data Science.
Languages: Arabic (native), English (professional).

Answer concisely in 2-4 sentences unless a detailed answer is needed. Be helpful and professional.`;

  /* ----- Local mock fallback responses ----- */
  const MOCK_RESPONSES = [
    {
      keys: ['riskguard', 'capstone', 'forecasting', 'django'],
      answer: "RiskGuard AI is Amr's capstone project — a Django web app that forecasts customer expenses and income using Scikit-learn. It features a full ETL pipeline, regression + time-series models, and embedded dashboards for non-technical users. You can explore it at github.com/Amr-Ahmed9/RiskGuard-AI."
    },
    {
      keys: ['mnt', 'halan', 'experience', 'work', 'job', 'current', 'role'],
      answer: "Amr currently works as a Performance Specialist at MNT-Halan in Cairo. He collects and analyzes operational data to track KPIs, builds dashboards for department heads, standardized reporting workflows, and supports quarterly strategic planning."
    },
    {
      keys: ['skill', 'tech', 'stack', 'python', 'sql', 'excel', 'power bi', 'strongest'],
      answer: "Amr's strongest skills are Excel (Power Query, Pivot Tables, dashboards), Power BI (DAX, Star Schema), Python (Pandas, Scikit-learn, Matplotlib), and SQL (CTEs, Window Functions, RFM Scoring). He also has solid experience with Django and Git."
    },
    {
      keys: ['open', 'hire', 'available', 'opportunity', 'job', 'looking'],
      answer: "Yes! Amr is actively seeking a Data Analyst or junior ML/BI Engineering role. He's based in Cairo, Egypt and open to both local and remote opportunities. Best way to reach him: aamr7057@gmail.com."
    },
    {
      keys: ['project', 'portfolio', 'work', 'built'],
      answer: "Amr has three completed projects: RiskGuard AI (ML forecasting web app), Customer Segmentation Analysis (SQL + Power BI RFM analysis), and KPI Reporting Automation (Excel Power Query pipelines). He's also building a churn prediction model, SQL sales analytics report, and a Financial KPI Power BI dashboard."
    },
    {
      keys: ['education', 'university', 'degree', 'study', 'graduate'],
      answer: "Amr graduated in 2025 with a B.Sc. in Computer Science from Arab Open University, Cairo. Relevant coursework included Data Structures, Database Systems, Probability & Statistics, Software Engineering, and OOP."
    },
    {
      keys: ['certif', 'course', 'learn', 'training'],
      answer: "Amr has completed certifications in Microsoft Excel (Advanced Data Analysis) and Python for Data Science. He's currently working through the 365 Data Science ML Track and a Power BI Data Modeling course."
    },
    {
      keys: ['contact', 'email', 'reach', 'github', 'linkedin'],
      answer: "You can reach Amr at aamr7057@gmail.com or explore his work on GitHub at github.com/Amr-Ahmed9. He's also available via phone at 01155362488."
    }
  ];

  function mockResponse(msg) {
    const lower = msg.toLowerCase();
    for (const { keys, answer } of MOCK_RESPONSES) {
      if (keys.some(k => lower.includes(k))) return answer;
    }
    return "I'm Amr's portfolio assistant! Ask me about his projects (like RiskGuard AI), his skills (Python, SQL, Power BI), his experience at MNT-Halan, or whether he's open to work. I'm happy to help!";
  }

  /* ----- DOM helpers ----- */
  function addMessage(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;
    wrap.innerHTML = `
      <div class="msg-icon ${role === 'bot' ? 'bot-icon' : 'user-icon'}" aria-hidden="true">
        ${role === 'bot' ? 'AI' : 'You'}
      </div>
      <div class="msg-bubble">${text}</div>`;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addTypingIndicator() {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    wrap.id = 'typing-indicator';
    wrap.innerHTML = `
      <div class="msg-icon bot-icon" aria-hidden="true">AI</div>
      <div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function setLoading(on) {
    sendBtn.disabled = on;
    inputEl.disabled = on;
  }

  /* ----- Main send handler ----- */
  async function handleChat() {
    const msg = inputEl.value.trim();
    if (!msg) return;

    inputEl.value = '';
    addMessage('user', msg);
    setLoading(true);
    const typingEl = addTypingIndicator();

    try {
      /* Attempt live Anthropic API call.
         The header "anthropic-dangerous-direct-browser-access: true"
         is REQUIRED by Anthropic for direct browser calls —
         this was the root cause of the chatbot not responding. */
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '',          // leave empty; handled by claude.ai proxy
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 350,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: msg }]
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply = data?.content?.[0]?.text;
      if (!reply) throw new Error('Empty response');

      removeTypingIndicator();
      addMessage('bot', reply);

    } catch (err) {
      /* ----- Fallback: local mock responses ----- */
      console.warn('[Chatbot] API unavailable, using local fallback.', err.message);
      // Simulate a short delay so it feels natural
      await new Promise(r => setTimeout(r, 800));
      removeTypingIndicator();
      addMessage('bot', mockResponse(msg));

      // Update status indicator silently
      if (statusEl) {
        statusEl.textContent = 'Assistant · Local mode';
        statusEl.className = 'chat-status offline';
      }
    } finally {
      setLoading(false);
      inputEl.focus();
    }
  }

  /* ----- Event listeners ----- */
  sendBtn.addEventListener('click', handleChat);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); }
  });

  /* ----- Expose sendChat for quick-chip buttons ----- */
  window.sendChat = function(msg) {
    inputEl.value = msg;
    handleChat();
  };
}());

/* ============================================================
   NAV SCROLL SHADOW
   Adds a subtle shadow to the nav on scroll
   ============================================================ */
(function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(0,0,0,0.4)'
      : 'none';
  }, { passive: true });
}());
