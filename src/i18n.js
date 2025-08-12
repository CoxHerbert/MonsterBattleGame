import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    home: {
      title: '怪物大战',
      start: '开始游戏',
      continue: '继续游戏',
      settings: '设置',
      leaderboard: '排行榜',
      rank: '第{n}名：{score}',
      selectSave: '选择存档',
      saveItem: '波数{wave} 分数{score}',
      close: '关闭'
    },
    settings: {
      mute: '静音',
      unmute: '取消静音',
      volume: '音量',
      bgmOnLabel: '🎵 背景音乐 开',
      bgmOffLabel: '🎵 背景音乐 关',
      bgmOnTitle: '开启背景音乐',
      bgmOffTitle: '关闭背景音乐',
      radarOn: '雷达：开',
      radarOff: '雷达：关',
      mapSize: '地图大小',
      small: '小',
      medium: '中',
      large: '大',
      saveAndExit: '保存并退出',
      restart: '重新开始',
      close: '关闭',
      language: '语言'
    },
    game: {
      score: '分数',
      best: '最高',
      combo: '连击',
      hp: '生命',
      wave: '波数',
      boss: '首领',
      seconds: '秒',
      paused: '已暂停',
      aimAssist: '辅助瞄准',
      tapToEnableSound: '轻点屏幕以启用声音',
      loadingImages: '贴图加载中…',
      pause: '暂停',
      resume: '继续',
      autoFireOn: '自动攻击：开',
      autoFireOff: '自动攻击：关',
      fullscreen: '全屏',
      exitFullscreen: '退出全屏',
      settings: '设置',
      tips: '键鼠：WASD + 鼠标 ｜ 手柄：左摇杆移动、右摇杆瞄准、RT/A 射击 ｜ 触屏：左下移动，右下瞄准（轻推触发自动瞄准）。',
      gameOver: '游戏结束，分数 {score}',
      restart: '重新开始',
      backHome: '回到首页',
      buff: {
        speed: '⚡加速',
        spread: '🔱散射',
        burn: '🔥燃烧',
        pierce: '🎯穿透',
        bounce: '↩️弹射',
        split: '🔀分裂'
      },
      chooseAugment: '选择增强',
      augment: {
        atk: '攻击力+20%',
        aspd: '攻速+10%',
        speed: '移速+10%',
        hp: '最大生命+20'
      },
      youDied: '你阵亡了',
      pressStart: '按 Start/Esc 切换暂停'
    }
  },
  en: {
    home: {
      title: 'Monster Battle',
      start: 'Start Game',
      continue: 'Continue',
      settings: 'Settings',
      leaderboard: 'Leaderboard',
      rank: '#{n}: {score}',
      selectSave: 'Choose Save',
      saveItem: 'Wave {wave} Score {score}',
      close: 'Close'
    },
    settings: {
      mute: 'Mute',
      unmute: 'Unmute',
      volume: 'Volume',
      bgmOnLabel: '🎵 BGM On',
      bgmOffLabel: '🎵 BGM Off',
      bgmOnTitle: 'Enable BGM',
      bgmOffTitle: 'Disable BGM',
      radarOn: 'Radar: On',
      radarOff: 'Radar: Off',
      mapSize: 'Map Size',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      saveAndExit: 'Save & Exit',
      restart: 'Restart',
      close: 'Close',
      language: 'Language'
    },
    game: {
      score: 'Score',
      best: 'Best',
      combo: 'Combo',
      hp: 'HP',
      wave: 'Wave',
      boss: 'Boss',
      seconds: 's',
      paused: 'Paused',
      aimAssist: 'Aim Assist',
      tapToEnableSound: 'Tap screen to enable sound',
      loadingImages: 'Loading images…',
      pause: 'Pause',
      resume: 'Resume',
      autoFireOn: 'Auto Fire: On',
      autoFireOff: 'Auto Fire: Off',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
      settings: 'Settings',
      tips: 'Keyboard: WASD + Mouse | Gamepad: Move with left stick, aim with right stick, RT/A to shoot | Touch: move left bottom, aim right bottom (light drag for auto aim).',
      gameOver: 'Game Over, score {score}',
      restart: 'Restart',
      backHome: 'Back to Home',
      buff: {
        speed: '⚡Speed',
        spread: '🔱Spread',
        burn: '🔥Burn',
        pierce: '🎯Pierce',
        bounce: '↩️Bounce',
        split: '🔀Split'
      },
      chooseAugment: 'Choose Augment',
      augment: {
        atk: 'Attack +20%',
        aspd: 'Attack Speed +10%',
        speed: 'Move Speed +10%',
        hp: 'Max HP +20'
      },
      youDied: 'You Died',
      pressStart: 'Press Start/Esc to toggle pause'
    }
  }
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('zombie-lang') || 'zh',
  messages
})

export default i18n
