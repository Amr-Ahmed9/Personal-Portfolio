/* ── PAGE SWITCHING ── */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
  window.scrollTo(0, 0);
  if (page === 'portfolio') {
    setTimeout(() => {
      document.querySelectorAll('.skill-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });
    }, 300);
  }
}

function smoothScroll(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 50);
}

/* ── HERO CANVAS — particle network ── */
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
resize();
window.addEventListener('resize', () => { resize(); initParticles(); });

function initParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 2 + 1
    });
  }
}
initParticles();

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (let p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,229,255,0.6)'; ctx.fill();
    for (let q of particles) {
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 120) {
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(0,229,255,${.15 * (1 - d / 120)})`; ctx.lineWidth = .5; ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ── STAT COUNTERS ── */
let counted = false;
function countUp(el, target, suffix = '') {
  let s = 0;
  const step = target / 1800 * 16;
  const iv = setInterval(() => {
    s += step;
    if (s >= target) { s = target; clearInterval(iv); }
    el.textContent = Math.floor(s) + suffix;
  }, 16);
}

const heroObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    setTimeout(() => countUp(document.getElementById('s1'), 6), 200);
    setTimeout(() => countUp(document.getElementById('s2'), 5), 400);
    setTimeout(() => countUp(document.getElementById('s3'), 9200, '+'), 600);
    setTimeout(() => countUp(document.getElementById('s4'), 50, '+'), 800);
  }
}, { threshold: .3 });
heroObs.observe(document.querySelector('.hero'));

/* ── SCROLL FADE-IN ── */
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .1 });
fadeEls.forEach(el => fadeObs.observe(el));

/* ── SKILL BARS ── */
const barObs = new IntersectionObserver(entries => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.querySelectorAll('.skill-fill').forEach(b => {
        setTimeout(() => { b.style.width = b.dataset.w + '%'; }, 200);
      });
    }
  });
}, { threshold: .3 });
const sg = document.querySelector('.skills-grid');
if (sg) barObs.observe(sg);

/* ── TERMINAL ── */
const output = document.getElementById('terminal-output');
const termInput = document.getElementById('term-input');

const cmds = {
  whoami: () => [
    { t: 'success', v: 'Amr Ahmed Shehata — Data Scientist & ML Engineer' },
    { t: 'out', v: '📍 Cairo, Egypt | CS Graduate, Arab Open University 2025' },
    { t: 'out', v: '🏢 Performance Specialist @ MNT-Halan (current)' },
    { t: 'out', v: '🎯 Targeting: Data Analyst / Junior ML / BI roles' }
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
    { t: 'out', v: 'Libraries: pandas, numpy, scikit-learn, matplotlib, seaborn, django' }
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
  clear: () => null,
  help: () => [
    { t: 'out', v: 'Commands: whoami · ls projects · cat skills.txt · git log' },
    { t: 'out', v: '          python --version · cat certifications.txt · contact · clear' }
  ]
};

let cmdHistory = [], histIdx = -1;

function addLine(type, text) {
  const d = document.createElement('div');
  d.className = 'term-line';
  d.innerHTML = `<span class="term-${type}">${text}</span>`;
  output.appendChild(d);
}

function runCmd(cmd) {
  termInput.value = '';
  addLine('prompt', 'amr@portfolio:~$ ');
  output.lastChild.innerHTML += `<span class="term-cmd">${cmd}</span>`;
  if (cmd === 'clear') { output.innerHTML = ''; return; }
  const fn = cmds[cmd.trim().toLowerCase()];
  if (fn) { const lines = fn(); if (lines) lines.forEach(l => addLine(l.t, l.v)); }
  else addLine('err', `command not found: ${cmd}. Try 'help'`);
  output.scrollTop = output.scrollHeight;
}

termInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && termInput.value.trim()) {
    const v = termInput.value.trim();
    cmdHistory.unshift(v); histIdx = -1;
    runCmd(v); termInput.value = '';
  }
  if (e.key === 'ArrowUp') { histIdx = Math.min(histIdx + 1, cmdHistory.length - 1); termInput.value = cmdHistory[histIdx] || ''; }
  if (e.key === 'ArrowDown') { histIdx = Math.max(histIdx - 1, -1); termInput.value = histIdx < 0 ? '' : cmdHistory[histIdx]; }
});

setTimeout(() => runCmd('whoami'), 600);

/* ── AI CHATBOT ── */
const SYSTEM_PROMPT = `You are an AI assistant embedded in Amr Ahmed Shehata's personal portfolio. His profile:
- Name: Amr Ahmed Shehata. Location: Cairo, Egypt.
- Education: B.Sc. Computer Science, Arab Open University, graduated 2025.
- Current role: Performance Specialist at MNT-Halan (June 2024–Present) — KPI dashboards, ETL, benchmarking, reporting automation.
- Email: aamr7057@gmail.com | GitHub: github.com/Amr-Ahmed9
- Seeking: Data Analyst or junior ML/BI role.
- Skills: Excel (Power Query, Pivot Tables, VLOOKUP, dashboards), Power BI (DAX, data modeling, star schema), Python (Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn), SQL (joins, CTEs, window functions, RFM scoring), Git, Django, Jupyter, VS Code.
- Projects: 1. RiskGuard AI (capstone 2024-2025): Django + Scikit-learn financial forecasting app, ETL pipeline, regression + time-series. 2. Customer Segmentation (2024): SQL RFM scoring on 500+ customers, Power BI visualization. 3. KPI Reporting Automation (2024-present): Excel Power Query automation, dynamic dashboards. In progress: Customer Churn Prediction, SQL Sales Analytics, Financial KPI Dashboard.
- Certifications: 365 Data Science ML Track (in progress), MS Excel Advanced, Power BI (in progress), Python for Data Science.
- Languages: Arabic (native), English (professional).
Answer concisely and professionally. Highlight his practical experience and project work.`;

async function handleChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  addMsg('user', msg);
  const typing = addTyping();
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: msg }]
      })
    });
    const data = await res.json();
    typing.remove();
    addMsg('bot', data.content?.[0]?.text || "I'm having trouble responding. Try again!");
  } catch (e) {
    typing.remove();
    addMsg('bot', "Connection issue — check out the terminal or GitHub for more info!");
  }
}

function addMsg(role, text) {
  const msgs = document.getElementById('chat-messages');
  const d = document.createElement('div');
  d.className = `msg ${role}`;
  d.innerHTML = `<div class="msg-icon ${role === 'bot' ? 'bot-icon' : 'user-icon'}">${role === 'bot' ? 'AI' : 'You'}</div><div class="msg-bubble">${text}</div>`;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTyping() {
  const msgs = document.getElementById('chat-messages');
  const d = document.createElement('div');
  d.className = 'msg bot';
  d.innerHTML = `<div class="msg-icon bot-icon">AI</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}

function sendChat(msg) { document.getElementById('chat-input').value = msg; handleChat(); }
document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleChat(); });
