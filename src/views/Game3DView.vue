<template>
  <div class="three-wrap" ref="mountEl"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const mountEl = ref(null)
let scene, camera, renderer, player, animationId
const keys = { ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false }
const speed = 0.1
const monsters = []
const bounds = 9.5

function onKeyDown(e){ if(e.key in keys) keys[e.key] = true }
function onKeyUp(e){ if(e.key in keys) keys[e.key] = false }

function animate(){
  animationId = requestAnimationFrame(animate)
  if(keys.ArrowUp) player.position.z -= speed
  if(keys.ArrowDown) player.position.z += speed
  if(keys.ArrowLeft) player.position.x -= speed
  if(keys.ArrowRight) player.position.x += speed
  player.position.x = THREE.MathUtils.clamp(player.position.x, -bounds, bounds)
  player.position.z = THREE.MathUtils.clamp(player.position.z, -bounds, bounds)
  monsters.forEach(m=>{
    m.position.x += 0.02 * m.userData.dir
    if(Math.abs(m.position.x) > 8) m.userData.dir *= -1
    m.rotation.y += 0.01
  })
  renderer.render(scene, camera)
}

onMounted(()=>{
  scene = new THREE.Scene()
  const width = mountEl.value.clientWidth
  const height = mountEl.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 100)
  camera.position.set(0,5,8)
  camera.lookAt(0,0,0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  mountEl.value.appendChild(renderer.domElement)

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
  scene.add(light)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20,20),
    new THREE.MeshStandardMaterial({ color:0x222222 })
  )
  ground.rotation.x = -Math.PI/2
  scene.add(ground)

  const wallMaterial = new THREE.MeshStandardMaterial({ color:0x666666 })
  const wallThickness = 0.5
  const wallHeight = 1
  const half = 10
  const walls = [
    new THREE.Mesh(new THREE.BoxGeometry(20, wallHeight, wallThickness), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(20, wallHeight, wallThickness), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 20), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 20), wallMaterial)
  ]
  walls[0].position.set(0, wallHeight/2, -half)
  walls[1].position.set(0, wallHeight/2, half)
  walls[2].position.set(-half, wallHeight/2, 0)
  walls[3].position.set(half, wallHeight/2, 0)
  walls.forEach(w => scene.add(w))

  player = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({ color:0x00ff00 })
  )
  player.position.y = 0.5
  scene.add(player)

  const monsterGeo = new THREE.BoxGeometry(1,1,1)
  const monsterMat = new THREE.MeshStandardMaterial({ color:0xff0000 })
  for(let i=0;i<3;i++){
    const m = new THREE.Mesh(monsterGeo, monsterMat)
    m.position.set(-4 + i*4, 0.5, i%2===0 ? -4 : 4)
    m.userData.dir = Math.random()>0.5?1:-1
    monsters.push(m)
    scene.add(m)
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  animate()
})

onBeforeUnmount(()=>{
  cancelAnimationFrame(animationId)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  renderer && renderer.dispose()
})
</script>

<style scoped>
.three-wrap {
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
}
</style>
