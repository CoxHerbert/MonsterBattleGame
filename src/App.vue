<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (!saved && window.matchMedia?.('(prefers-color-scheme: dark)')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
  }
})
</script>

<template>
  <RouterView />
</template>

<style>
/* global styles for root can be added here if needed */
</style>
