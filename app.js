/* ============================================================
   Navidad para Luminé — app.js
   - Defaults: lumine.jpeg y ruben.jpg desde el inicio
   - Textos prellenados (primera exportación completa)
   - Tarjetas: FIX total (desktop + móvil) con event delegation
   - Poster: footer bar fija (Navidad 2025 + firma)
   - Compartir PNG: Web Share API (archivo) + link
   - GitHub Pages: Service Worker opcional (con versión)
   ============================================================ */

const KEY_BONUS_UNLOCKED = "lumine_xmas_bonus_unlocked_v3";
const SW_VERSION = "v4"; // cambia a v5/v6 cada vez que actualices (para evitar caché)

const DEFAULT_SIGNATURE = "Roly Rubén";
const DEFAULT_DISPLAY_NAME = "Milagros Luminé";

const DEFAULT_PROMISE =
  "Conocerás a muchas personas y las mismas se irán sin importar el motivo pero en mí encontrarás alguien que estará disponible extendiendo mi mano en todo momento para ti";

const DEFAULT_LUMINE_PATH = "lumine.jpeg";
const DEFAULT_ME_PATH = "ruben.jpg";

/* Helpers seguros (si falta un ID, no rompe todo el script) */
const $ = (id) => document.getElementById(id);
const on = (id, ev, fn) => {
  const el = $(id);
  if (el) el.addEventListener(ev, fn);
  return el;
};

const screens = Array.from(document.querySelectorAll(".screen[data-step]"));
const pill = $("stepPill");

let step = 1;
let giftUnlocked = false;

const state = {
  lumineDataUrl: null,
  meDataUrl: null,
  bonusUnlocked: localStorage.getItem(KEY_BONUS_UNLOCKED) === "1",
  opts: {
    displayName: DEFAULT_DISPLAY_NAME,
    signature: DEFAULT_SIGNATURE,
    revealLine: "Luminé, tú haces diciembre más bonito.",
    goalLine: "Navidad 2025 • Tu esfuerzo vale",
    sealLine: "Por nuestra amistad ",
    srtaMode: true,
    enhanceLumine: true,
    glitter: 55,
    pawMode: false,
    catName: "",
    promise: DEFAULT_PROMISE,
    message: "",
    phrases: [
      "Mi mejor amiga, mi luz morada 💜",
      "Que esta Navidad te abrace bonito ✨",
      "Tu dedicación habla por ti (yo la veo)",
      "Eres bonita de verdad: no te apagues por inseguridades"
    ]
  }
};

function showStep(n) {
  step = Math.max(1, Math.min(6, n));
  if (step >= 3 && !giftUnlocked) step = 2;
  if (step === 6 && !state.bonusUnlocked) step = 5;

  screens.forEach((s) => s.classList.toggle("active", Number(s.dataset.step) === step));
  if (pill) pill.textContent = `Paso ${step}/6`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

on("prev", "click", () => showStep(step - 1));
on("next", "click", () => showStep(step + 1));
on("goGift", "click", () => showStep(2));
on("quickStart", "click", () => showStep(2));
on("goLetter", "click", () => showStep(4));
on("goPoster", "click", () => showStep(5));
on("backToLetter", "click", () => showStep(4));

/* -------------------------
   Regalo
-------------------------- */
const gift = $("gift");
const revealBadge = $("revealBadge");
const giftHint = $("giftHint");

function unlockGift() {
  if (!gift) return;
  gift.classList.add("open");
  giftUnlocked = true;
  if (revealBadge) revealBadge.classList.add("show");
  if (giftHint) giftHint.textContent = "Listo ✨ ahora puedes pasar al paso 3.";
  showStep(3);
}

on("openGift", "click", unlockGift);
on("skipGift", "click", () => {
  if (gift) gift.classList.add("open");
  giftUnlocked = true;
  if (revealBadge) revealBadge.classList.add("show");
  showStep(3);
});

if (gift) {
  gift.addEventListener("click", unlockGift);
  gift.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") unlockGift();
  });
}

