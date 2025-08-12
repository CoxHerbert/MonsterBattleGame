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

function onKeyDown(e){ if(e.key in keys) keys[e.key] = true }
function onKeyUp(e){ if(e.key in keys) keys[e.key] = false }

function animate(){
  animationId = requestAnimationFrame(animate)
  if(keys.ArrowUp) player.position.z -= speed
  if(keys.ArrowDown) player.position.z += speed
  if(keys.ArrowLeft) player.position.x -= speed
  if(keys.ArrowRight) player.position.x += speed
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

  player = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({ color:0x00ff00 })
  )
  player.position.y = 0.5
  scene.add(player)

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
