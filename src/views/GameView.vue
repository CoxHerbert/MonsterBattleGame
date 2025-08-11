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
        <span v-if="paused">⏸ Paused</span>
        <span v-if="gamepad.name" class="pad">🎮 {{ gamepad.name }}</span>
        <span v-if="autoAim.enabled && isTouchDevice" class="pad">🎯 AimAssist</span>
        <span v-if="!audio.ready" class="pad">🔇 轻点屏幕以启用声音</span>
      </div>

      <div class="buffs" v-if="activeBuffs.length">
        <div class="buff" v-for="b in activeBuffs" :key="b.kind">
          <span class="tag">{{ b.kind }}</span>
          <span class="time">{{ b.left.toFixed(1) }}s</span>
        </div>
      </div>

      <div class="actions">
        <button @click="togglePause">{{ paused ? '继续' : '暂停' }}</button>
        <button @click="restart">重新开始</button>
        <button @click="toggleFullscreen">{{ isAnyFullscreen ? '退出全屏' : '全屏' }}</button>

        <!-- 音频控制 -->
        <div class="audio">
          <button @click="toggleMute" :title="audio.muted ? '取消静音' : '静音'">
            {{ audio.muted ? '🔇' : '🔊' }}
          </button>
          <input
            class="vol"
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="audio.volume"
            @input="onVolumeInput($event)"
            :title="'音量 ' + Math.round(audio.volume*100) + '%'"
          />
          <button @click="toggleBgm" :title="audio.bgmOn ? '关闭BGM' : '开启BGM'">
            {{ audio.bgmOn ? '🎵 BGM 开' : '🎵 BGM 关' }}
          </button>
        </div>
      </div>

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
const LS_KEY = 'zombie-best-score-v1';
const VOL_KEY = 'zombie-volume';
const MUTE_KEY = 'zombie-muted';
const BGM_KEY = 'zombie-bgm';