/* -------------------------
   ✅ Tarjetas sorpresa (MODAL)
   - Funciona en desktop y móvil
   - No depende del "flip"
-------------------------- */
/* -------------------------
   ✅ Tarjetas sorpresa (MODAL + FLIP fallback)
   - Captura el click aunque el DOM interno cambie
   - Si el modal no existe, hace fallback a alert()
-------------------------- */
function initSurpriseCardsModalAndFlip(){
  const grid = document.getElementById("flipGrid");
  if (!grid) return;

  const modal = document.getElementById("surpriseModal");
  const titleEl = document.getElementById("surpriseModalTitle");
  const bodyEl  = document.getElementById("surpriseModalBody");
  const closeBtn= document.getElementById("surpriseModalClose");
  const okBtn   = document.getElementById("surpriseModalOk");

  const messages = [
    "Srta. Luminé: tu esfuerzo sí se nota. 💜",
    "Tienes unos ojos lindos… de esos que se quedan en la memoria. ✨",
    "Si hoy solo quieres dormir: está bien. Descansar también construye. 😴",
    "Eres directa y sincera, y eso es un regalo raro. 🌟",
    "Eres bonita de verdad. No dejes que la inseguridad te hable más fuerte que tú. 🫶",
    "Si te menciono lo del vestido, es solo para verte segura: con lo que uses, tú te ves bien. 🤍"
  ];

  const cards = Array.from(grid.querySelectorAll(".flipCard"));
  cards.forEach((card, i) => {
    card.dataset.sTitle = `Sorpresa ${i + 1} ✨`;
    card.dataset.sMsg = messages[i] || "✨";

    // rellena el back (por si quieres ver el mensaje en flip)
    const back = card.querySelector(".flipBack");
    if (back) back.textContent = card.dataset.sMsg;
  });

  let lastFocus = null;

  function openModal(title, msg){
    // ✅ Fallback: si NO existe el modal, igual verás el mensaje
    if (!modal || !titleEl || !bodyEl) {
      alert(msg || "");
      return;
    }
    lastFocus = document.activeElement;

    titleEl.textContent = title || "Sorpresa ✨";
    bodyEl.textContent  = msg || "";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modalOpen");
    setTimeout(() => (okBtn || closeBtn)?.focus?.(), 0);
  }

  function closeModal(){
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modalOpen");
    if (lastFocus?.focus) lastFocus.focus();
  }

  closeBtn?.addEventListener("click", closeModal);
  okBtn?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("show")) closeModal();
  });

  // ✅ Captura máxima: si algo frena bubbling, igual lo detectamos
  document.addEventListener("pointerup", (e) => {
    const card = e.target.closest?.(".flipCard");
    if (!card) return;

    // 2) modal
    openModal(card.dataset.sTitle, card.dataset.sMsg);
  }, true);

  // Reiniciar
  const resetBtn = document.getElementById("resetCards");
  resetBtn?.addEventListener("click", () => {
    grid.querySelectorAll(".flipCard").forEach(c => c.classList.remove("flipped"));
  });
}


/* -------------------------
   Modo UNMSM (ánimo)
-------------------------- */
const pepTalkOut = $("pepTalkOut");
const pepTalks = [
  "Luminé, a tu ritmo. No necesitas correr para avanzar. 💜",
  "Que sea difícil no significa que sea imposible. Significa que es importante. ✨",
  "Si hoy solo pudiste un poco, igual cuenta. Un poco constante vence a mucho de vez en cuando. 🌙",
  "Cuando el cansancio suba, recuerda: tú no eres tu cansancio. Tú eres tu constancia. 🌟",
  "Cuídate como cuidas a los demás: con paciencia y con ternura. 🫶"
];
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

on("pepTalkBtn", "click", () => {
  if (pepTalkOut) pepTalkOut.textContent = randomPick(pepTalks);
});

on("copyPepTalk", "click", async () => {
  if (!pepTalkOut) return;
  const text = pepTalkOut.textContent.trim();
  try {
    await navigator.clipboard.writeText(text);
    pepTalkOut.textContent = "✅ Copiado.";
    setTimeout(() => pepTalkOut.textContent = text, 800);
  } catch {
    pepTalkOut.textContent = text + " (copia manual si tu navegador no deja)";
  }
});

