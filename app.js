(function () {
"use strict";

const STORE_KEY = "examenPythonL3L4_v1";
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const TOTAL = QUESTIONS.length;
const PTS = 100 / TOTAL;
const SEC_KEYS = ["teo", "cod", "pra"];
QUESTIONS.forEach((q, i) => { q.num = i + 1; });
const byId = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

/* ---------- storage ---------- */
let state = null;
function load() { try { const r = localStorage.getItem(STORE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
function clearStore() { try { localStorage.removeItem(STORE_KEY); } catch (e) {} }

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function orderOk(q, seq) {
  if (!Array.isArray(seq)) return false;
  return q.rules.every(([a, b]) => seq.indexOf(a) < seq.indexOf(b));
}
function newState(name) {
  const opts = {}, seqs = {};
  QUESTIONS.forEach(q => {
    if (q.type === "mc") opts[q.id] = shuffle(q.options);
    if (q.type === "order") { let s; do { s = shuffle(q.items.map(x => x.k)); } while (orderOk(q, s)); seqs[q.id] = s; }
  });
  return { name, startedAt: Date.now(), answers: {}, opts, seqs, finished: false, finishedAt: null, submitted: false, results: null };
}

function toast(msg, ms = 3500) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, ms);
}

/* ---------- code highlight (@@ = blank) ---------- */
function highlight(src) {
  const parts = []; const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|@@)/g; let last = 0, m;
  while ((m = re.exec(src))) {
    parts.push({ t: "code", v: src.slice(last, m.index) });
    parts.push(m[0] === "@@" ? { t: "blank" } : { t: "str", v: m[0] });
    last = re.lastIndex;
  }
  parts.push({ t: "code", v: src.slice(last) });
  return parts.map(p => {
    if (p.t === "blank") return '<span class="blank">&nbsp;____&nbsp;</span>';
    if (p.t === "str") return '<span class="st">' + esc(p.v) + "</span>";
    return esc(p.v)
      .replace(/\b(print|input|int|float|str|round|format)\b/g, '<span class="kw">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="nu">$1</span>');
  }).join("");
}
const term = code => `<div class="term"><div class="term-bar"><i></i><i></i><i></i><span>main.py</span></div><pre><code>${highlight(code)}</code></pre></div>`;

/* ---------- header ---------- */
$("#lessons").textContent = CONFIG.lessons;
$("#meta").innerHTML = `
  <span class="chip"><b>${TOTAL}</b> preguntas</span>
  <span class="chip"><b>100</b> puntos (${PTS % 1 ? PTS.toFixed(1) : PTS} c/u)</span>
  <span class="chip">Aprobatorio: <b>${CONFIG.passScore}</b></span>
  <span class="chip">Tiempo: <b>${CONFIG.timeLimitMin} min</b></span>`;
$("#rules").innerHTML = `
  <li>Tienes <b>${CONFIG.timeLimitMin} minutos</b>. Al terminar el tiempo, el examen se entrega solo.</li>
  <li>Si se cierra la página por accidente, vuelve a abrir el link: tus respuestas se guardan.</li>
  <li>No uses PyCharm ni internet: es para saber qué tanto dominas los temas.</li>`;

/* ---------- start ---------- */
function initStart() {
  const saved = load();
  if (saved && saved.finished && saved.results) { state = saved; $("#start").hidden = true; renderResults(); if (!state.submitted) sendResults(); return; }
  if (saved && !saved.finished) {
    const box = $("#resume"); box.hidden = false;
    const n = Object.keys(saved.answers).length;
    box.innerHTML = `<b>Hay un examen en curso de ${esc(saved.name)}</b> (${n}/${TOTAL} respondidas).
      <div class="btns" style="margin-top:10px"><button class="btn primary" id="resumeBtn" type="button">Continuar →</button>
      <button class="btn" id="discardBtn" type="button">Empezar de nuevo</button></div>`;
    $("#resumeBtn").onclick = () => { state = saved; startExam(); };
    $("#discardBtn").onclick = () => { if (confirmBox("¿Borrar el examen en curso de " + saved.name + "?")) { clearStore(); box.hidden = true; } };
  }
}
function confirmBox(msg) { return window.confirm(msg); }

$("#startBtn").addEventListener("click", () => {
  const name = $("#student").value.trim().replace(/\s+/g, " ");
  if (name.length < 3) { $("#nameErr").hidden = false; $("#student").focus(); return; }
  state = newState(name); save(); startExam();
});
$("#student").addEventListener("input", () => { if ($("#student").value.trim()) $("#nameErr").hidden = true; });
$("#student").addEventListener("keydown", e => { if (e.key === "Enter") $("#startBtn").click(); });

/* ---------- exam ---------- */
let tick = null, warned = false;
function startExam() {
  $("#student").value = state.name; $("#student").disabled = true;
  $("#startBtn").hidden = true; $("#resume").hidden = true; $("#rules").hidden = true;
  buildExam();
  $("#exam").hidden = false; $("#progress").hidden = false; $("#submitBox").hidden = false;
  updateProgress();
  clearInterval(tick); tick = setInterval(updateTimer, 1000); updateTimer();
  $("#exam").scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildExam() {
  const exam = $("#exam"); exam.innerHTML = "";
  SEC_KEYS.forEach((key, si) => {
    const qs = QUESTIONS.filter(q => q.sec === key);
    const sec = document.createElement("section"); sec.className = "section";
    sec.innerHTML = `<div class="sec-head"><span class="eyebrow">Parte ${si + 1} · ${qs.length} preguntas</span><h2>${SECTIONS[key].name}</h2><p>${SECTIONS[key].desc}</p></div>`;
    qs.forEach(q => {
      const card = document.createElement("article");
      card.className = "q"; card.id = "q-" + q.id;
      let html = `<div class="q-top"><span class="q-num">${String(q.num).padStart(2, "0")}</span><p class="q-text">${q.text}${q.repaso ? '<span class="tag-repaso">Repaso</span>' : ""}</p></div>`;
      if (q.code) html += term(q.code);
      const a = state.answers[q.id];
      if (q.type === "mc") {
        html += `<div class="opts" role="radiogroup">` + state.opts[q.id].map((o, k) =>
          `<label class="opt"><input type="radio" name="a-${q.id}" value="${esc(o)}" ${a === o ? "checked" : ""}><span class="t">${q.codeOpts ? `<pre>${esc(o)}</pre>` : esc(o)}</span></label>`).join("") + `</div>`;
      } else if (q.type === "tf") {
        html += `<div class="opts tf" role="radiogroup">` + ["Verdadero", "Falso"].map(o =>
          `<label class="opt"><input type="radio" name="a-${q.id}" value="${o}" ${a === o ? "checked" : ""}><span class="t">${o}</span></label>`).join("") + `</div>`;
      } else if (q.type === "fill") {
        html += `<div class="fill"><label for="a-${q.id}">Tu respuesta:</label><input type="text" id="a-${q.id}" data-q="${q.id}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="escribe aquí" value="${esc(a || "")}"></div>`;
      } else if (q.type === "order") {
        html += `<ol class="order" id="ord-${q.id}"></ol>
          <label class="order-confirm"><input type="checkbox" id="ordok-${q.id}" ${a ? "checked" : ""}> Ya revisé el orden (márcalo si crees que ya está bien)</label>`;
      }
      card.innerHTML = html;
      sec.appendChild(card);
    });
    exam.appendChild(sec);
  });
  QUESTIONS.filter(q => q.type === "order").forEach(renderOrder);
}

function renderOrder(q) {
  const seq = state.seqs[q.id];
  const items = Object.fromEntries(q.items.map(x => [x.k, x]));
  $("#ord-" + q.id).innerHTML = seq.map((k, i) => `
    <li data-k="${k}"><span class="n">${i + 1}</span><pre>${highlight(items[k].code)}</pre>
      <span class="mv"><button type="button" data-dir="-1" data-k="${k}" aria-label="Subir" ${i === 0 ? "disabled" : ""}>↑</button>
      <button type="button" data-dir="1" data-k="${k}" aria-label="Bajar" ${i === seq.length - 1 ? "disabled" : ""}>↓</button></span></li>`).join("");
}

$("#exam").addEventListener("click", e => {
  const b = e.target.closest(".order button"); if (!b) return;
  const q = byId[b.closest(".order").id.slice(4)];
  const seq = state.seqs[q.id]; const i = seq.indexOf(b.dataset.k); const j = i + Number(b.dataset.dir);
  if (j < 0 || j >= seq.length) return;
  [seq[i], seq[j]] = [seq[j], seq[i]];
  state.answers[q.id] = seq.slice(); $("#ordok-" + q.id).checked = true;
  save(); renderOrder(q); updateProgress();
  const li = $(`#ord-${q.id} li[data-k="${b.dataset.k}"]`); if (li) { li.classList.add("moved"); setTimeout(() => li.classList.remove("moved"), 180); li.querySelector(`button[data-dir="${b.dataset.dir}"]`)?.focus(); }
});
$("#exam").addEventListener("change", e => {
  const t = e.target;
  if (t.type === "radio") state.answers[t.name.slice(2)] = t.value;
  else if (t.id && t.id.startsWith("ordok-")) { const id = t.id.slice(6); if (t.checked) state.answers[id] = state.seqs[id].slice(); else delete state.answers[id]; }
  save(); updateProgress();
});
$("#exam").addEventListener("input", e => {
  const t = e.target; if (!t.dataset.q) return;
  if (t.value.trim()) state.answers[t.dataset.q] = t.value; else delete state.answers[t.dataset.q];
  save(); updateProgress();
});

const isAnswered = q => { const a = state.answers[q.id]; return a !== undefined && a !== null && String(a).trim() !== ""; };
function updateProgress() {
  const done = QUESTIONS.filter(isAnswered).length;
  $("#barFill").style.width = (done / TOTAL * 100) + "%";
  $("#progTxt").textContent = `${done} / ${TOTAL}`;
  QUESTIONS.forEach(q => { if (isAnswered(q)) $("#q-" + q.id)?.classList.remove("missing"); });
}

function remaining() { return Math.round(CONFIG.timeLimitMin * 60 - (Date.now() - state.startedAt) / 1000); }
function updateTimer() {
  if (!state || state.finished) return;
  const r = remaining(); const t = $("#timer");
  t.textContent = `${String(Math.max(0, Math.floor(r / 60))).padStart(2, "0")}:${String(Math.max(0, r % 60)).padStart(2, "0")}`;
  t.classList.toggle("warn", r <= 300 && r > 60); t.classList.toggle("danger", r <= 60);
  if (r <= 300 && !warned) { warned = true; toast("⏰ Quedan 5 minutos"); }
  if (r <= 0) { toast("⏰ Se terminó el tiempo. Tu examen se entregó."); grade(); }
}

/* ---------- submit ---------- */
$("#submit").addEventListener("click", () => {
  const missing = QUESTIONS.filter(q => !isAnswered(q));
  if (missing.length) {
    missing.forEach(q => $("#q-" + q.id).classList.add("missing"));
    $("#warnTxt").textContent = `Te faltan ${missing.length} pregunta${missing.length > 1 ? "s" : ""} por responder (marcadas en amarillo). Las preguntas sin respuesta cuentan como incorrectas.`;
    $("#warn").hidden = false; return;
  }
  if (confirmBox("¿Entregar el examen? Ya no podrás cambiar tus respuestas.")) grade();
});
$("#goMissing").addEventListener("click", () => { const q = QUESTIONS.find(x => !isAnswered(x)); if (q) $("#q-" + q.id).scrollIntoView({ behavior: "smooth", block: "center" }); });
$("#forceSubmit").addEventListener("click", () => grade());

/* ---------- grading ---------- */
const norm = s => String(s || "").replace(/[‘’´`]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, "").replace(/\($/, "");
function isCorrect(q) {
  const a = state.answers[q.id];
  if (!isAnswered(q)) return false;
  if (q.type === "fill") return q.accept.some(x => norm(x) === norm(a));
  if (q.type === "order") return orderOk(q, a);
  return a === q.answer;
}
function showAnswer(q) {
  const a = state.answers[q.id];
  if (!isAnswered(q)) return "(sin respuesta)";
  if (q.type === "order") return a.map(k => q.items.findIndex(x => x.k === k) + 1).join(" → ") + "  (líneas en tu orden)";
  return String(a).trim();
}
function correctText(q) {
  if (q.type === "fill") return q.accept[0];
  if (q.type === "order") return q.answerText;
  return q.answer;
}

function computeResults() {
  const res = QUESTIONS.map(q => ({ id: q.id, ok: isCorrect(q) }));
  const correct = res.filter(r => r.ok).length;
  const score = Math.round(correct * PTS);
  const secs = {}, topics = {};
  QUESTIONS.forEach((q, i) => {
    const ok = res[i].ok;
    secs[q.sec] = secs[q.sec] || [0, 0]; secs[q.sec][1]++; if (ok) secs[q.sec][0]++;
    topics[q.topic] = topics[q.topic] || [0, 0, q.sec]; topics[q.topic][1]++; if (ok) topics[q.topic][0]++;
  });
  const mins = Math.max(1, Math.round((state.finishedAt - state.startedAt) / 60000));
  return { res, correct, score, pass: score >= CONFIG.passScore, secs, topics, mins,
           unanswered: QUESTIONS.filter(q => !isAnswered(q)).length };
}

function grade() {
  if (state.finished) return;
  clearInterval(tick);
  state.finished = true; state.finishedAt = Date.now();
  state.results = computeResults(); save();
  $("#exam").hidden = true; $("#progress").hidden = true; $("#submitBox").hidden = true; $("#start").hidden = true;
  renderResults();
  sendResults();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function payload() {
  const R = state.results;
  const f = k => `${R.secs[k][0]} de ${R.secs[k][1]}`;
  const weak = Object.entries(R.topics).filter(([, v]) => v[0] / v[1] < 0.6).map(([k]) => k);
  return {
    "bot-field": "",
    alumna: state.name,
    fecha: new Date(state.finishedAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }),
    calificacion: String(R.score),
    correctas: `${R.correct}/${TOTAL}`,
    resultado: R.pass ? "Aprobado" : "No aprobado",
    minutos: String(R.mins),
    sin_responder: String(R.unanswered),
    teoria: f("teo"), codigo: f("cod"), practica: f("pra"),
    incorrectas: R.res.filter(r => !r.ok).map(r => byId[r.id].num).join(", ") || "ninguna",
    reforzar: weak.join("; ") || "—",
    respuestas: QUESTIONS.map((q, i) => `${q.num}. ${R.res[i].ok ? "✔" : "✘"} ${showAnswer(q)}`).join(" | "),
    temas_json: JSON.stringify(R.topics),
    secciones_json: JSON.stringify(R.secs)
  };
}

async function sendResults() {
  if (state.submitted) { setStatus("ok"); return; }
  setStatus("sending");
  const p = payload();
  try {
    const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "form-name": CONFIG.formName, ...p }).toString() });
    if (!r.ok) throw new Error("HTTP " + r.status);
    state.submitted = true; save(); setStatus("ok");
  } catch (e) { console.warn("No se pudo enviar:", e); setStatus("error"); }
  if (CONFIG.sheetUrl) {
    // Copia opcional a Google Sheets (mismo formato que el examen anterior)
    const R = state.results;
    fetch(CONFIG.sheetUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ examen: "Lecciones 3 y 4", alumna: state.name, calificacion: R.score, correctas: R.correct, total: TOTAL,
        teoria: p.teoria, codigo: p.codigo, practica: p.practica, resultado: p.resultado, minutos: R.mins,
        incorrectas: p.incorrectas, respuestas: QUESTIONS.map((q, i) => (R.res[i].ok ? "✔ " : "✘ ") + showAnswer(q)) }) }).catch(() => {});
  }
}

function setStatus(s) {
  const st = $("#sendStatus"); if (!st) return;
  st.dataset.state = s;
  if (s === "sending") st.textContent = "Enviando tus resultados a tu profesor…";
  if (s === "ok") { st.textContent = "✓ Listo: tus resultados se enviaron a tu profesor."; $("#copyBox").hidden = true; }
  if (s === "error") {
    st.innerHTML = 'No se pudieron enviar tus resultados automáticamente. <button class="btn" id="retry" type="button" style="margin-left:6px">Reintentar</button>';
    $("#retry").onclick = sendResults; $("#copyBox").hidden = false;
  }
}

function summaryText() {
  const p = payload();
  return [`Examen de Python (${CONFIG.lessons.split(" · ")[0]})`, "Alumna: " + p.alumna, "Fecha: " + p.fecha,
    `Calificación: ${p.calificacion}/100 (${p.correctas} correctas) — ${p.resultado}`,
    `Teoría: ${p.teoria} · Lectura de código: ${p.codigo} · Práctica: ${p.practica}`,
    "Tiempo: " + p.minutos + " min", "Incorrectas: " + p.incorrectas, "Temas a reforzar: " + p.reforzar].join("\n");
}

/* ---------- results ---------- */
function renderResults() {
  const R = state.results;
  const topicChips = Object.entries(R.topics).map(([k, v]) => {
    const r = v[0] / v[1]; const c = r >= 0.999 ? "ok" : r >= 0.6 ? "warn" : "bad";
    return `<span class="chip ${c}">${esc(k)} · ${v[0]}/${v[1]}</span>`;
  }).join("");
  const review = CONFIG.showReview ? `
    <div class="sec-head"><h3>Revisión pregunta por pregunta</h3><p>Lee la explicación de las que fallaste: es la mejor forma de repasar.</p></div>
    <div class="review">${QUESTIONS.map((q, i) => {
      const ok = R.res[i].ok;
      return `<div class="rv ${ok ? "ok" : "bad"}">
        <span class="tag">${String(q.num).padStart(2, "0")} · ${ok ? "Correcta" : "Incorrecta"}${q.repaso ? " · Repaso" : ""}</span>
        <p>${q.text}</p>
        ${q.code ? term(q.code) : ""}
        ${ok ? "" : `<p><span class="lbl">Tu respuesta:</span> <code>${esc(showAnswer(q))}</code></p>`}
        <p><span class="lbl">Respuesta correcta:</span> <code>${esc(correctText(q))}</code></p>
        <p class="note">💡 ${esc(q.explain)}</p></div>`;
    }).join("")}</div>` : "";

  const el = $("#results"); el.hidden = false;
  el.innerHTML = `
    <div class="sec-head"><span class="eyebrow">Resultados</span><h2>${esc(state.name)}, este es tu resultado</h2></div>
    <div class="card score-card" style="margin-top:12px">
      <div class="score">${R.score}<small>/100</small></div>
      <div>
        <span class="verdict ${R.pass ? "pass" : "fail"}">${R.pass ? "Aprobado" : "No aprobado"}</span>
        ${SEC_KEYS.map(k => `<div class="bk"><span>${SECTIONS[k].name}</span><div class="bar"><i style="width:${R.secs[k][0] / R.secs[k][1] * 100}%"></i></div><b>${R.secs[k][0]}/${R.secs[k][1]}</b></div>`).join("")}
        <p class="muted small" style="margin-top:6px">${R.correct} de ${TOTAL} correctas · ${R.mins} min${R.unanswered ? ` · ${R.unanswered} sin responder` : ""}</p>
      </div>
    </div>
    <p class="send-status" id="sendStatus" data-state="sending" style="margin-top:14px">Enviando…</p>
    <div class="card" id="copyBox" hidden style="margin-top:14px">
      <h3>Envía tus resultados</h3>
      <p class="muted small" style="margin:6px 0 10px">Copia este resumen y mándaselo a tu profesor por WhatsApp o correo.</p>
      <textarea id="summary" readonly>${esc(summaryText())}</textarea>
      <div class="btns" style="margin-top:10px"><button class="btn primary" id="copyBtn" type="button">Copiar resultados</button></div>
    </div>
    <div class="card" style="margin-top:14px"><h3 style="margin-bottom:10px">Tus temas</h3><div class="topics">${topicChips}</div>
      <p class="muted small" style="margin-top:10px">Verde = dominado · Amarillo = casi · Rojo = a reforzar</p></div>
    <div style="margin-top:14px">${review}</div>
    <div class="btns no-print" style="justify-content:space-between;margin-top:20px">
      <button class="btn" id="printBtn" type="button">🖨️ Imprimir / guardar PDF</button>
      <button class="btn" id="newBtn" type="button">Nueva alumna en este dispositivo</button>
    </div>`;
  $("#copyBtn").onclick = async () => { try { await navigator.clipboard.writeText($("#summary").value); toast("Resultados copiados ✓"); } catch (e) { $("#summary").select(); } };
  $("#printBtn").onclick = () => window.print();
  $("#newBtn").onclick = () => {
    if (!confirmBox(`¿Empezar con otra alumna? Los resultados de ${state.name} se borrarán de este dispositivo${state.submitted ? " (ya se enviaron al profesor)" : " y TODAVÍA NO se han enviado"}.`)) return;
    clearStore(); location.reload();
  };
  setStatus(state.submitted ? "ok" : "sending");
}

initStart();
})();
