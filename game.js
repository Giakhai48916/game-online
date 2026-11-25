document.getElementById('lobby-rules-text').innerHTML =
  `<b>Luật chơi:</b> Map 35&times;35 ngẫu nhiên. Người Bắt có kỹ năng <b>⚡ Tăng Tốc ${SEEKER_BOOST_DURATION}s</b> (hồi ${SEEKER_BOOST_COOLDOWN}s) và phát <b>ánh sáng đỏ</b> khi lại gần. Bị bắt vào <b>Lồng Giam</b> khóa cứu <b>${JAIL_LOCK_SECONDS}s</b>. Nhặt <b>🔦 Đèn Pin</b> (tối đa ${MAX_ITEMS_TOTAL} cây) làm <b>chói trắng ${BLIND_DURATION}s</b>. Còn <b>1 phút cuối</b>: Người Bắt tăng tốc cố định, Thấu Thị nháy <b>${XRAY_ON_SEC}s/${XRAY_OFF_SEC}s</b> và bị bắt thua ngay!`;

let userSettings = { touchSens: 1.0, mouseSens: 1.0, invertY: false, bgmVol: 0.40, bgmMuted: false };
let myCosmetics = { skin: 'white', hat: 'hutao' };
let activeSecretChar = null; // null | 'sans' | 'knight'

function detectSecretCharFromName(rawName) {
  const n = (rawName || '').trim().toLowerCase();
  if (n === 'sans') return 'sans';
  if (n === 'knight') return 'knight';
  return null;
}

function isSansSecretName(rawName) {
  return detectSecretCharFromName(rawName) === 'sans';
}

function isKnightSecretName(rawName) {
  return detectSecretCharFromName(rawName) === 'knight';
}

try {
  const savedSet = JSON.parse(localStorage.getItem('br3d_settings') || 'null');
  if (savedSet) {
    userSettings.touchSens = Math.max(0.2, Math.min(3.0, Number(savedSet.touchSens) || 1.0));
    userSettings.mouseSens = Math.max(0.2, Math.min(3.0, Number(savedSet.mouseSens) || 1.0));
    userSettings.invertY = !!savedSet.invertY;
    if (typeof savedSet.bgmVol === 'number' && !Number.isNaN(savedSet.bgmVol)) {
      userSettings.bgmVol = Math.max(0, Math.min(1, savedSet.bgmVol));
    }
    userSettings.bgmMuted = !!savedSet.bgmMuted;
  }
  const savedCos = JSON.parse(localStorage.getItem('br3d_cosmetics') || 'null');
  if (savedCos) {
    if (SKINS.some(s => s.id === savedCos.skin)) myCosmetics.skin = savedCos.skin;
    if (HATS.some(h => h.id === savedCos.hat)) myCosmetics.hat = savedCos.hat;
  }
  const savedName = localStorage.getItem('br3d_name');
  if (savedName) {
    document.getElementById('player-name').value = savedName;
    activeSecretChar = detectSecretCharFromName(savedName);
  }
} catch (e) {}

function persistSettings() { try { localStorage.setItem('br3d_settings', JSON.stringify(userSettings)); } catch (e) {} }
function persistCosmetics() { try { localStorage.setItem('br3d_cosmetics', JSON.stringify(myCosmetics)); } catch (e) {} }
function getSkinInfo(id) { return SKINS.find(s => s.id === id) || SKINS[0]; }
function formatClock(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// Âm thanh tiếng nói đặc trưng kiểu Undertale khi mở khóa Sans (Web Audio API)
function playUndertaleSansVoice() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [293.66, 329.63, 261.63, 392.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      const start = ctx.currentTime + idx * 0.055;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.052);
    });
    setTimeout(() => ctx.close().catch(() => {}), 450);
  } catch (e) {}
}

// Âm thanh chuông Linh Hồn du dương phong cách Hollow Knight khi mở khóa Knight
function playHollowKnightSoulChime() {
  try {
    const ctx = getSharedAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440.0, 523.25, 659.25, 880.0]; // A4 - C5 - E5 - A5 (âm hưởng Hallownest)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      sub.type = 'triangle';
      const st = now + idx * 0.085;
      osc.frequency.setValueAtTime(freq, st);
      sub.frequency.setValueAtTime(freq * 0.5, st);
      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.075, st + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, st + 0.55);
      osc.connect(gain); sub.connect(gain); gain.connect(ctx.destination);
      osc.start(st); sub.start(st);
      osc.stop(st + 0.58); sub.stop(st + 0.58);
    });
  } catch (e) {}
}

// Hệ thống âm thanh kỹ năng chuẩn (Sans: gaster-blaster-sound-effect.mp3 & Knight: hero_fireball.wav)
// Hỗ trợ tải trước (preload) & phát mượt trên PC / Mobile / iPad
let sharedAudioCtx = null;

function getSharedAudioCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume().catch(() => {});
  return sharedAudioCtx;
}

function createPreloadedSound(url) {
  const s = { url, buf: null, raw: null, fetching: false, decoding: false };
  const decodeIfReady = () => {
    if (s.buf || s.decoding || !s.raw) return;
    const ctx = getSharedAudioCtx();
    if (!ctx) return;
    s.decoding = true;
    const copy = s.raw.slice(0);
    new Promise((resolve, reject) => {
      const p = ctx.decodeAudioData(copy, resolve, reject);
      if (p && typeof p.then === 'function') p.then(resolve).catch(reject);
    })
      .then(buf => { if (buf) s.buf = buf; })
      .catch(() => {})
      .finally(() => { s.decoding = false; });
  };
  return {
    preload() {
      if (s.buf) return;
      if (s.raw) { decodeIfReady(); return; }
      if (s.fetching) return;
      s.fetching = true;
      fetch(s.url)
        .then(res => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.arrayBuffer();
        })
        .then(arr => {
          s.raw = arr;
          decodeIfReady();
        })
        .catch(() => { s.fetching = false; });
    },
    play(volume = 0.95) {
      const vol = Math.max(0.22, Math.min(1.0, volume));
      try {
        const ctx = getSharedAudioCtx();
        if (ctx && s.buf) {
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
          const src = ctx.createBufferSource();
          const gain = ctx.createGain();
          src.buffer = s.buf;
          gain.gain.setValueAtTime(vol, ctx.currentTime);
          src.connect(gain);
          gain.connect(ctx.destination);
          src.start(0);
          return;
        }
      } catch (e) {}

      try {
        const audio = new Audio(s.url);
        audio.volume = vol;
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) {}
    }
  };
}

const gasterBlasterSfx = createPreloadedSound('./gaster-blaster-sound-effect.mp3');
const shadeSoulSfx = createPreloadedSound('./hero_fireball.wav');

function preloadSkillAudios() {
  gasterBlasterSfx.preload();
  shadeSoulSfx.preload();
}

// Nhạc nền chơi game (TEMPOREX - Numbers loop -> bgm.mp3)
const gameBgmAudio = new Audio('./bgm.mp3');
gameBgmAudio.loop = true;
gameBgmAudio.preload = 'auto';
let gameBgmShouldPlay = false;

function applyBgmVolume() {
  const effectiveVol = userSettings.bgmMuted ? 0 : Math.max(0, Math.min(1, userSettings.bgmVol));
  gameBgmAudio.volume = effectiveVol;
  const btnBgm = document.getElementById('btn-hud-bgm');
  if (btnBgm) {
    btnBgm.textContent = (userSettings.bgmMuted || userSettings.bgmVol <= 0.001) ? '🔇' : '🎵';
  }
}

function startGameBgm(restart = false) {
  gameBgmShouldPlay = true;
  applyBgmVolume();
  if (restart) {
    try { gameBgmAudio.currentTime = 0; } catch (e) {}
  }
  if (userSettings.bgmMuted || userSettings.bgmVol <= 0.001) return;
  try {
    const p = gameBgmAudio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (e) {}
}

function stopGameBgm() {
  gameBgmShouldPlay = false;
  try {
    gameBgmAudio.pause();
    gameBgmAudio.currentTime = 0;
  } catch (e) {}
}

function playSpeedBoostSound() {
  try {
    const ctx = getSharedAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.28);
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(1400, now);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    osc.connect(flt); flt.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.36);
  } catch (e) {}
}

function unlockGameAudio() {
  const ctx = getSharedAudioCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  preloadSkillAudios();
  if (gameBgmShouldPlay && gameBgmAudio.paused && !userSettings.bgmMuted && userSettings.bgmVol > 0.001) {
    applyBgmVolume();
    try {
      const p = gameBgmAudio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {}
  }
}
['pointerdown', 'touchstart', 'keydown'].forEach(ev => {
  window.addEventListener(ev, unlockGameAudio, { passive: true });
});
preloadSkillAudios();

function playGasterBlasterSound(volume = 0.95) {
  gasterBlasterSfx.play(volume);
}

function playStunHitSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.32);
    setTimeout(() => ctx.close().catch(() => {}), 450);
  } catch (e) {}
}

// Âm thanh Shade Soul gốc của The Knight (hero_fireball.wav)
function playShadeSoulSound(volume = 0.95) {
  shadeSoulSfx.play(volume);
}

function createPreviewBox(canvasId, w, h) {
  const cvs = document.getElementById(canvasId);
  const ren = new THREE.WebGLRenderer({ canvas: cvs, alpha: true, antialias: true, powerPreference: 'high-performance' });
  ren.setPixelRatio(Math.max(2, Math.min(window.devicePixelRatio || 1, 3)));
  ren.setSize(w, h, false);
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(36, w / h, 0.1, 20);
  cam.position.set(0, 1.02, 3.22);
  cam.lookAt(0, 0.90, 0);

  // Ánh sáng Studio cân bằng tương phản cao (không cháy trắng, nổi rõ khối hốc mắt, gò má & nếp áo)
  sc.add(new THREE.HemisphereLight(0xfff9ee, 0x232940, 0.62));
  const keyLight = new THREE.DirectionalLight(0xfff5e4, 0.78);
  keyLight.position.set(2.6, 3.8, 3.4);
  sc.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x88ccff, 0.52);
  rimLight.position.set(-2.8, 2.4, -2.6);
  sc.add(rimLight);
  const frontFill = new THREE.DirectionalLight(0xeef4ff, 0.18);
  frontFill.position.set(-0.6, 0.5, 3.2);
  sc.add(frontFill);

  const state = { cvs, ren, sc, cam, char: null, angle: Math.PI - 0.28, dragging: false, lastX: 0 };
  cvs.addEventListener('pointerdown', (e) => { state.dragging = true; state.lastX = e.clientX; });
  window.addEventListener('pointerup', () => { state.dragging = false; });
  window.addEventListener('pointermove', (e) => {
    if (!state.dragging) return;
    state.angle += (e.clientX - state.lastX) * 0.016;
    state.lastX = e.clientX;
  });
  return state;
}

const menuPreview = createPreviewBox('preview-3d-canvas', 116, 148);
const lobbyPreview = createPreviewBox('lobby-3d-canvas', 116, 148);

function refreshPreviewModels() {
  const hex = getSkinInfo(myCosmetics.skin).hex;
  [menuPreview, lobbyPreview].forEach(box => {
    if (box.char) box.sc.remove(box.char);
    box.char = buildCharacterMesh(hex, myCosmetics.hat, false, false, activeSecretChar);
    box.char.rotation.y = box.angle;
    box.sc.add(box.char);
  });
}

function updateWardrobeLockUI() {
  const isSans = (activeSecretChar === 'sans');
  const isKnight = (activeSecretChar === 'knight');
  const locked = isSans || isKnight;
  ['menu', 'lobby'].forEach(prefix => {
    const box = document.getElementById(`${prefix}-wardrobe-box`);
    const customEl = document.getElementById(`${prefix}-wardrobe-custom`);
    const sansLockEl = document.getElementById(`${prefix}-sans-locked`);
    const knightLockEl = document.getElementById(`${prefix}-knight-locked`);
    if (box) {
      box.classList.toggle('sans-locked-theme', isSans);
      box.classList.toggle('knight-locked-theme', isKnight);
    }
    if (customEl) customEl.classList.toggle('hidden', locked);
    if (sansLockEl) sansLockEl.classList.toggle('hidden', !isSans);
    if (knightLockEl) knightLockEl.classList.toggle('hidden', !isKnight);
  });
}

function setSecretCharState(newSecret, playSound = false) {
  const changed = (activeSecretChar !== newSecret);
  activeSecretChar = newSecret;
  updateWardrobeLockUI();
  refreshPreviewModels();
  if (changed) {
    if (playSound) {
      if (newSecret === 'sans') playUndertaleSansVoice();
      else if (newSecret === 'knight') playHollowKnightSoulChime();
    }
    syncMyCosmeticsToRoom();
  }
}

function renderWardrobeUI() {
  ['menu-skin-grid', 'lobby-skin-grid'].forEach(gid => {
    const box = document.getElementById(gid);
    box.innerHTML = '';
    SKINS.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.title = s.name;
      btn.className = 'skin-dot' + (myCosmetics.skin === s.id ? ' selected' : '');
      btn.style.backgroundColor = s.css;
      btn.addEventListener('click', () => {
        if (activeSecretChar) return;
        myCosmetics.skin = s.id;
        persistCosmetics();
        renderWardrobeUI(); refreshPreviewModels(); syncMyCosmeticsToRoom();
      });
      box.appendChild(btn);
    });
  });

  ['menu-hat-grid', 'lobby-hat-grid'].forEach(gid => {
    const box = document.getElementById(gid);
    box.innerHTML = '';
    HATS.forEach(h => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hat-btn' + (myCosmetics.hat === h.id ? ' selected' : '');
      btn.textContent = h.name;
      btn.addEventListener('click', () => {
        if (activeSecretChar) return;
        myCosmetics.hat = h.id;
        persistCosmetics();
        renderWardrobeUI(); refreshPreviewModels(); syncMyCosmeticsToRoom();
      });
      box.appendChild(btn);
    });
  });
  updateWardrobeLockUI();
}
renderWardrobeUI();
refreshPreviewModels();

const settingsOverlay = document.getElementById('settings-overlay');
const sliderTouchSens = document.getElementById('slider-touch-sens');
const sliderMouseSens = document.getElementById('slider-mouse-sens');
const valTouchSens = document.getElementById('val-touch-sens');
const valMouseSens = document.getElementById('val-mouse-sens');
const sliderBgmVol = document.getElementById('slider-bgm-vol');
const valBgmVol = document.getElementById('val-bgm-vol');
const chkInvertY = document.getElementById('chk-invert-y');

function syncSettingsUI() {
  sliderTouchSens.value = userSettings.touchSens;
  sliderMouseSens.value = userSettings.mouseSens;
  valTouchSens.textContent = userSettings.touchSens.toFixed(2) + 'x';
  valMouseSens.textContent = userSettings.mouseSens.toFixed(2) + 'x';
  if (sliderBgmVol) sliderBgmVol.value = userSettings.bgmVol;
  if (valBgmVol) valBgmVol.textContent = Math.round(userSettings.bgmVol * 100) + '%';
  chkInvertY.checked = userSettings.invertY;
  applyBgmVolume();
}
syncSettingsUI();

function openSettingsModal(e) {
  if (e) e.stopPropagation();
  if (document.pointerLockElement) document.exitPointerLock();
  syncSettingsUI();
  settingsOverlay.classList.remove('hidden');
}

function closeSettingsModal() {
  persistSettings();
  settingsOverlay.classList.add('hidden');
  updateLockHint();
}

['btn-menu-settings', 'btn-lobby-settings', 'btn-hud-settings'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', openSettingsModal);
});

sliderTouchSens.addEventListener('input', () => {
  userSettings.touchSens = Number(sliderTouchSens.value);
  valTouchSens.textContent = userSettings.touchSens.toFixed(2) + 'x';
  persistSettings();
});
sliderMouseSens.addEventListener('input', () => {
  userSettings.mouseSens = Number(sliderMouseSens.value);
  valMouseSens.textContent = userSettings.mouseSens.toFixed(2) + 'x';
  persistSettings();
});
chkInvertY.addEventListener('change', () => { userSettings.invertY = chkInvertY.checked; persistSettings(); });
if (sliderBgmVol) {
  sliderBgmVol.addEventListener('input', () => {
    userSettings.bgmVol = Number(sliderBgmVol.value);
    if (userSettings.bgmVol > 0) userSettings.bgmMuted = false;
    if (valBgmVol) valBgmVol.textContent = Math.round(userSettings.bgmVol * 100) + '%';
    applyBgmVolume();
    if (gameBgmShouldPlay && gameBgmAudio.paused && userSettings.bgmVol > 0) startGameBgm(false);
    else if (userSettings.bgmVol <= 0.001) { try { gameBgmAudio.pause(); } catch (e) {} }
    persistSettings();
  });
}
const btnHudBgm = document.getElementById('btn-hud-bgm');
if (btnHudBgm) {
  btnHudBgm.addEventListener('click', (e) => {
    e.stopPropagation();
    userSettings.bgmMuted = !userSettings.bgmMuted;
    if (!userSettings.bgmMuted && userSettings.bgmVol <= 0.001) userSettings.bgmVol = 0.40;
    applyBgmVolume();
    if (userSettings.bgmMuted) { try { gameBgmAudio.pause(); } catch (err) {} }
    else if (gameBgmShouldPlay) startGameBgm(false);
    persistSettings();
  });
}

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    userSettings.touchSens = Number(btn.dataset.touch);
    userSettings.mouseSens = Number(btn.dataset.mouse);
    syncSettingsUI(); persistSettings();
  });
});

document.getElementById('btn-reset-settings').addEventListener('click', () => {
  userSettings = { touchSens: 1.0, mouseSens: 1.0, invertY: false, bgmVol: 0.40, bgmMuted: false };
  syncSettingsUI(); persistSettings();
});
document.getElementById('btn-close-settings').addEventListener('click', closeSettingsModal);

function isInFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function updateFullscreenButtons() {
  const label = isInFullscreen() ? '✕ Thoát' : '⛶ Full';
  ['btn-menu-fs', 'btn-lobby-fs', 'btn-hud-fs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = label;
  });
}

function tryEnterFullscreen(silent = false) {
  const docEl = document.documentElement;
  const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
  if (req) {
    try {
      const res = req.call(docEl, { navigationUI: 'hide' });
      if (res && typeof res.catch === 'function') res.catch(() => {});
      if (isTouchDevice && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
    } catch (e) {}
  } else if (!silent) {
    const msg = 'Trên iPhone/iPad: Bấm Chia sẻ (↑) → "Thêm vào Màn hình chính" để chơi Full màn hình 100%!';
    if (gameScreen.classList.contains('active')) showToast(msg, 'info');
    else { menuError.textContent = msg; lobbyError.textContent = msg; }
  }
}

function toggleFullscreen(e) {
  if (e) e.stopPropagation();
  if (isInFullscreen()) { const exit = document.exitFullscreen || document.webkitExitFullscreen; if (exit) exit.call(document); }
  else tryEnterFullscreen(false);
}

['btn-menu-fs', 'btn-lobby-fs', 'btn-hud-fs'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', toggleFullscreen);
});
document.addEventListener('fullscreenchange', () => { updateFullscreenButtons(); resize3D(); });
document.addEventListener('webkitfullscreenchange', () => { updateFullscreenButtons(); resize3D(); });

function createBackgroundSafeLoop(callback, intervalMs) {
  try {
    const code = `let t=null; self.onmessage=e=>{ if(e.data==='start'){ clearInterval(t); t=setInterval(()=>self.postMessage(1), ${intervalMs}); } else if(e.data==='stop'){ clearInterval(t); } };`;
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    worker.onmessage = () => callback();
    worker.postMessage('start');
    return { stop() { worker.postMessage('stop'); worker.terminate(); URL.revokeObjectURL(url); } };
  } catch (err) {
    const id = setInterval(callback, intervalMs);
    return { stop() { clearInterval(id); } };
  }
}

let activeMapGrid = [], flowToCenter = [], validFloorTiles = [], validHiderSpawns = [];

function generateRandomBackroomsMap() {
  const N = MAP_SIZE;
  const g = Array.from({ length: N }, () => Array(N).fill(1));
  const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
  const stack = [{ r: 1, c: 1 }];
  g[1][1] = 0;

  while (stack.length > 0) {
    const cur = stack[stack.length - 1];
    const shuffled = dirs.slice().sort(() => Math.random() - 0.5);
    let carved = false;
    for (const [dr, dc] of shuffled) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr > 0 && nr < N - 1 && nc > 0 && nc < N - 1 && g[nr][nc] === 1) {
        g[cur.r + dr / 2][cur.c + dc / 2] = 0; g[nr][nc] = 0;
        stack.push({ r: nr, c: nc }); carved = true; break;
      }
    }
    if (!carved) stack.pop();
  }

  for (let k = 0; k < 8; k++) {
    const rr = 2 + Math.floor(Math.random() * (N - 6));
    const cc = 2 + Math.floor(Math.random() * (N - 6));
    if (Math.abs(rr - CENTER_TILE) < 6 && Math.abs(cc - CENTER_TILE) < 6) continue;
    for (let r = rr; r < rr + 3; r++) for (let c = cc; c < cc + 3; c++) g[r][c] = 0;
  }

  for (let r = 2; r < N - 2; r++) {
    for (let c = 2; c < N - 2; c++) {
      if (g[r][c] === 1) {
        const horiz = g[r][c - 1] === 0 && g[r][c + 1] === 0;
        const vert = g[r - 1][c] === 0 && g[r + 1][c] === 0;
        if ((horiz || vert) && Math.random() < 0.22) g[r][c] = 0;
      }
    }
  }

  for (let r = CENTER_TILE - 3; r <= CENTER_TILE + 3; r++) {
    for (let c = CENTER_TILE - 3; c <= CENTER_TILE + 3; c++) g[r][c] = 0;
  }
  for (let r = CENTER_TILE - 2; r <= CENTER_TILE + 2; r++) {
    for (let c = CENTER_TILE - 2; c <= CENTER_TILE + 2; c++) {
      const isEdgeR = (r === CENTER_TILE - 2 || r === CENTER_TILE + 2);
      const isEdgeC = (c === CENTER_TILE - 2 || c === CENTER_TILE + 2);
      if (isEdgeR && isEdgeC) g[r][c] = 1;
      else if (isEdgeR || isEdgeC) g[r][c] = 3;
      else g[r][c] = 2;
    }
  }

  for (let i = 0; i < N; i++) { g[0][i] = 1; g[N - 1][i] = 1; g[i][0] = 1; g[i][N - 1] = 1; }

  const visited = Array.from({ length: N }, () => Array(N).fill(false));
  const q = [{ r: CENTER_TILE, c: CENTER_TILE }];
  visited[CENTER_TILE][CENTER_TILE] = true;
  const d4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while (q.length > 0) {
    const cur = q.shift();
    for (const [dr, dc] of d4) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && !visited[nr][nc] && g[nr][nc] !== 1) {
        visited[nr][nc] = true; q.push({ r: nr, c: nc });
      }
    }
  }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c] !== 1 && !visited[r][c]) g[r][c] = 1;
  return g;
}

function encodeMapGrid(grid) { return grid.map(row => row.join('')); }
function decodeMapGrid(rows) { return rows.map(str => str.split('').map(Number)); }

function computeMapNavigationData(grid) {
  const N = grid.length;
  flowToCenter = Array.from({ length: N }, () => Array(N).fill(null));
  const visited = Array.from({ length: N }, () => Array(N).fill(false));
  const queue = [{ r: CENTER_TILE, c: CENTER_TILE }];
  visited[CENTER_TILE][CENTER_TILE] = true;
  flowToCenter[CENTER_TILE][CENTER_TILE] = { r: CENTER_TILE, c: CENTER_TILE };

  const d4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while (queue.length > 0) {
    const cur = queue.shift();
    for (const [dr, dc] of d4) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && !visited[nr][nc] && grid[nr][nc] !== 1) {
        visited[nr][nc] = true; flowToCenter[nr][nc] = { r: cur.r, c: cur.c }; queue.push({ r: nr, c: nc });
      }
    }
  }

  validFloorTiles = []; validHiderSpawns = [];
  for (let r = 1; r < N - 1; r++) {
    for (let c = 1; c < N - 1; c++) {
      if (grid[r][c] === 0) {
        const distFromCenter = Math.hypot(r - CENTER_TILE, c - CENTER_TILE);
        if (distFromCenter >= 5) validFloorTiles.push({ r, c });
        if (distFromCenter >= 9) validHiderSpawns.push({ r, c });
      }
    }
  }
}

function isSolidTileForPlayer(r, c, phase, player) {
  const N = activeMapGrid.length;
  if (N === 0 || r < 0 || r >= N || c < 0 || c >= N) return true;
  const t = activeMapGrid[r][c];
  if (t === 1) return true;
  if (t === 3 && (phase === 'prep' || player.status === 'jailed')) return true;
  return false;
}

function collidesWithMap(x, y, radius, phase, player) {
  const minC = Math.floor((x - radius) / TILE_SIZE), maxC = Math.floor((x + radius) / TILE_SIZE);
  const minR = Math.floor((y - radius) / TILE_SIZE), maxR = Math.floor((y + radius) / TILE_SIZE);
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (isSolidTileForPlayer(r, c, phase, player)) {
        const cx = Math.max(c * TILE_SIZE, Math.min(x, (c + 1) * TILE_SIZE));
        const cy = Math.max(r * TILE_SIZE, Math.min(y, (r + 1) * TILE_SIZE));
        if ((x - cx) ** 2 + (y - cy) ** 2 < radius * radius) return true;
      }
    }
  }
  return false;
}

function moveWithCollision(player, vx, vy, dt, phase) {
  const nx = player.x + vx * dt;
  if (!collidesWithMap(nx, player.y, PLAYER_RADIUS, phase, player)) player.x = nx;
  const ny = player.y + vy * dt;
  if (!collidesWithMap(player.x, ny, PLAYER_RADIUS, phase, player)) player.y = ny;
}

function hasLineOfSight(x1, y1, x2, y2) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.ceil(dist / 10);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const r = Math.floor((y1 + (y2 - y1) * t) / TILE_SIZE);
    const c = Math.floor((x1 + (x2 - x1) * t) / TILE_SIZE);
    if (r < 0 || r >= activeMapGrid.length || c < 0 || c >= activeMapGrid.length) return false;
    if (activeMapGrid[r][c] === 1) return false;
  }
  return true;
}

function castRayToWall(x, y, yaw, maxDist) {
  const fx = -Math.sin(yaw), fy = -Math.cos(yaw);
  const step = 8;
  for (let d = step; d <= maxDist; d += step) {
    const px = x + fx * d, py = y + fy * d;
    const r = Math.floor(py / TILE_SIZE), c = Math.floor(px / TILE_SIZE);
    if (r < 0 || r >= activeMapGrid.length || c < 0 || c >= activeMapGrid.length) return Math.max(0, d - step);
    if (activeMapGrid[r][c] === 1) return Math.max(0, d - step);
  }
  return maxDist;
}

function distPointToBeam(px, py, sx, sy, yaw, beamDist) {
  const fx = -Math.sin(yaw), fy = -Math.cos(yaw);
  const dx = px - sx, dy = py - sy;
  const proj = dx * fx + dy * fy;
  if (proj < -16 || proj > beamDist + 14) return Infinity;
  const clamped = Math.max(0, Math.min(beamDist, proj));
  return Math.hypot(px - (sx + fx * clamped), py - (sy + fy * clamped));
}

function isInRescueZone(x, y) {
  const min = (CENTER_TILE - 3.3) * TILE_SIZE, max = (CENTER_TILE + 4.3) * TILE_SIZE;
  return x >= min && x <= max && y >= min && y <= max;
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const gameCanvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1809);
scene.fog = new THREE.FogExp2(0x1b1809, 0.042);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 115);
camera.rotation.order = 'YXZ';
scene.add(camera);

const fpFlashlight = createFlashlightMesh(0.75);
fpFlashlight.position.set(0.36, -0.30, -0.58);
fpFlashlight.rotation.set(0.06, -0.14, 0);
fpFlashlight.visible = false;
camera.add(fpFlashlight);

const ambientLight = new THREE.AmbientLight(0xfff1c2, 0.72);
scene.add(ambientLight);
scene.add(new THREE.HemisphereLight(0xfff6d1, 0x4d431b, 0.45));

const playerFlashLight = new THREE.PointLight(0xfff2c6, 0.75, 18);
scene.add(playerFlashLight);

const seekerRedLight = new THREE.PointLight(0xff1a24, 3.2, SEEKER_LIGHT_RANGE, 1.45);
seekerRedLight.visible = false;
scene.add(seekerRedLight);

const centerLight = new THREE.PointLight(0xffdf6b, 1.4, 24);
centerLight.position.set((CENTER_TILE + 0.5) * 4, 3.0, (CENTER_TILE + 0.5) * 4);
scene.add(centerLight);

function createBackroomsWallTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#d8c56a'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#c5b054';
  for (let x = 0; x < 256; x += 24) {
    g.fillRect(x, 0, 8, 256); g.fillStyle = '#cbb75c';
    for (let y = 16; y < 256; y += 32) {
      g.beginPath(); g.moveTo(x + 16, y - 7); g.lineTo(x + 20, y); g.lineTo(x + 16, y + 7); g.lineTo(x + 12, y); g.closePath(); g.fill();
    }
    g.fillStyle = '#c5b054';
  }
  g.fillStyle = 'rgba(72, 60, 18, 0.14)'; g.fillRect(0, 185, 256, 55);
  g.fillStyle = '#52441b'; g.fillRect(0, 236, 256, 20);
  g.fillStyle = '#736129'; g.fillRect(0, 0, 256, 8);
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; return tex;
}

function createCarpetTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#9b8b47'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = Math.random() > 0.5 ? 'rgba(65,55,18,0.2)' : 'rgba(218,200,118,0.13)';
    g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
  }
  g.fillStyle = 'rgba(55,48,16,0.15)'; g.beginPath(); g.arc(90, 130, 52, 0, Math.PI * 2); g.fill();
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(MAP_SIZE, MAP_SIZE); return tex;
}

function createCeilingTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c4ba87'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#7d7550'; g.lineWidth = 4;
  g.strokeRect(2, 2, 124, 124); g.strokeRect(130, 2, 124, 124);
  g.strokeRect(2, 130, 124, 124); g.strokeRect(130, 130, 124, 124);
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(MAP_SIZE, MAP_SIZE); return tex;
}

const sharedWallMat = new THREE.MeshStandardMaterial({ map: createBackroomsWallTexture(), roughness: 0.85 });
const sharedFloorMat = new THREE.MeshStandardMaterial({ map: createCarpetTexture(), roughness: 0.92 });
const sharedCeilMat = new THREE.MeshStandardMaterial({ map: createCeilingTexture(), roughness: 0.85 });

let worldGroup = null, cageBarsGroup = null, cageBarMat = null, jailRing = null;
const minimapBaseCanvas = document.createElement('canvas'); minimapBaseCanvas.width = 160; minimapBaseCanvas.height = 160;

function rebuildMinimapBase(grid) {
  const N = grid.length, cell = minimapBaseCanvas.width / N;
  const g = minimapBaseCanvas.getContext('2d'); g.clearRect(0, 0, 160, 160);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const t = grid[r][c];
    if (t === 1) g.fillStyle = '#5c5228'; else if (t === 2) g.fillStyle = '#e3c852'; else g.fillStyle = '#1f1c0e';
    g.fillRect(c * cell, r * cell, cell + 0.35, cell + 0.35);
  }
}

function rebuildBackroomsWorld3D(grid) {
  if (worldGroup) scene.remove(worldGroup);
  worldGroup = new THREE.Group(); scene.add(worldGroup);
  const N = grid.length, worldW = N * 4, wallH = 3.6;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldW), sharedFloorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.set(worldW / 2, 0, worldW / 2); worldGroup.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldW), sharedCeilMat);
  ceil.rotation.x = Math.PI / 2; ceil.position.set(worldW / 2, wallH, worldW / 2); worldGroup.add(ceil);

  const wallPositions = [], lampPositions = [], gatePositions = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const t = grid[r][c], wx = (c + 0.5) * 4, wz = (r + 0.5) * 4;
    if (t === 1) wallPositions.push([wx, wz]);
    else { if (r % 2 === 1 && c % 2 === 1) lampPositions.push([wx, wz]); if (t === 3) gatePositions.push([wx, wz]); }
  }

  const dummy = new THREE.Object3D();
  const wallInst = new THREE.InstancedMesh(new THREE.BoxGeometry(4, wallH, 4), sharedWallMat, wallPositions.length);
  wallPositions.forEach(([wx, wz], i) => { dummy.position.set(wx, wallH / 2, wz); dummy.updateMatrix(); wallInst.setMatrixAt(i, dummy.matrix); });
  wallInst.instanceMatrix.needsUpdate = true; worldGroup.add(wallInst);

  const lampInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 0.08, 0.55), new THREE.MeshBasicMaterial({ color: 0xfffce0 }), lampPositions.length);
  lampPositions.forEach(([wx, wz], i) => { dummy.position.set(wx, wallH - 0.05, wz); dummy.updateMatrix(); lampInst.setMatrixAt(i, dummy.matrix); });
  lampInst.instanceMatrix.needsUpdate = true; worldGroup.add(lampInst);

  const cx = (CENTER_TILE + 0.5) * 4;
  const centerFloor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ color: 0x2d2b24, roughness: 0.78 }));
  centerFloor.rotation.x = -Math.PI / 2; centerFloor.position.set(cx, 0.02, cx); worldGroup.add(centerFloor);

  jailRing = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.3, 32), new THREE.MeshBasicMaterial({ color: 0xf0da75, side: THREE.DoubleSide }));
  jailRing.rotation.x = -Math.PI / 2; jailRing.position.set(cx, 0.04, cx); worldGroup.add(jailRing);

  const jailSign = createNameTagSprite('⛓️ LỒNG GIAM ⛓️', '#f0da75', 3.0, 0.72);
  jailSign.position.set(cx, 2.65, cx); worldGroup.add(jailSign);

  cageBarsGroup = new THREE.Group();
  const barGeo = new THREE.CylinderGeometry(0.075, 0.075, wallH, 8);
  cageBarMat = new THREE.MeshBasicMaterial({ color: 0xff4757, transparent: true, opacity: 0.82 });
  gatePositions.forEach(([wx, wz]) => {
    for (let offset = -1.2; offset <= 1.2; offset += 1.2) {
      const b1 = new THREE.Mesh(barGeo, cageBarMat); b1.position.set(wx + offset, wallH / 2, wz); cageBarsGroup.add(b1);
      const b2 = new THREE.Mesh(barGeo, cageBarMat); b2.position.set(wx, wallH / 2, wz + offset); cageBarsGroup.add(b2);
    }
  });
  worldGroup.add(cageBarsGroup);
  rebuildMinimapBase(grid);
}

const groundItemMeshes = {}, activeFlashBeams = [], activeBlasters3D = [], activeShadeSouls3D = [], activeVoidBursts3D = [], playerMeshes = {};

function createGroundItemMesh() {
  const grp = new THREE.Group();
  const fl = createFlashlightMesh(1.55); fl.position.y = 0.65; fl.rotation.x = 0.25; grp.add(fl);
  const glowRing = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.68, 20), new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.82 }));
  glowRing.rotation.x = -Math.PI / 2; glowRing.position.y = 0.05; grp.add(glowRing);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.45, 1.8, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
  beam.position.y = 0.9; grp.add(beam);
  grp.userData = { fl }; return grp;
}