/* -------------------------
   Cuando dudes (sin repetir)
-------------------------- */
const doubtOut = $("doubtOut");
const allDoubts = [
  "Eres amable, incluso cuando estás cansada. Eso dice mucho de ti. 💜",
  "Eres noble. Y tu nobleza no hace ruido, pero abriga. ✨",
  "Eres sincera: lo que dices tiene peso porque viene con verdad. 🌟",
  "Tu determinación es real. Se nota en cómo vuelves a intentarlo. 👣",
  "Tus ojos son lindos. No es cumplido, es dato. 🌙",
  "Tu esfuerzo vale. Aunque nadie lo vea, cuenta. 🤍",
  "Eres más bonita de lo que tus inseguridades te dejan creer. ✨",
  "No tienes que ser perfecta para ser grande: con ser tú, ya alcanza. 🫶"
];
let doubtPool = [...allDoubts];

on("doubtBtn", "click", () => {
  if (!doubtOut) return;
  if (doubtPool.length === 0) {
    doubtOut.textContent = "Se acabaron los mensajes (reinicia para repetir) ✨";
    return;
  }
  const idx = Math.floor(Math.random() * doubtPool.length);
  const msg = doubtPool.splice(idx, 1)[0];
  doubtOut.textContent = msg;
});

on("resetDoubts", "click", () => {
  doubtPool = [...allDoubts];
  if (doubtOut) doubtOut.textContent = "Reiniciado ✨ Presiona “Cuando dudes”.";
});

/* -------------------------
   Energía
-------------------------- */
const energyRange = $("energyRange");
const energyValue = $("energyValue");
const energyLine = $("energyLine");

function energyMessage(v) {
  if (v <= 15) return "Hoy toca suave: agua, respirar, y lo mínimo. Descansar también es avanzar. 😴";
  if (v <= 35) return "Un pasito. Solo uno. Y ya ganaste el día. 💜";
  if (v <= 60) return "Vas bien: enfoque corto + pausa. Tú puedes. ✨";
  if (v <= 80) return "Estás fuerte. A tu ritmo, pero firme. 💜";
  return "Modo poderosa: pero igual cuídate. No te quemes. 🌟";
}
if (energyRange) {
  energyRange.addEventListener("input", () => {
    const v = Number(energyRange.value);
    if (energyValue) energyValue.textContent = `${v}%`;
    if (energyLine) energyLine.textContent = energyMessage(v);
  });
}

/* -------------------------
   UI readonly (paso 4)
-------------------------- */
const messageEl = $("message");
const fromNameEl = $("fromName");
const revealLineEl = $("revealLine");
const goalLineEl = $("goalLine");
const sealLineEl = $("sealLine");
const srtaModeEl = $("srtaMode");

const phrase1 = $("phrase1");
const phrase2 = $("phrase2");
const phrase3 = $("phrase3");
const phrase4 = $("phrase4");

function setReadonlyUIFromState() {
  if (fromNameEl) fromNameEl.value = state.opts.signature;
  if (revealLineEl) revealLineEl.value = state.opts.revealLine;
  if (goalLineEl) goalLineEl.value = state.opts.goalLine;
  if (sealLineEl) sealLineEl.value = state.opts.sealLine;
  if (srtaModeEl) srtaModeEl.checked = !!state.opts.srtaMode;

  if (messageEl) messageEl.value = state.opts.message;

  if (phrase1) phrase1.value = state.opts.phrases[0] || "";
  if (phrase2) phrase2.value = state.opts.phrases[1] || "";
  if (phrase3) phrase3.value = state.opts.phrases[2] || "";
  if (phrase4) phrase4.value = state.opts.phrases[3] || "";
}

