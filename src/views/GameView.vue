<template>
  <div class="game-wrap" ref="wrap" :class="{ pseudo: isPseudoFullscreen }">
    <canvas ref="canvas" class="game-canvas"></canvas>

    <!-- HUD -->
    <div class="hud">
      <div class="stats">
        <span>Score: {{ score }}</span>
        <span>Best: {{ bestScore }}</span>
        <span>Combo: {{ combo }}x</span>
        <span>HP: {{ Math.max(0, Math.ceil(player.hp)) }}</span>
        <span>Wave: {{ wave }}</span>
        <span>Boss: {{ Math.ceil(bossTimer) }}s</span>
        <span v-if="paused">⏸ Paused</span>
        <span v-if="gamepad.name" class="pad">🎮 {{ gamepad.name }}</span>
        <span v-if="autoAim.enabled && isTouchDevice" class="pad">🎯 AimAssist</span>
        <span v-if="!audio.ready" class="pad">🔇 轻点屏幕以启用声音</span>
        <span v-if="!assets.ready" class="pad">🖼️ 贴图加载中…</span>
      </div>

      <div class="buffs" v-if="activeBuffs.length">
        <div class="buff" v-for="b in activeBuffs" :key="b.kind">
          <span class="tag">{{ b.kind }}</span>
          <span class="time">{{ b.left.toFixed(1) }}s</span>
        </div>
      </div>

      <div class="actions">
        <button @click="togglePause">{{ paused ? '继续' : '暂停' }}</button>
        <button @click="toggleAutoFire">{{ autoFire ? '自动攻击：开' : '自动攻击：关' }}</button>
        <button @click="toggleFullscreen">{{ isAnyFullscreen ? '退出全屏' : '全屏' }}</button>
        <button @click="toggleSettings">{{ settingsOpen ? '关闭设置' : '设置' }}</button>
      </div>

      <SettingsPanel v-if="settingsOpen" :showRestart="true" @restart="restart" />

      <div class="tips">
        键鼠：WASD + 鼠标 ｜ 手柄：左摇杆移动、右摇杆瞄准、RT/A 射击 ｜ 触屏：左下移动，右下瞄准（轻推触发自动瞄准）。
      </div>
    </div>

    <!-- 触控层（仅触屏设备渲染） -->
    <div
      v-if="isTouchDevice"
      class="touch-layer"
      @touchstart.prevent.stop="onTouchStart"
      @touchmove.prevent.stop="onTouchMove"
      @touchend.prevent.stop="onTouchEnd"
      @touchcancel.prevent.stop="onTouchEnd">
    </div>

    <!-- 左虚拟摇杆 -->
    <div v-show="isTouchDevice && touch.left.active" class="joystick" :style="joyStyle(touch.left)">
      <div class="base"></div>
      <div class="stick" :style="stickStyle(touch.left)"></div>
    </div>
    <!-- 右虚拟摇杆 -->
    <div v-show="isTouchDevice && touch.right.active" class="joystick" :style="joyStyle(touch.right)">
      <div class="base"></div>
      <div class="stick" :style="stickStyle(touch.right)"></div>
    </div>
  </div>
</template>

<script>
import SettingsPanel from '../components/SettingsPanel.vue'
const LS_KEY = 'zombie-best-score-v1';
const VOL_KEY = 'zombie-volume';
const MUTE_KEY = 'zombie-muted';
const BGM_KEY = 'zombie-bgm';

/* ===== 内置SVG精灵（可替换为你的 PNG/SVG 地址） ===== */
const PLAYER_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
  <defs><radialGradient id='g' cx='50%' cy='45%' r='55%'>
    <stop offset='0%' stop-color='#ffffff'/><stop offset='100%' stop-color='#cfe9ff'/></radialGradient></defs>
  <circle cx='32' cy='32' r='14' fill='url(#g)' stroke='#9ccfff' stroke-width='2'/>
  <rect x='32' y='29' width='18' height='6' rx='3' fill='#8fd1ff' stroke='#5fb6ff' stroke-width='1'/>
  <circle cx='26' cy='28' r='2' fill='#2d3a4a'/><circle cx='26' cy='36' r='2' fill='#2d3a4a'/>
</svg>`);
const ZOMBIE_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
  <defs><radialGradient id='zg' cx='50%' cy='45%' r='60%'>
    <stop offset='0%' stop-color='#b9f6a5'/><stop offset='100%' stop-color='#56b870'/></radialGradient></defs>
  <circle cx='32' cy='32' r='13' fill='url(#zg)' stroke='#2d6e49' stroke-width='2'/>
  <circle cx='27' cy='28' r='3' fill='#ffffff'/><circle cx='38' cy='30' r='2' fill='#ffffff'/>
  <path d='M24 38 Q32 34 40 38' stroke='#183a2a' stroke-width='3' fill='none' stroke-linecap='round'/>
</svg>`);
const ELITE_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
  <defs><radialGradient id='eg' cx='50%' cy='45%' r='60%'>
    <stop offset='0%' stop-color='#ffd1a6'/><stop offset='100%' stop-color='#ff6b3d'/></radialGradient></defs>
  <circle cx='32' cy='32' r='14' fill='url(#eg)' stroke='#a13a14' stroke-width='2'/>
  <circle cx='27' cy='28' r='3' fill='#ffffff'/><circle cx='38' cy='30' r='2' fill='#ffffff'/>
  <path d='M24 38 Q32 42 40 38' stroke='#6a1200' stroke-width='3' fill='none' stroke-linecap='round'/>