function spawnFlashBeamEffect(x, y, yaw) {
  const length = FLASH_RANGE * WORLD_SCALE;
  const radius = Math.tan(FLASH_HALF_ANGLE) * length * 0.68;
  const geo = new THREE.ConeGeometry(radius, length, 22, 1, true);
  geo.translate(0, -length / 2, 0); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffe8, transparent: true, opacity: 0.56, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const cone = new THREE.Mesh(geo, mat); cone.position.set(x * WORLD_SCALE, 1.42, y * WORLD_SCALE); cone.rotation.y = yaw; scene.add(cone);
  const light = new THREE.PointLight(0xffffff, 3.6, Math.max(26, length * 1.15));
  light.position.set((x - Math.sin(yaw) * 65) * WORLD_SCALE, 1.65, (y - Math.cos(yaw) * 65) * WORLD_SCALE); scene.add(light);
  activeFlashBeams.push({ mesh: cone, light, life: 0.72, maxLife: 0.72 });
}

function spawnGasterBlaster3D(x, y, yaw, beamDist, chargeSec, beamSec) {
  const beamWorldLen = Math.max(1.5, beamDist * WORLD_SCALE);
  const mesh = createGasterBlasterMesh(beamWorldLen);
  mesh.position.set(x * WORLD_SCALE, 1.92, y * WORLD_SCALE);
  mesh.rotation.y = yaw;
  mesh.scale.set(0.15, 0.15, 0.15);
  scene.add(mesh);

  // Tính âm lượng theo khoảng cách tới đầu xương / đường tia laser (gần nghe cực đã, xa nhỏ dần)
  let vol = 0.96;
  if (localPlayer.initialized) {
    const dSkull = Math.hypot(localPlayer.x - x, localPlayer.y - y);
    const dLine = distPointToBeam(localPlayer.x, localPlayer.y, x, y, yaw, beamDist);
    const nearest = Math.min(dSkull, dLine);
    vol = Math.max(0.32, Math.min(1.0, 1.0 - (nearest / 1450) * 0.68));
  }
  playGasterBlasterSound(vol);

  activeBlasters3D.push({
    mesh,
    baseX: x * WORLD_SCALE,
    baseY: 1.92,
    baseZ: y * WORLD_SCALE,
    yaw,
    elapsed: 0,
    chargeSec: chargeSec || BLASTER_CHARGE_SEC,
    beamSec: beamSec || BLASTER_BEAM_SEC,
    beamShown: false
  });
}

function spawnShadeSoul3D(x, y, yaw, range, speed) {
  const r = range || SHADE_SOUL_RANGE;
  const spd = speed || SHADE_SOUL_SPEED;

  // 1. Hiệu ứng vòng nổ Hư Không đen-tím tại điểm phóng (giống ảnh mẫu)
  const burstMesh = createShadeSoulBurstMesh();
  burstMesh.position.set(x * WORLD_SCALE, 1.48, y * WORLD_SCALE);
  burstMesh.rotation.y = yaw;
  burstMesh.scale.set(0.35, 0.35, 0.35);
  scene.add(burstMesh);
  activeVoidBursts3D.push({ mesh: burstMesh, elapsed: 0, duration: 0.42 });

  // 2. Tinh linh Hư Không Shade Soul lao thẳng siêu xa xuyên tường
  const mesh = createShadeSoulMesh();
  mesh.position.set(x * WORLD_SCALE, 1.48, y * WORLD_SCALE);
  mesh.rotation.y = yaw;
  mesh.scale.set(0.45, 0.45, 0.45);
  scene.add(mesh);

  // Tính âm lượng theo khoảng cách gần nhất tới đường bay Shade Soul
  let vol = 0.96;
  if (localPlayer.initialized) {
    const dStart = Math.hypot(localPlayer.x - x, localPlayer.y - y);
    const dLine = distPointToBeam(localPlayer.x, localPlayer.y, x, y, yaw, r);
    const nearest = Math.min(dStart, dLine);
    vol = Math.max(0.32, Math.min(1.0, 1.0 - (nearest / 1450) * 0.68));
  }
  playShadeSoulSound(vol);

  activeShadeSouls3D.push({
    mesh,
    startX: x,
    startY: y,
    yaw,
    traveled: 0,
    range: r,
    speed: spd,
    elapsed: 0
  });
}

function syncPlayerMesh3D(p) {
  const existing = playerMeshes[p.id];
  const secChar = p.secretChar || (p.sansActive ? 'sans' : (p.knightActive ? 'knight' : null));
  const needRebuild = !existing || existing.skin !== p.skin || existing.hat !== p.hat || existing.role !== p.role || existing.secretChar !== secChar;
  if (needRebuild) {
    if (existing) { disposeNameTag(existing.nameTag); scene.remove(existing.mesh); }
    const charMesh = buildCharacterMesh(getSkinInfo(p.skin).hex, p.hat, p.role === 'seeker', p.role === 'hider', secChar);
    scene.add(charMesh);
    playerMeshes[p.id] = { mesh: charMesh, skin: p.skin, hat: p.hat, role: p.role, secretChar: secChar, tagKey: '', nameTag: null };
  }
  const entry = playerMeshes[p.id];
  const lockSec = p.status === 'jailed' ? Math.ceil(p.lockTimer || 0) : 0;
  const blindSec = p.blindTimer > 0 ? Math.ceil(p.blindTimer) : 0;
  const stunSec = p.stunTimer > 0 ? Math.ceil(p.stunTimer) : 0;
  const tagKey = `${p.status}|${lockSec}|${blindSec}|${stunSec}|${p.stunSource || ''}|${p.grace ? 1 : 0}|${secChar || ''}`;
  if (entry.tagKey !== tagKey) {
    entry.tagKey = tagKey;
    if (entry.nameTag) { entry.mesh.remove(entry.nameTag); disposeNameTag(entry.nameTag); }
    let label = p.name, color = '#ffffff';
    const stunCol = p.stunSource === 'knight' ? '#c4b5fd' : '#38bdf8';
    if (p.role === 'seeker') {
      if (stunSec > 0) { label = `[⚡ CHOÁNG ${stunSec}s] ${p.name}`; color = stunCol; }
      else if (blindSec > 0) { label = `[⚡ CHÓI ${blindSec}s] ${p.name}`; color = '#fde047'; }
      else { label = `[BẮT] ${p.name}`; color = (secChar === 'sans' ? '#38bdf8' : (secChar === 'knight' ? '#c4b5fd' : '#ff6b6b')); }
    }
    else if (p.status === 'jailed') { label = lockSec > 0 ? `[KHÓA ${lockSec}s] ${p.name}` : `[CỨU ĐƯỢC!] ${p.name}`; color = lockSec > 0 ? '#ff9f1c' : '#4ade80'; }
    else if (stunSec > 0) { label = `[⚡ CHOÁNG ${stunSec}s] ${p.name}`; color = stunCol; }
    else if (p.grace) { label = `[MIỄN NHIỄM] ${p.name}`; color = '#38bdf8'; }
    entry.nameTag = createNameTagSprite(label, color); entry.nameTag.visible = false; entry.mesh.add(entry.nameTag);
  }
  if (entry.mesh.userData.handItem) entry.mesh.userData.handItem.visible = !!(p.hasItem && p.status === 'alive');
  return entry;
}

let peer = null, isHost = false, myId = null, currentRoomCode = null;
let hostConn = null; const guestConns = {};
let hostRoom = null, hostLoopHandle = null, botCounter = 0, itemUidCounter = 0;

let configuredDuration = 180, gamePhase = 'lobby', gameTimer = 0;
let isFinalMinute = false, xrayActive = false, xrayCountdown = 0;
let renderPlayers = [], renderItems = []; const smoothPlayers = {};
let localPlayer = { x: 0, y: 0, tpSeq: -1, initialized: false, moving: false };
let lastPosSendMs = 0, swipeTipTimer = null;