/* Mensaje largo poético/cálido */
state.opts.message =
`Milagros Luminé…

Navidad tiene esa forma rara de volver suave lo que fue difícil. Y hoy, entre luces pequeñas y silencios bonitos, yo solo quiero dejarte esto: un pedacito de cariño escrito con calma, como quien pone una manta sobre alguien que aprecia.

A veces me acuerdo de cómo empezó todo: un paradero frente a la academia, un inicio simple… y aun así, de esos comienzos nacen cosas que se vuelven importantes. Yo fui el primero en hablarte, y después —sin apuro— nos fuimos ganando confianza como se ganan las cosas buenas: con palabras constantes y presencia real.

Gracias por haber estado cuando yo estaba mal por dentro. Por tus consejos, por tu forma de decir la verdad con cuidado, por acompañar incluso cuando tú también tenías tus propios días pesados. Hay personas que “animan” por compromiso; tú no. Tú sostienes.

Yo te admiro, Luminé. Tu esfuerzo, tu disciplina y esa determinación tuya cuando te propones algo. Sé que estudiar para la UNMSM puede sentirse pesado, pero eso no te hace menos: te hace humana… y valiente. Cuando el día se sienta grande, no pienses que estás fallando: piensa que estás creciendo. No por correr, sino por insistir. Por volver. Por intentar otra vez.

Y si un día solo quieres dormir… está bien. Dormir también protege tu corazón. Descansar no borra tu avance: lo cuida.

También quiero decirte algo con el corazón: eres bonita. Bonita de verdad. Y no solo por fuera —aunque sí, tus ojos son lindos— sino por cómo eres: amable, noble, cariñosa, tímida a tu manera, sincera y directa. Esa combinación tuya abriga. Así que cuando una inseguridad te visite, no le des la llave de tu casa.

Aunque ahora no nos veamos ni hablemos tanto como antes, cuando coincidimos y nos ponemos al día, se siente como si el tiempo no hubiera cortado nada. Se siente cercano. Se siente real. Y yo te quiero un montón por ser como eres.

Feliz Navidad, mi mejor amiga.
Que esta fecha te abrace bonito.
Y que tú también te abraces bonito. 💜✨`;

setReadonlyUIFromState();

/* -------------------------
   Imágenes (defaults + uploads)
-------------------------- */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
async function tryFetchToDataURL(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await blobToDataURL(blob);
  } catch {
    return null;
  }
}

const imgL = $("imgLumine");
const imgM = $("imgMe");

on("fileLumine", "change", async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  state.lumineDataUrl = await readFileAsDataURL(f);
  if (imgL) imgL.src = state.lumineDataUrl;
  schedulePosterRegen();
});
on("fileMe", "change", async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  state.meDataUrl = await readFileAsDataURL(f);
  if (imgM) imgM.src = state.meDataUrl;
  schedulePosterRegen();
});