</svg>`);

/* ===== 随机 & 地形工具 ===== */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function seedFrom(cx, cy, worldSeed){const s=((cx*73856093)^(cy*19349663)^worldSeed)>>>0;return s>>>0;}

export default {
  name: 'ZombieGame',
  components: { SettingsPanel },
  data() {
    return {
      // DOM
      wrap: null, canvas: null, ctx: null,
      dpr: Math.min(window.devicePixelRatio || 1, 2),

      // runtime
      running: false, paused: false, lastTime: 0, accTime: 0,

      // fullscreen
      isNativeFullscreen: false, isPseudoFullscreen: false,

      // player（世界坐标）
      player: { x: 0, y: 0, r: 14, baseSpeed: 220, speed: 220, hp: 100, dir: 0, fireCooldown: 0 },

      // inputs
      keys: new Set(),
      mouse: { x: 0, y: 0, down: false },
      gamepad: { index: -1, name: '', connected: false },
      gp: { lx:0, ly:0, rx:0, ry:0, rt:0, fire:false, pause:false },

      touch: {
        left:  { id:-1, active:false, cx:0, cy:0, x:0, y:0, r:60, max:60, vx:0, vy:0, mag:0 },
        right: { id:-1, active:false, cx:0, cy:0, x:0, y:0, r:60, max:60, vx:0, vy:0, mag:0 },
      },

      // auto-aim
      autoAim: { enabled:true, range:260, minStickToFire:0.08, weakThreshold:0.25, highlight:null },

      // auto fire
      autoFire: false,

      // settings
      settingsOpen: false,

      // world / infinite
      worldSeed: Math.floor(Math.random()*2**31)>>>0,
      chunkSize: 512,
      chunks: new Map(),
      visibleObstacles: [],

      // entities
      bullets: [], zombies: [], particles: [], drops: [],

      // spawn
      spawnTimer: 0, spawnInterval: 1.0, wave: 1,
      bossTimer: 180, bossInterval: 180,

      // score
      score: 0, bestScore: 0, combo: 1, comboTimer: 0,

      // buffs
      buff: { speed: 0, spread: 0, burn: 0, pierce: 0, bounce: 0, split: 0 },

      // device
      isTouchDevice: false,

      // audio（含更劲爆BGM）
      audio: {
        ctx: null, ready: false,
        master: null, fxGain: null, bgmGain: null,
        volume: 0.8, muted: false, bgmOn: true,
        lastShotAt: 0, lastHitAt: 0, lastPickupAt: 0,
        // pad
        pad1: null, pad2: null, lfo: null, filter: null,
        // beat
        tempo: 118, beatTimer: null, beatStep: 0,
        bgmPlaying: false,
      },

      // assets
      assets: { ready:false, player:null, zombie:null, elite:null },

      // 小地图 / 雷达
      minimap: {
        open: true,
        zoom: 0.12,             // 像素/世界单位（越大越放大）
        minZoom: 0.05,
        maxZoom: 0.4,
        closedW: 220, closedH: 220,
        openW: 360, openH: 280,
        margin: 10,
        size: 'medium',
        // 运行时缓存的屏幕矩形，用于滚轮命中检测
        _rect: { x: 0, y: 0, w: 0, h: 0 },
      },
    };
  },
  computed: {
    settings() { return this.$store.state.settings; },
    activeBuffs() {
      const list = [];
      if (this.buff.speed > 0)  list.push({ kind: '⚡Speed', left: this.buff.speed });
      if (this.buff.spread > 0) list.push({ kind: '🔱Spread', left: this.buff.spread });
      if (this.buff.burn > 0)   list.push({ kind: '🔥Burn', left: this.buff.burn });
      if (this.buff.pierce > 0) list.push({ kind: '🎯Pierce', left: this.buff.pierce });
      if (this.buff.bounce > 0) list.push({ kind: '↩️Bounce', left: this.buff.bounce });
      if (this.buff.split > 0)  list.push({ kind: '🔀Split', left: this.buff.split });
      return list;
    },
    isAnyFullscreen() { return this.isNativeFullscreen || this.isPseudoFullscreen; }
  },
  watch: {
    'settings.volume'(v) {
      this.audio.volume = v;
      this.setMasterGain(v);
    },
    'settings.muted'(v) {
      this.audio.muted = v;
      this.setMasterGain(this.audio.volume);
    },
    'settings.bgmOn'(v) {
      this.audio.bgmOn = v;
      if (v) this.startBgm(); else this.stopBgm();
    },
    'settings.minimapOpen'(v) { this.minimap.open = v; },
    'settings.minimapSize'(v) { this.minimap.size = v; this.updateMinimapSize(); }
  },
  mounted() {
    // touch check
    this.isTouchDevice =
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);

    // audio prefs
    const v = Number(localStorage.getItem(VOL_KEY));
    if (!Number.isNaN(v) && v >= 0 && v <= 1) this.audio.volume = v;
    this.audio.muted = localStorage.getItem(MUTE_KEY) === '1';
    const bgmSaved = localStorage.getItem(BGM_KEY);
    if (bgmSaved === '0' || bgmSaved === '1') this.audio.bgmOn = (bgmSaved === '1');
    this.$store.commit('setVolume', this.audio.volume);
    this.$store.commit('setMuted', this.audio.muted);
    this.$store.commit('setBgmOn', this.audio.bgmOn);

    this.minimap.open = this.settings.minimapOpen;
    this.minimap.size = this.settings.minimapSize;
    this.updateMinimapSize();

    this.bestScore = Number(localStorage.getItem(LS_KEY) || 0);

    this.wrap = this.$refs.wrap;
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.handleResize();
    window.addEventListener('resize', this.handleResize, { passive: true });

    // inputs
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    this.canvas.addEventListener('mousemove', this.onMouseMove, { passive: true });
    this.canvas.addEventListener('mousedown', this.onMouseDown, { passive: false });
    window.addEventListener('mouseup', this.onMouseUp, { passive: true });
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.reset();

    // load sprites & run
    this.loadSprites().then(() => {
      this.assets.ready = true;
      this.running = true;
      requestAnimationFrame(this.loop);
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.stopBgm(true);
  },
  methods: {
    /* ===== Sprites ===== */
    loadSprites() {
      const mk = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
      return Promise.all([
        mk(`data:image/svg+xml;utf8,${PLAYER_SVG}`),
        mk(`data:image/svg+xml;utf8,${ZOMBIE_SVG}`),
        mk(`data:image/svg+xml;utf8,${ELITE_SVG}`),
      ]).then(([player, zombie, elite]) => {
        this.assets.player = player; this.assets.zombie = zombie; this.assets.elite = elite;
      }).catch(() => {
        this.assets.player = this.assets.zombie = this.assets.elite = null;
      });
    },
    drawSprite(img, x, y, r, rotation = 0) {
      if (!img) return false;
      const ctx = this.ctx;
      const size = r * 2;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rotation);
      ctx.drawImage(img, -r, -r, size, size);
      ctx.restore();
      return true;
    },

    /* ===== Fullscreen ===== */
    hasNativeFullscreen() {
      const el = this.wrap;
      return !!(el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen);
    },
    async enterNativeFullscreen() {
      const el = this.wrap;
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) await el.msRequestFullscreen();
        this.isNativeFullscreen = true;
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
      } catch { this.isNativeFullscreen = false; this.enterPseudoFullscreen(); }
    },
    async exitNativeFullscreen() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (document.webkitFullscreenElement && document.webkitExitFullscreen) await document.webkitExitFullscreen();
        this.isNativeFullscreen = false;
      } catch {}
    },
    enterPseudoFullscreen() { this.isPseudoFullscreen = true; setTimeout(()=>window.scrollTo(0,0),0); },
    exitPseudoFullscreen() { this.isPseudoFullscreen = false; },
    async toggleFullscreen() {
      await this.ensureAudio();
      if (!this.isAnyFullscreen) { if (this.hasNativeFullscreen()) await this.enterNativeFullscreen(); else this.enterPseudoFullscreen(); }
      else { if (this.isNativeFullscreen) await this.exitNativeFullscreen(); if (this.isPseudoFullscreen) this.exitPseudoFullscreen(); }
      setTimeout(this.handleResize, 50);
    },
    onFullscreenChange() {
      const el = document.fullscreenElement || document.webkitFullscreenElement || null;
      this.isNativeFullscreen = !!el;
      setTimeout(this.handleResize, 50);
    },

    /* ===== Audio (更劲爆BGM) ===== */
    async ensureAudio() {
      if (this.audio.ready && this.audio.ctx && this.audio.ctx.state === 'running') return true;
      try {
        if (!this.audio.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return false;
          this.audio.ctx = new AudioCtx();
        }
        if (!this.audio.master) {
          const ctx = this.audio.ctx;
          this.audio.master = ctx.createGain();
          this.audio.fxGain = ctx.createGain();
          this.audio.bgmGain = ctx.createGain();
          this.audio.master.gain.value = this.audio.muted ? 0 : this.audio.volume;
          this.audio.fxGain.gain.value = 1.0;
          this.audio.bgmGain.gain.value = 0.0; // 渐入
          this.audio.fxGain.connect(this.audio.master);
          this.audio.bgmGain.connect(this.audio.master);
          this.audio.master.connect(ctx.destination);
        }
        if (this.audio.ctx.state !== 'running') await this.audio.ctx.resume();

        // unlock pulse
        const b = this.audio.ctx.createBuffer(1, 1, 44100);
        const s = this.audio.ctx.createBufferSource(); s.buffer = b; s.connect(this.audio.fxGain); s.start(0);

        this.audio.ready = (this.audio.ctx.state === 'running');
        if (this.audio.ready && this.audio.bgmOn && !this.audio.bgmPlaying) this.startBgm(true);
        return this.audio.ready;
      } catch { return false; }
    },
    setMasterGain(vol) {
      if (!this.audio.master) return;
      const target = this.audio.muted ? 0 : vol;
      this.audio.master.gain.setTargetAtTime(target, this.audio.ctx.currentTime, 0.015);
    },
    async onVisibilityChange() {
      if (!this.audio.ctx) return;
      if (document.visibilityState === 'visible') {
        try {
          await this.audio.ctx.resume();
          this.audio.ready = (this.audio.ctx.state === 'running');
          if (this.audio.ready && this.audio.bgmOn && !this.audio.bgmPlaying) this.startBgm(true);
        } catch {}
      }
    },
    startBgm(isResume = false) {
      if (!this.audio.ready || this.audio.bgmPlaying) return;
      const ctx = this.audio.ctx;

      // --- pad 持续音（保留一点氛围） ---
      const pad1 = ctx.createOscillator(); pad1.type = 'sine'; pad1.frequency.value = 220;
      const pad2 = ctx.createOscillator(); pad2.type = 'sine'; pad2.frequency.value = 329.63;
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 6;
      lfo.connect(lfoGain); lfoGain.connect(pad1.detune); lfoGain.connect(pad2.detune);
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1000; filter.Q.value = 0.6;
      pad1.connect(filter); pad2.connect(filter); filter.connect(this.audio.bgmGain);

      // 渐入
      const now = ctx.currentTime;
      const startGain = isResume ? this.audio.bgmGain.gain.value : 0;
      this.audio.bgmGain.gain.cancelScheduledValues(now);
      this.audio.bgmGain.gain.setValueAtTime(startGain, now);
      this.audio.bgmGain.gain.linearRampToValueAtTime(0.25, now + 1.0);

      lfo.start(now); pad1.start(now); pad2.start(now);
      this.audio.pad1 = pad1; this.audio.pad2 = pad2; this.audio.lfo = lfo; this.audio.filter = filter;

      // --- 节拍（踢/军鼓/帽镲）+ 简单低音 ---
      this.audio.beatStep = 0;
      const interval = (60 / this.audio.tempo) / 2 * 1000; // 8分音符间隔
      this.audio.beatTimer = setInterval(() => {
        const s = this.audio.beatStep % 16;

        // K: 0, 8, 12；S: 4, 12；H: 偶数步
        if (s === 0 || s === 8 || s === 12) this.bgmKick();
        if (s === 4 || s === 12) this.bgmSnare();
        if (s % 2 === 0) this.bgmHat();

        // 简单低音：在强拍给个短促锯齿包络
        if (s === 0 || s === 8) this.bgmBass(110);      // A2
        if (s === 4) this.bgmBass(146.83);              // D3
        if (s === 12) this.bgmBass(98);                 // G2

        this.audio.beatStep++;
      }, interval);

      this.audio.bgmPlaying = true;
    },
    stopBgm(immediate = false) {
      if (!this.audio.bgmPlaying) return;
      const ctx = this.audio.ctx; const now = ctx.currentTime;

      // 渐出
      this.audio.bgmGain.gain.cancelScheduledValues(now);
      if (immediate) this.audio.bgmGain.gain.setValueAtTime(0, now);
      else {
        this.audio.bgmGain.gain.setValueAtTime(this.audio.bgmGain.gain.value, now);
        this.audio.bgmGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
      }
      const stopAt = immediate ? now + 0.01 : now + 0.65;

      // 停 pad & LFO
      try { this.audio.pad1 && this.audio.pad1.stop(stopAt); } catch {}
      try { this.audio.pad2 && this.audio.pad2.stop(stopAt); } catch {}
      try { this.audio.lfo && this.audio.lfo.stop(stopAt); } catch {}
      this.audio.pad1 = this.audio.pad2 = this.audio.lfo = this.audio.filter = null;

      // 停 beat
      if (this.audio.beatTimer) { clearInterval(this.audio.beatTimer); this.audio.beatTimer = null; }

      this.audio.bgmPlaying = false;
    },

    // ---- BGM 子音色（连到 bgmGain）----
    bgmOneShot({ type='sine', freq=220, glide=0, dur=0.12, gain=0.25, attack=0.003, decay=0.10 }) {
      if (!this.audio.ready) return;
      const ctx = this.audio.ctx, t0 = ctx.currentTime;
      const osc = ctx.createOscillator(); osc.type = type;
      const g = ctx.createGain();

      osc.frequency.setValueAtTime(Math.max(40, freq), t0);
      if (glide !== 0) {
        const endFreq = Math.max(40, freq + glide);
        osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + Math.max(0.03, dur));
      }
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(attack + decay, dur));
      osc.connect(g).connect(this.audio.bgmGain);
      osc.start(t0); osc.stop(t0 + dur + 0.06);
    },
    bgmKick() { // 短促下滑的低频
      this.bgmOneShot({ type:'sine', freq:130, glide:-90, dur:0.18, gain:0.35, attack:0.002, decay:0.14 });
    },
    bgmSnare() { // 噪声+三角
      if (!this.audio.ready) return;
      const ctx = this.audio.ctx, t0 = ctx.currentTime;

      // 三角主体
      this.bgmOneShot({ type:'triangle', freq:220, glide:-60, dur:0.09, gain:0.18, attack:0.002, decay:0.08 });

      // 噪声
      const len = 0.06;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2 - 1) * 0.5;
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.18, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      src.connect(g).connect(this.audio.bgmGain);
      src.start(t0); src.stop(t0 + len + 0.02);
    },
    bgmHat() { // 短噪声
      if (!this.audio.ready) return;
      const ctx = this.audio.ctx, t0 = ctx.currentTime;
      const len = 0.02;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2 - 1) * 0.35;
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.16, t0 + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      src.connect(g).connect(this.audio.bgmGain);
      src.start(t0); src.stop(t0 + len + 0.02);
    },
    bgmBass(freq) { // 锯齿+低通
      if (!this.audio.ready) return;
      const ctx = this.audio.ctx, t0 = ctx.currentTime;
      const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, t0);
      const filter = ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value = 800; filter.Q.value = 0.7;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.22, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      osc.connect(filter).connect(g).connect(this.audio.bgmGain);
      osc.start(t0); osc.stop(t0 + 0.24);
    },

    // ---- 通用SFX（射击/命中/拾取）----
    now() { return (this.audio.ctx ? this.audio.ctx.currentTime : 0) || 0; },
    oneShot({ type='square', freq=440, glide=-200, dur=0.10, gain=0.16, attack=0.004, decay=0.10 }) {
      if (!this.audio.ready) return;
      const ctx = this.audio.ctx;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(40, freq), t0);
      if (glide !== 0) { const endFreq = Math.max(40, freq + glide); osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + Math.max(0.03, dur)); }
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(attack + decay, dur));
      osc.connect(g).connect(this.audio.fxGain); osc.start(t0); osc.stop(t0 + dur + 0.06);
    },
    sfxShot() { if (!this.audio.ready) return; const t = this.now(); if (t - this.audio.lastShotAt < 0.045) return; this.audio.lastShotAt = t; this.oneShot({ type:'square', freq:1000, glide:-800, dur:0.07, gain:0.14, attack:0.002, decay:0.06 }); },
    sfxHit() {
      if (!this.audio.ready) return; const t = this.now(); if (t - this.audio.lastHitAt < 0.03) return; this.audio.lastHitAt = t;
      this.oneShot({ type:'triangle', freq:240, glide:-140, dur:0.06, gain:0.18, attack:0.0015, decay:0.06 });
      const ctx=this.audio.ctx, len=0.04, buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*len),ctx.sampleRate), data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.6;
      const src=ctx.createBufferSource(); src.buffer=buffer; const g=ctx.createGain(); const t0=ctx.currentTime;
      g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(0.12,t0+0.005); g.gain.exponentialRampToValueAtTime(0.0001,t0+len);
      src.connect(g).connect(this.audio.fxGain); src.start(t0); src.stop(t0+len+0.02);
    },
    sfxPickup() { if (!this.audio.ready) return; const t = this.now(); if (t - this.audio.lastPickupAt < 0.08) return; this.audio.lastPickupAt = t; this.oneShot({ type:'sine', freq:920, glide:0, dur:0.10, gain:0.13, attack:0.0015, decay:0.09 }); },

    /* ===== Layout ===== */
    handleResize() {
      const styleWidth = window.innerWidth, styleHeight = window.innerHeight;
      this.canvas.width = Math.floor(styleWidth * this.dpr);
      this.canvas.height = Math.floor(styleHeight * this.dpr);
      this.canvas.style.width = styleWidth + 'px';
      this.canvas.style.height = styleHeight + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.updateMinimapSize();
    },
    updateMinimapSize() {
      const mm = this.minimap;
      const base = Math.min(window.innerWidth, window.innerHeight);
      let factor = 0.22;
      if (mm.size === 'small') factor = 0.15;
      else if (mm.size === 'large') factor = 0.3;
      mm.closedW = mm.closedH = Math.floor(base * factor);
      mm.openW = Math.floor(mm.closedW * 1.6);
      mm.openH = Math.floor(mm.closedH * 1.3);
    },
    reset() {
      this.player.x = 0; this.player.y = 0;
      this.player.hp = 100; this.player.speed = this.player.baseSpeed;
      this.score = 0; this.combo = 1; this.comboTimer = 0;
      this.wave = 1; this.spawnInterval = 1.0; this.spawnTimer = 0;
      this.bullets = []; this.zombies = []; this.particles = []; this.drops = [];
      this.buff.speed = 0; this.buff.spread = 0; this.buff.burn = 0; this.buff.pierce = 0; this.buff.bounce = 0; this.buff.split = 0;
      this.bossTimer = this.bossInterval;
      this.paused = false; this.lastTime = performance.now();
      this.touch.left.active = false; this.touch.left.id = -1;
      this.touch.right.active = false; this.touch.right.id = -1;
      this.autoAim.highlight = null;
      this.chunks.clear(); this.visibleObstacles = [];
    },
    restart() {
      this.reset();
      this.settingsOpen = false;
    },
    togglePause() { this.paused = !this.paused; },
    toggleAutoFire() { this.autoFire = !this.autoFire; },
    toggleSettings() {
      this.settingsOpen = !this.settingsOpen;
      this.paused = this.settingsOpen;
    },

    /* ===== Input ===== */
    async onKeyDown(e) {
      await this.ensureAudio();
      const k = e.key.toLowerCase();
      if (['w','a','s','d'].includes(k)) this.keys.add(k);
      if (k === ' ') { e.preventDefault(); this.mouse.down = true; }
      if (k === 'escape') this.togglePause();
      if (k === 'm') this.toggleMapOpen();
      if (k === '[') this.zoomOutMap();
      if (k === ']') this.zoomInMap();
    },
    onKeyUp(e) {
      const k = e.key.toLowerCase();
      if (['w','a','s','d'].includes(k)) this.keys.delete(k);
      if (k === ' ') this.mouse.down = false;
    },
    onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    },
    async onMouseDown() { await this.ensureAudio(); this.mouse.down = true; },
    onMouseUp() { this.mouse.down = false; },
    onWheel(e) {
      // 仅在光标位于小地图上时拦截滚轮，缩放地图
      const r = this.minimap._rect;
      const x = e.offsetX, y = e.offsetY;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        e.preventDefault();
        const dir = Math.sign(e.deltaY);
        if (dir > 0) this.zoomOutMap(); else this.zoomInMap();
      }
    },

    onGamepadConnected(e) { this.gamepad.index = e.gamepad.index; this.gamepad.name = e.gamepad.id; this.gamepad.connected = true; },
    onGamepadDisconnected() { this.gamepad.index = -1; this.gamepad.name = ''; this.gamepad.connected = false; this.gp = { lx:0,ly:0,rx:0,ry:0,rt:0,fire:false,pause:false }; },
    pollGamepad() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = pads && pads[this.gamepad.index];
      if (!gp) { this.gp.fire = false; return; }
      const dz = 0.18;
      const dead = (v) => (Math.abs(v) < dz ? 0 : (v > 0 ? (v - dz)/(1 - dz) : (v + dz)/(1 - dz)));
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const lx = dead(gp.axes[0] || 0), ly = dead(gp.axes[1] || 0);
      const rx = dead(gp.axes[2] || 0), ry = dead(gp.axes[3] || 0);
      const rt = gp.buttons[7] ? (gp.buttons[7].value || (gp.buttons[7].pressed ? 1 : 0)) : 0;
      const btnA = gp.buttons[0] && gp.buttons[0].pressed; const start = gp.buttons[9] && gp.buttons[9].pressed;
      this.gp.lx = clamp(lx, -1, 1); this.gp.ly = clamp(ly, -1, 1);
      this.gp.rx = clamp(rx, -1, 1); this.gp.ry = clamp(ry, -1, 1);
      this.gp.rt = clamp(rt, 0, 1);
      this.gp.fire = btnA || this.gp.rt > 0.2 || Math.hypot(this.gp.rx, this.gp.ry) > 0.35;
      this.gp.pause = !!start;
    },

    /* ===== Touch dual sticks ===== */
    async onTouchStart(e) {
      await this.ensureAudio();
      const rect = this.canvas.getBoundingClientRect();
      for (const t of e.changedTouches) {
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        if (x < rect.width * 0.5 && !this.touch.left.active) this.startStick(this.touch.left, t.identifier, x, y);
        else if (x >= rect.width * 0.5 && !this.touch.right.active) this.startStick(this.touch.right, t.identifier, x, y);
      }
    },
    onTouchMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      for (const t of e.changedTouches) {
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        if (t.identifier === this.touch.left.id)  this.moveStick(this.touch.left,  x, y);
        if (t.identifier === this.touch.right.id) this.moveStick(this.touch.right, x, y);
      }
    },
    onTouchEnd(e) {
      for (const t of e.changedTouches) {
        if (t.identifier === this.touch.left.id)  this.endStick(this.touch.left);
        if (t.identifier === this.touch.right.id) this.endStick(this.touch.right);
      }
    },
    startStick(st, id, x, y) { st.id = id; st.active = true; st.cx = x; st.cy = y; st.x = x; st.y = y; st.vx = 0; st.vy = 0; st.mag = 0; },
    moveStick(st, x, y) { const dx = x - st.cx, dy = y - st.cy; const len = Math.hypot(dx, dy), max = st.max, ratio = len > max ? max / len : 1; st.x = st.cx + dx * ratio; st.y = st.cy + dy * ratio; st.vx = (st.x - st.cx)/max; st.vy = (st.y - st.cy)/max; st.mag = Math.min(1, len/max); },
    endStick(st) { st.id = -1; st.active = false; st.vx = 0; st.vy = 0; st.mag = 0; },
    joyStyle(st) { return `left:${st.cx - st.r}px; top:${st.cy - st.r}px; width:${st.r*2}px; height:${st.r*2}px;`; },
    stickStyle(st) { const dx = (st.x - st.cx); const dy = (st.y - st.cy); return `transform: translate(${dx}px, ${dy}px);`; },

    /* ===== Infinite map: chunks & obstacles ===== */
    getChunk(cx, cy) {
      const key = `${cx},${cy}`;
      if (this.chunks.has(key)) return this.chunks.get(key);

      const seed = seedFrom(cx, cy, this.worldSeed);
      const rnd = mulberry32(seed);

      const baseX = cx * this.chunkSize;
      const baseY = cy * this.chunkSize;

      // 障碍：2~4个细长矩形
      const count = 2 + Math.floor(rnd() * 3);
      const obstacles = [];
      for (let i = 0; i < count; i++) {
        const horiz = rnd() < 0.5;
        const thick = 20 + Math.floor(rnd() * 30);
        const len = 140 + Math.floor(rnd() * 200);
        const x = baseX + 40 + Math.floor(rnd() * (this.chunkSize - 80));
        const y = baseY + 40 + Math.floor(rnd() * (this.chunkSize - 80));
        const w = horiz ? len : thick;
        const h = horiz ? thick : len;
        obstacles.push({ x: x - w/2, y: y - h/2, w, h, r: 8 });
      }

      // 装饰
      const decor = [];
      const decorCount = 12 + Math.floor(rnd() * 10);
      for (let i = 0; i < decorCount; i++) {
        const x = baseX + Math.floor(rnd() * this.chunkSize);
        const y = baseY + Math.floor(rnd() * this.chunkSize);
        const rad = 16 + Math.floor(rnd() * 34);
        const hue = 100 + Math.floor(rnd() * 50);
        decor.push({ x, y, r: rad, color: `hsl(${hue} 25% 22% / 0.55)` });
      }

      const tileTint = 8 + Math.floor(rnd() * 12);
      const ch = { obstacles, decor, tileTint };
      this.chunks.set(key, ch);
      return ch;
    },
    refreshVisibleObstacles(camX, camY, camW, camH) {
      const margin = 160;
      const minX = camX - margin, minY = camY - margin;
      const maxX = camX + camW + margin, maxY = camY + camH + margin;
      const cs = this.chunkSize;
      const minCx = Math.floor(minX / cs), maxCx = Math.floor(maxX / cs);
      const minCy = Math.floor(minY / cs), maxCy = Math.floor(maxY / cs);
      const list = [];
      for (let cy = minCy; cy <= maxCy; cy++) for (let cx = minCx; cx <= maxCx; cx++) list.push(...this.getChunk(cx, cy).obstacles);
      this.visibleObstacles = list;

      // 控制缓存规模：保留玩家附近 5x5 块
      const pcx = Math.floor(this.player.x / cs), pcy = Math.floor(this.player.y / cs);
      for (const key of this.chunks.keys()) {
        const [cx, cy] = key.split(',').map(n=>parseInt(n,10));
        if (Math.abs(cx - pcx) > 3 || Math.abs(cy - pcy) > 3) this.chunks.delete(key);
      }
    },

    /* ===== Main loop ===== */
    loop(t) {
      if (!this.running) return;
      const dt = Math.min(0.033, (t - this.lastTime) / 1000 || 0);
      this.lastTime = t;

      if (this.gamepad.connected) this.pollGamepad();
      if (this.gp.pause) { this.togglePause(); this.gp.pause = false; }

      if (!this.paused && this.player.hp > 0) { this.update(dt); this.draw(); }
      else { this.draw(); }

      requestAnimationFrame(this.loop);
    },

    update(dt) {
      // 相机
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      const camX = this.player.x - w / 2, camY = this.player.y - h / 2;

      // 可见障碍
      this.refreshVisibleObstacles(camX, camY, w, h);

      // buffs
      if (this.buff.speed  > 0) this.buff.speed  = Math.max(0, this.buff.speed  - dt);
      if (this.buff.spread > 0) this.buff.spread = Math.max(0, this.buff.spread - dt);
      if (this.buff.burn   > 0) this.buff.burn   = Math.max(0, this.buff.burn   - dt);
      if (this.buff.pierce > 0) this.buff.pierce = Math.max(0, this.buff.pierce - dt);
      if (this.buff.bounce > 0) this.buff.bounce = Math.max(0, this.buff.bounce - dt);
      if (this.buff.split  > 0) this.buff.split  = Math.max(0, this.buff.split  - dt);
      this.player.speed = this.player.baseSpeed * (this.buff.speed > 0 ? 1.5 : 1.0);

      // 移动
      let mx = 0, my = 0;
      if (this.keys.has('w')) my -= 1; if (this.keys.has('s')) my += 1; if (this.keys.has('a')) mx -= 1; if (this.keys.has('d')) mx += 1;
      if (Math.hypot(this.gp.lx, this.gp.ly) > 0) { mx = this.gp.lx; my = this.gp.ly; }
      if (this.isTouchDevice && this.touch.left.active && this.touch.left.mag > 0.05) { mx = this.touch.left.vx; my = this.touch.left.vy; }
      const mlen = Math.hypot(mx, my) || 1; mx/=mlen; my/=mlen;
      this.player.x += mx * this.player.speed * dt; this.player.y += my * this.player.speed * dt;
      this.resolveCircleObstacles(this.player);

      // 瞄准（鼠标屏幕 -> 世界）
      let aimDir = this.player.dir, haveAim = false; this.autoAim.highlight = null;
      const mdx = (camX + this.mouse.x) - this.player.x, mdy = (camY + this.mouse.y) - this.player.y;
      if (Math.hypot(mdx, mdy) > 0.001) { aimDir = Math.atan2(mdy, mdx); haveAim = true; }
      if (Math.hypot(this.gp.rx, this.gp.ry) > 0.15) { aimDir = Math.atan2(this.gp.ry, this.gp.rx); haveAim = true; }
      if (this.isTouchDevice && this.touch.right.active) {
        if (this.touch.right.mag > 0.10) { aimDir = Math.atan2(this.touch.right.vy, this.touch.right.vx); haveAim = true; }
        else if (this.autoAim.enabled) { const target = this.findAutoAimTarget(this.autoAim.range); if (target) { aimDir = Math.atan2(target.y - this.player.y, target.x - this.player.x); haveAim = true; this.autoAim.highlight = target; } }
      }
      if (this.autoFire) {
        const target = this.findAutoAimTarget(Infinity);
        if (target) {
          aimDir = Math.atan2(target.y - this.player.y, target.x - this.player.x);
          haveAim = true;
          this.autoAim.highlight = target;
        }
      }
      if (haveAim) this.player.dir = aimDir;

      // 开火
      const touchFire = (this.isTouchDevice && this.touch.right.active && (this.touch.right.mag > 0.25 || (this.autoAim.highlight && this.touch.right.mag > this.autoAim.minStickToFire)));
      const shouldFire = this.autoFire || this.mouse.down || this.gp.fire || touchFire;
      this.player.fireCooldown = Math.max(0, this.player.fireCooldown - dt);
      if (shouldFire && this.player.fireCooldown <= 0) { this.fireBullet(); this.player.fireCooldown = (this.buff.spread > 0 ? 0.10 : 0.12); }

      // 子弹
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.x += Math.cos(b.dir) * b.speed * dt;
        b.y += Math.sin(b.dir) * b.speed * dt;
        if (b.homing) {
          const tDir = Math.atan2(this.player.y - b.y, this.player.x - b.x);
          const diff = ((tDir - b.dir + Math.PI) % (Math.PI * 2)) - Math.PI;
          const maxTurn = 2.5 * dt;
          b.dir += this.clamp(diff, -maxTurn, maxTurn);
        }
        b.life -= dt;
        if (this.pointHitObstacle(b.x, b.y)) {
          if (b.bounce && b.bounce > 0) {
            b.dir += Math.PI;
            b.bounce--;
            b.x += Math.cos(b.dir) * 4;
            b.y += Math.sin(b.dir) * 4;
          } else {
            b.life = 0;
          }
        }
        if (b.life <= 0) { this.bullets.splice(i, 1); continue; }
        if (b.from === 'enemy' && this.circleHit(b.x, b.y, 3, this.player.x, this.player.y, this.player.r)) {
          this.player.hp -= b.dmg;
          this.bullets.splice(i, 1);
        }
      }

      // Boss刷新
      this.bossTimer -= dt;
      if (this.bossTimer <= 0) {
        if (!this.zombies.some(z => z.boss)) this.spawnBoss();
        this.bossTimer = this.bossInterval;
      }

      // 刷怪（环带）
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        if (this.zombies.length < Math.min(80, 24 + this.wave * 3)) this.spawnZombieRing();
        const minInterval = 0.35;
        this.spawnInterval = Math.max(minInterval, this.spawnInterval * 0.995);
        this.spawnTimer = this.spawnInterval;
        this.accTime += dt; if (this.accTime >= 10) { this.wave++; this.accTime = 0; }
      }

      // 僵尸
      for (let i = this.zombies.length - 1; i >= 0; i--) {
        const z = this.zombies[i];
        if (z.burnTime > 0) { z.burnTime -= dt; z.hp -= z.burnDps * dt; if (z.hp <= 0) { this.zombies.splice(i, 1); this.onKill(z); continue; } }
        if (z.invuln > 0) z.invuln -= dt;
        if (z.elite) { z.dashCd -= dt; if (z.dashCd <= 0) { z.dashing = true; z.dashTime = 0.45; z.dashCd = 3 + Math.random() * 1.5; } if (z.dashing) { z.dashTime -= dt; if (z.dashTime <= 0) z.dashing = false; } }
        const baseSpeed = z.speed * (z.dashing ? 3.2 : 1);
        let dir = Math.atan2(this.player.y - z.y, this.player.x - z.x);
        let step = baseSpeed * dt;
        let nx = z.x + Math.cos(dir) * step, ny = z.y + Math.sin(dir) * step;
        const fx = nx + Math.cos(dir) * z.r, fy = ny + Math.sin(dir) * z.r;
        if (!z.ghost && this.pointHitObstacle(fx, fy)) {
          const sign = Math.random() < 0.5 ? 1 : -1;
          for (let a = 0.3; a < Math.PI; a += 0.3) {
            const nd = dir + sign * a;
            nx = z.x + Math.cos(nd) * step; ny = z.y + Math.sin(nd) * step;
            const tx = nx + Math.cos(nd) * z.r, ty = ny + Math.sin(nd) * z.r;
            if (!this.pointHitObstacle(tx, ty)) { dir = nd; break; }
          }
        }
        z.x = nx; z.y = ny;
        if (!z.ghost) this.resolveCircleObstacles(z);
        if (z.ranged) {
          z.shotCd -= dt;
          const dist = Math.hypot(this.player.x - z.x, this.player.y - z.y);
          if (dist < 600 && z.shotCd <= 0) {
            const dir = Math.atan2(this.player.y - z.y, this.player.x - z.x);
            const bullet = { x: z.x, y: z.y, dir, speed: 350, dmg: z.dmg * 0.6, life: 2.5, from: 'enemy' };
            if (z.pooper) {
              z.shotCount = (z.shotCount || 0) + 1;
              if (z.shotCount % 3 === 0) {
                bullet.speed = 280;
                bullet.color = '#8b4513';
                bullet.homing = true;
              } else {
                bullet.color = '#a0522d';
              }
            }
            this.bullets.push(bullet);
            z.shotCd = 2 + Math.random();
          }
        }

        // 子弹命中
        for (let j = this.bullets.length - 1; j >= 0; j--) {
          const b = this.bullets[j];
          if (b.from !== 'player') continue;
          if (this.circleHit(b.x, b.y, 3, z.x, z.y, z.r)) {
            if (z.invuln > 0) continue;
            z.hp -= b.dmg;
            if (b.burn) { z.burnTime = 3; z.burnDps = 6; }
            if (b.split && !b.fromSplit) {
              for (const s of [-0.4, 0.4]) {
                this.bullets.push({ x: z.x, y: z.y, dir: b.dir + s, speed: 560, dmg: b.dmg * 0.5, life: 0.6, from: 'player', pierce: 0, bounce: 0, burn: b.burn, split: false, fromSplit: true });
              }
            }
            this.makeHitParticles(z.x, z.y, '#6cf'); this.sfxHit();
            if (z.hp <= 0) { this.zombies.splice(i, 1); this.onKill(z); }
            if (b.pierce && b.pierce > 0) { b.pierce--; } else { this.bullets.splice(j, 1); }
            break;
          }
        }
        // 咬玩家
        if (this.circleHit(this.player.x, this.player.y, this.player.r, z.x, z.y, z.r)) {
          this.player.hp -= z.dmg * dt; const push = 50 * dt; z.x -= Math.cos(dir) * push; z.y -= Math.sin(dir) * push;
        }

        // 太远清理
        const dx = z.x - this.player.x, dy = z.y - this.player.y;
        if (dx*dx + dy*dy > 2200*2200) { this.zombies.splice(i, 1); }
      }

      // 掉落物
      for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i]; d.life -= dt; if (d.life <= 0) { this.drops.splice(i, 1); continue; }
        d.bob += dt; d.drawY = d.y + Math.sin(d.bob * 4) * 3;
        if (this.circleHit(this.player.x, this.player.y, this.player.r, d.x, d.drawY, d.r)) {
          this.applyDrop(d.type); this.drops.splice(i, 1);
          this.makeDeathBurst(d.x, d.drawY, '#ffd166'); this.sfxPickup();
        }
      }

      // 粒子
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]; p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx * dt * 60; p.y += p.vy * dt * 60; p.life -= dt; if (p.life <= 0) this.particles.splice(i, 1);
      }

      // 计分
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer === 0) this.combo = 1;
      if (this.score > this.bestScore) { this.bestScore = this.score; localStorage.setItem(LS_KEY, String(this.bestScore)); }
    },

    /* ===== Drawing ===== */
    draw() {
      const ctx = this.ctx;
      const screenW = this.canvas.clientWidth, screenH = this.canvas.clientHeight;
      const camX = this.player.x - screenW / 2, camY = this.player.y - screenH / 2;

      // —— 地形层（修复：始终在最底层，合成方式复位）——
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      ctx.clearRect(0, 0, screenW, screenH);
      ctx.save(); ctx.translate(-camX, -camY);
      this.drawTerrain(camX, camY, screenW, screenH);

      // 掉落
      for (const d of this.drops) {
        ctx.save(); ctx.translate(d.x, d.drawY);
        ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(0, 0, d.r, 0, Math.PI * 2); ctx.fill();
        ctx.font = '16px ui-sans-serif, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#111'; ctx.fillText(d.icon, 0, 1); ctx.restore();
      }

      // 子弹
      for (const b of this.bullets) {
        const color = b.color ? b.color : (b.burn ? '#ffb347' : (b.from === 'enemy' ? '#f99' : '#9cf'));
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 3);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, color);
        ctx.globalAlpha = (b.pierce && b.pierce > 0) ? 0.55 : 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 僵尸（贴图 + 血条 + 数值HP）
      for (const z of this.zombies) {
        const img = z.elite ? this.assets.elite : this.assets.zombie;
        const rot = Math.atan2(this.player.y - z.y, this.player.x - z.x);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 6;
        const drawn = this.drawSprite(img, z.x, z.y, z.r, rot);
        if (!drawn) { ctx.translate(z.x, z.y); ctx.rotate(rot); ctx.fillStyle = z.color; ctx.beginPath(); ctx.arc(0,0,z.r,0,Math.PI*2); ctx.fill(); }
        ctx.restore();

        const bw = z.r * 2, bh = 4, bx = z.x - z.r, by = z.y - z.r - 12;
        ctx.fillStyle = '#222'; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = z.elite ? '#ff7b7b' : '#e55'; ctx.fillRect(bx, by, (z.hp/z.maxHp)*bw, bh);
        const txt = Math.max(0, Math.ceil(z.hp)).toString();
        ctx.font = 'bold 12px ui-sans-serif, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 3; ctx.strokeText(txt, z.x, by - 2);
        ctx.fillStyle = '#fff'; ctx.fillText(txt, z.x, by - 2);

        if (z.elite && z.dashing) { ctx.globalAlpha = 0.28; ctx.fillStyle = '#ffcf33'; ctx.beginPath(); ctx.arc(z.x, z.y, z.r + 6, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
      }

      // 自动瞄准高亮
      if (this.autoAim.highlight) { const t = this.autoAim.highlight; ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.arc(t.x, t.y, t.r + 6, 0, Math.PI * 2); ctx.stroke(); }

      // 玩家 + 血条
      const p = this.player;
      const drewPlayer = this.drawSprite(this.assets.player, p.x, p.y, p.r, p.dir);
      if (!drewPlayer) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.dir); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#9cf'; ctx.fillRect(8, -3, 14, 6); ctx.restore(); }
      const phw = 56, phh = 7, pbx = p.x - phw/2, pby = p.y - p.r - 18;
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; this.roundRect(ctx, pbx, pby, phw, phh, 4); ctx.fill();
      ctx.save(); ctx.beginPath(); this.roundRect(ctx, pbx, pby, phw, phh, 4); ctx.clip();
      ctx.fillStyle = '#1f8fff'; ctx.fillRect(pbx, pby, Math.max(0, Math.min(1, p.hp/100))*phw, phh); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; this.roundRect(ctx, pbx, pby, phw, phh, 4); ctx.stroke();

      // 粒子
      for (const part of this.particles) { ctx.globalAlpha = Math.max(0, part.life / part.maxLife); ctx.fillStyle = part.color; ctx.fillRect(part.x, part.y, 2, 2); }
      ctx.globalAlpha = 1;

      ctx.restore(); // 结束世界层

      // —— 小地图（屏幕空间，最后绘制，避免被遮挡）——
      this.drawMinimap();

      // 死亡/暂停覆盖
      if (this.player.hp <= 0 || this.paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, screenW, screenH);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 32px ui-sans-serif, system-ui'; ctx.textAlign = 'center';
        ctx.fillText(this.paused ? '已暂停' : '你阵亡了', screenW / 2, screenH / 2 - 10);
        ctx.font = '16px ui-sans-serif, system-ui';
        ctx.fillText('Start/Esc 切换暂停；点击【重新开始】再战', screenW / 2, screenH / 2 + 20);
      }
    },
    drawTerrain(camX, camY, w, h) {
      const ctx = this.ctx, cs = this.chunkSize;
      const minCx = Math.floor((camX - 0) / cs), maxCx = Math.floor((camX + w) / cs);
      const minCy = Math.floor((camY - 0) / cs), maxCy = Math.floor((camY + h) / cs);

      // 底色
      ctx.fillStyle = '#0e0f12'; ctx.fillRect(camX, camY, w, h);

      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cx = minCx; cx <= maxCx; cx++) {
          const ch = this.getChunk(cx, cy), x = cx * cs, y = cy * cs;
          ctx.fillStyle = `hsl(220 15% ${10 + ch.tileTint}% / 1)`; ctx.fillRect(x, y, cs, cs);

          // 装饰在障碍下方
          for (const d of ch.decor) { ctx.beginPath(); ctx.fillStyle = d.color; ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
        }
      }

      // 障碍统一在所有地块绘制完后再绘制，避免相邻地块覆盖
      ctx.fillStyle = '#1f2430'; ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      for (const o of this.visibleObstacles) { this.roundRect(ctx, o.x, o.y, o.w, o.h, o.r); ctx.fill(); ctx.stroke(); }

      // 世界网格
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      const step = 80; const startX = Math.floor(camX / step) * step; const startY = Math.floor(camY / step) * step;
      for (let x = startX; x < camX + h + w; x += step) { ctx.beginPath(); ctx.moveTo(x, camY); ctx.lineTo(x, camY + h); ctx.stroke(); }
      for (let y = startY; y < camY + h; y += step) { ctx.beginPath(); ctx.moveTo(camX, y); ctx.lineTo(camX + w, y); ctx.stroke(); }
    },

    /* ===== Minimap / Radar ===== */
    getMinimapRect() {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      const mm = this.minimap;
      const mw = mm.open ? mm.openW : mm.closedW;
      const mh = mm.open ? mm.openH : mm.closedH;
      const x = mm.margin;           // 左上角
      const y = mm.margin;
      return { x, y, w: mw, h: mh };
    },
    drawMinimap() {
      if (!this.minimap.open) { // 仍绘制闭合的小雷达框
        // 仍然画，但缩小
      }
      const ctx = this.ctx, mm = this.minimap;
      const rect = this.getMinimapRect();
      mm._rect = rect; // 保存供滚轮判断

      const { x, y, w, h } = rect;
      const cx = x + w/2, cy = y + h/2;

      // 背板
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
      ctx.fillStyle = 'rgba(20,24,32,0.9)'; this.roundRect(ctx, x, y, w, h, 12); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; this.roundRect(ctx, x, y, w, h, 12); ctx.stroke();

      // 世界 -> 小地图变换
      const scale = this.clamp(mm.zoom, mm.minZoom, mm.maxZoom);
      const halfWorldW = w / 2 / scale;
      const halfWorldH = h / 2 / scale;

      // 地形（只画障碍轮廓，避免太花）
      const minX = this.player.x - halfWorldW, maxX = this.player.x + halfWorldW;
      const minY = this.player.y - halfWorldH, maxY = this.player.y + halfWorldH;
      const cs = this.chunkSize;
      const minCx = Math.floor(minX / cs), maxCx = Math.floor(maxX / cs);
      const minCy = Math.floor(minY / cs), maxCy = Math.floor(maxY / cs);
      ctx.save(); ctx.beginPath(); this.roundRect(ctx, x+6, y+6, w-12, h-12, 8); ctx.clip();

      // 区块淡底
      for (let cyi = minCy; cyi <= maxCy; cyi++) for (let cxi = minCx; cxi <= maxCx; cxi++) {
        const ch = this.getChunk(cxi, cyi);
        const bx = cxi * cs, by = cyi * cs;
        ctx.fillStyle = `hsl(220 10% ${14 + ch.tileTint}% / 0.55)`;
        const rx = cx + (bx - this.player.x) * scale;
        const ry = cy + (by - this.player.y) * scale;
        ctx.fillRect(rx, ry, cs * scale, cs * scale);
      }

      // 障碍轮廓
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
      for (let cyi = minCy; cyi <= maxCy; cyi++) for (let cxi = minCx; cxi <= maxCx; cxi++) {
        const { obstacles } = this.getChunk(cxi, cyi);
        for (const o of obstacles) {
          const rx = cx + (o.x - this.player.x) * scale;
          const ry = cy + (o.y - this.player.y) * scale;
          ctx.strokeRect(rx, ry, o.w * scale, o.h * scale);
        }
      }

      // 怪物点
      const rMax = Math.min(w, h) / 2 - 8; // 雷达边缘
      for (const z of this.zombies) {
        const dx = (z.x - this.player.x) * scale;
        const dy = (z.y - this.player.y) * scale;
        let px = cx + dx, py = cy + dy;
        // 边缘夹紧：超出雷达范围的怪，贴到边框
        const dist = Math.hypot(dx, dy);
        if (dist > rMax) { const k = rMax / dist; px = cx + dx * k; py = cy + dy * k; }
        if (z.boss) {
          ctx.fillStyle = '#ff4757';
          ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '8px ui-sans-serif,system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('B', px, py + 0.5);
        } else {
          ctx.beginPath();
          ctx.fillStyle = z.elite ? '#ff8d4f' : '#88f88e';
          ctx.arc(px, py, z.elite ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // 玩家点
      ctx.beginPath(); ctx.fillStyle = '#7fb7ff'; ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
      // 朝向箭头
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(this.player.dir);
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-4, 3); ctx.lineTo(-4, -3); ctx.closePath();
      ctx.fillStyle = '#d6e7ff'; ctx.fill(); ctx.restore();

      ctx.restore();
    },
    zoomInMap() { this.minimap.zoom = this.clamp(this.minimap.zoom * 1.15, this.minimap.minZoom, this.minimap.maxZoom); },
    zoomOutMap() { this.minimap.zoom = this.clamp(this.minimap.zoom / 1.15, this.minimap.minZoom, this.minimap.maxZoom); },
    toggleMapOpen() { this.$store.commit('setMinimapOpen', !this.$store.state.settings.minimapOpen); },

    /* ===== Gameplay helpers ===== */
    fireBullet() {
      const p = this.player;
      const baseDir = p.dir;
      const shots = (this.buff.spread > 0 ? 3 : 1);
      const spread = 0.18;
      for (let i = 0; i < shots; i++) {
        const offset = (i - (shots - 1) / 2) * spread;
        const dir = baseDir + offset;
        const muzzleX = p.x + Math.cos(dir) * (p.r + 12);
        const muzzleY = p.y + Math.sin(dir) * (p.r + 12);
        this.bullets.push({
          x: muzzleX,
          y: muzzleY,
          dir,
          speed: 740,
          dmg: 24 * (shots > 1 ? 0.65 : 1),
          life: 0.9,
          from: 'player',
          pierce: this.buff.pierce > 0 ? 2 : 0,
          bounce: this.buff.bounce > 0 ? 2 : 0,
          burn: this.buff.burn > 0,
          split: this.buff.split > 0,
          fromSplit: false
        });
        this.makeMuzzleFlash(muzzleX, muzzleY);
      }
      this.sfxShot();
    },
    spawnZombieRing() {
      const tries = 8;
      for (let k = 0; k < tries; k++) {
        const ang = Math.random() * Math.PI * 2; const r = 450 + Math.random() * 200;
        const x = this.player.x + Math.cos(ang) * r; const y = this.player.y + Math.sin(ang) * r;
        if (this.pointHitObstacle(x, y)) continue;
        const eliteChance = Math.min(0.18, 0.05 + this.wave * 0.012); const elite = Math.random() < eliteChance;
        const base = 1 + this.wave * 0.12; const zr = elite ? 16 : (12 + Math.random() * 10);
        const hp = (elite ? 150 : 45) * base * (0.9 + Math.random() * 0.6);
        const speed = (elite ? 70 : 60) + Math.random() * 30 + this.wave * 2;
        const dmg = (elite ? 16 : 12) + this.wave * 0.6;
        const hue = elite ? 12 + Math.random() * 24 : 100 + Math.random() * 160;
        const color = elite ? `hsl(${hue} 80% 55%)` : `hsl(${hue} 60% 55%)`;
        const ghost = Math.random() < 0.1;
        const invuln = Math.random() < 0.1 ? 2.0 : 0;
        const pooper = Math.random() < 0.05;
        const ranged = pooper || Math.random() < 0.1;
        this.zombies.push({ x, y, r: zr, hp, maxHp: hp, speed, dmg, color, elite, dashing:false, dashCd: elite ? (1 + Math.random() * 1.5) : 9999, dashTime:0, ghost, invuln, ranged, pooper, shotCd: ranged ? 1.5 : 0, shotCount:0, burnTime:0, burnDps:0, boss:false });
        return;
      }
    },
    spawnBoss() {
      const ang = Math.random() * Math.PI * 2; const r = 600 + Math.random() * 200;
      const x = this.player.x + Math.cos(ang) * r; const y = this.player.y + Math.sin(ang) * r;
      const hp = 1200 + this.wave * 80;
      const speed = 60 + this.wave * 2;
      const dmg = 35 + this.wave * 1.5;
      this.zombies.push({ x, y, r: 28, hp, maxHp: hp, speed, dmg, color: '#ff4757', elite: true, boss: true, dashing:false, dashCd: 2, dashTime:0, ghost:false, invuln:0, ranged:true, shotCd:1.5, burnTime:0, burnDps:0 });
    },
    onKill(z) {
      const gain = Math.round(10 + z.maxHp * 0.1);
      this.combo = Math.min(10, this.combo + 1); this.comboTimer = 2.2;
      this.score += gain * this.combo;
      this.makeDeathBurst(z.x, z.y, z.color);
      const dropRoll = Math.random(); const dropBias = z.elite ? 0.5 : 0.25;
      if (dropRoll < dropBias) {
        const types = ['heal','speed','spread','burn','pierce','bounce','split'];
        const type = types[Math.floor(Math.random()*types.length)];
        this.spawnDrop(z.x, z.y, type);
      }
    },
    spawnDrop(x, y, type) {
      const map = {
        heal:{icon:'❤️',color:'#ff9aa2'},
        speed:{icon:'⚡',color:'#f9d56e'},
        spread:{icon:'🔱',color:'#9ad3bc'},
        burn:{icon:'🔥',color:'#ffb347'},
        pierce:{icon:'🎯',color:'#c49bbb'},
        bounce:{icon:'↩️',color:'#b6e0fe'},
        split:{icon:'🔀',color:'#d4a5a5'}
      };
      const cfg = map[type]; this.drops.push({ type, x, y, drawY:y, r:13, life:10, bob:0, icon:cfg.icon, color:cfg.color });
    },
    applyDrop(type) {
      if (type==='heal') this.player.hp = Math.min(100, this.player.hp + 35);
      if (type==='speed') this.buff.speed = Math.max(this.buff.speed, 8);
      if (type==='spread') this.buff.spread = Math.max(this.buff.spread, 10);
      if (type==='burn') this.buff.burn = Math.max(this.buff.burn, 10);
      if (type==='pierce') this.buff.pierce = Math.max(this.buff.pierce, 10);
      if (type==='bounce') this.buff.bounce = Math.max(this.buff.bounce, 10);
      if (type==='split') this.buff.split = Math.max(this.buff.split, 10);
    },
    findAutoAimTarget(range) { let best=null, bestD2=Infinity, px=this.player.x, py=this.player.y; for (const z of this.zombies){ const dx=z.x-px, dy=z.y-py, d2=dx*dx+dy*dy; if(d2<=range*range && d2<bestD2){best=z; bestD2=d2;}} return best; },

    /* ===== FX ===== */
    makeMuzzleFlash(x, y) { for (let i = 0; i < 6; i++) this.particles.push({ x, y, vx:(Math.random()-0.5)*5, vy:(Math.random()-0.5)*5, life:0.2+Math.random()*0.2, maxLife:0.4, color:'#cff' }); },
    makeHitParticles(x, y, color) { for (let i = 0; i < 10; i++) this.particles.push({ x, y, vx:(Math.random()-0.5)*8, vy:(Math.random()-0.5)*8, life:0.3+Math.random()*0.4, maxLife:0.7, color }); },
    makeDeathBurst(x, y, color) { for (let i = 0; i < 24; i++) { const a=Math.random()*Math.PI*2, s=2+Math.random()*6; this.particles.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:0.6+Math.random()*0.6, maxLife:1.2, color }); } },

    /* ===== Collisions ===== */
    resolveCircleObstacles(circle) {
      for (const o of this.visibleObstacles) {
        const nx = this.clamp(circle.x, o.x, o.x + o.w), ny = this.clamp(circle.y, o.y, o.y + o.h);
        const dx = circle.x - nx, dy = circle.y - ny, r = circle.r + 0.5, dist2 = dx*dx + dy*dy;
        if (dist2 < r*r) { const dist = Math.sqrt(dist2) || 0.0001, overlap = r - dist, ux = dx/dist, uy = dy/dist; circle.x += ux*overlap; circle.y += uy*overlap; }
      }
    },
    pointHitObstacle(x, y) { for (const o of this.visibleObstacles) if (x>=o.x && x<=o.x+o.w && y>=o.y && y<=o.y+o.h) return true; return false; },

    /* ===== utils ===== */
    clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
    circleHit(x1, y1, r1, x2, y2, r2) { const dx=x1-x2, dy=y1-y2; return dx*dx + dy*dy <= (r1+r2)*(r1+r2); },
    roundRect(ctx, x, y, w, h, r=8) { ctx.beginPath(); ctx.moveTo(x+r, y); ctx.arcTo(x+w, y, x+w, y+h, r); ctx.arcTo(x+w, y+h, x, y+h, r); ctx.arcTo(x, y+h, x, y, r); ctx.arcTo(x, y, x+w, y, r); ctx.closePath(); },
  }
};
</script>

<style scoped>
.game-wrap{
  position:relative;
  width:100vw;
  height:100dvh;
  background:#0e0f12;
  overflow:hidden;
  touch-action:none;
}
.game-wrap.pseudo{ position:fixed; inset:0; width:100vw; height:100dvh; z-index:9999; }
.game-canvas{ width:100%; height:100%; display:block; cursor:crosshair; }

/* HUD */
.hud{ position:absolute; inset:0; pointer-events:none; display:flex; flex-direction:column; justify-content:space-between; z-index:3; }
.stats{ pointer-events:none; user-select:none; padding:10px 14px; display:flex; gap:16px; color:#e7f4ff; text-shadow:0 1px 2px rgba(0,0,0,.6); font:600 14px ui-sans-serif,system-ui; }
.stats .pad{ opacity:.75; }
.buffs{ pointer-events:none; display:flex; gap:8px; padding:0 14px; }
.buff{ background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); color:#e7f4ff; padding:2px 8px; border-radius:10px; font:600 12px ui-sans-serif,system-ui; display:flex; gap:6px; align-items:center; }

.actions{ pointer-events:auto; position:absolute; right:10px; top:8px; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.actions button{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
.actions button:hover{ filter:brightness(1.1); }


/* 触摸层（仅触屏渲染） */
.touch-layer{ position:absolute; inset:0; z-index:1; pointer-events:auto; }

/* 虚拟摇杆（只展示） */
.joystick{ position:absolute; z-index:2; border-radius:999px; opacity:.95; pointer-events:none; }
.joystick .base{ position:absolute; inset:0; border-radius:999px; background:radial-gradient(closest-side, rgba(255,255,255,.12), rgba(255,255,255,.05)); border:1px solid rgba(255,255,255,.15); }
.joystick .stick{ position:absolute; left:50%; top:50%; width:38px; height:38px; margin-left:-19px; margin-top:-19px; border-radius:999px; background:rgba(255,255,255,.35); border:1px solid rgba(255,255,255,.25); box-shadow:0 4px 10px rgba(0,0,0,.25); }
</style>
