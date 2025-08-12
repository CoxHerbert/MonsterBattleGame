export default {
  dodge: { // 闪避：短无敌+位移
    cd: 3.5, invulnSec: 0.35, dashDist: 160, dashTime: 0.12, sfx: 'dodge' },

  shield: { // 护盾：吸收伤害，随时间衰减
    cd: 12, shieldValue: 120, decayPerSec: 10, duration: 8, sfx: 'shield_on' },

  nuke: { // 全屏轰炸：扣能量 + 短CD
    cd: 5, energyCost: 60, baseDamageMul: 3.2, radius: 520, sfx: 'nuke' }
};