export default {
  name: 'GameView',
  data() {
    return {
      // DOM
      wrap: null,
      canvas: null,
      ctx: null,
      dpr: Math.min(window.devicePixelRatio || 1, 2),

      // state
      running: false,
      paused: false,
      lastTime: 0,
      accTime: 0,

      // fullscreen state
      isNativeFullscreen: false,
      isPseudoFullscreen: false,

      // player
      player: {
        x: 0, y: 0, r: 14, baseSpeed: 220, speed: 220, hp: 100,
        dir: 0, fireCooldown: 0,
      },

      // inputs
      keys: new Set(),
      mouse: { x: 0, y: 0, down: false },
      gamepad: { index: -1, name: '', connected: false },
      gp: { lx:0, ly:0, rx:0, ry:0, rt:0, fire:false, pause:false },

      touch: {
        left:  { id: -1, active: false, cx: 0, cy: 0, x: 0, y: 0, r: 60, max: 60, vx: 0, vy: 0, mag: 0 },
        right: { id: -1, active: false, cx: 0, cy: 0, x: 0, y: 0, r: 60, max: 60, vx: 0, vy: 0, mag: 0 },
      },

      // auto-aim
      autoAim: {
        enabled: true,
        range: 260,
        minStickToFire: 0.08,
        weakThreshold: 0.25,
        highlight: null,
      },

      // world
      bullets: [],
      zombies: [],
      particles: [],
      drops: [],
      obstacles: [],

      // spawn
      spawnTimer: 0,
      spawnInterval: 1.0,
      wave: 1,

      // score
      score: 0,
      bestScore: 0,
      combo: 1,
      comboTimer: 0,

      // buffs
      buff: { speed: 0, spread: 0 },

      // device
      isTouchDevice: false,

      // audio (WebAudio)
      audio: {
        ctx: null,
        ready: false,

        // routing
        master: null,
        fxGain: null,
        bgmGain: null,

        // ui state
        volume: 0.8,
        muted: false,
        bgmOn: true,

        // sfx throttling
        lastShotAt: 0,
        lastHitAt: 0,
        lastPickupAt: 0,

        // bgm nodes
        pad1: null,
        pad2: null,
        lfo: null,
        filter: null,
        bgmPlaying: false,
      },
    };
  },
  computed: {
    activeBuffs() {
      const list = [];
      if (this.buff.speed > 0)  list.push({ kind: '⚡Speed', left: this.buff.speed });
      if (this.buff.spread > 0) list.push({ kind: '🔱Spread', left: this.buff.spread });
      return list;
    },
    isAnyFullscreen() {
      return this.isNativeFullscreen || this.isPseudoFullscreen;
    }
  },
  mounted() {
    // 触屏判定
    this.isTouchDevice =
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);

    // 读取音量/静音/BGM 首选项
    const v = Number(localStorage.getItem(VOL_KEY));
    if (!Number.isNaN(v) && v >= 0 && v <= 1) this.audio.volume = v;
    this.audio.muted = localStorage.getItem(MUTE_KEY) === '1';
    const bgmSaved = localStorage.getItem(BGM_KEY);
    if (bgmSaved === '0' || bgmSaved === '1') this.audio.bgmOn = (bgmSaved === '1');

    this.bestScore = Number(localStorage.getItem(LS_KEY) || 0);

    this.wrap = this.$refs.wrap;
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.handleResize();
    window.addEventListener('resize', this.handleResize, { passive: true });

    // kb/mouse（也用作音频解锁的用户手势）
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    this.canvas.addEventListener('mousemove', this.onMouseMove, { passive: true });
    this.canvas.addEventListener('mousedown', this.onMouseDown, { passive: false });
    window.addEventListener('mouseup', this.onMouseUp, { passive: true });

    // 手柄
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);

    // 全屏变更
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    // 前后台切换：回到前台确保音频 resume 和 BGM 恢复
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.reset();
    this.running = true;
    requestAnimationFrame(this.loop);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.stopBgm(true);
  },
  methods: {
    // ===== Fullscreen =====
    hasNativeFullscreen() {
      const el = this.wrap;
      return !!(el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen);
    },
    async enterNativeFullscreen() {
      const el = this.wrap;
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen(); // Safari
        else if (el.msRequestFullscreen) await el.msRequestFullscreen();
        this.isNativeFullscreen = true;
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(()=>{});
        }
      } catch (e) {
        this.isNativeFullscreen = false;
        this.enterPseudoFullscreen();
      }
    },
    async exitNativeFullscreen() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (document.webkitFullscreenElement && document.webkitExitFullscreen) await document.webkitExitFullscreen();
        this.isNativeFullscreen = false;
      } catch { /* ignore */ }
    },
    enterPseudoFullscreen() {
      this.isPseudoFullscreen = true;
      setTimeout(() => window.scrollTo(0, 0), 0);
    },
    exitPseudoFullscreen() { this.isPseudoFullscreen = false; },
    async toggleFullscreen() {
      await this.ensureAudio(); // 手势内顺便解锁音频/BGM
      if (!this.isAnyFullscreen) {
        if (this.hasNativeFullscreen()) await this.enterNativeFullscreen();
        else this.enterPseudoFullscreen();
      } else {
        if (this.isNativeFullscreen) await this.exitNativeFullscreen();
        if (this.isPseudoFullscreen) this.exitPseudoFullscreen();
      }
      setTimeout(this.handleResize, 50);
    },
    onFullscreenChange() {
      const el = document.fullscreenElement || document.webkitFullscreenElement || null;
      this.isNativeFullscreen = !!el;
      setTimeout(this.handleResize, 50);
    },

    // ===== Audio Routing / Controls =====
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

          // 初始电平
          this.audio.master.gain.value = this.audio.muted ? 0 : this.audio.volume;
          this.audio.fxGain.gain.value = 1.0;
          this.audio.bgmGain.gain.value = 0.0; // 先静音，待开启BGM时渐入

          this.audio.fxGain.connect(this.audio.master);
          this.audio.bgmGain.connect(this.audio.master);
          this.audio.master.connect(ctx.destination);
        }

        // Safari/iOS 常见 suspended
        if (this.audio.ctx.state !== 'running') {
          await this.audio.ctx.resume();
        }

        // 短静音脉冲触发解锁
        const b = this.audio.ctx.createBuffer(1, 1, 44100);
        const s = this.audio.ctx.createBufferSource(); s.buffer = b; s.connect(this.audio.fxGain); s.start(0);

        this.audio.ready = (this.audio.ctx.state === 'running');

        // 如果用户设置了 BGM 开启，则在解锁后启动
        if (this.audio.ready && this.audio.bgmOn && !this.audio.bgmPlaying) {
          this.startBgm(true);
        }
        return this.audio.ready;
      } catch (e) {
        console.warn('Audio init failed:', e);
        return false;
      }
    },
    setMasterGain(vol) {
      if (!this.audio.master) return;
      const target = this.audio.muted ? 0 : vol;
      this.audio.master.gain.setTargetAtTime(target, this.audio.ctx.currentTime, 0.015);
    },
    onVolumeInput(e) {
      const v = Math.max(0, Math.min(1, parseFloat(e.target.value)));
      this.audio.volume = Number.isFinite(v) ? v : 0.8;
      localStorage.setItem(VOL_KEY, String(this.audio.volume));
      this.setMasterGain(this.audio.volume);
    },
    async toggleMute() {
      await this.ensureAudio();
      this.audio.muted = !this.audio.muted;
      localStorage.setItem(MUTE_KEY, this.audio.muted ? '1' : '0');
      this.setMasterGain(this.audio.volume);
    },
    async toggleBgm() {
      await this.ensureAudio();
      this.audio.bgmOn = !this.audio.bgmOn;
      localStorage.setItem(BGM_KEY, this.audio.bgmOn ? '1' : '0');
      if (this.audio.bgmOn) this.startBgm();
      else this.stopBgm();
    },
    async onVisibilityChange() {
      if (!this.audio.ctx) return;
      if (document.visibilityState === 'visible') {
        try {
          await this.audio.ctx.resume();
          this.audio.ready = (this.audio.ctx.state === 'running');
          if (this.audio.ready && this.audio.bgmOn && !this.audio.bgmPlaying) {
            this.startBgm(true);
          }
        } catch {}
      }
    },

    // ===== BGM synth (pad) =====
    startBgm(isResume = false) {
      if (!this.audio.ready || this.audio.bgmPlaying) return;
      const ctx = this.audio.ctx;

      // 基础和弦：A 小调（A3=220Hz，E4=329.63Hz），轻微抖动与滤波
      const pad1 = ctx.createOscillator(); pad1.type = 'sine'; pad1.frequency.value = 220;      // A3
      const pad2 = ctx.createOscillator(); pad2.type = 'sine'; pad2.frequency.value = 329.63;  // E4

      // 轻 vibrato LFO（调制 detune，±6 cents）
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 6; // cents
      lfo.connect(lfoGain);
      lfoGain.connect(pad1.detune);
      lfoGain.connect(pad2.detune);

      // 柔和低通
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      filter.Q.value = 0.5;

      // 合成 -> 滤波 -> bgmGain -> master
      pad1.connect(filter);
      pad2.connect(filter);
      filter.connect(this.audio.bgmGain);

      // 渐入
      const now = ctx.currentTime;
      const startGain = isResume ? this.audio.bgmGain.gain.value : 0;
      this.audio.bgmGain.gain.cancelScheduledValues(now);
      this.audio.bgmGain.gain.setValueAtTime(startGain, now);
      this.audio.bgmGain.gain.linearRampToValueAtTime(0.20, now + 1.0); // 目标 BGM 电平

      lfo.start(now);
      pad1.start(now);
      pad2.start(now);

      // 保存引用，便于停止
      this.audio.pad1 = pad1;
      this.audio.pad2 = pad2;
      this.audio.lfo = lfo;
      this.audio.filter = filter;
      this.audio.bgmPlaying = true;
    },
    stopBgm(immediate = false) {
      if (!this.audio.bgmPlaying) return;
      const ctx = this.audio.ctx;
      const now = ctx.currentTime;
      this.audio.bgmGain.gain.cancelScheduledValues(now);
      if (immediate) {
        this.audio.bgmGain.gain.setValueAtTime(0, now);
      } else {
        this.audio.bgmGain.gain.setValueAtTime(this.audio.bgmGain.gain.value, now);
        this.audio.bgmGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
      }
      const stopAt = immediate ? now + 0.01 : now + 0.65;

      const { pad1, pad2, lfo } = this.audio;
      try { pad1 && pad1.stop(stopAt); } catch {}
      try { pad2 && pad2.stop(stopAt); } catch {}
      try { lfo && lfo.stop(stopAt); } catch {}

      setTimeout(() => {
        this.audio.pad1 = this.audio.pad2 = this.audio.lfo = this.audio.filter = null;
        this.audio.bgmPlaying = false;
      }, (immediate ? 20 : 700));
    },

    // ===== SFX synths =====
    now() { return (this.audio.ctx ? this.audio.ctx.currentTime : 0) || 0; },
    oneShot({ type='square', freq=440, glide=-200, dur=0.10, gain=0.16, attack=0.004, decay=0.10 }) {
      if (!this.audio.ready) return;
      const ctx = this.audio.ctx;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(40, freq), t0);
      if (glide !== 0) {
        const endFreq = Math.max(40, freq + glide);
        // exponentialRamp 需要正值
        osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + Math.max(0.03, dur));
      }

      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(attack + decay, dur));

      osc.connect(g).connect(this.audio.fxGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.06);
    },
    sfxShot() {
      if (!this.audio.ready) return;
      const t = this.now();
      if (t - this.audio.lastShotAt < 0.045) return; // 限流
      this.audio.lastShotAt = t;
      this.oneShot({ type:'square', freq: 1000, glide: -800, dur: 0.07, gain: 0.14, attack: 0.002, decay: 0.06 });
    },
    sfxHit() {
      if (!this.audio.ready) return;
      const t = this.now();
      if (t - this.audio.lastHitAt < 0.03) return;
      this.audio.lastHitAt = t;

      // 主音
      this.oneShot({ type:'triangle', freq: 240, glide: -140, dur: 0.06, gain: 0.18, attack: 0.0015, decay: 0.06 });

      // 噪声 burst
      const ctx = this.audio.ctx;
      const len = 0.04;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
      const src = ctx.createBufferSource(); src.buffer = buffer;

      const g = ctx.createGain();
      const t0 = ctx.currentTime;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.12, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);

      src.connect(g).connect(this.audio.fxGain);
      src.start(t0);
      src.stop(t0 + len + 0.02);
    },
    sfxPickup() {
      if (!this.audio.ready) return;
      const t = this.now();
      if (t - this.audio.lastPickupAt < 0.08) return;
      this.audio.lastPickupAt = t;
      this.oneShot({ type:'sine', freq: 920, glide: 0, dur: 0.10, gain: 0.13, attack: 0.0015, decay: 0.09 });
    },

    // ===== layout / world =====
    handleResize() {
      const styleWidth = window.innerWidth;
      const styleHeight = window.innerHeight;
      this.canvas.width = Math.floor(styleWidth * this.dpr);
      this.canvas.height = Math.floor(styleHeight * this.dpr);
      this.canvas.style.width = styleWidth + 'px';
      this.canvas.style.height = styleHeight + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (!this.running) {
        this.player.x = styleWidth / 2;
        this.player.y = styleHeight / 2;
      }
      this.buildObstacles();
    },
    buildObstacles() {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      const minSide = Math.min(w, h);
      const thick = Math.max(20, Math.round(minSide * 0.03));
      this.obstacles = [
        { x: w * 0.18, y: h * 0.25, w: Math.max(160, w*0.18), h: thick, r: 8 },
        { x: w * 0.60, y: h * 0.45, w: Math.max(180, w*0.22), h: thick, r: 8 },
        { x: w * 0.34, y: h * 0.72, w: Math.max(160, w*0.20), h: thick, r: 8 },
      ];
    },
    reset() {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      this.player.x = w / 2;
      this.player.y = h / 2;
      this.player.hp = 100;
      this.player.speed = this.player.baseSpeed;

      this.score = 0; this.combo = 1; this.comboTimer = 0;
      this.wave = 1; this.spawnInterval = 1.0; this.spawnTimer = 0;

      this.bullets = []; this.zombies = []; this.particles = []; this.drops = [];
      this.buff.speed = 0; this.buff.spread = 0;
      this.paused = false; this.lastTime = performance.now();

      this.touch.left.active = false; this.touch.left.id = -1;
      this.touch.right.active = false; this.touch.right.id = -1;
      this.autoAim.highlight = null;

      this.buildObstacles();
    },
    restart() { this.reset(); },
    togglePause() { this.paused = !this.paused; },

    // ===== kb/mouse =====
    async onKeyDown(e) {
      await this.ensureAudio();
      const k = e.key.toLowerCase();
      if (['w','a','s','d'].includes(k)) this.keys.add(k);
      if (k === ' ') { e.preventDefault(); this.mouse.down = true; }
      if (k === 'escape') this.togglePause();
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

    // ===== gamepad =====
    onGamepadConnected(e) {
      this.gamepad.index = e.gamepad.index;
      this.gamepad.name = e.gamepad.id;
      this.gamepad.connected = true;
    },
    onGamepadDisconnected() {
      this.gamepad.index = -1; this.gamepad.name = ''; this.gamepad.connected = false;
      this.gp = { lx:0,ly:0,rx:0,ry:0,rt:0,fire:false,pause:false };
    },
    pollGamepad() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = pads && pads[this.gamepad.index];
      if (!gp) { this.gp.fire = false; return; }
      const dz = 0.18;
      const dead = (v) => (Math.abs(v) < dz ? 0 : (v > 0 ? (v - dz)/(1 - dz) : (v + dz)/(1 - dz)));
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

      const lx = dead(gp.axes[0] || 0);
      const ly = dead(gp.axes[1] || 0);
      const rx = dead(gp.axes[2] || 0);
      const ry = dead(gp.axes[3] || 0);
      const rt = gp.buttons[7] ? (gp.buttons[7].value || (gp.buttons[7].pressed ? 1 : 0)) : 0;
      const btnA = gp.buttons[0] && gp.buttons[0].pressed;
      const start = gp.buttons[9] && gp.buttons[9].pressed;

      this.gp.lx = clamp(lx, -1, 1);
      this.gp.ly = clamp(ly, -1, 1);
      this.gp.rx = clamp(rx, -1, 1);
      this.gp.ry = clamp(ry, -1, 1);
      this.gp.rt = clamp(rt, 0, 1);
      this.gp.fire = btnA || this.gp.rt > 0.2 || Math.hypot(this.gp.rx, this.gp.ry) > 0.35;
      this.gp.pause = !!start;
    },

    // ===== touch dual sticks =====
    async onTouchStart(e) {
      await this.ensureAudio();
      const rect = this.canvas.getBoundingClientRect();
      for (const t of e.changedTouches) {
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        if (x < rect.width * 0.5 && !this.touch.left.active) {
          this.startStick(this.touch.left, t.identifier, x, y);
        } else if (x >= rect.width * 0.5 && !this.touch.right.active) {
          this.startStick(this.touch.right, t.identifier, x, y);
        }
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
    startStick(st, id, x, y) {
      st.id = id; st.active = true;
      st.cx = x; st.cy = y; st.x = x; st.y = y;
      st.vx = 0; st.vy = 0; st.mag = 0;
    },
    moveStick(st, x, y) {
      const dx = x - st.cx, dy = y - st.cy;
      const len = Math.hypot(dx, dy);
      const max = st.max;
      const ratio = len > max ? max / len : 1;
      st.x = st.cx + dx * ratio;
      st.y = st.cy + dy * ratio;
      st.vx = (st.x - st.cx) / max;
      st.vy = (st.y - st.cy) / max;
      st.mag = Math.min(1, len / max);
    },
    endStick(st) {
      st.id = -1; st.active = false;
      st.vx = 0; st.vy = 0; st.mag = 0;
    },
    joyStyle(st) {
      return `left:${st.cx - st.r}px; top:${st.cy - st.r}px; width:${st.r*2}px; height:${st.r*2}px;`;
    },
    stickStyle(st) {
      const dx = (st.x - st.cx);
      const dy = (st.y - st.cy);
      return `transform: translate(${dx}px, ${dy}px);`;
    },

    // ===== main loop =====
    loop(t) {
      if (!this.running) return;
      const dt = Math.min(0.033, (t - this.lastTime) / 1000 || 0);
      this.lastTime = t;

      if (this.gamepad.connected) this.pollGamepad();
      if (this.gp.pause) { this.togglePause(); this.gp.pause = false; }

      if (!this.paused && this.player.hp > 0) {
        this.update(dt);
        this.draw();
      } else {
        this.draw();
      }
      requestAnimationFrame(this.loop);
    },

    update(dt) {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;

      // buffs
      if (this.buff.speed > 0)  this.buff.speed  = Math.max(0, this.buff.speed  - dt);
      if (this.buff.spread > 0) this.buff.spread = Math.max(0, this.buff.spread - dt);
      this.player.speed = this.player.baseSpeed * (this.buff.speed > 0 ? 1.5 : 1.0);

      // ===== movement =====
      let mx = 0, my = 0;
      if (this.keys.has('w')) my -= 1;
      if (this.keys.has('s')) my += 1;
      if (this.keys.has('a')) mx -= 1;
      if (this.keys.has('d')) mx += 1;
      if (Math.hypot(this.gp.lx, this.gp.ly) > 0) { mx = this.gp.lx; my = this.gp.ly; }
      if (this.isTouchDevice && this.touch.left.active && this.touch.left.mag > 0.05) {
        mx = this.touch.left.vx; my = this.touch.left.vy;
      }
      const mlen = Math.hypot(mx, my) || 1;
      mx /= mlen; my /= mlen;
      this.player.x = this.clamp(this.player.x + mx * this.player.speed * dt, this.player.r, w - this.player.r);
      this.player.y = this.clamp(this.player.y + my * this.player.speed * dt, this.player.r, h - this.player.r);
      this.resolveCircleObstacles(this.player);

      // ===== aim (with mobile assist) =====
      let aimDir = this.player.dir;
      let haveAim = false;
      this.autoAim.highlight = null;

      // mouse
      const mdx = this.mouse.x - this.player.x;
      const mdy = this.mouse.y - this.player.y;
      if (Math.hypot(mdx, mdy) > 0.001) { aimDir = Math.atan2(mdy, mdx); haveAim = true; }

      // gamepad right stick
      if (Math.hypot(this.gp.rx, this.gp.ry) > 0.15) {
        aimDir = Math.atan2(this.gp.ry, this.gp.rx); haveAim = true;
      }

      // touch right stick (with auto aim)
      if (this.isTouchDevice && this.touch.right.active) {
        if (this.touch.right.mag > 0.10) {
          aimDir = Math.atan2(this.touch.right.vy, this.touch.right.vx);
          haveAim = true;
        } else if (this.autoAim.enabled) {
          const target = this.findAutoAimTarget(this.autoAim.range);
          if (target) {
            aimDir = Math.atan2(target.y - this.player.y, target.x - this.player.x);
            haveAim = true;
            this.autoAim.highlight = target;
          }
        }
      }
      if (haveAim) this.player.dir = aimDir;

      // ===== fire =====
      const touchFire =
        (this.isTouchDevice && this.touch.right.active && (
          this.touch.right.mag > 0.25 ||
          (this.autoAim.highlight && this.touch.right.mag > this.autoAim.minStickToFire)
        ));
      const shouldFire = this.mouse.down || this.gp.fire || touchFire;

      this.player.fireCooldown = Math.max(0, this.player.fireCooldown - dt);
      if (shouldFire && this.player.fireCooldown <= 0) {
        this.fireBullet();
        this.player.fireCooldown = (this.buff.spread > 0 ? 0.10 : 0.12);
      }

      // bullets
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.x += Math.cos(b.dir) * b.speed * dt;
        b.y += Math.sin(b.dir) * b.speed * dt;
        b.life -= dt;
        if (this.hitObstacle(b.x, b.y)) b.life = 0;
        if (b.life <= 0 || b.x < -10 || b.x > w + 10 || b.y < -10 || b.y > h + 10) {
          this.bullets.splice(i, 1);
        }
      }

      // spawn
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnZombie();
        const minInterval = 0.35;
        this.spawnInterval = Math.max(minInterval, this.spawnInterval * 0.995);
        this.spawnTimer = this.spawnInterval;
        this.accTime += dt;
        if (this.accTime >= 10) { this.wave++; this.accTime = 0; }
      }

      // zombies
      for (let i = this.zombies.length - 1; i >= 0; i--) {
        const z = this.zombies[i];
        if (z.elite) {
          z.dashCd -= dt;
          if (z.dashCd <= 0) { z.dashing = true; z.dashTime = 0.45; z.dashCd = 3 + Math.random() * 1.5; }
          if (z.dashing) { z.dashTime -= dt; if (z.dashTime <= 0) z.dashing = false; }
        }
        const baseSpeed = z.speed * (z.dashing ? 3.2 : 1);
        const angle = Math.atan2(this.player.y - z.y, this.player.x - z.x);
        z.x += Math.cos(angle) * baseSpeed * dt;
        z.y += Math.sin(angle) * baseSpeed * dt;
        this.resolveCircleObstacles(z);

        // bullet hit
        for (let j = this.bullets.length - 1; j >= 0; j--) {
          const b = this.bullets[j];
          if (this.circleHit(b.x, b.y, 3, z.x, z.y, z.r)) {
            z.hp -= b.dmg;
            this.bullets.splice(j, 1);
            this.makeHitParticles(z.x, z.y, '#6cf');
            this.sfxHit(); // 命中音效
            if (z.hp <= 0) { this.zombies.splice(i, 1); this.onKill(z); }
            break;
          }
        }
        // bite
        if (this.circleHit(this.player.x, this.player.y, this.player.r, z.x, z.y, z.r)) {
          this.player.hp -= z.dmg * dt;
          const push = 50 * dt;
          z.x -= Math.cos(angle) * push;
          z.y -= Math.sin(angle) * push;
        }
      }

      // drops
      for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i];
        d.life -= dt;
        if (d.life <= 0) { this.drops.splice(i, 1); continue; }
        d.bob += dt;
        d.drawY = d.y + Math.sin(d.bob * 4) * 3;
        if (this.circleHit(this.player.x, this.player.y, this.player.r, d.x, d.drawY, d.r)) {
          this.applyDrop(d.type);
          this.drops.splice(i, 1);
          this.makeDeathBurst(d.x, d.drawY, '#ffd166');
          this.sfxPickup(); // 拾取提示
        }
      }

      // particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
        p.life -= dt; if (p.life <= 0) this.particles.splice(i, 1);
      }

      // combo & save
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer === 0) this.combo = 1;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem(LS_KEY, String(this.bestScore));
      }
    },

    draw() {
      const ctx = this.ctx;
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;

      // bg
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0e0f12'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // obstacles
      for (const o of this.obstacles) {
        ctx.fillStyle = '#1f2430';
        this.roundRect(ctx, o.x, o.y, o.w, o.h, o.r); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
      }

      // drops
      for (const d of this.drops) {
        ctx.save(); ctx.translate(d.x, d.drawY);
        ctx.fillStyle = d.color;
        ctx.beginPath(); ctx.arc(0, 0, d.r, 0, Math.PI * 2); ctx.fill();
        ctx.font = '16px ui-sans-serif, system-ui';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#111'; ctx.fillText(d.icon, 0, 1);
        ctx.restore();
      }

      // bullets
      for (const b of this.bullets) {
        ctx.beginPath(); ctx.fillStyle = '#9cf';
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
      }

      // zombies
      for (const z of this.zombies) {
        ctx.save(); ctx.translate(z.x, z.y);
        ctx.rotate(Math.atan2(this.player.y - z.y, this.player.x - z.x));
        ctx.fillStyle = z.color;
        ctx.beginPath(); ctx.arc(0, 0, z.r, 0, Math.PI * 2); ctx.fill();
        // hp bar
        ctx.fillStyle = '#222'; ctx.fillRect(-z.r, -z.r - 10, z.r * 2, 4);
        ctx.fillStyle = z.elite ? '#ff7b7b' : '#e55';
        ctx.fillRect(-z.r, -z.r - 10, (z.hp / z.maxHp) * z.r * 2, 4);
        // elite dash aura
        if (z.elite && z.dashing) {
          ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffcf33';
          ctx.beginPath(); ctx.arc(0, 0, z.r + 6, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      // auto-aim highlight
      if (this.autoAim.highlight) {
        const t = this.autoAim.highlight;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.arc(t.x, t.y, t.r + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // player
      const p = this.player;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.dir);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9cf'; ctx.fillRect(8, -3, 14, 6);
      ctx.restore();

      // particles
      for (const part of this.particles) {
        ctx.globalAlpha = Math.max(0, part.life / part.maxLife);
        ctx.fillStyle = part.color; ctx.fillRect(part.x, part.y, 2, 2);
      }
      ctx.globalAlpha = 1;

      if (this.player.hp <= 0 || this.paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(this.paused ? '已暂停' : '你阵亡了', w / 2, h / 2 - 10);
        ctx.font = '16px ui-sans-serif, system-ui';
        ctx.fillText('Start/Esc 切换暂停；点击【重新开始】再战', w / 2, h / 2 + 20);
      }
    },

    // ===== gameplay =====
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
        this.bullets.push({ x: muzzleX, y: muzzleY, dir, speed: 740, dmg: 24 * (shots > 1 ? 0.65 : 1), life: 0.9 });
        this.makeMuzzleFlash(muzzleX, muzzleY);
      }
      this.sfxShot(); // 射击音效
    },
    spawnZombie() {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      const edge = Math.floor(Math.random() * 4);
      const margin = 30;
      let x = 0, y = 0;
      if (edge === 0) { x = Math.random() * w; y = -margin; }
      if (edge === 1) { x = w + margin; y = Math.random() * h; }
      if (edge === 2) { x = Math.random() * w; y = h + margin; }
      if (edge === 3) { x = -margin; y = Math.random() * h; }

      const eliteChance = Math.min(0.15, 0.05 + this.wave * 0.01);
      const elite = Math.random() < eliteChance;

      const base = 1 + this.wave * 0.12;
      const r = elite ? 16 : (12 + Math.random() * 10);
      const hp = (elite ? 140 : 40) * base * (0.9 + Math.random() * 0.6);
      const speed = (elite ? 70 : 60) + Math.random() * 30 + this.wave * 2;
      const dmg = (elite ? 16 : 12) + this.wave * 0.6;

      const hue = elite ? 12 + Math.random() * 24 : 100 + Math.random() * 160;
      const color = elite ? `hsl(${hue} 80% 55%)` : `hsl(${hue} 60% 55%)`;

      this.zombies.push({
        x, y, r, hp, maxHp: hp, speed, dmg, color,
        elite, dashing: false, dashCd: elite ? (1 + Math.random() * 1.5) : 9999, dashTime: 0,
      });
    },
    onKill(z) {
      const gain = Math.round(10 + z.maxHp * 0.1);
      this.combo = Math.min(10, this.combo + 1);
      this.comboTimer = 2.2;
      this.score += gain * this.combo;
      this.makeDeathBurst(z.x, z.y, z.color);

      const dropRoll = Math.random();
      const dropBias = z.elite ? 0.5 : 0.25;
      if (dropRoll < dropBias) {
        const r = Math.random();
        const type = r < 0.34 ? 'heal' : (r < 0.67 ? 'speed' : 'spread');
        this.spawnDrop(z.x, z.y, type);
      }
    },
    spawnDrop(x, y, type) {
      const map = {
        heal:  { icon: '❤️', color: '#ff9aa2' },
        speed: { icon: '⚡', color: '#f9d56e' },
        spread:{ icon: '🔱', color: '#9ad3bc' },
      };
      const cfg = map[type];
      this.drops.push({ type, x, y, drawY: y, r: 13, life: 10, bob: 0, icon: cfg.icon, color: cfg.color });
    },
    applyDrop(type) {
      if (type === 'heal') this.player.hp = Math.min(100, this.player.hp + 35);
      if (type === 'speed') this.buff.speed  = Math.max(this.buff.speed, 8);
      if (type === 'spread') this.buff.spread = Math.max(this.buff.spread, 10);
    },

    // ===== auto-aim helper =====
    findAutoAimTarget(range) {
      let best = null, bestD2 = Infinity;
      const px = this.player.x, py = this.player.y;
      for (const z of this.zombies) {
        const dx = z.x - px, dy = z.y - py;
        const d2 = dx*dx + dy*dy;
        if (d2 <= range*range && d2 < bestD2) {
          best = z; bestD2 = d2;
        }
      }
      return best;
    },

    // ===== fx =====
    makeMuzzleFlash(x, y) {
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
          life: 0.2 + Math.random() * 0.2, maxLife: 0.4, color: '#cff',
        });
      }
    },
    makeHitParticles(x, y, color) {
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
          life: 0.3 + Math.random() * 0.4, maxLife: 0.7, color,
        });
      }
    },
    makeDeathBurst(x, y, color) {
      for (let i = 0; i < 24; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 6;
        this.particles.push({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: 0.6 + Math.random() * 0.6, maxLife: 1.2, color,
        });
      }
    },

    // ===== collisions =====
    resolveCircleObstacles(circle) {
      for (const o of this.obstacles) {
        const nx = this.clamp(circle.x, o.x, o.x + o.w);
        const ny = this.clamp(circle.y, o.y, o.y + o.h);
        const dx = circle.x - nx, dy = circle.y - ny;
        const r = circle.r + 0.5;
        const dist2 = dx*dx + dy*dy;
        if (dist2 < r*r) {
          const dist = Math.sqrt(dist2) || 0.0001;
          const overlap = r - dist;
          const ux = dx / dist, uy = dy / dist;
          circle.x += ux * overlap; circle.y += uy * overlap;
        }
      }
    },
    hitObstacle(x, y) {
      for (const o of this.obstacles) {
        if (x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h) return true;
      }
      return false;
    },

    // ===== utils =====
    clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
    circleHit(x1, y1, r1, x2, y2, r2) {
      const dx = x1 - x2, dy = y1 - y2;
      return dx * dx + dy * dy <= (r1 + r2) * (r1 + r2);
    },
    roundRect(ctx, x, y, w, h, r = 8) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },
  }
};
</script>

