<template>
  <main class="home">
    <section class="hero">
      <h1>{{ t('home.title') }}</h1>
      <p class="subtitle">
        {{ t('home.subtitle') }}
      </p>
      <div class="cta">
        <RouterLink class="btn" :to="{ name: 'game' }">
          {{ t('home.cta.start') }}
        </RouterLink>
        <button class="btn ghost" @click="toggleTheme">
          {{ themeLabel }}
        </button>
      </div>
    </section>

    <section class="panels">
      <article class="panel">
        <h2>{{ t('home.panels.progressionTitle') }}</h2>
        <p class="muted">
          {{ t('home.panels.progressionDesc') }}
        </p>
      </article>
      <article class="panel">
        <h2>{{ t('home.panels.weaponTitle') }}</h2>
        <p class="muted">
          {{ t('home.panels.weaponDesc') }}
        </p>
      </article>
      <article class="panel">
        <h2>{{ t('home.panels.stageTitle') }}</h2>
        <p class="muted">
          {{ t('home.panels.stageDesc') }}
        </p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, computed } from 'vue'

const { t } = useI18n()

const isDark = computed(() => document.documentElement.classList.contains('dark'))
const themeLabel = computed(() => isDark.value ? t('home.theme.light') : t('home.theme.dark'))

function toggleTheme() {
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const nextDark = saved ? saved === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', nextDark)
})
</script>

<style scoped>
.home {
  max-width: 1120px;
  margin: 0 auto;
  padding: var(--space-4);
}

.hero {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: clamp(1.25rem, 2vw + 1rem, 2rem);
  box-shadow: var(--shadow);
}

.hero h1 {
  font-size: clamp(1.6rem, 2.2vw + 1rem, 2.2rem);
  line-height: 1.25;
  margin: 0 0 var(--space-2);
  color: var(--text-1); /* 主标题高可读，但不刺眼 */
  font-weight: 700;
}

.subtitle {
  color: var(--text-2); /* 次级文字更柔和 */
  margin: 0 0 var(--space-3);
  max-width: 56ch;
}

.cta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--accent-soft);  /* 轻强调，不强对比 */
  color: var(--text-1);
  box-shadow: var(--shadow);
  transition: transform .08s ease, box-shadow .2s ease, background .2s ease;
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }

.btn.ghost {
  background: transparent;
}

.panels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  box-shadow: var(--shadow);
}

.panel h2 {
  margin: 0 0 .5rem;
  font-size: 1.05rem;
  color: var(--text-1);
}
.panel .muted {
  color: var(--text-3);
  line-height: 1.6;
}
</style>