const menuScreen = document.getElementById('menu-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const nameInput = document.getElementById('player-name');
const roomCodeInput = document.getElementById('room-code-input');
const menuError = document.getElementById('menu-error');
const lobbyError = document.getElementById('lobby-error');
const btnCreate = document.getElementById('btn-create');
const btnJoin = document.getElementById('btn-join');
const lobbyCodeEl = document.getElementById('lobby-room-code');
const btnDurMinus = document.getElementById('btn-dur-minus');
const btnDurPlus = document.getElementById('btn-dur-plus');
const durationDisplay = document.getElementById('duration-display');
const playerCountEl = document.getElementById('player-count');
const playerListEl = document.getElementById('player-list');
const hostBotControls = document.getElementById('host-bot-controls');
const btnStartGame = document.getElementById('btn-start-game');
const waitingHostText = document.getElementById('waiting-host-text');
const hudRole = document.getElementById('hud-role');
const hudTimer = document.getElementById('hud-timer');
const hudStats = document.getElementById('hud-stats');
const hudItemBadge = document.getElementById('hud-item-badge');
const hudXrayBadge = document.getElementById('hud-xray-badge');
const blindOverlay = document.getElementById('blind-overlay');
const blindCountdown = document.getElementById('blind-countdown');
const hudBlasterBadge = document.getElementById('hud-blaster-badge');
const hudShadeBadge = document.getElementById('hud-shade-badge');
const hudBoostBadge = document.getElementById('hud-boost-badge');
const stunOverlay = document.getElementById('stun-overlay');
const stunCountdown = document.getElementById('stun-countdown');
const caughtVignette = document.getElementById('caught-vignette');
const xrayVignette = document.getElementById('xray-vignette');
const boostVignette = document.getElementById('boost-vignette');
const pcLockHint = document.getElementById('pc-lock-hint');
const mobileSwipeTip = document.getElementById('mobile-swipe-tip');
const toastContainer = document.getElementById('toast-container');
const rescuePrompt = document.getElementById('rescue-prompt');
const flashPrompt = document.getElementById('flash-prompt');
const blasterPrompt = document.getElementById('blaster-prompt');
const shadePrompt = document.getElementById('shade-prompt');
const boostPrompt = document.getElementById('boost-prompt');
const mobileControls = document.getElementById('mobile-controls');
const btnMobileRescue = document.getElementById('btn-mobile-rescue');
const btnMobileFlash = document.getElementById('btn-mobile-flash');
const btnMobileBlaster = document.getElementById('btn-mobile-blaster');
const btnMobileShade = document.getElementById('btn-mobile-shade');
const btnMobileBoost = document.getElementById('btn-mobile-boost');
const endOverlay = document.getElementById('end-overlay');
const endPersonalTitle = document.getElementById('end-personal-title');
const endPersonalSub = document.getElementById('end-personal-sub');
const endResultsList = document.getElementById('end-results-list');
const btnBackLobby = document.getElementById('btn-back-lobby');
const endWaitHost = document.getElementById('end-wait-host');
const minimapCanvas = document.getElementById('minimap-canvas');
const mctx = minimapCanvas.getContext('2d');

// Chỉ mở khóa nhân vật ẩn khi nhập đúng tên bí mật ("sans" hoặc "knight")
nameInput.addEventListener('input', () => {
  const detected = detectSecretCharFromName(nameInput.value);
  setSecretCharState(detected, !!detected && detected !== activeSecretChar);
});

function showScreen(sc) {
  [menuScreen, lobbyScreen, gameScreen].forEach(s => s.classList.remove('active'));
  sc.classList.add('active');
  if (sc !== gameScreen && document.pointerLockElement) document.exitPointerLock();
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function showToast(message, style = 'info') {
  const el = document.createElement('div'); el.className = `toast ${style}`; el.textContent = message;
  toastContainer.appendChild(el); setTimeout(() => el.remove(), 4200);
}
function showTemporarySwipeTip() {
  if (!isTouchDevice) return; clearTimeout(swipeTipTimer);
  mobileSwipeTip.classList.remove('hidden'); mobileSwipeTip.style.opacity = '1';
  swipeTipTimer = setTimeout(hideSwipeTip, 3600);
}
function hideSwipeTip() {
  clearTimeout(swipeTipTimer); mobileSwipeTip.style.opacity = '0';
  setTimeout(() => mobileSwipeTip.classList.add('hidden'), 450);
}

function createPlayerObj(id, name, cosmetics, isBot = false) {
  const cleanName = (name || 'Người chơi').trim().slice(0, 14) || 'Người chơi';
  const secretWanted = isBot ? null : detectSecretCharFromName(cleanName);
  return {
    id, name: cleanName,
    skin: cosmetics?.skin || 'white', hat: cosmetics?.hat || 'none',
    wantsSans: secretWanted === 'sans',
    wantsKnight: secretWanted === 'knight',
    sansActive: false, knightActive: false, secretChar: null, isBot,
    x: (CENTER_TILE + 0.5) * TILE_SIZE, y: (CENTER_TILE + 0.5) * TILE_SIZE,
    yaw: 0, tpSeq: 0, role: 'hider', status: 'alive',
    lockTimer: 0, graceTimer: 0, blindTimer: 0, stunTimer: 0, stunSource: 'sans', blasterCooldown: 0, shadeCooldown: 0, boostTimer: 0, boostCooldown: 0, hasItem: false,
    input: { dx: 0, dy: 0 }, moving: false, botDir: { dx: 0, dy: 0 }, botThink: 0
  };
}

// Mỗi phòng chỉ tối đa 1 Sans và tối đa 1 Knight; nếu có >= 2 người nhập trùng tên ẩn thì chọn ngẫu nhiên đúng 1 người
function assignUniqueSecretsInRoom(forceReroll = false) {
  if (!hostRoom) return;
  const all = Object.values(hostRoom.players);

  const pickOneFor = (secretKey) => {
    const candidates = all.filter(p => !p.isBot && detectSecretCharFromName(p.name) === secretKey);
    const currentHolder = candidates.find(p => p.secretChar === secretKey);
    let chosen = null;
    if (candidates.length === 1) {
      chosen = candidates[0];
    } else if (candidates.length > 1) {
      chosen = (!forceReroll && currentHolder) ? currentHolder : candidates[Math.floor(Math.random() * candidates.length)];
    }
    return chosen ? chosen.id : null;
  };

  const sansHolderId = pickOneFor('sans');
  const knightHolderId = pickOneFor('knight');

  all.forEach(p => {
    p.sansActive = (p.id === sansHolderId);
    p.knightActive = (p.id === knightHolderId);
    p.secretChar = p.sansActive ? 'sans' : (p.knightActive ? 'knight' : null);
  });
}

function syncMyCosmeticsToRoom() {
  const secretWanted = detectSecretCharFromName(nameInput.value);
  if (isHost && hostRoom && hostRoom.players[myId]) {
    hostRoom.players[myId].skin = myCosmetics.skin;
    hostRoom.players[myId].hat = myCosmetics.hat;
    hostRoom.players[myId].wantsSans = (secretWanted === 'sans');
    hostRoom.players[myId].wantsKnight = (secretWanted === 'knight');
    assignUniqueSecretsInRoom(false);
    if (hostRoom.phase === 'lobby') hostEmitLobby();
  } else if (hostConn && hostConn.open) {
    hostConn.send({
      type: 'cosmetics', skin: myCosmetics.skin, hat: myCosmetics.hat,
      wantsSans: secretWanted === 'sans', wantsKnight: secretWanted === 'knight'
    });
  }
}

function hostBroadcast(packet) {
  handleClientPacket(packet);
  for (const pid in guestConns) if (guestConns[pid] && guestConns[pid].open) guestConns[pid].send(packet);
}
function hostSendTo(pid, packet) {
  if (pid === myId) handleClientPacket(packet);
  else if (guestConns[pid] && guestConns[pid].open) guestConns[pid].send(packet);
}
function hostEmitLobby() {
  if (!hostRoom) return;
  assignUniqueSecretsInRoom(false);
  hostBroadcast({
    type: 'lobbyUpdate', code: hostRoom.code, hostId: hostRoom.hostId,
    phase: hostRoom.phase, matchDuration: hostRoom.matchDuration,
    players: Object.values(hostRoom.players).map(p => ({
      id: p.id, name: p.name, skin: p.skin, hat: p.hat,
      sansActive: !!p.sansActive, knightActive: !!p.knightActive, secretChar: p.secretChar || null, isBot: p.isBot
    }))
  });
}

function hostMaintainFlashlights() {
  if (!hostRoom || validFloorTiles.length === 0) return;
  const heldCount = Object.values(hostRoom.players).filter(p => p.hasItem).length;
  const need = MAX_ITEMS_TOTAL - (hostRoom.items.length + heldCount);
  for (let i = 0; i < need; i++) {
    let bestTile = null;
    for (let attempt = 0; attempt < 25; attempt++) {
      const cand = validFloorTiles[Math.floor(Math.random() * validFloorTiles.length)];
      const cx = (cand.c + 0.5) * TILE_SIZE, cy = (cand.r + 0.5) * TILE_SIZE;
      const closeItem = hostRoom.items.some(it => Math.hypot(it.x - cx, it.y - cy) < TILE_SIZE * 5);
      const closePl = Object.values(hostRoom.players).some(p => Math.hypot(p.x - cx, p.y - cy) < TILE_SIZE * 2.5);
      if (!closeItem && !closePl) { bestTile = { x: cx, y: cy }; break; }
    }
    if (!bestTile) {
      const fb = validFloorTiles[Math.floor(Math.random() * validFloorTiles.length)];
      bestTile = { x: (fb.c + 0.5) * TILE_SIZE, y: (fb.r + 0.5) * TILE_SIZE };
    }
    itemUidCounter++;
    hostRoom.items.push({ id: 'fl-' + itemUidCounter, x: Math.round(bestTile.x), y: Math.round(bestTile.y) });
  }
}

function hostFinalizeMatch(endReason, seekerWonAll) {
  if (!hostRoom || hostRoom.phase === 'ended') return;
  hostRoom.phase = 'ended';
  const players = Object.values(hostRoom.players);
  const survivors = players.filter(p => p.role === 'hider' && p.status === 'alive').length;
  const results = players.map(p => {
    if (p.role === 'seeker') {
      return seekerWonAll
        ? { id: p.id, name: p.name, role: 'seeker', outcome: 'win', detail: 'THẮNG (Bắt sạch toàn bộ)' }
        : { id: p.id, name: p.name, role: 'seeker', outcome: 'lose', detail: `THUA (Còn ${survivors} người sống sót)` };
    }
    if (!seekerWonAll && p.status === 'alive') return { id: p.id, name: p.name, role: 'hider', outcome: 'win', detail: 'THẮNG (Sống sót hết giờ)' };
    if (p.status === 'jailed') return { id: p.id, name: p.name, role: 'hider', outcome: 'lose', detail: 'THUA (Bị nhốt trong Lồng)' };
    return { id: p.id, name: p.name, role: 'hider', outcome: 'lose', detail: 'THUA (Bị bắt phút cuối)' };
  });
  hostBroadcast({ type: 'gameEnded', endReason, seekerWonAll, results });
}

function hostCheckMatchEnd() {
  if (!hostRoom || hostRoom.phase !== 'playing') return;
  const players = Object.values(hostRoom.players);
  const seeker = players.find(p => p.role === 'seeker');
  const hiders = players.filter(p => p.role === 'hider');
  if (!seeker) { hostFinalizeMatch('Người Bắt đã rời khỏi phòng!', false); return; }
  if (hiders.length === 0) { hostFinalizeMatch('Không còn Người Chạy nào trong mê cung!', true); return; }
  if (hiders.every(h => h.status !== 'alive')) hostFinalizeMatch(`👹 ${seeker.name} đã bắt toàn bộ Người Chạy và CHIẾN THẮNG!`, true);
}

function hostAcceptGuestPos(playerId, msg) {
  if (!hostRoom) return;
  const p = hostRoom.players[playerId];
  if (!p || p.isBot || msg.tpSeq !== p.tpSeq) return;
  if (typeof msg.yaw === 'number' && !Number.isNaN(msg.yaw)) p.yaw = msg.yaw;
  if (p.stunTimer > 0) { p.moving = false; return; }
  if (typeof msg.moving === 'boolean') p.moving = msg.moving;
  if (typeof msg.x === 'number' && typeof msg.y === 'number') {
    const physPhase = p.status === 'eliminated' ? 'playing' : hostRoom.phase;
    if (Math.hypot(msg.x - p.x, msg.y - p.y) < 520 && !collidesWithMap(msg.x, msg.y, PLAYER_RADIUS - 1.5, physPhase, p)) {
      p.x = msg.x; p.y = msg.y;
    }
  }
}

function hostHandleRescue(playerId, msg) {
  if (!hostRoom || hostRoom.phase !== 'playing') return;
  if (msg) hostAcceptGuestPos(playerId, msg);
  const rescuer = hostRoom.players[playerId];
  if (!rescuer || rescuer.role !== 'hider' || rescuer.status !== 'alive' || !isInRescueZone(rescuer.x, rescuer.y)) return;
  const rescuable = Object.values(hostRoom.players).filter(h => h.role === 'hider' && h.status === 'jailed' && h.lockTimer <= 0);
  if (rescuable.length > 0) {
    const names = rescuable.map(h => {
      h.status = 'alive'; h.lockTimer = 0; h.graceTimer = 3.5; h.x = rescuer.x; h.y = rescuer.y; h.tpSeq++; return h.name;
    });
    hostBroadcast({ type: 'toast', message: `🔓 ${rescuer.name} đã GIẢI CỨU ${names.join(', ')} khỏi Lồng Giam!`, style: 'success' });
  }
}

function hostHandleUseFlashlight(playerId, msg) {
  if (!hostRoom || (hostRoom.phase !== 'playing' && hostRoom.phase !== 'prep')) return;
  if (msg) hostAcceptGuestPos(playerId, msg);
  const user = hostRoom.players[playerId];
  if (!user || user.role !== 'hider' || user.status !== 'alive' || !user.hasItem) return;

  user.hasItem = false;
  hostBroadcast({ type: 'flashEffect', x: user.x, y: user.y, yaw: user.yaw });

  const seeker = Object.values(hostRoom.players).find(p => p.role === 'seeker');
  let hitSeeker = false;
  if (seeker) {
    const dx = seeker.x - user.x, dy = seeker.y - user.y, dist = Math.hypot(dx, dy);
    if (dist <= FLASH_RANGE) {
      const fx = -Math.sin(user.yaw), fy = -Math.cos(user.yaw);
      const dot = dist > 1 ? (dx * fx + dy * fy) / dist : 1;
      if (dot >= Math.cos(FLASH_HALF_ANGLE) && hasLineOfSight(user.x, user.y, seeker.x, seeker.y)) {
        hitSeeker = true; seeker.blindTimer = BLIND_DURATION;
        hostBroadcast({ type: 'toast', message: `⚡ ${user.name} chiếu ĐÈN PIN làm chói mắt ${seeker.name} trong ${BLIND_DURATION}s!`, style: 'success' });
      }
    }
  }
  if (!hitSeeker) hostSendTo(playerId, { type: 'toast', message: '🔦 Đã chiếu đèn pin nhưng không trúng Người Bắt!', style: 'info' });
  hostMaintainFlashlights();
}

function hostHandleBlaster(playerId, msg) {
  if (!hostRoom || hostRoom.phase !== 'playing') return;
  if (msg) hostAcceptGuestPos(playerId, msg);
  const p = hostRoom.players[playerId];
  const canCastRole = p && (p.role === 'seeker' || (p.role === 'hider' && p.status === 'alive'));
  if (!canCastRole || !p.sansActive || p.blasterCooldown > 0 || p.stunTimer > 0) return;

  p.blasterCooldown = BLASTER_COOLDOWN;
  const nearWall = castRayToWall(p.x, p.y, p.yaw, 46);
  const fx = -Math.sin(p.yaw), fy = -Math.cos(p.yaw);
  const spawnOffset = Math.min(32, Math.max(6, nearWall - 12));
  const bx = p.x + fx * spawnOffset;
  const by = p.y + fy * spawnOffset;
  const beamDist = BLASTER_RANGE;

  if (!hostRoom.activeBlasters) hostRoom.activeBlasters = [];
  hostRoom.activeBlasters.push({
    casterId: p.id,
    casterRole: p.role,
    x: bx, y: by, yaw: p.yaw, beamDist,
    elapsed: 0,
    chargeSec: BLASTER_CHARGE_SEC,
    beamSec: BLASTER_BEAM_SEC,
    hitIds: new Set()
  });

  hostBroadcast({
    type: 'blasterEffect',
    x: Math.round(bx * 10) / 10,
    y: Math.round(by * 10) / 10,
    yaw: Number(p.yaw.toFixed(3)),
    beamDist: Math.round(beamDist),
    chargeSec: BLASTER_CHARGE_SEC,
    beamSec: BLASTER_BEAM_SEC
  });
}

function hostHandleShadeSoul(playerId, msg) {
  if (!hostRoom || hostRoom.phase !== 'playing') return;
  if (msg) hostAcceptGuestPos(playerId, msg);
  const p = hostRoom.players[playerId];
  const canCastRole = p && (p.role === 'seeker' || (p.role === 'hider' && p.status === 'alive'));
  if (!canCastRole || !p.knightActive || p.shadeCooldown > 0 || p.stunTimer > 0) return;

  p.shadeCooldown = SHADE_SOUL_COOLDOWN;
  const fx = -Math.sin(p.yaw), fy = -Math.cos(p.yaw);
  const sx = p.x + fx * 22;
  const sy = p.y + fy * 22;

  if (!hostRoom.activeShadeSouls) hostRoom.activeShadeSouls = [];
  hostRoom.activeShadeSouls.push({
    casterId: p.id,
    casterRole: p.role,
    x: sx, y: sy, yaw: p.yaw,
    fx, fy,
    traveled: 0,
    range: SHADE_SOUL_RANGE,
    speed: SHADE_SOUL_SPEED,
    hitIds: new Set()
  });

  hostBroadcast({
    type: 'shadeSoulEffect',
    x: Math.round(sx * 10) / 10,
    y: Math.round(sy * 10) / 10,
    yaw: Number(p.yaw.toFixed(3)),
    range: SHADE_SOUL_RANGE,
    speed: SHADE_SOUL_SPEED
  });
}

function getSeekerMoveSpeed(seekerObj, inFinalMin) {
  if (inFinalMin) return SEEKER_FINAL_SPEED;
  const isHidden = !!(seekerObj && (seekerObj.secretChar || seekerObj.sansActive || seekerObj.knightActive));
  if (seekerObj && !isHidden && seekerObj.boostTimer > 0) return SEEKER_BOOST_SPEED;
  return SEEKER_SPEED;
}

function hostHandleSeekerBoost(playerId, msg) {
  if (!hostRoom || hostRoom.phase !== 'playing') return;
  if (hostRoom.timer <= FINAL_MINUTE_SEC) return; // Vào 1 phút cuối đã xóa kỹ năng tăng tốc
  if (msg) hostAcceptGuestPos(playerId, msg);
  const p = hostRoom.players[playerId];
  const isHidden = !!(p && (p.secretChar || p.sansActive || p.knightActive));
  if (!p || p.role !== 'seeker' || isHidden || p.boostCooldown > 0 || p.boostTimer > 0 || p.stunTimer > 0) return;

  p.boostTimer = SEEKER_BOOST_DURATION;
  p.boostCooldown = SEEKER_BOOST_COOLDOWN;
  hostSendTo(playerId, { type: 'boostSound' });
  hostBroadcast({
    type: 'toast',
    message: `⚡ Người Bắt ${p.name} kích hoạt TĂNG TỐC trong ${SEEKER_BOOST_DURATION} giây!`,
    style: 'warning'
  });
}

function updateBotAI(bot, players, seeker, dt, xrayOn) {
  if (bot.stunTimer > 0) { bot.input = { dx: 0, dy: 0 }; return; }
  bot.botThink -= dt;
  if (bot.role === 'seeker') {
    if (hostRoom.phase === 'prep') { bot.input = { dx: 0, dy: 0 }; return; }
    if (bot.blindTimer > 0) {
      if (bot.botThink <= 0) { bot.botThink = 0.6; const a = Math.random() * Math.PI * 2; bot.botDir = { dx: Math.cos(a) * 0.45, dy: Math.sin(a) * 0.45 }; }
      bot.input = { ...bot.botDir }; return;
    }
    let target = null, bestD = Infinity;
    const visionRange = xrayOn ? 9999 : 400;
    players.forEach(p => {
      if (p.role === 'hider' && p.status === 'alive' && p.graceTimer <= 0) {
        const d = Math.hypot(p.x - bot.x, p.y - bot.y);
        if (d < bestD && d < visionRange && (xrayOn || hasLineOfSight(bot.x, bot.y, p.x, p.y))) { bestD = d; target = p; }
      }
    });
    if (target) {
      bot.input = { dx: (target.x - bot.x) / (bestD || 1), dy: (target.y - bot.y) / (bestD || 1) };
      if (hostRoom.timer > FINAL_MINUTE_SEC && bot.boostCooldown <= 0 && bot.boostTimer <= 0 && bestD > 90 && bestD < 360) {
        hostHandleSeekerBoost(bot.id, null);
      }
    }
    else if (bot.botThink <= 0) {
      bot.botThink = 1.0 + Math.random(); const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      bot.botDir = { dx: dirs[Math.floor(Math.random() * 4)][0], dy: dirs[Math.floor(Math.random() * 4)][1] };
      bot.input = { ...bot.botDir };
    } else bot.input = { ...bot.botDir };
    if (Math.hypot(bot.input.dx, bot.input.dy) > 0.1) bot.yaw = Math.atan2(-bot.input.dx, -bot.input.dy);
  } else if (bot.status === 'alive') {
    if (bot.hasItem && seeker && seeker.blindTimer <= 0) {
      const distS = Math.hypot(seeker.x - bot.x, seeker.y - bot.y);
      if (distS < FLASH_RANGE * 0.8 && hasLineOfSight(bot.x, bot.y, seeker.x, seeker.y)) {
        bot.yaw = Math.atan2(-(seeker.x - bot.x), -(seeker.y - bot.y)); hostHandleUseFlashlight(bot.id, null); return;
      }
    }
    if (seeker && Math.hypot(seeker.x - bot.x, seeker.y - bot.y) < 260) {
      const dx = bot.x - seeker.x, dy = bot.y - seeker.y, d = Math.hypot(dx, dy) || 1;
      bot.input = { dx: dx / d, dy: dy / d }; bot.yaw = Math.atan2(-bot.input.dx, -bot.input.dy); return;
    }
    const needRescue = players.some(p => p.role === 'hider' && p.status === 'jailed' && p.lockTimer <= 0);
    const seekerNearCenter = seeker && Math.hypot(seeker.x - (CENTER_TILE + 0.5) * TILE_SIZE, seeker.y - (CENTER_TILE + 0.5) * TILE_SIZE) < 270;
    if (hostRoom.phase === 'playing' && needRescue && !seekerNearCenter) {
      if (isInRescueZone(bot.x, bot.y)) { hostHandleRescue(bot.id, null); return; }
      const r = Math.max(0, Math.min(MAP_SIZE - 1, Math.floor(bot.y / TILE_SIZE))), c = Math.max(0, Math.min(MAP_SIZE - 1, Math.floor(bot.x / TILE_SIZE)));
      const nxt = flowToCenter[r]?.[c] || { r: CENTER_TILE, c: CENTER_TILE };
      const dx = (nxt.c + 0.5) * TILE_SIZE - bot.x, dy = (nxt.r + 0.5) * TILE_SIZE - bot.y, d = Math.hypot(dx, dy) || 1;
      bot.input = { dx: dx / d, dy: dy / d }; bot.yaw = Math.atan2(-bot.input.dx, -bot.input.dy); return;
    }
    if (bot.botThink <= 0) {
      bot.botThink = 1.0 + Math.random() * 1.4; const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      const pick = dirs[Math.floor(Math.random() * 4)]; bot.botDir = { dx: pick[0], dy: pick[1] };
    }
    bot.input = { ...bot.botDir };
    if (Math.hypot(bot.input.dx, bot.input.dy) > 0.1) bot.yaw = Math.atan2(-bot.input.dx, -bot.input.dy);
  } else bot.input = { dx: 0, dy: 0 };
}

function startHostGameLoop() {
  if (hostLoopHandle) hostLoopHandle.stop();
  let lastTick = performance.now();
  hostLoopHandle = createBackgroundSafeLoop(() => {
    const nowMs = performance.now();
    const DT = Math.min(0.1, Math.max(0.005, (nowMs - lastTick) / 1000)); lastTick = nowMs;
    if (!hostRoom || (hostRoom.phase !== 'prep' && hostRoom.phase !== 'playing')) return;

    hostRoom.timer -= DT;
    if (hostRoom.phase === 'prep' && hostRoom.timer <= 0) {
      hostRoom.phase = 'playing'; hostRoom.timer = hostRoom.matchDuration; hostRoom.finalMinuteAlerted = false;
      hostBroadcast({ type: 'toast', message: '🚨 LỒNG ĐÃ MỞ! Hãy chú ý ánh sáng đỏ của Người Bắt!', style: 'danger' });
    } else if (hostRoom.phase === 'playing') {
      if (hostRoom.timer <= FINAL_MINUTE_SEC && !hostRoom.finalMinuteAlerted) {
        hostRoom.finalMinuteAlerted = true;
        Object.values(hostRoom.players).forEach(pl => { pl.boostTimer = 0; });
        hostBroadcast({ type: 'toast', message: `👁️ 1 PHÚT CUỐI! Người Bắt tăng tốc cố định & Đôi Mắt Thấu Thị nháy ${XRAY_ON_SEC}s/${XRAY_OFF_SEC}s!`, style: 'danger' });
      }
      if (hostRoom.timer <= 0) { hostRoom.timer = 0; hostFinalizeMatch('⏱️ HẾT GIỜ! Những Người Chạy còn sống sót đã chiến thắng!', false); return; }
    }

    const inFinalMin = (hostRoom.phase === 'playing' && hostRoom.timer <= FINAL_MINUTE_SEC);
    let pulseOn = false, pulseCountdown = 0;
    if (inFinalMin) {
      const mod = Math.max(0, FINAL_MINUTE_SEC - hostRoom.timer) % XRAY_CYCLE_SEC;
      if (mod < XRAY_ON_SEC) { pulseOn = true; pulseCountdown = Number((XRAY_ON_SEC - mod).toFixed(1)); }
      else { pulseOn = false; pulseCountdown = Math.ceil(XRAY_CYCLE_SEC - mod); }
    }

    const players = Object.values(hostRoom.players), seeker = players.find(p => p.role === 'seeker');
    for (const p of players) {
      if (p.graceTimer > 0) p.graceTimer = Math.max(0, p.graceTimer - DT);
      if (p.blindTimer > 0) p.blindTimer = Math.max(0, p.blindTimer - DT);
      if (p.stunTimer > 0) p.stunTimer = Math.max(0, p.stunTimer - DT);
      if (p.blasterCooldown > 0) p.blasterCooldown = Math.max(0, p.blasterCooldown - DT);
      if (p.shadeCooldown > 0) p.shadeCooldown = Math.max(0, p.shadeCooldown - DT);
      if (inFinalMin) { p.boostTimer = 0; }
      else if (p.boostTimer > 0) { p.boostTimer = Math.max(0, p.boostTimer - DT); }
      if (p.boostCooldown > 0) p.boostCooldown = Math.max(0, p.boostCooldown - DT);
      if (p.status === 'jailed' && p.lockTimer > 0) {
        const prev = Math.ceil(p.lockTimer); p.lockTimer = Math.max(0, p.lockTimer - DT);
        if (prev > 0 && p.lockTimer === 0) hostBroadcast({ type: 'toast', message: `🔓 ${p.name} đã hết ${JAIL_LOCK_SECONDS}s khóa! Có thể CỨU!`, style: 'success' });
      }
      if (p.isBot && (p.status === 'alive' || p.status === 'seeking')) {
        const px = p.x, py = p.y; updateBotAI(p, players, seeker, DT, pulseOn);
        const botSpd = p.role === 'seeker' ? getSeekerMoveSpeed(p, inFinalMin) : HIDER_SPEED; moveWithCollision(p, p.input.dx * botSpd, p.input.dy * botSpd, DT, hostRoom.phase);
        p.moving = Math.hypot(p.x - px, p.y - py) > 0.5;
      }
      if (p.role === 'hider' && p.status === 'alive' && !p.hasItem && !p.secretChar) {
        for (let i = hostRoom.items.length - 1; i >= 0; i--) {
          const it = hostRoom.items[i];
          if (Math.hypot(p.x - it.x, p.y - it.y) < 36) {
            p.hasItem = true; hostRoom.items.splice(i, 1);
            hostSendTo(p.id, { type: 'toast', message: `🔦 Đã nhặt ĐÈN PIN! Chiếu làm chói Người Bắt ${BLIND_DURATION}s!`, style: 'success' }); break;
          }
        }
      }
    }

    if (hostRoom.phase === 'playing' && seeker && seeker.blindTimer <= 0 && seeker.stunTimer <= 0) {
      for (const h of players) {
        if (h.role === 'hider' && h.status === 'alive' && h.graceTimer <= 0 && Math.hypot(seeker.x - h.x, seeker.y - h.y) < PLAYER_RADIUS * 2.25) {
          h.stunTimer = 0;
          if (h.hasItem) { h.hasItem = false; hostMaintainFlashlights(); }
          if (inFinalMin) {
            h.status = 'eliminated'; h.lockTimer = 0; h.tpSeq++;
            hostBroadcast({ type: 'toast', message: `💀 [PHÚT CUỐI] ${h.name} bị ${seeker.name} bắt và THUA NGAY!`, style: 'danger' });
          } else {
            h.status = 'jailed'; h.lockTimer = JAIL_LOCK_SECONDS; const a = Math.random() * Math.PI * 2;
            h.x = (CENTER_TILE + 0.5) * TILE_SIZE + Math.cos(a) * 28; h.y = (CENTER_TILE + 0.5) * TILE_SIZE + Math.sin(a) * 28; h.tpSeq++;
            hostBroadcast({ type: 'toast', message: `⛓️ ${h.name} bị đưa vào Lồng Giam! Khóa cứu ${JAIL_LOCK_SECONDS}s!`, style: 'warning' });
          }
          hostCheckMatchEnd();
        }
      }
    }

    // Xử lý va chạm tia Gaster Blaster của Sans (cả 2 phe, xuyên tường, choáng đứng im 5s)
    if (hostRoom.phase === 'playing' && hostRoom.activeBlasters && hostRoom.activeBlasters.length > 0) {
      for (let bi = hostRoom.activeBlasters.length - 1; bi >= 0; bi--) {
        const b = hostRoom.activeBlasters[bi];
        b.elapsed += DT;
        if (b.elapsed >= b.chargeSec && b.elapsed <= b.chargeSec + b.beamSec) {
          for (const target of players) {
            if (target.id === b.casterId || b.hitIds.has(target.id)) continue;
            const validTarget = (b.casterRole === 'seeker')
              ? (target.role === 'hider' && target.status === 'alive' && target.graceTimer <= 0)
              : (target.role === 'seeker');
            if (validTarget) {
              const dBeam = distPointToBeam(target.x, target.y, b.x, b.y, b.yaw, b.beamDist);
              if (dBeam <= BLASTER_HIT_WIDTH + PLAYER_RADIUS) {
                b.hitIds.add(target.id);
                target.stunTimer = BLASTER_STUN_DURATION;
                target.stunSource = 'sans';
                target.moving = false;
                target.tpSeq++;
                hostSendTo(target.id, { type: 'stunnedSound' });
                hostBroadcast({
                  type: 'toast',
                  message: target.role === 'seeker'
                    ? `⚡ Người Bắt ${target.name} trúng tia năng lượng và bị CHOÁNG đứng im ${BLASTER_STUN_DURATION} giây!`
                    : `⚡ ${target.name} trúng tia năng lượng và bị CHOÁNG đứng im ${BLASTER_STUN_DURATION} giây!`,
                  style: target.role === 'seeker' ? 'success' : 'danger'
                });
              }
            }
          }
        }
        if (b.elapsed >= b.chargeSec + b.beamSec + 0.35) {
          hostRoom.activeBlasters.splice(bi, 1);
        }
      }
    }

    // Xử lý va chạm Shade Soul của The Knight (cả 2 phe, siêu xa xuyên tường, choáng đứng im 5s)
    if (hostRoom.phase === 'playing' && hostRoom.activeShadeSouls && hostRoom.activeShadeSouls.length > 0) {
      for (let si = hostRoom.activeShadeSouls.length - 1; si >= 0; si--) {
        const s = hostRoom.activeShadeSouls[si];
        const stepDist = Math.min(s.speed * DT, s.range - s.traveled);
        const prevX = s.x, prevY = s.y;
        s.x += s.fx * stepDist;
        s.y += s.fy * stepDist;
        s.traveled += stepDist;

        for (const target of players) {
          if (target.id === s.casterId || s.hitIds.has(target.id)) continue;
          const validTarget = (s.casterRole === 'seeker')
            ? (target.role === 'hider' && target.status === 'alive' && target.graceTimer <= 0)
            : (target.role === 'seeker');
          if (validTarget) {
            const dSeg = distPointToBeam(target.x, target.y, prevX, prevY, s.yaw, Math.max(1, stepDist));
            if (dSeg <= SHADE_SOUL_HIT_RADIUS + PLAYER_RADIUS) {
              s.hitIds.add(target.id);
              target.stunTimer = SHADE_SOUL_STUN_DURATION;
              target.stunSource = 'knight';
              target.moving = false;
              target.tpSeq++;
              hostSendTo(target.id, { type: 'stunnedSound' });
              hostBroadcast({
                type: 'toast',
                message: target.role === 'seeker'
                  ? `🌑 Người Bắt ${target.name} trúng Shade Soul và bị CHOÁNG đứng im ${SHADE_SOUL_STUN_DURATION} giây!`
                  : `🌑 ${target.name} trúng Shade Soul và bị CHOÁNG đứng im ${SHADE_SOUL_STUN_DURATION} giây!`,
                style: target.role === 'seeker' ? 'success' : 'danger'
              });
            }
          }
        }

        if (s.traveled >= s.range) {
          hostRoom.activeShadeSouls.splice(si, 1);
        }
      }
    }

    hostBroadcast({
      type: 'gameState', phase: hostRoom.phase, timer: Math.ceil(hostRoom.timer),
      isFinalMinute: inFinalMin, xrayActive: pulseOn, xrayCountdown: pulseCountdown, items: hostRoom.items,
      players: players.map(p => ({
        id: p.id, name: p.name, skin: p.skin, hat: p.hat, sansActive: !!p.sansActive, knightActive: !!p.knightActive, secretChar: p.secretChar || null,
        x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10, yaw: Number(p.yaw.toFixed(2)),
        tpSeq: p.tpSeq, role: p.role, status: p.status, lockTimer: Math.ceil(p.lockTimer),
        blindTimer: Number(p.blindTimer.toFixed(1)),
        stunTimer: Number(p.stunTimer.toFixed(1)),
        stunSource: p.stunSource || 'sans',
        blasterCd: Math.ceil(p.blasterCooldown),
        shadeCd: Math.ceil(p.shadeCooldown),
        boostTimer: Number(p.boostTimer.toFixed(1)),
        boostCd: Math.ceil(p.boostCooldown),
        hasItem: p.hasItem, grace: p.graceTimer > 0, moving: p.moving
      }))
    });
  }, 1000 / 30);
}

function handleClientPacket(data) {
  if (!data || !data.type) return;
  if (data.type === 'lobbyUpdate') {
    gamePhase = data.phase; currentRoomCode = data.code; configuredDuration = data.matchDuration || 180;
    lobbyCodeEl.textContent = data.code; durationDisplay.textContent = formatClock(configuredDuration);
    endOverlay.classList.add('hidden'); blindOverlay.style.opacity = '0'; stunOverlay.classList.add('hidden'); boostVignette.classList.add('hidden'); seekerRedLight.visible = false;
    stopGameBgm();
    showScreen(lobbyScreen);

    const meLobby = data.players.find(p => p.id === myId);
    const myAssignedSecret = meLobby ? (meLobby.secretChar || (meLobby.sansActive ? 'sans' : (meLobby.knightActive ? 'knight' : null))) : null;
    if (myAssignedSecret !== activeSecretChar) {
      activeSecretChar = myAssignedSecret;
      updateWardrobeLockUI();
    }
    refreshPreviewModels();

    playerCountEl.textContent = data.players.length; playerListEl.innerHTML = '';
    data.players.forEach(p => {
      const li = document.createElement('li');
      const meTag = p.id === myId ? ' (Bạn)' : '';
      // Nhân vật ẩn được giấu kín và không hiển thị tên phụ kiện (mũ/mặt nạ) kế tên
      const isSecretPlayer = !!(p.secretChar || p.sansActive || p.knightActive);
      const sk = getSkinInfo(p.skin);
      const hatObj = HATS.find(h => h.id === p.hat);
      const hatLabel = (!isSecretPlayer && hatObj && hatObj.id !== 'none') ? ` · ${hatObj.name}` : '';
      let badge = '';
      if (p.id === data.hostId) badge = '<span class="host-badge">★ Chủ phòng</span>';
      else if (p.isBot) badge = '<span class="bot-badge">BOT</span>';
      li.innerHTML = `<span class="p-meta"><span class="p-swatch" style="background:${sk.css}"></span><span>${escapeHtml(p.name)}${meTag}<small style="color:#a89a64">${hatLabel}</small></span></span>${badge}`;
      playerListEl.appendChild(li);
    });
    btnStartGame.classList.toggle('hidden', !isHost); hostBotControls.classList.toggle('hidden', !isHost);
    btnDurMinus.classList.toggle('hidden', !isHost); btnDurPlus.classList.toggle('hidden', !isHost);
    waitingHostText.classList.toggle('hidden', isHost);
  } else if (data.type === 'gameStarted') {
    gamePhase = data.phase; gameTimer = data.timer; isFinalMinute = false; xrayActive = false;
    endOverlay.classList.add('hidden'); settingsOverlay.classList.add('hidden');
    camYaw = 0; camPitch = 0; localPlayer = { x: 0, y: 0, tpSeq: -1, initialized: false, moving: false };
    activeMapGrid = decodeMapGrid(data.mapRows);
    if (!isHost) computeMapNavigationData(activeMapGrid);
    rebuildBackroomsWorld3D(activeMapGrid);
    for (const id in playerMeshes) { disposeNameTag(playerMeshes[id].nameTag); scene.remove(playerMeshes[id].mesh); delete playerMeshes[id]; }
    for (const id in groundItemMeshes) { scene.remove(groundItemMeshes[id]); delete groundItemMeshes[id]; }
    for (let i = activeBlasters3D.length - 1; i >= 0; i--) { scene.remove(activeBlasters3D[i].mesh); disposeObject3D(activeBlasters3D[i].mesh); }
    activeBlasters3D.length = 0;
    for (let i = activeShadeSouls3D.length - 1; i >= 0; i--) { scene.remove(activeShadeSouls3D[i].mesh); disposeObject3D(activeShadeSouls3D[i].mesh); }
    activeShadeSouls3D.length = 0;
    for (let i = activeVoidBursts3D.length - 1; i >= 0; i--) { scene.remove(activeVoidBursts3D[i].mesh); disposeObject3D(activeVoidBursts3D[i].mesh); }
    activeVoidBursts3D.length = 0;
    stunOverlay.classList.add('hidden');
    for (const id in smoothPlayers) delete smoothPlayers[id];
    boostVignette.classList.add('hidden');
    showScreen(gameScreen); resize3D(); detectTouchControls(); showTemporarySwipeTip(); startGameBgm(true);
  } else if (data.type === 'gameState') {
    gamePhase = data.phase; gameTimer = data.timer; isFinalMinute = !!data.isFinalMinute;
    xrayActive = !!data.xrayActive; xrayCountdown = data.xrayCountdown || 0;
    renderPlayers = data.players; renderItems = data.items || [];
    const me = renderPlayers.find(p => p.id === myId);
    if (me && (!localPlayer.initialized || me.tpSeq !== localPlayer.tpSeq)) {
      localPlayer.x = me.x; localPlayer.y = me.y; localPlayer.tpSeq = me.tpSeq; localPlayer.initialized = true;
    }
    renderPlayers.forEach(p => { if (!smoothPlayers[p.id]) smoothPlayers[p.id] = { x: p.x, y: p.y, yaw: p.yaw }; });
    updateHUD();
  } else if (data.type === 'flashEffect') spawnFlashBeamEffect(data.x, data.y, data.yaw);
  else if (data.type === 'blasterEffect') spawnGasterBlaster3D(data.x, data.y, data.yaw, data.beamDist, data.chargeSec, data.beamSec);
  else if (data.type === 'shadeSoulEffect') spawnShadeSoul3D(data.x, data.y, data.yaw, data.range, data.speed);
  else if (data.type === 'stunnedSound') playStunHitSound();
  else if (data.type === 'boostSound') playSpeedBoostSound();
  else if (data.type === 'toast') showToast(data.message, data.style || 'info');
  else if (data.type === 'gameEnded') {
    gamePhase = 'ended'; isFinalMinute = false; xrayActive = false; blindOverlay.style.opacity = '0'; stunOverlay.classList.add('hidden'); boostVignette.classList.add('hidden'); seekerRedLight.visible = false; stopGameBgm();
    settingsOverlay.classList.add('hidden'); if (document.pointerLockElement) document.exitPointerLock();
    const myRes = data.results.find(r => r.id === myId);
    if (myRes) { endPersonalTitle.textContent = myRes.outcome === 'win' ? '🏆 BẠN ĐÃ CHIẾN THẮNG!' : '💀 BẠN ĐÃ THUA CUỘC!'; endPersonalTitle.style.color = myRes.outcome === 'win' ? '#4ade80' : '#ff6b6b'; }
    endPersonalSub.textContent = data.endReason || ''; endResultsList.innerHTML = '';
    data.results.forEach(r => {
      const li = document.createElement('li');
      const cls = r.outcome === 'win' ? 'res-win' : 'res-lose';
      li.innerHTML = `<span>${r.role === 'seeker' ? '🔴 Bắt' : '⚪ Chạy'} · <b>${escapeHtml(r.name)}${r.id === myId ? ' (Bạn)' : ''}</b></span><span class="${cls}">${escapeHtml(r.detail)}</span>`;
      endResultsList.appendChild(li);
    });
    endOverlay.classList.remove('hidden'); btnBackLobby.classList.toggle('hidden', !isHost); endWaitHost.classList.toggle('hidden', isHost);
  } else if (data.type === 'error') { menuError.textContent = data.message; lobbyError.textContent = data.message; }
}

function setMenuLoading(loading, text) { btnCreate.disabled = loading; btnJoin.disabled = loading; if (text !== undefined) menuError.textContent = text; }
btnDurMinus.addEventListener('click', () => { if (isHost && hostRoom) { hostRoom.matchDuration = Math.max(90, hostRoom.matchDuration - 30); hostEmitLobby(); } });
btnDurPlus.addEventListener('click', () => { if (isHost && hostRoom) { hostRoom.matchDuration = Math.min(600, hostRoom.matchDuration + 30); hostEmitLobby(); } });

btnCreate.addEventListener('click', () => {
  const name = nameInput.value.trim(); if (!name) { menuError.textContent = 'Vui lòng nhập tên của bạn!'; return; }
  try { localStorage.setItem('br3d_name', name); } catch (e) {}
  setMenuLoading(true, 'Đang khởi tạo phòng 20 người...');
  const code = generateRoomCode(); if (peer) peer.destroy();
  isHost = true; peer = new Peer(ROOM_PREFIX + code, PEER_CONFIG);

  peer.on('open', (id) => {
    myId = id; currentRoomCode = code; setMenuLoading(false, '');
    if (!hostRoom || hostRoom.code !== code) {
      hostRoom = { code, hostId: id, phase: 'lobby', timer: 0, matchDuration: 180, finalMinuteAlerted: false, items: [], activeBlasters: [], activeShadeSouls: [], players: { [id]: createPlayerObj(id, name, myCosmetics, false) } };
      startHostGameLoop();
    }
    hostEmitLobby();
  });

  peer.on('disconnected', () => { if (peer && !peer.destroyed) setTimeout(() => { if (peer && !peer.destroyed && peer.disconnected) peer.reconnect(); }, 1500); });
  peer.on('connection', (conn) => {
    conn.on('data', (msg) => {
      if (!msg || !msg.type) return;
      if (msg.type === 'join') {
        if (hostRoom.phase !== 'lobby' && hostRoom.phase !== 'ended') { conn.send({ type: 'error', message: 'Phòng đang trong trận!' }); setTimeout(() => conn.close(), 300); return; }
        if (Object.keys(hostRoom.players).length >= MAX_PLAYERS) { conn.send({ type: 'error', message: 'Phòng đã đầy!' }); setTimeout(() => conn.close(), 300); return; }
        guestConns[conn.peer] = conn; hostRoom.players[conn.peer] = createPlayerObj(conn.peer, msg.name, { skin: msg.skin, hat: msg.hat }, false); hostEmitLobby();
      } else if (msg.type === 'cosmetics') {
        const pl = hostRoom.players[conn.peer];
        if (pl) { pl.skin = msg.skin; pl.hat = msg.hat; pl.wantsSans = !!msg.wantsSans; pl.wantsKnight = !!msg.wantsKnight; if (hostRoom.phase === 'lobby') hostEmitLobby(); }
      }
      else if (msg.type === 'pos') hostAcceptGuestPos(conn.peer, msg);
      else if (msg.type === 'rescue') hostHandleRescue(conn.peer, msg);
      else if (msg.type === 'useItem') hostHandleUseFlashlight(conn.peer, msg);
      else if (msg.type === 'blaster') hostHandleBlaster(conn.peer, msg);
      else if (msg.type === 'shadeSoul') hostHandleShadeSoul(conn.peer, msg);
      else if (msg.type === 'seekerBoost') hostHandleSeekerBoost(conn.peer, msg);
    });
    conn.on('close', () => {
      const left = hostRoom.players[conn.peer], hadItem = left?.hasItem;
      delete guestConns[conn.peer]; delete hostRoom.players[conn.peer];
      if (hadItem) hostMaintainFlashlights();
      if (left) hostBroadcast({ type: 'toast', message: `${left.name} đã rời phòng.`, style: 'info' });
      if (hostRoom.phase === 'lobby' || hostRoom.phase === 'ended') hostEmitLobby(); else hostCheckMatchEnd();
    });
  });
  peer.on('error', (err) => setMenuLoading(false, err.type === 'unavailable-id' ? 'Mã phòng trùng, thử lại!' : 'Lỗi kết nối (' + err.type + ').'));
});

btnJoin.addEventListener('click', () => {
  const name = nameInput.value.trim(), code = roomCodeInput.value.trim().toUpperCase();
  if (!name) { menuError.textContent = 'Vui lòng nhập tên của bạn!'; return; }
  if (code.length !== 4) { menuError.textContent = 'Mã phòng phải gồm 4 ký tự!'; return; }
  try { localStorage.setItem('br3d_name', name); } catch (e) {}
  setMenuLoading(true, 'Đang kết nối tới phòng ' + code + '...');
  if (peer) peer.destroy();
  isHost = false; peer = new Peer(PEER_CONFIG); let connected = false;
  const relayNotice = setTimeout(() => { if (!connected) menuError.textContent = 'Đang chuyển tiếp TURN (4G/NAT)... đợi chút!'; }, 4500);
  const timeout = setTimeout(() => { if (!connected) { clearTimeout(relayNotice); setMenuLoading(false, 'Không kết nối được tới ' + code + '!'); if (peer) peer.destroy(); } }, 15000);

  peer.on('open', (id) => {
    myId = id; hostConn = peer.connect(ROOM_PREFIX + code, { reliable: true, serialization: 'json' });
    hostConn.on('open', () => { connected = true; clearTimeout(relayNotice); clearTimeout(timeout); setMenuLoading(false, ''); hostConn.send({ type: 'join', name, skin: myCosmetics.skin, hat: myCosmetics.hat }); });
    hostConn.on('data', (msg) => handleClientPacket(msg));
    hostConn.on('error', () => { if (!connected) { clearTimeout(relayNotice); clearTimeout(timeout); setMenuLoading(false, 'Kết nối gián đoạn, thử bấm Vào Phòng lại!'); } });
    hostConn.on('close', () => { if (connected) { stopGameBgm(); showScreen(menuScreen); menuError.textContent = 'Chủ phòng đã đóng phòng hoặc mất kết nối.'; } });
  });
  peer.on('error', (err) => { clearTimeout(relayNotice); clearTimeout(timeout); setMenuLoading(false, err.type === 'peer-unavailable' ? 'Không tìm thấy mã phòng ' + code + '!' : 'Lỗi kết nối (' + err.type + ').'); });
});

document.getElementById('btn-copy-code').addEventListener('click', () => {
  if (!currentRoomCode) return; navigator.clipboard?.writeText(currentRoomCode);
  const b = document.getElementById('btn-copy-code'); b.textContent = 'Đã chép!'; setTimeout(() => (b.textContent = 'Sao chép'), 1500);
});
document.getElementById('btn-add-bot').addEventListener('click', () => {
  if (!isHost || !hostRoom || Object.keys(hostRoom.players).length >= MAX_PLAYERS) return;
  botCounter++;
  hostRoom.players['bot-' + botCounter] = createPlayerObj('bot-' + botCounter, 'Bot ' + botCounter, { skin: SKINS[Math.floor(Math.random() * SKINS.length)].id, hat: HATS[Math.floor(Math.random() * HATS.length)].id }, true);
  hostEmitLobby();
});
document.getElementById('btn-clear-bots').addEventListener('click', () => {
  if (!isHost || !hostRoom) return;
  for (const id in hostRoom.players) if (hostRoom.players[id].isBot) delete hostRoom.players[id];
  hostEmitLobby();
});

btnStartGame.addEventListener('click', () => {
  if (!isHost || !hostRoom) return; lobbyError.textContent = '';
  const list = Object.values(hostRoom.players);
  if (list.length < 2) { lobbyError.textContent = 'Cần ít nhất 2 người (hoặc bấm "+ Thêm Bot")!'; return; }
  if (isTouchDevice && !isInFullscreen()) tryEnterFullscreen(true);

  assignUniqueSecretsInRoom(true);
  const newMap = generateRandomBackroomsMap(); activeMapGrid = newMap; computeMapNavigationData(newMap);
  const seekerIdx = Math.floor(Math.random() * list.length), spawns = validHiderSpawns.slice().sort(() => Math.random() - 0.5);
  let sIdx = 0;
  list.forEach((p, idx) => {
    p.input = { dx: 0, dy: 0 }; p.lockTimer = 0; p.graceTimer = 0; p.blindTimer = 0; p.stunTimer = 0; p.stunSource = 'sans'; p.blasterCooldown = 0; p.shadeCooldown = 0; p.boostTimer = 0; p.boostCooldown = 0; p.hasItem = false; p.yaw = 0; p.tpSeq++;
    if (idx === seekerIdx) { p.role = 'seeker'; p.status = 'seeking'; p.x = (CENTER_TILE + 0.5) * TILE_SIZE; p.y = (CENTER_TILE + 0.5) * TILE_SIZE; }
    else { p.role = 'hider'; p.status = 'alive'; const sp = spawns[sIdx % spawns.length] || { r: 1, c: 1 }; sIdx++; p.x = (sp.c + 0.5) * TILE_SIZE; p.y = (sp.r + 0.5) * TILE_SIZE; }
  });

  hostRoom.items = []; hostRoom.activeBlasters = []; hostRoom.activeShadeSouls = []; hostMaintainFlashlights(); hostRoom.phase = 'prep'; hostRoom.timer = PREP_DURATION; hostRoom.finalMinuteAlerted = false;
  hostBroadcast({ type: 'gameStarted', phase: 'prep', timer: PREP_DURATION, mapRows: encodeMapGrid(newMap) });
  hostBroadcast({ type: 'toast', message: `${list[seekerIdx].name} là NGƯỜI BẮT! Hãy chạy trốn trong 15s!`, style: 'warning' });
});
btnBackLobby.addEventListener('click', () => { if (isHost && hostRoom) { hostRoom.phase = 'lobby'; hostEmitLobby(); } });

const keys = {}; let camYaw = 0, camPitch = 0, joystickVec = { dx: 0, dy: 0 }, isTouchDevice = false, pointerLockGraceUntil = 0;

function detectTouchControls() {
  const isIPad = /iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobileUA = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent);
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  isTouchDevice = isIPad || isMobileUA || isCoarse;
  mobileControls.classList.toggle('hidden', !isTouchDevice); updateLockHint();
}
function updateLockHint() {
  const modalOpen = !endOverlay.classList.contains('hidden') || !settingsOverlay.classList.contains('hidden');
  pcLockHint.classList.toggle('hidden', !(gameScreen.classList.contains('active') && !isTouchDevice && document.pointerLockElement !== gameCanvas && !modalOpen));
}
function requestGamePointerLock() {
  try { const res = gameCanvas.requestPointerLock({ unadjustedMovement: true }); if (res && typeof res.catch === 'function') res.catch(() => { try { gameCanvas.requestPointerLock(); } catch (e) {} }); }
  catch (e) { try { gameCanvas.requestPointerLock?.(); } catch (err) {} }
}

gameCanvas.addEventListener('click', () => { const modalOpen = !endOverlay.classList.contains('hidden') || !settingsOverlay.classList.contains('hidden'); if (!isTouchDevice && gameScreen.classList.contains('active') && !modalOpen) requestGamePointerLock(); });
gameCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('mousedown', (e) => { const modalOpen = !endOverlay.classList.contains('hidden') || !settingsOverlay.classList.contains('hidden'); if (e.button === 2 && gameScreen.classList.contains('active') && !modalOpen) sendPrimarySkillOrItem(); });
document.addEventListener('pointerlockchange', () => { if (document.pointerLockElement === gameCanvas) pointerLockGraceUntil = performance.now() + 90; updateLockHint(); });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; joystickVec = { dx: 0, dy: 0 }; });