<style scoped>
.game-wrap{
  position:relative;
  width:100vw;
  height:100dvh; /* 横屏/全面屏友好 */
  background:#0e0f12;
  overflow:hidden;
  touch-action:none;
}

/* 伪全屏：移动端不支持原生全屏时作为兜底 */
.game-wrap.pseudo{
  position:fixed;
  inset:0;
  width:100vw;
  height:100dvh;
  z-index:9999;
}

.game-canvas{ width:100%; height:100%; display:block; cursor:crosshair; }

/* HUD 在最上层，但只有按钮可点 */
.hud{
  position:absolute; inset:0;
  pointer-events:none;
  display:flex; flex-direction:column; justify-content:space-between;
  z-index:3;
}
.stats{
  pointer-events:none; user-select:none; padding:10px 14px;
  display:flex; gap:16px; color:#e7f4ff;
  text-shadow:0 1px 2px rgba(0,0,0,.6);
  font:600 14px ui-sans-serif,system-ui;
}
.stats .pad{ opacity:.75; }
.buffs{ pointer-events:none; display:flex; gap:8px; padding:0 14px; }
.buff{
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
  color:#e7f4ff; padding:2px 8px; border-radius:10px;
  font:600 12px ui-sans-serif,system-ui; display:flex; gap:6px; align-items:center;
}

