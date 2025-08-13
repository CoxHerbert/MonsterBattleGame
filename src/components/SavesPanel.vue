<template>
  <div class="panel">
    <h2>{{ $t('saves.title') }}</h2>

    <div v-if="!saves.length" class="empty">
      {{ $t('saves.empty') }}
    </div>

    <ul v-else class="list">
      <li v-for="s in saves" :key="s.id" class="item">
        <div class="meta">
          <div class="line">
            <strong>#{{ s.id }}</strong>
            <span class="time">{{ format(s.time) }}</span>
          </div>
          <div class="line dim">
            <span>{{ $t('saves.wave') }}: {{ s.state?.wave ?? '-' }}</span>
            <span>•</span>
            <span>{{ $t('saves.score') }}: {{ s.state?.score ?? '-' }}</span>
            <span v-if="s.state?.player">•</span>
            <span v-if="s.state?.player">{{ $t('saves.hp') }}: {{ Math.ceil(s.state.player.hp ?? 0) }}</span>
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
  methods: { format: formatDateTime }
}
</script>

<style scoped>
.panel{ background:#0f1320; color:#e6f0ff; border:1px solid #2a3346; border-radius:12px; padding:16px; width:min(760px, 94vw); }
h2{ margin:0 0 10px; font:700 18px ui-sans-serif,system-ui; }
.empty{ opacity:.75; padding:10px 0; }
.list{ list-style:none; padding:0; margin:8px 0 0; display:flex; flex-direction:column; gap:10px; max-height:min(56vh, 520px); overflow:auto; }
.item{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px; border:1px solid #263149; border-radius:10px; background:rgba(255,255,255,.03); }
.meta{ display:flex; flex-direction:column; gap:4px; }
.line{ display:flex; align-items:center; gap:8px; }
.dim{ opacity:.8; font-size:13px; }
.time{ opacity:.7; }
.ops{ display:flex; gap:8px; }
.actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:12px; }
.btn{ background:#1f2937; color:#e5e7eb; border:0; padding:6px 10px; border-radius:10px; cursor:pointer; }
.btn:hover{ filter:brightness(1.08); }
.btn.ghost{ background:transparent; border:1px solid #2a3346; }
.btn.danger{ background:#7f1d1d; }
</style>