/* -------------------------
   Canvas poster helpers
-------------------------- */
const canvas = $("poster");
const ctx = canvas ? canvas.getContext("2d") : null;

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawImageCover(ctx, img, x, y, w, h) {
  const iw = img.width, ih = img.height;
  const ir = iw / ih;
  const r = w / h;
  let sx, sy, sw, sh;
  if (ir > r) { sh = ih; sw = ih * r; sx = (iw - sw) / 2; sy = 0; }
  else { sw = iw; sh = iw / r; sx = 0; sy = (ih - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ");
  let line = "", lines = 0;
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? (line + " " + words[i]) : words[i];
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines++;
      line = words[i];
      if (maxLines && lines >= maxLines) return y;
    } else line = testLine;
  }
  if (line) { ctx.fillText(line, x, y); y += lineHeight; }
  return y;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

function softNoise(alpha = 0.03) {
  if (!canvas || !ctx) return;
  const { width: W, height: H } = canvas;
  const imgData = ctx.getImageData(0, 0, W, H);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * alpha;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawGarland(y) {
  const W = canvas.width;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "rgba(215,215,227,.22)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(90, y);
  ctx.quadraticCurveTo(W * 0.5, y + 26, W - 90, y);
  ctx.stroke();

  const dots = [0.18, 0.32, 0.50, 0.68, 0.82].map(t => 90 + (W - 180) * t);
  dots.forEach((x, i) => {
    const fill = (i % 2 === 0) ? "rgba(246,213,139,.92)" : "rgba(215,215,227,.85)";
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y + 10 + (i % 2 ? 6 : 0), 10, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function glitter(amount0to100) {
  const W = canvas.width, H = canvas.height;
  const n = Math.floor(60 + (amount0to100 / 100) * 240);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const r = Math.random() * 1.6 + 0.4;
    const isGold = Math.random() > 0.45;
    ctx.fillStyle = isGold ? "rgba(246,213,139,.45)" : "rgba(215,215,227,.34)";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPaws(seed = 11, alpha = 0.14) {
  const W = canvas.width;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(215,215,227,.85)";
  function paw(x, y, s) {
    ctx.beginPath(); ctx.arc(x, y, s * 0.48, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - s * 0.55, y - s * 0.55, s * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - s * 0.70, s * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + s * 0.55, y - s * 0.55, s * 0.22, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < seed; i++) {
    const x = 120 + (i * (W - 240) / (seed - 1));
    const y = 520 + (i * 75);
    paw(x, y, 22);
  }
  ctx.restore();
}

/* ✅ Poster */
async function generatePoster() {
  if (!canvas || !ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const o = state.opts;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#050208");
  bg.addColorStop(0.45, "#1a0b2a");
  bg.addColorStop(1, "#06020b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  glitter(o.glitter);
  softNoise(0.030);

  ctx.save();
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(246,213,139,.65)";
  roundRectPath(ctx, 34, 34, W - 68, H - 68, 36);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(215,215,227,.22)";
  roundRectPath(ctx, 62, 62, W - 124, H - 124, 32);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(167,139,250,.18)";
  roundRectPath(ctx, 78, 78, W - 156, H - 156, 28);
  ctx.stroke();
  ctx.restore();

  drawGarland(112);

  ctx.save();
  ctx.fillStyle = "rgba(246,213,139,.96)";
  ctx.font = "900 64px ui-sans-serif, system-ui";
  ctx.fillText("Feliz Navidad, Luminé ✨", 90, 190);

  ctx.fillStyle = "rgba(238,234,255,.86)";
  ctx.font = "700 28px ui-sans-serif, system-ui";
  ctx.fillText(`Para ${o.displayName || DEFAULT_DISPLAY_NAME} — mi mejor amiga 💜`, 92, 240);
  ctx.restore();

  if (o.revealLine?.trim()) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.strokeStyle = "rgba(246,213,139,.22)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, 90, 266, W - 180, 58, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(246,213,139,.92)";
    ctx.font = "800 22px ui-sans-serif, system-ui";
    ctx.fillText(o.revealLine.trim(), 114, 303);
    ctx.restore();
  }

  if (o.sealLine?.trim()) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.strokeStyle = "rgba(215,215,227,.18)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, 90, 332, 390, 52, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(215,215,227,.92)";
    ctx.font = "800 18px ui-sans-serif, system-ui";
    ctx.fillText(`✦ ${o.sealLine.trim()}`, 112, 365);
    ctx.restore();
  }

  if (o.goalLine?.trim()) {
    ctx.save();
    ctx.fillStyle = "rgba(124,58,237,.16)";
    ctx.strokeStyle = "rgba(167,139,250,.18)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, W - 90 - 470, 332, 470, 52, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(238,234,255,.90)";
    ctx.font = "800 18px ui-sans-serif, system-ui";
    ctx.fillText(`🎓 ${o.goalLine.trim()}`, W - 90 - 450, 365);
    ctx.restore();
  }

  if (o.pawMode) drawPaws(11, 0.14);

  const frameY = 410;
  const frameSize = 420;
  const gap = 70;
  const totalW = frameSize * 2 + gap;
  const startX = (W - totalW) / 2;

  function drawFrame(x, y, label, accent = false) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.strokeStyle = "rgba(255,255,255,.16)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, frameSize, frameSize, 34);
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = "rgba(246,213,139,.20)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x + 14, y + 14, frameSize - 28, frameSize - 28, 28);
    ctx.stroke();

    ctx.fillStyle = accent ? "rgba(124,58,237,.52)" : "rgba(255,255,255,.06)";
    roundRectPath(ctx, x + 22, y + 22, 260, 44, 22);
    ctx.fill();

    ctx.fillStyle = "rgba(238,234,255,.94)";
    ctx.font = "900 20px ui-sans-serif, system-ui";
    ctx.fillText(label, x + 40, y + 52);
    ctx.restore();
  }

  drawFrame(startX, frameY, o.srtaMode ? "Srta. Luminé" : "Luminé", true);
  drawFrame(startX + frameSize + gap, frameY, "Yo", false);

  async function drawRoundedImage(im, x, y, w, h, r, filter = "none", spotlight = false) {
    ctx.save();
    if (spotlight) {
      const cx = x + w / 2, cy = y + h / 2;
      const sp = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.65);
      sp.addColorStop(0, "rgba(246,213,139,.10)");
      sp.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sp;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(w, h) * 0.65, 0, Math.PI * 2); ctx.fill();
    }

    ctx.filter = filter;
    roundRectPath(ctx, x, y, w, h, r);
    ctx.clip();
    drawImageCover(ctx, im, x, y, w, h);
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(246,213,139,.30)";
    roundRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
  }

  const lumineFilter = o.enhanceLumine ? "contrast(1.07) saturate(1.06) brightness(1.04)" : "none";

  try {
    if (state.lumineDataUrl) {
      const imL = await loadImage(state.lumineDataUrl);
      await drawRoundedImage(imL, startX + 18, frameY + 78, frameSize - 36, frameSize - 96, 26, lumineFilter, true);
    }
    if (state.meDataUrl) {
      const imM = await loadImage(state.meDataUrl);
      await drawRoundedImage(imM, startX + frameSize + gap + 18, frameY + 78, frameSize - 36, frameSize - 96, 26, "none", false);
    }
  } catch (_) {}

  const quoteY = 860;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.strokeStyle = "rgba(246,213,139,.18)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, 80, quoteY, W - 160, 140, 26);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = "rgba(246,213,139,.92)";
  ctx.font = "900 24px ui-sans-serif, system-ui";
  ctx.fillText("Promesa de amistad:", 98, quoteY + 40);

  ctx.fillStyle = "rgba(238,234,255,.86)";
  ctx.font = "600 22px ui-sans-serif, system-ui";
  wrapText(ctx, `“${(o.promise || DEFAULT_PROMISE).trim()}”`, 98, quoteY + 74, W - 196, 30, 3);

  if (o.pawMode && (o.catName || "").trim()) {
    ctx.fillStyle = "rgba(215,215,227,.88)";
    ctx.font = "800 18px ui-sans-serif, system-ui";
    ctx.fillText(`🐾 Por tu gatita: ${(o.catName || "").trim()}`, 98, quoteY + 126);
  }
  ctx.restore();

  const footerH = 74;
  const footerY = H - 78 - footerH;
  const footerX = 80;
  const footerW = W - 160;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.20)";
  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, footerX, footerY, footerW, footerH, 22);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const panelY = 1020;
  const panelH = Math.max(300, (footerY - 16) - panelY);
  const panelX = 80;
  const panelW = W - 160;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.05)";
  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, panelX, panelY, panelW, panelH, 34);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = "rgba(246,213,139,.92)";
  ctx.font = "900 30px ui-sans-serif, system-ui";
  ctx.fillText("Un mensaje para ti:", 90, panelY + 50);

  const msg = (o.message || "").trim();
  const bullets = (o.phrases || []).map(s => (s || "").trim()).filter(Boolean).slice(0, 4);

  const lineH = 34;
  const bulletsBlockH = 28 + (bullets.length * 26) + 16;
  const textTop = panelY + 90;
  const textBottomLimit = panelY + panelH - bulletsBlockH - 10;
  const maxTextLines = Math.max(3, Math.floor((textBottomLimit - textTop) / lineH));

  ctx.fillStyle = "rgba(238,234,255,.86)";
  ctx.font = "500 24px ui-sans-serif, system-ui";
  let y = textTop;
  y = wrapText(ctx, msg, 90, y, W - 180, lineH, maxTextLines);

  let by = panelY + panelH - bulletsBlockH + 10;
  ctx.fillStyle = "rgba(215,215,227,.88)";
  ctx.font = "900 20px ui-sans-serif, system-ui";
  ctx.fillText("Detalles:", 90, by);
  by += 28;

  ctx.fillStyle = "rgba(238,234,255,.82)";
  ctx.font = "700 20px ui-sans-serif, system-ui";
  bullets.forEach(b => {
    ctx.fillText(`• ${b}`, 90, by);
    by += 26;
  });
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(246,213,139,.88)";
  ctx.font = "900 22px ui-sans-serif, system-ui";
  ctx.fillText("Navidad 2025 • Hecho con cariño", footerX + 20, footerY + 46);

  ctx.fillStyle = "rgba(195,189,223,.92)";
  ctx.font = "900 20px ui-sans-serif, system-ui";
  const sig = `— ${o.signature || DEFAULT_SIGNATURE}`;
  const sigW = ctx.measureText(sig).width;
  ctx.fillText(sig, footerX + footerW - 20 - sigW, footerY + 46);
  ctx.restore();
}