.actions{
  pointer-events:auto;
  position:absolute; right:10px; top:8px; display:flex; gap:8px; align-items:center;
}
.actions button{
  background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px;
  border-radius:10px; cursor:pointer;
}
.actions button:hover{ filter:brightness(1.1); }

.actions .audio{
  display:flex; align-items:center; gap:6px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.08);
  padding:4px 6px; border-radius:10px;
}
.actions .audio .vol{
  width:110px; height:6px;
  accent-color:#9cf;
}

.tips{ pointer-events:none; color:#9fb3c8; font:12px ui-sans-serif,system-ui; padding:0 14px 12px; }

/* 触摸层（仅触屏渲染） */
.touch-layer{ position:absolute; inset:0; z-index:1; pointer-events:auto; }

/* 虚拟摇杆：展示用，不吃事件 */
.joystick{
  position:absolute; z-index:2; border-radius:999px; opacity:.95; pointer-events:none;
}
.joystick .base{
  position:absolute; inset:0; border-radius:999px;
  background:radial-gradient(closest-side, rgba(255,255,255,.12), rgba(255,255,255,.05));
  border:1px solid rgba(255,255,255,.15);
}
.joystick .stick{
  position:absolute; left:50%; top:50%;
  width:38px; height:38px; margin-left:-19px; margin-top:-19px;
  border-radius:999px; background:rgba(255,255,255,.35);
  border:1px solid rgba(255,255,255,.25);
  box-shadow:0 4px 10px rgba(0,0,0,.25);
}
</style>
  