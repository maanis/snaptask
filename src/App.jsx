import { useState, useEffect, useRef } from 'react'

// ─── Dummy credentials ───────────────────────────────────────────────────────
const USERS = [
  { username: 'admin', password: 'snap123' },
  { username: 'user1', password: 'task456' },
]

// ─── Seed tasks ──────────────────────────────────────────────────────────────
const SEED_TASKS = [
  { id: 1, title: 'Build the landing page', desc: 'Design hero section and nav', priority: 'HIGH', tag: 'Dev', done: false, due: '2026-04-25' },
  { id: 2, title: 'Review pull requests', desc: 'Code review for team members', priority: 'MED', tag: 'Dev', done: true, due: '2026-04-21' },
  { id: 3, title: 'Weekly standup notes', desc: 'Document blockers and progress', priority: 'LOW', tag: 'Meeting', done: false, due: '2026-04-22' },
]

const PRIORITIES = ['LOW', 'MED', 'HIGH']
const TAGS = ['Dev', 'Design', 'Meeting', 'Research', 'Personal', 'Urgent']

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --bg2: #0d1117;
    --bg3: #131920;
    --bg4: #1a2330;
    --neon: #00f5a0;
    --neon2: #00d4ff;
    --pink: #ff2d78;
    --yellow: #f5c400;
    --text: #e2eaf4;
    --text-dim: #5a7080;
    --text-mid: #8aa0b8;
    --border: rgba(0,245,160,0.12);
    --border2: rgba(0,212,255,0.15);
    --glow: 0 0 20px rgba(0,245,160,0.15);
    --glow2: 0 0 20px rgba(0,212,255,0.15);
    --shadow: 0 8px 32px rgba(0,0,0,0.6);
  }

  body {
    font-family: 'Space Mono', 'Courier New', monospace;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse 70% 50% at 10% 0%, rgba(0,245,160,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 50% 70% at 90% 100%, rgba(0,212,255,0.05) 0%, transparent 60%),
      linear-gradient(180deg, var(--bg) 0%, #08101a 100%);
  }

  /* Scanline effect */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 8px rgba(0,245,160,0.3); }
    50% { box-shadow: 0 0 20px rgba(0,245,160,0.6); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* ── Login ── */
  .login-page {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 2rem;
    position: relative;
  }

  .login-grid-bg {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,245,160,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,160,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .login-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 2.5rem;
    animation: fadeUp 0.5s ease both;
    box-shadow: var(--glow), var(--shadow);
  }

  .login-badge {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    color: var(--neon);
    background: rgba(0,245,160,0.08);
    border: 1px solid rgba(0,245,160,0.2);
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 2px;
    margin-bottom: 1rem;
  }

  .login-title {
    font-family: 'Syne', sans-serif;
    font-size: 2.8rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 0.3rem;
    background: linear-gradient(135deg, var(--neon) 0%, var(--neon2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .login-sub {
    color: var(--text-dim);
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    margin-bottom: 2rem;
  }

  .cursor {
    display: inline-block;
    width: 8px;
    height: 1em;
    background: var(--neon);
    vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
    margin-left: 2px;
  }

  .field { margin-bottom: 1.2rem; }

  .field label {
    display: block;
    font-size: 0.68rem;
    letter-spacing: 0.15em;
    color: var(--neon);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .field input, .field select, .field textarea {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--text);
    font-family: 'Space Mono', monospace;
    font-size: 0.9rem;
    padding: 0.7rem 0.9rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: var(--neon);
    box-shadow: 0 0 0 2px rgba(0,245,160,0.08);
  }

  .field select option { background: var(--bg2); }
  .field textarea { resize: vertical; min-height: 70px; }

  .btn {
    width: 100%;
    padding: 0.85rem;
    background: var(--neon);
    color: var(--bg);
    border: none;
    border-radius: 2px;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.2s;
    animation: pulse 2s ease infinite;
  }

  .btn:hover {
    background: var(--neon2);
    transform: translateY(-1px);
    box-shadow: 0 0 30px rgba(0,212,255,0.4);
    animation: none;
  }

  .error-msg {
    color: var(--pink);
    font-size: 0.78rem;
    margin-bottom: 1rem;
    letter-spacing: 0.05em;
    border-left: 2px solid var(--pink);
    padding-left: 0.75rem;
  }

  .hint {
    color: var(--text-dim);
    font-size: 0.72rem;
    margin-top: 1.2rem;
    letter-spacing: 0.08em;
  }

  @media (max-width: 480px) {
    .login-page {
      place-items: center;
      padding: 1rem;
    }

    .login-card {
      padding: 1.25rem;
      max-width: 100%;
    }

    .login-badge {
      font-size: 0.62rem;
      letter-spacing: 0.14em;
    }

    .login-title {
      font-size: clamp(2rem, 14vw, 2.5rem);
    }

    .login-sub {
      font-size: 0.7rem;
      margin-bottom: 1.5rem;
    }

    .field input,
    .field select,
    .field textarea {
      font-size: 16px;
      padding: 0.75rem 0.8rem;
    }

    .btn {
      font-size: 0.9rem;
      padding: 0.8rem;
    }

    .hint {
      font-size: 0.68rem;
      margin-top: 1rem;
    }
  }

  /* ── App Layout ── */
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    animation: fadeUp 0.4s ease both;
  }

  /* ── Header ── */
  .header {
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 4px 30px rgba(0,0,0,0.4);
  }

  .header-brand {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.4rem;
    background: linear-gradient(135deg, var(--neon) 0%, var(--neon2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-pill {
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    color: var(--neon);
    background: rgba(0,245,160,0.06);
    border: 1px solid rgba(0,245,160,0.15);
    padding: 0.3rem 0.8rem;
    border-radius: 2px;
  }

  .logout-btn {
    font-family: 'Space Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 0.35rem 0.9rem;
    border-radius: 2px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
  }

  .logout-btn:hover { color: var(--pink); border-color: rgba(255,45,120,0.3); }

  /* ── Main ── */
  .main {
    flex: 1;
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
    padding: 2.5rem 2rem;
  }

  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: var(--text);
    line-height: 1;
  }

  .page-title span { color: var(--neon); }

  .page-sub {
    font-size: 0.72rem;
    color: var(--text-dim);
    letter-spacing: 0.1em;
    margin-top: 0.4rem;
  }

  /* ── Stats ── */
  .stats-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .stat-box {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 0.8rem 1.2rem;
    min-width: 90px;
    position: relative;
    overflow: hidden;
  }

  .stat-box::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--neon), var(--neon2));
  }

  .stat-n {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--neon);
    line-height: 1;
  }

  .stat-l {
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 0.2rem;
  }

  /* ── Add Task Button ── */
  .add-btn {
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    background: transparent;
    border: 1px solid var(--neon);
    color: var(--neon);
    padding: 0.6rem 1.3rem;
    border-radius: 2px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .add-btn:hover {
    background: var(--neon);
    color: var(--bg);
    box-shadow: var(--glow);
  }

  /* ── Form Panel ── */
  .form-panel {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 1.75rem;
    margin-bottom: 2rem;
    animation: fadeUp 0.25s ease both;
    box-shadow: var(--glow);
  }

  .form-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--neon);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;
  }

  .form-full { grid-column: 1 / -1; }

  @media (max-width: 600px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-full { grid-column: 1; }
  }

  .form-actions {
    display: flex;
    gap: 0.6rem;
    margin-top: 1.2rem;
  }

  .btn-submit {
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    background: var(--neon);
    color: var(--bg);
    border: none;
    padding: 0.65rem 1.5rem;
    border-radius: 2px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
  }

  .btn-submit:hover { background: var(--neon2); box-shadow: var(--glow2); }

  .btn-cancel2 {
    font-family: 'Space Mono', monospace;
    font-size: 0.78rem;
    color: var(--text-dim);
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 0.65rem 1.2rem;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel2:hover { color: var(--pink); border-color: rgba(255,45,120,0.3); }

  /* ── Filter Bar ── */
  .filter-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-label {
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-right: 0.25rem;
  }

  .filter-btn {
    font-family: 'Space Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--text-dim);
    padding: 0.3rem 0.8rem;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
  }

  .filter-btn.active { border-color: var(--neon); color: var(--neon); background: rgba(0,245,160,0.06); }
  .filter-btn:hover:not(.active) { border-color: rgba(255,255,255,0.2); color: var(--text-mid); }

  /* ── Task List ── */
  .task-list { display: flex; flex-direction: column; gap: 0.75rem; }

  .task-card {
    background: var(--bg2);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 2px;
    padding: 1.2rem 1.4rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    transition: border-color 0.2s, transform 0.15s;
    animation: fadeUp 0.3s ease both;
    position: relative;
    overflow: hidden;
  }

  .task-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    transition: background 0.2s;
  }

  .task-card.HIGH::before { background: var(--pink); }
  .task-card.MED::before { background: var(--yellow); }
  .task-card.LOW::before { background: var(--neon2); }

  .task-card:hover { border-color: rgba(0,245,160,0.15); transform: translateX(2px); }
  .task-card.done-card { opacity: 0.5; }

  /* Checkbox */
  .task-check {
    width: 20px;
    height: 20px;
    border: 2px solid var(--text-dim);
    border-radius: 2px;
    flex-shrink: 0;
    margin-top: 2px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 0.75rem;
    color: var(--bg);
  }

  .task-check.checked { background: var(--neon); border-color: var(--neon); }
  .task-check:hover:not(.checked) { border-color: var(--neon); }

  .task-body { flex: 1; min-width: 0; }

  .task-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 0.25rem;
    line-height: 1.3;
  }

  .task-card.done-card .task-title { text-decoration: line-through; color: var(--text-dim); }

  .task-desc {
    font-size: 0.8rem;
    color: var(--text-mid);
    margin-bottom: 0.6rem;
    line-height: 1.5;
  }

  .task-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .priority-chip {
    font-size: 0.62rem;
    letter-spacing: 0.15em;
    font-weight: 700;
    padding: 0.15rem 0.55rem;
    border-radius: 2px;
    text-transform: uppercase;
    border: 1px solid;
  }

  .priority-chip.HIGH { color: var(--pink); border-color: rgba(255,45,120,0.4); background: rgba(255,45,120,0.08); }
  .priority-chip.MED { color: var(--yellow); border-color: rgba(245,196,0,0.4); background: rgba(245,196,0,0.08); }
  .priority-chip.LOW { color: var(--neon2); border-color: rgba(0,212,255,0.4); background: rgba(0,212,255,0.08); }

  .tag-chip {
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    padding: 0.15rem 0.55rem;
    border-radius: 2px;
    border: 1px solid var(--border2);
    color: var(--text-dim);
    background: var(--bg3);
    text-transform: uppercase;
  }

  .due-chip {
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 0.05em;
  }

  .task-actions {
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .ta-btn {
    font-family: 'Space Mono', monospace;
    font-size: 0.7rem;
    padding: 0.3rem 0.65rem;
    border-radius: 2px;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.15s;
    letter-spacing: 0.05em;
    background: transparent;
  }

  .ta-edit { color: var(--neon2); border-color: rgba(0,212,255,0.2); }
  .ta-edit:hover { background: rgba(0,212,255,0.08); }
  .ta-del { color: var(--pink); border-color: rgba(255,45,120,0.2); }
  .ta-del:hover { background: rgba(255,45,120,0.08); }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(6px);
    z-index: 200;
    display: grid;
    place-items: center;
    padding: 2rem;
    animation: fadeIn 0.2s ease both;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 2rem;
    width: 100%;
    max-width: 520px;
    box-shadow: var(--glow), var(--shadow);
    animation: fadeUp 0.25s ease both;
  }

  .modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--neon);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }

  .modal-btns { display: flex; gap: 0.6rem; margin-top: 1.5rem; }

  .btn-danger {
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    background: var(--pink);
    color: #fff;
    border: none;
    padding: 0.65rem 1.5rem;
    border-radius: 2px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
  }

  .btn-danger:hover { box-shadow: 0 0 20px rgba(255,45,120,0.4); }

  /* ── Empty ── */
  .empty {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-dim);
  }

  .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.4; }
  .empty-text { font-family: 'Syne', sans-serif; font-size: 1rem; letter-spacing: 0.08em; text-transform: uppercase; }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--bg3);
    border: 1px solid var(--neon);
    color: var(--neon);
    padding: 0.7rem 1.3rem;
    border-radius: 2px;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    z-index: 999;
    box-shadow: var(--glow);
    animation: slideIn 0.3s ease both;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* ── Footer ── */
  .footer {
    border-top: 1px solid var(--border);
    text-align: center;
    padding: 1.25rem;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    color: var(--text-dim);
    text-transform: uppercase;
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null)
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2500) }
  return [msg, show]
}