/* Throttle render */
let regenTimer = null;
function schedulePosterRegen() {
  clearTimeout(regenTimer);
  regenTimer = setTimeout(() => generatePoster(), 250);
}
on("genPoster", "click", generatePoster);

/* -------------------------
   BONUS unlock + UI
-------------------------- */
const bonusLocked = $("bonusLocked");
const goBonusBtn = $("goBonus");

function updateBonusUI() {
  if (!bonusLocked || !goBonusBtn) return;
  if (state.bonusUnlocked) {
    bonusLocked.style.display = "none";
    goBonusBtn.style.display = "inline-flex";
  } else {
    bonusLocked.style.display = "block";
    goBonusBtn.style.display = "none";
  }
}

function markExportUnlocked() {
  if (!state.bonusUnlocked) {
    state.bonusUnlocked = true;
    localStorage.setItem(KEY_BONUS_UNLOCKED, "1");
    updateBonusUI();
  }
}

if (goBonusBtn) {
  goBonusBtn.addEventListener("click", () => {
    syncBonusInputsFromState();
    showStep(6);
  });
}

on("backToPoster", "click", () => {
  showStep(5);
  schedulePosterRegen();
});

/* -------------------------
   Descargar / Compartir
-------------------------- */
const shareHint = $("shareHint");

