<template>
  <div class="panel">
    <h2>{{ $t('saves.title') }}</h2>

    <div v-if="!saves.length" class="empty">
      {{ $t('saves.empty') }}
    </div>

    <ul v-else class="list">
      <li v-for="s in saves" :key="s.id" class="item">
        <div class="meta">
          <!-- 第一行：名称（可编辑） + 时间戳 -->
          <div class="line name">
            <input class="name-input"
                   :aria-label="$t('saves.renameAria')"
                   :value="s.name || defaultName(s)"
                   @keydown.enter.prevent="emitRename(s, $event.target.value)"
                   @blur="emitRename(s, $event.target.value)" />
            <span class="time">{{ format(s.time) }}</span>
          </div>

          <!-- 第二行：波次/分数/HP + 徽标 -->
          <div class="line dim wrap">
            <div class="chips">
              <span class="chip mode" :data-mode="s.gameMode || 'endless'">
                {{ modeLabel(s.gameMode) }}
              </span>
              <span class="chip diff" :data-diff="s.difficulty || 'normal'">
                {{ diffLabel(s.difficulty) }}
              </span>
            </div>
            <div class="stats">
              <span>{{ $t('saves.wave') }}: {{ s.state?.wave ?? '-' }}</span>
              <span>•</span>
              <span>{{ $t('saves.score') }}: {{ s.state?.score ?? '-' }}</span>
              <span v-if="s.state?.player">•</span>
              <span v-if="s.state?.player">{{ $t('saves.hp') }}: {{ Math.ceil(s.state.player.hp ?? 0) }}</span>
            </div>
          </div>
        </div>

        <div class="ops">
          <button class="btn" @click="$emit('continue', s.id)">{{ $t('saves.continue') }}</button>
          <button class="btn danger" @click="$emit('delete', s.id)">{{ $t('saves.delete') }}</button>
        </div>
      </li>
    </ul>

    <footer class="actions">
      <button class="btn ghost" @click="$emit('close')">{{ $t('saves.close') }}</button>
      <button class="btn danger" v-if="saves.length" @click="$emit('clearAll')">{{ $t('saves.clearAll') }}</button>
    </footer>
  </div>
</template>

<script>
import { formatDateTime } from '@/utils/time.js'
export default {
  name: 'SavesPanel',
  props: { saves: { type: Array, default: () => [] } },
  methods: {
    format: formatDateTime,
    defaultName(s){
      return this.$t('saves.unnamed') + ' #' + s.id;
    },
    emitRename(s, newName){
      const name = String(newName || '').trim();
      if (!name || name === s.name) return; // 空名或未改则忽略
      this.$emit('rename', { id: s.id, name });
    },
    modeLabel(m){
      const key = String(m || 'endless');
      return this.$t(`saves.mode.${key}`, key);
    },
    diffLabel(d){
      const key = String(d || 'normal');
      return this.$t(`saves.difficulty.${key}`, key);
    }
  }
}
</script>

<style scoped>
.panel{ background:#0f1320; color:#e6f0ff; border:1px solid #2a3346; border-radius:12px; padding:16px; width:min(760px, 94vw); }
h2{ margin:0 0 10px; font:700 18px ui-sans-serif,system-ui; }
.empty{ opacity:.75; padding:10px 0; }
.list{ list-style:none; padding:0; margin:8px 0 0; display:flex; flex-direction:column; gap:10px; max-height:min(56vh, 520px); overflow:auto; }
.item{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px; border:1px solid #263149; border-radius:10px; background:rgba(255,255,255,.03); }
.meta{ display:flex; flex-direction:column; gap:6px; min-width:0; }
.line{ display:flex; align-items:center; gap:8px; }
.line.wrap{ justify-content:space-between; gap:10px; }
.name-input{
  background:transparent; border:none; color:#e6f0ff; font:700 15px ui-sans-serif,system-ui; padding:2px 6px; border-radius:8px;
  outline:none; min-width:140px; max-width:44vw;
}
.name-input:focus{ background:rgba(255,255,255,.06); border:1px solid #2a3346; }
.dim{ opacity:.85; font-size:13px; }
.time{ opacity:.7; }
.ops{ display:flex; gap:8px; }
.actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:12px; }
.btn{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
.btn:hover{ filter:brightness(1.08); }
.btn.ghost{ background:transparent; border:1px solid #2a3346; }
.btn.danger{ background:#7f1d1d; }

/* 徽标样式 */
.chips{ display:flex; gap:6px; flex-wrap:wrap; }
.chip{
  display:inline-flex; align-items:center; gap:6px; padding:2px 8px; border-radius:999px; font:700 12px ui-sans-serif,system-ui;
  border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06);
}

/* 模式色彩 */
.chip.mode[data-mode="endless"]{ background:rgba(96,165,250,.15); border-color:rgba(96,165,250,.35); color:#cfe6ff; }
.chip.mode[data-mode="growth"]{ background:rgba(16,185,129,.15); border-color:rgba(16,185,129,.35); color:#c6ffea; }

/* 难度色彩 */
.chip.diff[data-diff="easy"]   { background:rgba(148,163,184,.18); border-color:rgba(148,163,184,.35); color:#e5eefc; }
.chip.diff[data-diff="normal"] { background:rgba(96,165,250,.15); border-color:rgba(96,165,250,.35); color:#cfe6ff; }
.chip.diff[data-diff="hard"]   { background:rgba(234,179,8,.15);  border-color:rgba(234,179,8,.35);  color:#fff5d1; }
.chip.diff[data-diff="hell"]   { background:rgba(239,68,68,.18);  border-color:rgba(239,68,68,.4);  color:#ffd2d2; }

.stats{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
</style>