const EMPTY_FORM = { title: '', desc: '', priority: 'MED', tag: 'Dev', due: '', done: false }

function TaskForm({ initial = EMPTY_FORM, onSubmit, onCancel, label = 'ADD TASK' }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="form-grid">
        <div className="field form-full">
          <label>Task Title</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?" />
        </div>
        <div className="field form-full">
          <label>Description</label>
          <textarea value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Optional details..." rows={2} />
        </div>
        <div className="field">
          <label>Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Tag</label>
          <select value={form.tag} onChange={e => set('tag', e.target.value)}>
            {TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Due Date</label>
          <input type="date" value={form.due} onChange={e => set('due', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-submit" onClick={() => form.title && onSubmit(form)}>{label}</button>
        <button className="btn-cancel2" onClick={onCancel}>CANCEL</button>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(() => sessionStorage.getItem('st_user') || null)
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('st_tasks')) || SEED_TASKS } catch { return SEED_TASKS }
  })
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [toastMsg, showToast] = useToast()

  const [creds, setCreds] = useState({ username: '', password: '' })
  const [loginErr, setLoginErr] = useState('')

  useEffect(() => {
    localStorage.setItem('st_tasks', JSON.stringify(tasks))
  }, [tasks])

  const login = () => {
    const username = creds.username.trim()
    const password = creds.password.trim()
    const user = USERS.find(u => u.username === username && u.password === password)
    if (user) {
      sessionStorage.setItem('st_user', user.username)
      setSession(user.username)
    } else {
      setLoginErr('// ERROR: invalid credentials')
    }
  }

  const logout = () => {
    sessionStorage.removeItem('st_user')
    setSession(null)
  }

  const addTask = (form) => {
    setTasks(t => [{ ...form, id: Date.now() }, ...t])
    setShowForm(false)
    showToast('⚡ TASK ADDED')
  }

  const updateTask = (form) => {
    setTasks(t => t.map(task => task.id === editTask.id ? { ...form, id: task.id } : task))
    setEditTask(null)
    showToast('✓ TASK UPDATED')
  }

  const deleteTask = () => {
    setTasks(t => t.filter(task => task.id !== deleteId))
    setDeleteId(null)
    showToast('// TASK REMOVED')
  }

  const toggleDone = (id) => {
    setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task))
  }

  const FILTERS = ['ALL', 'TODO', 'DONE', 'HIGH', 'MED', 'LOW']

  const filtered = tasks.filter(t => {
    if (filter === 'ALL') return true
    if (filter === 'TODO') return !t.done
    if (filter === 'DONE') return t.done
    return t.priority === filter
  })

  const counts = {
    total: tasks.length,
    done: tasks.filter(t => t.done).length,
    todo: tasks.filter(t => !t.done).length,
    high: tasks.filter(t => t.priority === 'HIGH' && !t.done).length,
  }

  // ── Login ──
  if (!session) return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        <div className="login-grid-bg" />
        <div className="login-card">
          <div className="login-badge">▸ PRODUCTIVITY OS v2.6</div>
          <h1 className="login-title">SnapTask<span className="cursor" /></h1>
          <p className="login-sub">// authenticate to access your workspace</p>
          <div className="field">
            <label>Username</label>
            <input
              placeholder="admin or user1"
              value={creds.username}
              onChange={e => setCreds(c => ({ ...c, username: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={creds.password}
              onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
          </div>
          {loginErr && <p className="error-msg">{loginErr}</p>}
          <button className="btn" onClick={login}>INITIALIZE SESSION</button>
          <p className="hint">// try: admin / snap123</p>
        </div>
      </div>
    </>
  )

  // ── Main App ──
  return (
    <>
      <style>{styles}</style>
      <div className="app-layout">
        {/* Header */}
        <header className="header">
          <div className="header-brand">⚡ SnapTask</div>
          <div className="header-right">
            <span className="user-pill">▸ {session}</span>
            <button className="logout-btn" onClick={logout}>LOGOUT</button>
          </div>
        </header>

        <main className="main">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">TASK <span>BOARD</span></h2>
              <p className="page-sub">// {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button className="add-btn" onClick={() => { setShowForm(s => !s); setEditTask(null) }}>
              {showForm ? '✕ CLOSE' : '+ NEW TASK'}
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {[['📋', counts.total, 'TOTAL'], ['✓', counts.done, 'DONE'], ['◉', counts.todo, 'TODO'], ['!', counts.high, 'HIGH PRI']].map(([icon, n, l]) => (
              <div className="stat-box" key={l}>
                <div className="stat-n">{n}</div>
                <div className="stat-l">{icon} {l}</div>
              </div>
            ))}
          </div>

          {/* Add Form */}
          {showForm && (
            <div className="form-panel">
              <div className="form-panel-title">▸ NEW TASK</div>
              <TaskForm onSubmit={addTask} onCancel={() => setShowForm(false)} />
            </div>
          )}

          {/* Filters */}
          <div className="filter-bar">
            <span className="filter-label">Filter:</span>
            {FILTERS.map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>

          {/* Task List */}
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◌</div>
              <p className="empty-text">No tasks match this filter</p>
            </div>
          ) : (
            <div className="task-list">
              {filtered.map(task => (
                <div className={`task-card ${task.priority} ${task.done ? 'done-card' : ''}`} key={task.id}>
                  {/* Checkbox */}
                  <div className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggleDone(task.id)}>
                    {task.done ? '✓' : ''}
                  </div>
                  {/* Body */}
                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    {task.desc && <div className="task-desc">{task.desc}</div>}
                    <div className="task-meta">
                      <span className={`priority-chip ${task.priority}`}>{task.priority}</span>
                      <span className="tag-chip">{task.tag}</span>
                      {task.due && <span className="due-chip">📅 {task.due}</span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="task-actions">
                    <button className="ta-btn ta-edit" onClick={() => { setEditTask(task); setShowForm(false) }}>EDIT</button>
                    <button className="ta-btn ta-del" onClick={() => setDeleteId(task.id)}>DEL</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="footer">SnapTask — Productivity OS // Built with React + Vite</footer>
      </div>

      {/* Edit Modal */}
      {editTask && (
        <div className="modal-overlay" onClick={() => setEditTask(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">▸ EDIT TASK</div>
            <TaskForm initial={editTask} onSubmit={updateTask} onCancel={() => setEditTask(null)} label="SAVE CHANGES" />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div className="modal-title">⚠ CONFIRM DELETE</div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              // This action is permanent. Task will be removed from the board.
            </p>
            <div className="modal-btns">
              <button className="btn-danger" onClick={deleteTask}>DELETE</button>
              <button className="btn-cancel2" onClick={() => setDeleteId(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </>
  )
}