function safeFileName(name) {
  return String(name || "poster")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

on("downloadPoster", "click", async () => {
  await generatePoster();
  if (!canvas) return;

  const base = safeFileName(`Navidad_2025_${state.opts.displayName || DEFAULT_DISPLAY_NAME}`);
  const a = document.createElement("a");
  a.download = `${base}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();

  markExportUnlocked();
  if (shareHint) shareHint.textContent = "✅ Descargado. Si quieres, ahora puedes abrir el regalo extra.";
});

on("sharePoster", "click", async () => {
  if (shareHint) shareHint.textContent = "";
  await generatePoster();
  if (!canvas) return;

  const base = safeFileName(`Navidad_2025_${state.opts.displayName || DEFAULT_DISPLAY_NAME}`);
  const title = "Navidad 2025 ✨";
  const text = "Te comparto el poster navideño 🎄💜";
  const url = window.location.href;

  canvas.toBlob(async (blob) => {
    if (!blob) {
      if (shareHint) shareHint.textContent = "No se pudo preparar el archivo. Descarga y comparte manualmente.";
      return;
    }
    const file = new File([blob], `${base}.png`, { type: "image/png" });

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title, text: `${text}\n${url}`, files: [file] });
        markExportUnlocked();
        if (shareHint) shareHint.textContent = "✅ Compartido. (Si quieres, abre el regalo extra.)";
      } else {
        const a = document.createElement("a");
        a.download = `${base}.png`;
        a.href = URL.createObjectURL(blob);
        a.click();
        URL.revokeObjectURL(a.href);
        markExportUnlocked();
        if (shareHint) shareHint.textContent = "Tu navegador no soporta compartir directo. Se descargó para que lo compartas manualmente.";
      }
    } catch {
      if (shareHint) shareHint.textContent = "Compartir cancelado o no disponible. Puedes descargar y compartir manualmente.";
    }
  }, "image/png");
});

/* -------------------------
   BONUS Studio (sync)
-------------------------- */
const bonus = {
  displayName: $("displayNameBonus"),
  fromName: $("fromNameBonus"),
  revealLine: $("revealLineBonus"),
  goalLine: $("goalLineBonus"),
  sealLine: $("sealLineBonus"),
  catName: $("catNameBonus"),
  glitter: $("glitterBonus"),
  srtaMode: $("srtaModeBonus"),
  pawMode: $("pawModeBonus"),
  enhance: $("enhanceLumineBonus"),
  promise: $("promiseBonus"),
  message: $("messageBonus"),
  p1: $("phrase1Bonus"),
  p2: $("phrase2Bonus"),
  p3: $("phrase3Bonus"),
  p4: $("phrase4Bonus"),
  fileL: $("fileLumineBonus"),
  fileM: $("fileMeBonus")
};

function syncBonusInputsFromState() {
  const o = state.opts;
  if (bonus.displayName) bonus.displayName.value = o.displayName || DEFAULT_DISPLAY_NAME;
  if (bonus.fromName) bonus.fromName.value = o.signature || DEFAULT_SIGNATURE;
  if (bonus.revealLine) bonus.revealLine.value = o.revealLine || "";
  if (bonus.goalLine) bonus.goalLine.value = o.goalLine || "";
  if (bonus.sealLine) bonus.sealLine.value = o.sealLine || "";
  if (bonus.catName) bonus.catName.value = o.catName || "";
  if (bonus.glitter) bonus.glitter.value = String(o.glitter ?? 55);
  if (bonus.srtaMode) bonus.srtaMode.checked = !!o.srtaMode;
  if (bonus.pawMode) bonus.pawMode.checked = !!o.pawMode;
  if (bonus.enhance) bonus.enhance.checked = !!o.enhanceLumine;
  if (bonus.promise) bonus.promise.value = o.promise || DEFAULT_PROMISE;
  if (bonus.message) bonus.message.value = o.message || "";
  if (bonus.p1) bonus.p1.value = o.phrases[0] || "";
  if (bonus.p2) bonus.p2.value = o.phrases[1] || "";
  if (bonus.p3) bonus.p3.value = o.phrases[2] || "";
  if (bonus.p4) bonus.p4.value = o.phrases[3] || "";
  setReadonlyUIFromState();
}

function pullStateFromBonus() {
  const o = state.opts;
  if (bonus.displayName) o.displayName = bonus.displayName.value.trim() || DEFAULT_DISPLAY_NAME;
  if (bonus.fromName) o.signature = bonus.fromName.value.trim() || DEFAULT_SIGNATURE;
  if (bonus.revealLine) o.revealLine = bonus.revealLine.value;
  if (bonus.goalLine) o.goalLine = bonus.goalLine.value;
  if (bonus.sealLine) o.sealLine = bonus.sealLine.value;
  if (bonus.catName) o.catName = bonus.catName.value;
  if (bonus.glitter) o.glitter = Math.max(0, Math.min(100, Number(bonus.glitter.value || 0)));
  if (bonus.srtaMode) o.srtaMode = !!bonus.srtaMode.checked;
  if (bonus.pawMode) o.pawMode = !!bonus.pawMode.checked;
  if (bonus.enhance) o.enhanceLumine = !!bonus.enhance.checked;
  if (bonus.promise) o.promise = bonus.promise.value;
  if (bonus.message) o.message = bonus.message.value;
  o.phrases = [
    bonus.p1 ? bonus.p1.value : "",
    bonus.p2 ? bonus.p2.value : "",
    bonus.p3 ? bonus.p3.value : "",
    bonus.p4 ? bonus.p4.value : ""
  ];

  setReadonlyUIFromState();
  schedulePosterRegen();
}

[
  bonus.displayName, bonus.fromName, bonus.revealLine, bonus.goalLine, bonus.sealLine,
  bonus.catName, bonus.glitter, bonus.promise, bonus.message,
  bonus.p1, bonus.p2, bonus.p3, bonus.p4
].forEach(el => el && el.addEventListener("input", pullStateFromBonus));
[bonus.srtaMode, bonus.pawMode, bonus.enhance].forEach(el => el && el.addEventListener("change", pullStateFromBonus));

if (bonus.fileL) {
  bonus.fileL.addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    state.lumineDataUrl = await readFileAsDataURL(f);
    if (imgL) imgL.src = state.lumineDataUrl;
    schedulePosterRegen();
  });
}
if (bonus.fileM) {
  bonus.fileM.addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    state.meDataUrl = await readFileAsDataURL(f);
    if (imgM) imgM.src = state.meDataUrl;
    schedulePosterRegen();
  });
}

/* -------------------------
   Bloquear edición en historia
-------------------------- */
function lockHistoryEdits() {
  document.querySelectorAll(".lockable").forEach(el => { el.disabled = true; });
}

/* Bootstrap */
(async function init() {
  lockHistoryEdits();
  updateBonusUI();
  initSurpriseCardsModalAndFlip(); // ✅ aquí se inicializan tarjetas sí o sí

  // Defaults de fotos para “primera vez”
  const dL = await tryFetchToDataURL(DEFAULT_LUMINE_PATH);
  if (dL) { state.lumineDataUrl = dL; if (imgL) imgL.src = dL; }

  const dM = await tryFetchToDataURL(DEFAULT_ME_PATH);
  if (dM) { state.meDataUrl = dM; if (imgM) imgM.src = dM; }

  await generatePoster();
})();

/* Service Worker (GitHub Pages HTTPS) */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // el query ?v=4 fuerza update del SW cuando cambias la versión
    navigator.serviceWorker.register(`./sw.js?${SW_VERSION}`).catch(() => {});
  });
}
