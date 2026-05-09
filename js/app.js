/**
 * RSA Cryptography System — Frontend Logic
 * Mirrors the CustomTkinter desktop app behaviour exactly.
 * All crypto math runs on the Flask backend via fetch().
 */

'use strict';

// ── API base URL ──────────────────────────────────────────────────────────────
const API = 'http://127.0.0.1:5000/api';

// ══════════════════════════════════════════════════════════════════════════════
//  TAB NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════
const navBtns   = document.querySelectorAll('.nav-btn');
const pages     = document.querySelectorAll('.page');

function switchTab(key) {
  // Update nav buttons (mirror Python _switch_tab logic)
  navBtns.forEach(btn => {
    const active = btn.dataset.tab === key;
    btn.classList.toggle('active', active);
  });

  // Show/hide pages
  pages.forEach(page => {
    page.classList.toggle('hidden', page.id !== `page-${key}`);
  });
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ══════════════════════════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS  (replaces messagebox.showerror / showwarning)
// ══════════════════════════════════════════════════════════════════════════════
const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(msg, type = 'info') {
  toastEl.textContent = msg;
  toastEl.className   = `toast show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.classList.remove('show'); }, 3500);
}

// ══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function setOutput(elId, text) {
  document.getElementById(elId).textContent = text;
}

function getInt(elId) {
  const v = parseInt(document.getElementById(elId).value.trim(), 10);
  if (isNaN(v)) throw new Error(`"${elId}" must be an integer.`);
  return v;
}

function getText(elId) {
  const el = document.getElementById(elId);
  return (el.tagName === 'TEXTAREA' ? el.value : el.value).trim();
}

async function postJSON(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ══════════════════════════════════════════════════════════════════════════════
//  RSA PAGE
// ══════════════════════════════════════════════════════════════════════════════
const keyInfoEl = document.getElementById('rsa-key-info');

// ── Compute Keys ──────────────────────────────────────────────────────────────
document.getElementById('btn-compute-keys').addEventListener('click', async () => {
  try {
    const p = getInt('p-entry');
    const q = getInt('q-entry');
    const e = getInt('e-entry');

    const data = await postJSON('/rsa/compute-keys', { p, q, e });

    keyInfoEl.textContent =
      `  n = ${p}×${q} = ${data.n}    |    ` +
      `φ(n) = ${p-1}×${q-1} = ${data.phi}    |    ` +
      `d (private key) = ${data.d}`;
    keyInfoEl.classList.add('computed');
  } catch (err) {
    showToast(`Input Error: ${err.message}`, 'error');
  }
});

// ── RSA Encrypt ───────────────────────────────────────────────────────────────
document.getElementById('btn-rsa-enc').addEventListener('click', async () => {
  try {
    const p    = getInt('p-entry');
    const q    = getInt('q-entry');
    const e    = getInt('e-entry');
    const text = getText('rsa-input');

    if (!text) { showToast('Please enter some text.', 'warn'); return; }

    const data = await postJSON('/rsa/encrypt', { p, q, e, text });

    if (data.warning) showToast(data.warning, 'warn');

    setOutput('rsa-result',
      `╔══════════════════════════════════════╗\n` +
      `║       RSA  ENCRYPTION  RESULT        ║\n` +
      `╚══════════════════════════════════════╝\n\n` +
      `  Parameters\n` +
      `  ─────────────────────────────────────\n` +
      `  p = ${p}    q = ${q}    e (public key) = ${e}\n` +
      `  n = p × q = ${data.n}\n` +
      `  φ(n) = (p-1)(q-1) = ${data.phi}\n\n` +
      `  Plaintext   :  ${text.toUpperCase()}\n` +
      `  Ciphertext  :  ${data.result}\n\n` +
      `  Formula  →  C = M^e mod n\n`
    );
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
});

// ── RSA Decrypt ───────────────────────────────────────────────────────────────
document.getElementById('btn-rsa-dec').addEventListener('click', async () => {
  try {
    const p    = getInt('p-entry');
    const q    = getInt('q-entry');
    const e    = getInt('e-entry');
    const text = getText('rsa-input');

    if (!text) { showToast('Please enter some text.', 'warn'); return; }

    const data = await postJSON('/rsa/decrypt', { p, q, e, text });

    setOutput('rsa-result',
      `╔══════════════════════════════════════╗\n` +
      `║       RSA  DECRYPTION  RESULT        ║\n` +
      `╚══════════════════════════════════════╝\n\n` +
      `  Parameters\n` +
      `  ─────────────────────────────────────\n` +
      `  p = ${p}    q = ${q}    e (public key) = ${e}\n` +
      `  n = ${data.n}    φ(n) = ${data.phi}\n` +
      `  d (private key) = ${data.d}  [Extended Euclidean Algorithm]\n\n` +
      `  Ciphertext  :  ${text.toUpperCase()}\n` +
      `  Plaintext   :  ${data.result}\n\n` +
      `  Formula  →  M = C^d mod n\n`
    );
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  AFFINE PAGE
// ══════════════════════════════════════════════════════════════════════════════

// ── Affine Encrypt ────────────────────────────────────────────────────────────
document.getElementById('btn-affine-enc').addEventListener('click', async () => {
  try {
    const text = document.getElementById('affine-input').value.trim();
    if (!text) { showToast('Please enter some text.', 'warn'); return; }

    const data = await postJSON('/affine/encrypt', { text });

    setOutput('affine-result',
      `[ ENCRYPTED RESULT ]\n\n` +
      `  Input   :  ${text.toUpperCase()}\n` +
      `  Output  :  ${data.result}\n`
    );
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
});

// ── Affine Decrypt ────────────────────────────────────────────────────────────
document.getElementById('btn-affine-dec').addEventListener('click', async () => {
  try {
    const text = document.getElementById('affine-input').value.trim();
    if (!text) { showToast('Please enter some text.', 'warn'); return; }

    const data = await postJSON('/affine/decrypt', { text });

    setOutput('affine-result',
      `[ DECRYPTED RESULT ]\n\n` +
      `  Input   :  ${text.toUpperCase()}\n` +
      `  Output  :  ${data.result}\n`
    );
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════════════════
switchTab('rsa');   // Start on RSA tab, same as Python app
