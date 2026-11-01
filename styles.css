* {
  box-sizing: border-box;
}

:root {
  --bg: #07111d;
  --panel: rgba(15, 23, 42, 0.8);
  --panel-soft: rgba(15, 23, 42, 0.62);
  --line: rgba(148, 163, 184, 0.18);
  --text: #edf6ff;
  --muted: #b8c6db;
  --accent: #5eead4;
  --accent-strong: #34d399;
  --accent-soft: rgba(94, 234, 212, 0.1);
  --shadow: 0 30px 60px rgba(2, 6, 23, 0.52);
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.12), transparent 28%),
    radial-gradient(circle at right center, rgba(96, 165, 250, 0.16), transparent 30%),
    var(--bg);
  color: var(--text);
}

button, input, select {
  font: inherit;
}

.app-shell {
  width: min(900px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 56px 0 80px;
}

.topbar {
  margin-bottom: 1.2rem;
}

.eyebrow {
  margin: 0 0 0.4rem;
  color: var(--accent);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  letter-spacing: -0.06em;
}

.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.mode-toggle {
  display: inline-flex;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 0.25rem;
  gap: 0.3rem;
}

.mode-btn {
  border: none;
  background: transparent;
  color: var(--muted);
  font-weight: 700;
  padding: 0.8rem 1.1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s ease;
}

.mode-btn.active {
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #062118;
}

.panel {
  display: none;
  margin-top: 1.3rem;
  padding: 1.1rem;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--panel-soft);
}

.panel.active {
  display: block;
}

.field-group {
  display: grid;
  gap: 0.52rem;
  margin-bottom: 0.9rem;
}

.field-group.compact {
  max-width: 260px;
}

label {
  color: var(--text);
  font-weight: 600;
}

input[type="file"], select {
  width: 100%;
  border: 1px solid var(--line);
  background: rgba(15, 23, 42, 0.85);
  border-radius: 12px;
  color: var(--text);
  padding: 0.85rem 0.9rem;
}

.file-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.7rem;
  color: var(--muted);
}

.secondary {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.8);
  color: var(--text);
  border-radius: 12px;
  padding: 0.7rem 1rem;
  cursor: pointer;
  font-weight: 700;
}

.secondary:hover {
  border-color: rgba(94, 234, 212, 0.35);
}

.status-box {
  margin-top: 1.2rem;
  border-radius: 14px;
  background: var(--accent-soft);
  border: 1px solid rgba(94, 234, 212, 0.25);
  color: var(--text);
  padding: 0.9rem 1rem;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .card {
    padding: 1rem;
  }

  .mode-toggle {
    width: 100%;
  }

  .mode-btn {
    flex: 1;
  }

  .file-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