window.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== gameCanvas || performance.now() < pointerLockGraceUntil) return;
  const mx = e.movementX || 0, my = e.movementY || 0;
  if (Math.abs(mx) > 220 || Math.abs(my) > 220) return;
  const ySign = userSettings.invertY ? -1 : 1;
  camYaw -= Math.max(-110, Math.min(110, mx)) * 0.0024 * userSettings.mouseSens;
  camPitch = Math.max(-1.05, Math.min(1.05, camPitch - Math.max(-110, Math.min(110, my)) * 0.0022 * userSettings.mouseSens * ySign));
});

function buildActionSnapshot() { return { x: Math.round(localPlayer.x * 10) / 10, y: Math.round(localPlayer.y * 10) / 10, yaw: Number(camYaw.toFixed(3)), moving: localPlayer.moving, tpSeq: localPlayer.tpSeq }; }
function sendRescue() { const s = buildActionSnapshot(); if (isHost) hostHandleRescue(myId, s); else if (hostConn && hostConn.open) hostConn.send({ type: 'rescue', ...s }); }
function sendUseFlashlight() { const s = buildActionSnapshot(); if (isHost) hostHandleUseFlashlight(myId, s); else if (hostConn && hostConn.open) hostConn.send({ type: 'useItem', ...s }); }
function sendUseBlaster() { const s = buildActionSnapshot(); if (isHost) hostHandleBlaster(myId, s); else if (hostConn && hostConn.open) hostConn.send({ type: 'blaster', ...s }); }
function sendUseShadeSoul() { const s = buildActionSnapshot(); if (isHost) hostHandleShadeSoul(myId, s); else if (hostConn && hostConn.open) hostConn.send({ type: 'shadeSoul', ...s }); }
function sendUseSeekerBoost() {
  const me = renderPlayers.find(p => p.id === myId);
  if (!me || me.role !== 'seeker' || me.sansActive || me.knightActive || me.secretChar) return;
  const s = buildActionSnapshot();
  if (isHost) hostHandleSeekerBoost(myId, s);
  else if (hostConn && hostConn.open) hostConn.send({ type: 'seekerBoost', ...s });
}
function sendPrimarySkillOrItem() {
  const me = renderPlayers.find(p => p.id === myId);
  if (!me) return;
  if (me.sansActive) sendUseBlaster();
  else if (me.knightActive) sendUseShadeSoul();
  else if (me.role === 'seeker') sendUseSeekerBoost();
  else sendUseFlashlight();
}

