/*
 * Talks to the Apps Script behind the register upload form (same /exec link). Answers go to the review
 * meeting sheet. If you ever create a NEW Apps Script deployment, update this link.
 */
var RU = (function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycbz-BAfsMYBOLqtTfm-Lk8L_n7Rzfms7CE7Q7Zy0x2FEozYuyCelADAMhFeZyxWYNlQHxA/exec';
  /** Throws err.server = true when Apps Script answered but refused. */
  async function api(body) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      credentials: 'omit',
      redirect: 'follow'
    });
    if (!res.ok) throw new Error('Network error (' + res.status + ')');
    const out = await res.json();
    if (!out.ok) { const e = new Error(out.error || 'Server error'); e.server = true; throw e; }
    return out.data;
  }
  return { API_URL, api };
})();
