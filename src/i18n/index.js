import { createI18n } from 'vue-i18n'
import zh from './zh-CN.json'
import en from './en.json'

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || 'zh-CN',
  fallbackLocale: 'en',
  messages: { 'zh-CN': zh, en }
})