window.addEventListener('keydown', (e) => {
  if (!gameScreen.classList.contains('active') || !settingsOverlay.classList.contains('hidden')) return;
  const k = e.key.toLowerCase(); keys[k] = true;
  if (e.key === 'Shift') {
    const me = renderPlayers.find(p => p.id === myId);
    if (me && me.role === 'seeker' && !me.sansActive && !me.knightActive && !me.secretChar) {
      e.preventDefault(); sendUseSeekerBoost();
    }
  }
  if (e.code === 'Space' || k === 'e') {
    e.preventDefault();
    const me = renderPlayers.find(p => p.id === myId);
    if (me && me.role === 'seeker') {
      if (!me.sansActive && !me.knightActive && !me.secretChar) sendUseSeekerBoost();
    } else sendRescue();
  }
  if (k === 'f' || k === 'q') { e.preventDefault(); sendPrimarySkillOrItem(); }
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

const joystickZone = document.getElementById('joystick-zone'), joystickBase = document.getElementById('joystick-base'), joystickKnob = document.getElementById('joystick-knob');
let joyTouchId = null;
function updateJoystick(cx, cy) {
  const rect = joystickBase.getBoundingClientRect(), maxDist = Math.max(30, rect.width * 0.37);
  let dx = cx - (rect.left + rect.width / 2), dy = cy - (rect.top + rect.height / 2), d = Math.hypot(dx, dy);
  if (d > maxDist) { dx = (dx / d) * maxDist; dy = (dy / d) * maxDist; }
  joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  joystickVec = { dx: dx / maxDist, dy: dy / maxDist };
}
joystickZone.addEventListener('touchstart', (e) => { e.preventDefault(); if (joyTouchId === null) { const t = e.changedTouches[0]; joyTouchId = t.identifier; updateJoystick(t.clientX, t.clientY); } }, { passive: false });
joystickZone.addEventListener('touchmove', (e) => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === joyTouchId) { updateJoystick(t.clientX, t.clientY); break; } }, { passive: false });
function releaseJoystick(e) { for (const t of e.changedTouches) if (t.identifier === joyTouchId) { joyTouchId = null; joystickKnob.style.transform = 'translate(-50%, -50%)'; joystickVec = { dx: 0, dy: 0 }; break; } }
joystickZone.addEventListener('touchend', releaseJoystick); joystickZone.addEventListener('touchcancel', releaseJoystick);

let lookTouchId = null, lastLookX = 0, lastLookY = 0;
gameCanvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  for (const t of e.changedTouches) if (lookTouchId === null && t.identifier !== joyTouchId) { lookTouchId = t.identifier; lastLookX = t.clientX; lastLookY = t.clientY; hideSwipeTip(); break; }
}, { passive: false });
gameCanvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const sensX = (window.innerWidth >= 768 ? 0.0044 : 0.0056) * userSettings.touchSens;
  const sensY = (window.innerWidth >= 768 ? 0.0038 : 0.0046) * userSettings.touchSens * (userSettings.invertY ? -1 : 1);
  for (const t of e.changedTouches) if (t.identifier === lookTouchId) {
    camYaw -= (t.clientX - lastLookX) * sensX;
    camPitch = Math.max(-1.0, Math.min(1.0, camPitch - (t.clientY - lastLookY) * sensY));
    lastLookX = t.clientX; lastLookY = t.clientY; break;
  }
}, { passive: false });
function releaseLookTouch(e) { for (const t of e.changedTouches) if (t.identifier === lookTouchId) { lookTouchId = null; break; } }
gameCanvas.addEventListener('touchend', releaseLookTouch); gameCanvas.addEventListener('touchcancel', releaseLookTouch);

btnMobileRescue.addEventListener('touchstart', (e) => { e.preventDefault(); sendRescue(); }, { passive: false }); btnMobileRescue.addEventListener('click', sendRescue);
btnMobileFlash.addEventListener('touchstart', (e) => { e.preventDefault(); sendUseFlashlight(); }, { passive: false }); btnMobileFlash.addEventListener('click', sendUseFlashlight);
btnMobileBlaster.addEventListener('touchstart', (e) => { e.preventDefault(); sendUseBlaster(); }, { passive: false });
btnMobileBlaster.addEventListener('click', sendUseBlaster);
btnMobileShade.addEventListener('touchstart', (e) => { e.preventDefault(); sendUseShadeSoul(); }, { passive: false });
btnMobileShade.addEventListener('click', sendUseShadeSoul);
btnMobileBoost.addEventListener('touchstart', (e) => { e.preventDefault(); sendUseSeekerBoost(); }, { passive: false });
btnMobileBoost.addEventListener('click', sendUseSeekerBoost);

