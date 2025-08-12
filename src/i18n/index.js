import { createI18n } from 'vue-i18n'
import zh from './zh-CN.json'

export default createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: { 'zh-CN': zh }
})