function updateHUD() {
  const me = renderPlayers.find(p => p.id === myId); if (!me) return;
  hudTimer.classList.toggle('final-min', isFinalMinute);
  hudTimer.textContent = gamePhase === 'prep' ? `CHUẨN BỊ: ${gameTimer}s` : (isFinalMinute ? `👁️ PHÚT CUỐI: ${formatClock(gameTimer)}` : `⏳ ${formatClock(gameTimer)}`);

  if (me.role === 'seeker' && me.blindTimer > 0) {
    blindOverlay.style.opacity = String(me.blindTimer < 1.0 ? me.blindTimer : 1.0);
    blindCountdown.textContent = `Không thể bắt người trong ${me.blindTimer.toFixed(1)}s`;
  } else blindOverlay.style.opacity = '0';

  const showXrayHud = (me.role === 'seeker' && isFinalMinute);
  hudXrayBadge.classList.toggle('hidden', !showXrayHud); hudXrayBadge.classList.toggle('active-pulse', showXrayHud && xrayActive);
  if (showXrayHud) hudXrayBadge.textContent = xrayActive ? `👁️ THẤU THỊ (${xrayCountdown}s)` : `👁️ Hồi ${xrayCountdown}s`;

  xrayVignette.classList.toggle('hidden', !(showXrayHud && xrayActive));
  caughtVignette.classList.toggle('hidden', me.status !== 'jailed');

  const isAliveHider = (me.role === 'hider' && me.status === 'alive');
  const isHiddenChar = !!(me.sansActive || me.knightActive || me.secretChar);
  const showFlashlightHud = isAliveHider && !isHiddenChar;
  hudItemBadge.classList.toggle('hidden', !showFlashlightHud); hudItemBadge.classList.toggle('has-item', showFlashlightHud && me.hasItem);
  hudItemBadge.textContent = me.hasItem ? '🔦 ĐÈN (1/1)' : '🔦 Trống';

  if (me.role === 'seeker') { const isSansS = !!me.sansActive, isKnightS = !!me.knightActive; hudRole.textContent = me.blindTimer > 0 ? `⚡ CHÓI (${me.blindTimer.toFixed(1)}s)` : (isSansS ? '🔵 NGƯỜI BẮT' : (isKnightS ? '🟣 NGƯỜI BẮT' : '🔴 NGƯỜI BẮT')); hudRole.style.borderColor = me.blindTimer > 0 ? '#fde047' : (isSansS ? '#38bdf8' : (isKnightS ? '#a78bfa' : '#ff595e')); hudRole.style.color = me.blindTimer > 0 ? '#fef08a' : (isSansS ? '#7dd3fc' : (isKnightS ? '#e9d5ff' : '#ff8a8e')); }
  else if (me.status === 'alive') { hudRole.textContent = me.grace ? '🛡️ MIỄN NHIỄM' : '⚪ NGƯỜI CHẠY'; hudRole.style.borderColor = me.grace ? '#38bdf8' : '#e5e7eb'; hudRole.style.color = me.grace ? '#7dd3fc' : '#ffffff'; }
  else if (me.status === 'jailed') { hudRole.textContent = me.lockTimer > 0 ? `🔒 LỒNG (${me.lockTimer}s)` : '🆘 CỨU ĐƯỢC RỒI!'; hudRole.style.borderColor = me.lockTimer > 0 ? '#ff9f1c' : '#4ade80'; hudRole.style.color = me.lockTimer > 0 ? '#ffd166' : '#86efac'; }
  else { hudRole.textContent = '💀 KHÁN GIẢ'; hudRole.style.borderColor = '#ff595e'; hudRole.style.color = '#fca5a5'; }

  const aliveCount = renderPlayers.filter(p => p.role === 'hider' && p.status === 'alive').length;
  const jailedCount = renderPlayers.filter(p => p.role === 'hider' && p.status === 'jailed').length;
  const elimCount = renderPlayers.filter(p => p.role === 'hider' && p.status === 'eliminated').length;
  hudStats.textContent = `Sống: ${aliveCount} | Giam: ${jailedCount} | Loại: ${elimCount}`;

  // Hiệu ứng & đếm ngược khi bị choáng (áp dụng cho cả Người Chạy & Người Bắt)
  const isStunned = ((me.role === 'seeker' || isAliveHider) && me.stunTimer > 0);
  const isVoidStun = (me.stunSource === 'knight');
  stunOverlay.classList.toggle('hidden', !isStunned);
  stunOverlay.classList.toggle('void-stun', isStunned && isVoidStun);
  if (isStunned) {
    stunCountdown.textContent = me.role === 'seeker'
      ? `Đứng im & không thể bắt người: ${me.stunTimer.toFixed(1)}s`
      : `Đứng im không thể di chuyển: ${me.stunTimer.toFixed(1)}s`;
    hudRole.textContent = isVoidStun ? `🌑 BỊ CHOÁNG (${me.stunTimer.toFixed(1)}s)` : `⚡ BỊ CHOÁNG (${me.stunTimer.toFixed(1)}s)`;
    hudRole.style.borderColor = isVoidStun ? '#a78bfa' : '#38bdf8';
    hudRole.style.color = isVoidStun ? '#ddd6fe' : '#7dd3fc';
  }

  // Kỹ năng ẩn Gaster Blaster (Sans — dùng được ở CẢ 2 PHE: Người Bắt và Người Chạy còn sống)
  const canUseSansSkill = (!!me.sansActive && gamePhase === 'playing' && (me.role === 'seeker' || isAliveHider));
  const blasterReady = canUseSansSkill && !isStunned && ((me.blasterCd || 0) <= 0);
  hudBlasterBadge.classList.toggle('hidden', !canUseSansSkill);
  hudBlasterBadge.classList.toggle('ready', blasterReady);
  if (canUseSansSkill) {
    hudBlasterBadge.textContent = blasterReady ? '💀 BLASTER: SẴN SÀNG [F]' : `💀 Blaster: ${me.blasterCd}s`;
  }
  btnMobileBlaster.classList.toggle('hidden', !canUseSansSkill);
  btnMobileBlaster.classList.toggle('as-hider', me.role === 'hider');
  btnMobileBlaster.classList.toggle('ready', blasterReady);
  if (canUseSansSkill) {
    btnMobileBlaster.innerHTML = blasterReady ? '💀<br>BẮN' : `💀<br>${me.blasterCd}s`;
  }

  // Kỹ năng ẩn Shade Soul (The Knight — dùng được ở CẢ 2 PHE: Người Bắt và Người Chạy còn sống)
  const canUseKnightSkill = (!!me.knightActive && gamePhase === 'playing' && (me.role === 'seeker' || isAliveHider));
  const shadeReady = canUseKnightSkill && !isStunned && ((me.shadeCd || 0) <= 0);
  hudShadeBadge.classList.toggle('hidden', !canUseKnightSkill);
  hudShadeBadge.classList.toggle('ready', shadeReady);
  if (canUseKnightSkill) {
    hudShadeBadge.textContent = shadeReady ? '🌑 SHADE SOUL: SẴN SÀNG [F]' : `🌑 Shade Soul: ${me.shadeCd}s`;
  }
  btnMobileShade.classList.toggle('hidden', !canUseKnightSkill);
  btnMobileShade.classList.toggle('as-hider', me.role === 'hider');
  btnMobileShade.classList.toggle('ready', shadeReady);
  if (canUseKnightSkill) {
    btnMobileShade.innerHTML = shadeReady ? '🌑<br>SOUL' : `🌑<br>${me.shadeCd}s`;
  }

  // Kỹ năng Tăng Tốc của Người Tìm (chỉ dành cho Người Tìm thường; nhân vật ẩn chỉ dùng kỹ năng cá nhân)
  const isSeekerPlaying = (me.role === 'seeker' && gamePhase === 'playing');
  const hasBoostSkill = (isSeekerPlaying && !isFinalMinute && !isHiddenChar);
  const isBoosting = (hasBoostSkill && (me.boostTimer || 0) > 0);
  const boostReady = (hasBoostSkill && !isStunned && !isBoosting && ((me.boostCd || 0) <= 0));
  const showBoostBadge = hasBoostSkill || (isSeekerPlaying && isFinalMinute);

  boostVignette.classList.toggle('hidden', !isBoosting);
  hudBoostBadge.classList.toggle('hidden', !showBoostBadge);
  hudBoostBadge.classList.toggle('ready', boostReady);
  hudBoostBadge.classList.toggle('active-boost', isBoosting);
  hudBoostBadge.classList.toggle('final-speed', isSeekerPlaying && isFinalMinute);
  if (showBoostBadge) {
    if (isFinalMinute) hudBoostBadge.textContent = '🔥 TỐC ĐỘ PHÚT CUỐI';
    else if (isBoosting) hudBoostBadge.textContent = `⚡ TĂNG TỐC: ${me.boostTimer.toFixed(1)}s`;
    else if (boostReady) hudBoostBadge.textContent = '⚡ TĂNG TỐC: SẴN SÀNG [SHIFT]';
    else hudBoostBadge.textContent = `⚡ Tăng tốc: ${me.boostCd}s`;
  }

  btnMobileBoost.classList.toggle('hidden', !hasBoostSkill);
  btnMobileBoost.classList.toggle('with-secret', false);
  btnMobileBoost.classList.toggle('ready', boostReady);
  btnMobileBoost.classList.toggle('active-boost', isBoosting);
  if (hasBoostSkill) {
    if (isBoosting) btnMobileBoost.innerHTML = `⚡<br>${me.boostTimer.toFixed(1)}s`;
    else if (boostReady) btnMobileBoost.innerHTML = '⚡<br>TĂNG';
    else btnMobileBoost.innerHTML = `⚡<br>${me.boostCd}s`;
  }

  const curX = localPlayer.initialized ? localPlayer.x : me.x, curY = localPlayer.initialized ? localPlayer.y : me.y;
  btnMobileRescue.classList.toggle('hidden', !isAliveHider);
  btnMobileFlash.classList.toggle('hidden', !(showFlashlightHud && me.hasItem));
  const hasRescuable = renderPlayers.some(p => p.role === 'hider' && p.status === 'jailed' && p.lockTimer <= 0);
  const canRescue = (gamePhase === 'playing' && isAliveHider && !isStunned && isInRescueZone(curX, curY) && hasRescuable);
  btnMobileRescue.classList.toggle('ready', canRescue);
  rescuePrompt.classList.toggle('hidden', !(canRescue && !isTouchDevice));
  flashPrompt.classList.toggle('hidden', !(showFlashlightHud && me.hasItem && !isTouchDevice));
  blasterPrompt.classList.toggle('hidden', !(blasterReady && !isTouchDevice));
  shadePrompt.classList.toggle('hidden', !(shadeReady && !isTouchDevice));
  boostPrompt.classList.toggle('hidden', !(boostReady && !isTouchDevice));
}

function drawMinimap(mePos, meObj) {
  if (activeMapGrid.length === 0 || !mePos) return;
  const w = minimapCanvas.width, h = minimapCanvas.height;
  const cx = w / 2, cy = h / 2;
  const N = activeMapGrid.length;
  const cell = minimapBaseCanvas.width / N;
  const px = (mePos.x / TILE_SIZE) * cell;
  const py = (mePos.y / TILE_SIZE) * cell;

  const viewRadiusTiles = 7.5;
  const scale = (w * 0.46) / (viewRadiusTiles * cell);

  mctx.clearRect(0, 0, w, h);
  mctx.save();
  mctx.beginPath();
  mctx.arc(cx, cy, cx - 1, 0, Math.PI * 2);
  mctx.clip();

  mctx.fillStyle = '#121007';
  mctx.fillRect(0, 0, w, h);

  mctx.translate(cx, cy);
  mctx.rotate(camYaw);
  mctx.scale(scale, scale);
  mctx.translate(-px, -py);

  mctx.drawImage(minimapBaseCanvas, 0, 0);

  if (gamePhase === 'prep') {
    mctx.fillStyle = '#ff4757';
    for (let r = CENTER_TILE - 2; r <= CENTER_TILE + 2; r++) {
      for (let c = CENTER_TILE - 2; c <= CENTER_TILE + 2; c++) {
        if (activeMapGrid[r]?.[c] === 3) mctx.fillRect(c * cell, r * cell, cell, cell);
      }
    }
  }

  if (meObj && meObj.role === 'hider' && meObj.status === 'alive' && !meObj.secretChar) {
    mctx.fillStyle = '#fde047';
    renderItems.forEach(it => {
      mctx.beginPath();
      mctx.arc((it.x / TILE_SIZE) * cell, (it.y / TILE_SIZE) * cell, cell * 0.42, 0, Math.PI * 2);
      mctx.fill();
    });
  }

  const seekerXrayPulse = (meObj && meObj.role === 'seeker' && isFinalMinute && xrayActive);

  renderPlayers.forEach(p => {
    if (p.id === myId || p.status === 'eliminated') return;
    const sp = smoothPlayers[p.id] || p;
    const sx = (sp.x / TILE_SIZE) * cell;
    const sy = (sp.y / TILE_SIZE) * cell;

    if (p.status === 'jailed') {
      mctx.fillStyle = p.lockTimer > 0 ? '#ff9f1c' : '#4ade80';
      mctx.beginPath();
      mctx.arc(sx, sy, cell * 0.45, 0, Math.PI * 2);
      mctx.fill();
    }
    if (seekerXrayPulse && p.role === 'hider' && p.status === 'alive') {
      mctx.fillStyle = '#ff2a3c';
      mctx.beginPath();
      mctx.arc(sx, sy, cell * 0.52, 0, Math.PI * 2);
      mctx.fill();
    }
  });

  mctx.restore();

  mctx.save();
  mctx.translate(cx, cy);
  mctx.fillStyle = meObj?.role === 'seeker' ? (meObj.sansActive ? '#38bdf8' : (meObj.knightActive ? '#a78bfa' : '#ff4757')) : '#4ade80';
  mctx.strokeStyle = '#0d0c06';
  mctx.lineWidth = 2;
  mctx.beginPath();
  mctx.moveTo(0, -8);
  mctx.lineTo(-6, 6);
  mctx.lineTo(0, 2.5);
  mctx.lineTo(6, 6);
  mctx.closePath();
  mctx.fill();
  mctx.stroke();
  mctx.restore();
}

let baseCameraFov = 74;
function resize3D() {
  const w = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const aspect = w / Math.max(1, h);
  baseCameraFov = aspect > 1.9 ? 67 : (aspect < 0.8 ? 82 : 74);
  camera.fov = baseCameraFov; camera.aspect = aspect;
  camera.updateProjectionMatrix(); renderer.setSize(w, h, false); detectTouchControls();
}
window.addEventListener('resize', resize3D);
window.addEventListener('orientationchange', () => setTimeout(resize3D, 150));
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize3D);
resize3D(); updateFullscreenButtons();

let lastFrameTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000)); lastFrameTime = now;
  const t = now / 1000;

  const activeBox = menuScreen.classList.contains('active') ? menuPreview : (lobbyScreen.classList.contains('active') ? lobbyPreview : null);
  if (activeBox && activeBox.char) {
    if (!activeBox.dragging) activeBox.angle += 0.008;
    activeBox.char.rotation.y = activeBox.angle;
    activeBox.char.position.y = Math.sin(t * 2.5) * 0.04;
    if (activeBox.char.userData.spinWheel) activeBox.char.userData.spinWheel.rotation.z += dt * 1.1;
    if (activeBox.char.userData.sansEyeGlow) {
      const s = 0.22 + Math.sin(t * 5.0) * 0.03;
      activeBox.char.userData.sansEyeGlow.scale.set(s, s, 1);
    }
    if (activeBox.char.userData.knightSoulGroup) {
      activeBox.char.userData.knightSoulGroup.children.forEach(sp => {
        const d = sp.userData;
        const a = d.baseAng + t * 0.9;
        sp.position.set(Math.cos(a) * d.rad, d.baseY + Math.sin(t * 2.2 + d.phase) * 0.09, Math.sin(a) * d.rad);
      });
    }
    activeBox.ren.render(activeBox.sc, activeBox.cam);
    return;
  }

  if (!gameScreen.classList.contains('active')) return;

  if (Math.random() < 0.025) ambientLight.intensity = 0.52 + Math.random() * 0.14;
  else ambientLight.intensity += (0.72 - ambientLight.intensity) * 0.18;

  const anyoneJailed = renderPlayers.some(p => p.status === 'jailed');
  if (cageBarsGroup && cageBarMat) {
    if (gamePhase === 'prep') { cageBarsGroup.visible = true; cageBarMat.color.setHex(0xff4757); cageBarMat.opacity = 0.82; }
    else if (anyoneJailed) { cageBarsGroup.visible = true; const anyReady = renderPlayers.some(p => p.status === 'jailed' && p.lockTimer <= 0); cageBarMat.color.setHex(anyReady ? 0x4ade80 : 0xff9f1c); cageBarMat.opacity = 0.38; }
    else cageBarsGroup.visible = false;
  }
  if (jailRing) jailRing.rotation.z = t * 0.8;

  const activeItemIds = new Set();
  renderItems.forEach(it => {
    activeItemIds.add(it.id);
    let mesh = groundItemMeshes[it.id];
    if (!mesh) { mesh = createGroundItemMesh(); scene.add(mesh); groundItemMeshes[it.id] = mesh; }
    mesh.position.set(it.x * WORLD_SCALE, 0, it.y * WORLD_SCALE);
    mesh.userData.fl.rotation.y = t * 2.2; mesh.userData.fl.position.y = 0.65 + Math.sin(t * 3.5) * 0.12;
  });
  for (const id in groundItemMeshes) if (!activeItemIds.has(id)) { scene.remove(groundItemMeshes[id]); delete groundItemMeshes[id]; }

  for (let i = activeFlashBeams.length - 1; i >= 0; i--) {
    const b = activeFlashBeams[i]; b.life -= dt; const ratio = Math.max(0, b.life / b.maxLife);
    b.mesh.material.opacity = ratio * 0.58; b.light.intensity = ratio * 3.6;
    if (b.life <= 0) { scene.remove(b.mesh); scene.remove(b.light); b.mesh.geometry.dispose(); b.mesh.material.dispose(); activeFlashBeams.splice(i, 1); }
  }

  // Hoạt ảnh 3D Gaster Blaster của Sans
  for (let i = activeBlasters3D.length - 1; i >= 0; i--) {
    const b = activeBlasters3D[i];
    b.elapsed += dt;
    const ud = b.mesh.userData;
    const fx = -Math.sin(b.yaw), fz = -Math.cos(b.yaw);

    if (b.elapsed < b.chargeSec) {
      // Giai đoạn 1: Xuất hiện + há hàm + tụ cầu năng lượng trắng xanh
      const p = b.elapsed / b.chargeSec;
      const easeOut = 1 - Math.pow(1 - p, 3);
      const sc = 0.15 + easeOut * 0.90;
      b.mesh.scale.set(sc, sc, sc);
      b.mesh.position.set(b.baseX, b.baseY + (1 - easeOut) * 0.55, b.baseZ);
      ud.skullGroup.rotation.z = (1 - easeOut) * 0.55;
      ud.jawGroup.rotation.x = -0.05 - easeOut * 0.68;
      const orbSc = 0.25 + p * 0.95;
      ud.chargeGroup.scale.set(orbSc, orbSc, orbSc);
      ud.orbRing1.rotation.z += dt * 9;
      ud.orbRing2.rotation.x += dt * 11;
      ud.light.intensity = 1.5 + p * 3.0;
    } else if (b.elapsed < b.chargeSec + b.beamSec) {
      // Giai đoạn 2: Phóng tia sáng trắng-xanh cực mạnh + giật lùi + sóng xung kích
      if (!b.beamShown) {
        b.beamShown = true;
        ud.beamGroup.visible = true;
      }
      const bp = (b.elapsed - b.chargeSec) / b.beamSec;
      const recoil = Math.sin(Math.min(1, bp * 3.5) * Math.PI) * 0.24;
      const jitterX = (Math.random() - 0.5) * 0.045;
      const jitterY = (Math.random() - 0.5) * 0.045;
      b.mesh.scale.set(1.05, 1.05, 1.05);
      b.mesh.position.set(b.baseX - fx * recoil + jitterX, b.baseY + jitterY, b.baseZ - fz * recoil);
      ud.skullGroup.rotation.z = 0;
      ud.jawGroup.rotation.x = -0.78 - Math.sin(t * 36) * 0.04;
      ud.chargeGroup.scale.set(1.25, 1.25, 1.25);
      ud.orbRing1.rotation.z += dt * 15;
      ud.orbRing2.rotation.x += dt * 16;

      const fadeOut = bp > 0.72 ? Math.max(0.05, (1 - bp) / 0.28) : 1.0;
      const pulse = (0.92 + Math.sin(t * 48) * 0.14) * fadeOut;
      ud.beamGroup.scale.set(pulse, pulse, 1);
      ud.beamCore.material.opacity = 0.98 * fadeOut;
      ud.beamMid.material.opacity = 0.74 * fadeOut;
      ud.beamAura.material.opacity = 0.36 * fadeOut;
      if (ud.beamPierceGlow) ud.beamPierceGlow.material.opacity = 0.24 * fadeOut;
      ud.muzzleBurst.scale.setScalar(pulse * 1.15);
      ud.light.intensity = 5.2 * fadeOut;

      ud.beamRings.forEach(rm => {
        rm.position.z -= dt * 26;
        if (rm.position.z < -ud.beamLength) rm.position.z += ud.beamLength;
        rm.rotation.z += dt * 7;
        rm.material.opacity = 0.85 * fadeOut;
      });
    } else {
      // Giai đoạn 3: Đóng hàm và tan biến gọn gàng
      const ep = (b.elapsed - (b.chargeSec + b.beamSec)) / 0.35;
      ud.beamGroup.visible = false;
      ud.chargeGroup.visible = false;
      const sc = Math.max(0.01, (1 - ep) * 1.05);
      b.mesh.scale.set(sc, sc, sc);
      b.mesh.position.set(b.baseX, b.baseY + ep * 0.55, b.baseZ);
      ud.jawGroup.rotation.x = -0.78 * (1 - ep);
      ud.light.intensity = Math.max(0, (1 - ep) * 2.0);
      if (ep >= 1) {
        scene.remove(b.mesh);
        disposeObject3D(b.mesh);
        activeBlasters3D.splice(i, 1);
      }
    }
  }

  // Hoạt ảnh vòng nổ Hư Không tại điểm phóng Shade Soul
  for (let i = activeVoidBursts3D.length - 1; i >= 0; i--) {
    const vb = activeVoidBursts3D[i];
    vb.elapsed += dt;
    const p = Math.min(1, vb.elapsed / vb.duration);
    const easeOut = 1 - Math.pow(1 - p, 3);
    const sc = 0.35 + easeOut * 1.95;
    vb.mesh.scale.set(sc, sc, 1);
    vb.mesh.rotation.z += dt * 4.5;
    const ud = vb.mesh.userData;
    const fade = Math.max(0, 1 - p);
    ud.darkRingMat.opacity = 0.92 * fade;
    ud.violetRingMat.opacity = 0.88 * fade;
    ud.soulWave.scale.setScalar(1 + p * 0.45);
    ud.light.intensity = 3.6 * fade;
    if (p >= 1) {
      scene.remove(vb.mesh);
      disposeObject3D(vb.mesh);
      activeVoidBursts3D.splice(i, 1);
    }
  }

  // Hoạt ảnh 3D Shade Soul của The Knight (bay xuyên tường + tua Hư Không uốn lượn + giọt mực)
  for (let i = activeShadeSouls3D.length - 1; i >= 0; i--) {
    const s = activeShadeSouls3D[i];
    s.elapsed += dt;
    s.traveled += s.speed * dt;
    const fx = -Math.sin(s.yaw), fy = -Math.cos(s.yaw);
    const curX = s.startX + fx * s.traveled;
    const curY = s.startY + fy * s.traveled;
    const ud = s.mesh.userData;

    const growIn = Math.min(1, s.elapsed / 0.14);
    const remainRatio = Math.max(0, 1 - s.traveled / s.range);
    const fadeOut = remainRatio < 0.14 ? Math.max(0.01, remainRatio / 0.14) : 1.0;
    const sc = (0.45 + (1 - Math.pow(1 - growIn, 3)) * 0.72) * fadeOut;

    s.mesh.position.set(curX * WORLD_SCALE, 1.48 + Math.sin(t * 14 + i) * 0.045, curY * WORLD_SCALE);
    s.mesh.scale.set(sc, sc, sc * (1.0 + (1 - growIn) * 0.35));

    // Uốn lượn 7 tua râu Hư Không sống động
    ud.tendrils.forEach(th => {
      const ph = th.userData.phase;
      th.rotation.x = Math.sin(t * 16 + ph) * 0.13;
      th.rotation.y = Math.cos(t * 14 + ph) * 0.14;
      th.rotation.z = Math.sin(t * 11 + ph) * 0.10;
    });

    // Chuyển động hạt mực đen & đốm linh hồn kéo đuôi
    ud.particles.forEach(sp => {
      const d = sp.userData;
      const cycle = ((d.zOff + s.elapsed * d.speed) % 3.4) + 0.45;
      sp.position.set(
        d.baseX + Math.sin(t * 9 + d.phase) * 0.09,
        d.baseY + Math.cos(t * 8 + d.phase) * 0.09,
        cycle
      );
    });

    ud.auraRing.rotation.z += dt * 9;
    ud.rimGlowMat.opacity = 0.36 * fadeOut;
    ud.pierceBodyMat.opacity = 0.30 * fadeOut;
    ud.pierceEyeMat.opacity = 0.82 * fadeOut;
    ud.light.intensity = 3.2 * fadeOut;

    if (s.traveled >= s.range) {
      scene.remove(s.mesh);
      disposeObject3D(s.mesh);
      activeShadeSouls3D.splice(i, 1);
    }
  }

  const meObj = renderPlayers.find(p => p.id === myId);
  if (meObj && localPlayer.initialized && gamePhase !== 'ended') {
    const keyTurnSpeed = 2.25 * userSettings.mouseSens;
    if (keys['arrowleft']) camYaw += keyTurnSpeed * dt;
    if (keys['arrowright']) camYaw -= keyTurnSpeed * dt;

    let forward = -joystickVec.dy, strafe = joystickVec.dx;
    if (Math.abs(forward) < 0.05 && Math.abs(strafe) < 0.05) {
      if (keys['w'] || keys['arrowup']) forward += 1; if (keys['s'] || keys['arrowdown']) forward -= 1;
      if (keys['d']) strafe += 1; if (keys['a']) strafe -= 1;
    }

    let wDx = 0, wDy = 0, mag = Math.hypot(forward, strafe);
    if (mag > 0.05) {
      const c = Math.min(1, mag), nf = (forward / mag) * c, ns = (strafe / mag) * c;
      wDx = (-Math.sin(camYaw)) * nf + Math.cos(camYaw) * ns;
      wDy = (-Math.cos(camYaw)) * nf + (-Math.sin(camYaw)) * ns;
    }

    const prevX = localPlayer.x, prevY = localPlayer.y;
    let spd = meObj.role === 'seeker' ? getSeekerMoveSpeed(meObj, isFinalMinute) : HIDER_SPEED, physPhase = gamePhase;
    if (meObj.status === 'jailed') spd = HIDER_SPEED * 0.75;
    else if (meObj.status === 'eliminated') { spd = HIDER_SPEED * 1.15; physPhase = 'playing'; }

    if (meObj.stunTimer > 0 && (meObj.role === 'seeker' || (meObj.role === 'hider' && meObj.status === 'alive'))) {
      localPlayer.moving = false;
    } else {
      const proxy = { x: localPlayer.x, y: localPlayer.y, status: meObj.status };
      moveWithCollision(proxy, wDx * spd, wDy * spd, dt, physPhase);
      localPlayer.x = proxy.x; localPlayer.y = proxy.y;
      localPlayer.moving = Math.hypot(localPlayer.x - prevX, localPlayer.y - prevY) > 0.15;
    }

    if (isHost && hostRoom && hostRoom.players[myId] && hostRoom.players[myId].tpSeq === localPlayer.tpSeq) {
      const hp = hostRoom.players[myId]; hp.x = localPlayer.x; hp.y = localPlayer.y; hp.yaw = camYaw; hp.moving = localPlayer.moving;
    } else if (!isHost && hostConn && hostConn.open && now - lastPosSendMs >= 33) {
      lastPosSendMs = now; hostConn.send({ type: 'pos', ...buildActionSnapshot() });
    }
  }

  const seekerXrayPulseOn = !!(meObj && meObj.role === 'seeker' && isFinalMinute && xrayActive);
  if (seekerXrayPulseOn) xraySilhouetteMat.opacity = 0.45 + Math.sin(t * 10) * 0.18;

  fpFlashlight.visible = !!(meObj && meObj.role === 'hider' && meObj.status === 'alive' && meObj.hasItem);
  if (fpFlashlight.visible) fpFlashlight.position.y = -0.30 + (localPlayer.moving ? Math.sin(t * 12) * 0.015 : Math.sin(t * 2.2) * 0.005);

  const smoothAlpha = 1 - Math.exp(-14 * dt), activeIds = new Set();
  const viewerX = localPlayer.initialized ? localPlayer.x : (meObj ? meObj.x : 0);
  const viewerY = localPlayer.initialized ? localPlayer.y : (meObj ? meObj.y : 0);
  let seekerLightPos = null, seekerLightTheme = 'normal';

  renderPlayers.forEach(p => {
    activeIds.add(p.id);
    if (p.id === myId) {
      if (playerMeshes[p.id]) playerMeshes[p.id].mesh.visible = false;
      if (p.role === 'seeker' && localPlayer.initialized) { seekerLightPos = { x: localPlayer.x, y: localPlayer.y }; seekerLightTheme = p.sansActive ? 'sans' : (p.knightActive ? 'knight' : 'normal'); }
      return;
    }
    const sp = smoothPlayers[p.id] || { x: p.x, y: p.y, yaw: p.yaw };
    if (Math.hypot(p.x - sp.x, p.y - sp.y) > 220) { sp.x = p.x; sp.y = p.y; }
    else { sp.x += (p.x - sp.x) * smoothAlpha; sp.y += (p.y - sp.y) * smoothAlpha; }
    let dyaw = p.yaw - sp.yaw; while (dyaw > Math.PI) dyaw -= Math.PI * 2; while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    sp.yaw += dyaw * smoothAlpha; smoothPlayers[p.id] = sp;
    if (p.role === 'seeker') { seekerLightPos = { x: sp.x, y: sp.y }; seekerLightTheme = p.sansActive ? 'sans' : (p.knightActive ? 'knight' : 'normal'); }

    const entry = syncPlayerMesh3D(p), visibleInWorld = (p.status !== 'eliminated');
    entry.mesh.visible = visibleInWorld;
    if (visibleInWorld) {
      entry.mesh.position.set(sp.x * WORLD_SCALE, 0, sp.y * WORLD_SCALE); entry.mesh.rotation.y = sp.yaw;
      const ud = entry.mesh.userData;
      if (ud.spinWheel) ud.spinWheel.rotation.z += dt * 1.1;
      if (ud.sansEyeGlow) {
        const s = (p.role === 'seeker' ? 0.34 : 0.20) + Math.sin(t * 8.0) * 0.04;
        ud.sansEyeGlow.scale.set(s, s, 1);
      }
      if (ud.knightSoulGroup) {
        const speed = p.role === 'seeker' ? 1.55 : 0.9;
        ud.knightSoulGroup.children.forEach(sp => {
          const d = sp.userData;
          const a = d.baseAng + t * speed;
          sp.position.set(Math.cos(a) * d.rad, d.baseY + Math.sin(t * 2.6 + d.phase) * 0.11, Math.sin(a) * d.rad);
        });
      }
      if (ud.seekerAuraRing) { const pulse = 1 + Math.sin(t * 6) * 0.14; ud.seekerAuraRing.scale.set(pulse, pulse, 1); ud.seekerAuraRing.material.opacity = 0.5 + Math.sin(t * 6) * 0.22; }
      if (ud.stunEffectGroup) {
        const showStun = ((p.role === 'seeker' || (p.role === 'hider' && p.status === 'alive')) && p.stunTimer > 0);
        ud.stunEffectGroup.visible = showStun;
        if (showStun) {
          const src = p.stunSource || 'sans';
          if (ud.stunEffectGroup.userData.lastSource !== src) {
            ud.stunEffectGroup.userData.lastSource = src;
            ud.stunEffectGroup.userData.rMat1.color.setHex(src === 'knight' ? 0xa78bfa : 0x38bdf8);
            ud.stunEffectGroup.userData.rMat2.color.setHex(src === 'knight' ? 0xf5f3ff : 0xe0f2fe);
          }
          ud.stunEffectGroup.userData.ring1.rotation.z += dt * 5.2;
          ud.stunEffectGroup.userData.ring2.rotation.z -= dt * 6.4;
        }
      }

      const showXrayForThis = seekerXrayPulseOn && p.role === 'hider' && p.status === 'alive';
      if (ud.xrayGroup) ud.xrayGroup.visible = showXrayForThis;
      if (entry.nameTag) {
        if (showXrayForThis) {
          entry.nameTag.visible = true; entry.nameTag.material.depthTest = false;
          if (entry.nameTag.material.fog !== false) { entry.nameTag.material.fog = false; entry.nameTag.material.needsUpdate = true; }
          entry.nameTag.renderOrder = 1000;
        } else {
          entry.nameTag.visible = Math.hypot(sp.x - viewerX, sp.y - viewerY) < 310 && hasLineOfSight(viewerX, viewerY, sp.x, sp.y);
          entry.nameTag.material.depthTest = true;
          if (entry.nameTag.material.fog !== true) { entry.nameTag.material.fog = true; entry.nameTag.material.needsUpdate = true; }
          entry.nameTag.renderOrder = 0;
        }
      }

      if (p.moving) {
        ud.bodyGroup.position.y = Math.abs(Math.sin(t * 13)) * 0.12; ud.bodyGroup.rotation.z = Math.sin(t * 13) * 0.08;
        ud.leftLeg.rotation.x = Math.sin(t * 13) * 0.45; ud.rightLeg.rotation.x = -Math.sin(t * 13) * 0.45;
      } else { ud.bodyGroup.position.y = 0; ud.bodyGroup.rotation.z = 0; ud.leftLeg.rotation.x = 0; ud.rightLeg.rotation.x = 0; }
    }
  });

  if (seekerLightPos && gamePhase !== 'ended') {
    seekerRedLight.visible = true;
    const lightHex = seekerLightTheme === 'sans' ? 0x1e9eff : (seekerLightTheme === 'knight' ? 0x8b6dff : 0xff1a24);
    seekerRedLight.color.setHex(lightHex);
    seekerRedLight.position.set(seekerLightPos.x * WORLD_SCALE, 1.85, seekerLightPos.y * WORLD_SCALE);
    const isSpecial = (seekerLightTheme !== 'normal');
    const baseInt = (meObj && meObj.role === 'seeker') ? (isSpecial ? 1.78 : 1.45) : (isSpecial ? 4.1 : 3.4);
    seekerRedLight.intensity = baseInt + Math.sin(t * 5.5) * 0.5;
  } else seekerRedLight.visible = false;

  for (const id in playerMeshes) if (!activeIds.has(id)) { disposeNameTag(playerMeshes[id].nameTag); scene.remove(playerMeshes[id].mesh); delete playerMeshes[id]; }

  if (localPlayer.initialized && meObj) {
    const isSpec = (meObj.status === 'eliminated');
    const bob = (localPlayer.moving && !isSpec) ? Math.sin(t * 12) * 0.075 : 0;
    camera.position.set(localPlayer.x * WORLD_SCALE, isSpec ? 2.55 : (1.62 + bob), localPlayer.y * WORLD_SCALE);
    camera.rotation.y = camYaw; camera.rotation.x = camPitch; playerFlashLight.position.copy(camera.position);

    const meIsHidden = !!(meObj.sansActive || meObj.knightActive || meObj.secretChar);
    const targetFov = baseCameraFov + (
      (meObj.role === 'seeker' && gamePhase === 'playing')
        ? (isFinalMinute ? 3.5 : ((!meIsHidden && (meObj.boostTimer || 0) > 0) ? 8.0 : 0))
        : 0
    );
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 8);
      camera.updateProjectionMatrix();
    }
  }

  renderer.render(scene, camera);
  drawMinimap(localPlayer.initialized ? localPlayer : null, meObj);
}

requestAnimationFrame(animate);
