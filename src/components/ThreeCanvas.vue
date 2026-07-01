<template>
  <canvas ref="canvasRef" id="webgl-canvas"></canvas>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import gsap from 'gsap'

const props = defineProps({
  currentPage: {
    type: String,
    default: 'main'
  }
})

const emit = defineEmits(['scene-ready'])

const canvasRef = ref(null)

const isMobile = window.innerWidth <= 768

const sceneState = reactive({
  waveAmp: 0.15,
  rotSpeed: 1.0,
  pSpeed: 0.015,
  ripple: 0,
  coreGlow: 0.4
})

const camBase = reactive({ x: 0, y: 0, z: 16 })
const targetX = ref(0)
const targetY = ref(0)

let scene, camera, renderer, clock
let blob, blobGeo, blobPos, blobOriginal, core, coreMat
let ringsGroup, particles, pGeo, pOff, pCount
let planes = []
let dirLight, mouseLight
let animFrameId = null
let loadedPlaneGeo = null
let gyroAvailable = false
let gyroTarget = { x: 0, y: 0 }
let frameCount = 0

function tweenColor(material, targetHexStr, duration) {
  const c = new THREE.Color(targetHexStr)
  gsap.to(material.color, { r: c.r, g: c.g, b: c.b, duration, ease: 'power2.inOut' })
}

function tweenEmissive(material, targetHexStr, duration) {
  const c = new THREE.Color(targetHexStr)
  gsap.to(material.emissive, { r: c.r, g: c.g, b: c.b, duration, ease: 'power2.inOut' })
}

function createPlaneInstance(color, scale) {
  const group = new THREE.Group()

  const mat = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.4,
    roughness: 0.3,
    transparent: true,
    opacity: 0.85,
    emissive: color,
    emissiveIntensity: 0.15
  })

  if (loadedPlaneGeo) {
    const mesh = new THREE.Mesh(loadedPlaneGeo, mat)
    mesh.rotation.y = Math.PI / 2
    group.add(mesh)
  }

  group.scale.setScalar(scale)
  return { group, material: mat }
}

function triggerRipple(isStrong = false) {
  const power = isStrong ? 1.5 : 0.6
  gsap.fromTo(sceneState, { ripple: power }, { ripple: 0, duration: 1.5, ease: 'elastic.out(1, 0.3)' })
  gsap.fromTo(coreMat, { emissiveIntensity: 2.0 }, { emissiveIntensity: sceneState.coreGlow, duration: 1.0, ease: 'power2.out' })
}

function animate() {
  animFrameId = requestAnimationFrame(animate)
  frameCount++

  // Skip every other frame on mobile for perf
  if (isMobile && frameCount % 2 !== 0) return

  const time = clock.getElapsedTime()

  // Deform blob
  const currentWave = sceneState.waveAmp + sceneState.ripple
  const v = new THREE.Vector3()
  for (let i = 0; i < blobPos.count; i++) {
    v.copy(blobOriginal[i])
    const w1 = Math.sin(v.x * 1.5 + time * 1.5) * currentWave
    const w2 = Math.cos(v.y * 1.5 + time * 1.2) * currentWave
    const w3 = Math.sin(v.z * 1.5 + time * 1.0) * currentWave
    v.normalize().multiplyScalar(3.5 + w1 + w2 + w3)
    blobPos.setXYZ(i, v.x, v.y, v.z)
  }
  blobPos.needsUpdate = true
  blobGeo.computeVertexNormals()

  // Rotate core elements
  blob.rotation.y += 0.003 * sceneState.rotSpeed
  blob.rotation.z += 0.002 * sceneState.rotSpeed
  core.rotation.x += 0.01 * sceneState.rotSpeed
  core.rotation.y += 0.01 * sceneState.rotSpeed
  ringsGroup.children.forEach((r, i) => {
    r.rotation.x += 0.001 * (i + 1) * sceneState.rotSpeed
    r.rotation.y += 0.002 * (i % 2 === 0 ? 1 : -1) * sceneState.rotSpeed
  })

  // Animate airplanes
  planes.forEach((p) => {
    const t = time * p.speed

    p.group.position.x = Math.sin(t + p.offset) * p.radiusX
    p.group.position.y = Math.cos(t * 0.7 + p.offset * 2) * p.radiusY + Math.sin(t * 1.3) * 1.0
    p.group.position.z = 2

    const futureT = t + 0.05
    const fx = Math.sin(futureT + p.offset) * p.radiusX
    const fy = Math.cos(futureT * 0.7 + p.offset * 2) * p.radiusY + Math.sin(futureT * 1.3) * 1.0

    const dx = fx - p.group.position.x
    const dy = fy - p.group.position.y

    p.group.rotation.y = -Math.atan2(dx, 1.5)
    p.group.rotation.x = dy * 0.15
    p.group.rotation.z = -dx * 0.25
  })

  // Particles
  const pos = pGeo.attributes.position.array
  for (let i = 0; i < pCount; i++) {
    const idx = i * 3
    pos[idx + 1] += sceneState.pSpeed
    pos[idx] += Math.sin(time + pOff[i]) * 0.01
    pos[idx + 2] += Math.cos(time + pOff[i]) * 0.01
    if (pos[idx + 1] > 10) pos[idx + 1] = -10
  }
  pGeo.attributes.position.needsUpdate = true

  // Camera
  const gyroInfluence = gyroAvailable ? 0.6 : 0
  const mouseInfluence = 1 - gyroInfluence
  const camTargetX = camBase.x + (targetX.value * 1.5 * mouseInfluence + gyroTarget.x * 3 * gyroInfluence)
  const camTargetY = camBase.y + (targetY.value * 1.5 * mouseInfluence + gyroTarget.y * 2 * gyroInfluence)
  camera.position.x += (camTargetX - camera.position.x) * 0.05
  camera.position.y += (camTargetY - camera.position.y) * 0.05
  camera.position.z += (camBase.z - camera.position.z) * 0.05
  camera.lookAt(0, 0, 0)

  renderer.render(scene, camera)
}

function onResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMouseMove(e) {
  targetX.value = (e.clientX / window.innerWidth) * 2 - 1
  targetY.value = -(e.clientY / window.innerHeight) * 2 + 1
  if (mouseLight) gsap.to(mouseLight.position, { x: targetX.value * 10, y: targetY.value * 10, duration: 1, ease: 'power2.out' })
}

function onMouseDown(e) {
  if (!e.target.closest('.cart-panel') && !e.target.closest('nav')) {
    triggerRipple()
  }
}

function onDeviceOrientation(e) {
  const beta = e.beta || 0
  const gamma = e.gamma || 0
  if (gamma === 0 && beta === 0) return
  gyroAvailable = true
  gyroTarget.x = Math.max(-1, Math.min(1, gamma / 45))
  gyroTarget.y = Math.max(-1, Math.min(1, (beta - 45) / 45))
}

function initGyro() {
  window.addEventListener('deviceorientation', onDeviceOrientation)
  setTimeout(() => {
    if (!gyroAvailable) {
      window.removeEventListener('deviceorientation', onDeviceOrientation)
    }
  }, 2000)
}

function openPage(pageId) {
  gsap.to(sceneState, { waveAmp: 0.6, rotSpeed: 6.0, pSpeed: 0.15, duration: 0.8, yoyo: true, repeat: 1, ease: 'power2.inOut' })

  let colors = []
  if (pageId === 'catalog') {
    colors = ['#ff6b35', '#ffd166', '#4ecdc4']
    gsap.to(camBase, { x: 6, y: 0, z: 20, duration: 2, ease: 'power3.inOut' })
  } else if (pageId === 'studio') {
    colors = ['#ff6b35', '#1a1a2e', '#4ecdc4']
    gsap.to(camBase, { x: 0, y: 0, z: 4.5, duration: 2.5, ease: 'power3.inOut' })
  } else if (pageId === 'delivery') {
    colors = ['#4ecdc4', '#ff6b35', '#ffd166']
    gsap.to(camBase, { x: 0, y: 0, z: 4.5, duration: 2.5, ease: 'power3.inOut' })
  }

  if (colors.length === 3) {
    planes.forEach((p, i) => {
      if (colors[i]) {
        tweenColor(p.material, colors[i], 2)
        tweenEmissive(p.material, colors[i], 2)
      }
    })
    tweenColor(dirLight, colors[0], 2)
  }
}

function closeAllPages() {
  gsap.to(sceneState, { waveAmp: 0.6, rotSpeed: 6.0, pSpeed: 0.15, duration: 0.8, yoyo: true, repeat: 1, ease: 'power2.inOut' })
  const defaults = ['#ff6b35', '#4ecdc4', '#ffd166']
  planes.forEach((p, i) => {
    tweenColor(p.material, defaults[i], 2)
    tweenEmissive(p.material, defaults[i], 2)
  })
  tweenColor(dirLight, '#ffffff', 2)
  gsap.to(camBase, { x: 0, y: 0, z: 16, duration: 2, ease: 'power3.inOut' })
}

watch(() => props.currentPage, (newPage, oldPage) => {
  if (newPage === oldPage) return
  if (newPage === 'main') {
    closeAllPages()
  } else {
    openPage(newPage)
  }
})

defineExpose({ triggerRipple })

onMounted(async () => {
  await nextTick()
  const canvas = canvasRef.value
  if (!canvas) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(camBase.x, camBase.y, camBase.z)

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: isMobile ? 'low-power' : 'high-performance'
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = isMobile ? 1.0 : 1.2

  clock = new THREE.Clock()

  // Adaptive quality levels
  const blobSeg = isMobile ? 64 : 128
  const coreSeg = isMobile ? 32 : 64
  const ringSeg = isMobile ? 16 : 32
  const ringTube = isMobile ? 0.04 : 0.03

  // Glass materials - use cheaper StandardMaterial on mobile
  let pureGlass, frostGlass
  if (isMobile) {
    pureGlass = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.05, roughness: 0.05,
      transparent: true, opacity: 0.35
    })
    frostGlass = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.1, roughness: 0.15,
      transparent: true, opacity: 0.3
    })
  } else {
    pureGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.05, roughness: 0.02,
      transmission: 1.0, ior: 1.52, thickness: 5.0,
      clearcoat: 1.0, clearcoatRoughness: 0.05
    })
    frostGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.1, roughness: 0.2,
      transmission: 0.8, ior: 1.4, thickness: 1.0
    })
  }

  // Core
  coreMat = isMobile
    ? new THREE.MeshStandardMaterial({
        color: 0xffe6f0, emissive: 0xffaa00,
        emissiveIntensity: sceneState.coreGlow
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xffe6f0, emissive: 0xffaa00,
        emissiveIntensity: sceneState.coreGlow,
        transmission: 0.9, roughness: 0.1
      })
  core = new THREE.Mesh(new THREE.SphereGeometry(1.2, coreSeg, coreSeg), coreMat)
  scene.add(core)

  // Blob
  blobGeo = new THREE.SphereGeometry(3.5, blobSeg, blobSeg)
  blobOriginal = []
  blobPos = blobGeo.attributes.position
  for (let i = 0; i < blobPos.count; i++) {
    const vec = new THREE.Vector3()
    vec.fromBufferAttribute(blobPos, i)
    blobOriginal.push(vec.clone())
  }
  blob = new THREE.Mesh(blobGeo, pureGlass)
  scene.add(blob)

  // Rings
  ringsGroup = new THREE.Group()
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5.0 + i * 0.8, ringTube, ringSeg, 64),
      frostGlass
    )
    ring.rotation.x = Math.random() * Math.PI
    ring.rotation.y = Math.random() * Math.PI
    ringsGroup.add(ring)
  }
  scene.add(ringsGroup)

  // Particles
  pCount = isMobile ? 300 : 800
  pGeo = new THREE.BufferGeometry()
  const pPosArr = new Float32Array(pCount * 3)
  pOff = new Float32Array(pCount)
  for (let i = 0; i < pCount; i++) {
    pPosArr[i * 3] = (Math.random() - 0.5) * 20
    pPosArr[i * 3 + 1] = (Math.random() - 0.5) * 20
    pPosArr[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5
    pOff[i] = Math.random() * Math.PI * 2
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPosArr, 3))
  pGeo.setAttribute('aOffset', new THREE.BufferAttribute(pOff, 1))
  particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: isMobile ? 0.1 : 0.08, color: 0xffffff, transparent: true,
    opacity: 0.6, blending: THREE.AdditiveBlending
  }))
  scene.add(particles)

  // Lights - fewer on mobile
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  dirLight = new THREE.DirectionalLight(0xffffff, 2)
  dirLight.position.set(5, 10, 7)
  scene.add(dirLight)
  if (!isMobile) {
    mouseLight = new THREE.PointLight(0xffffff, 1, 15)
    scene.add(mouseLight)
  }

  // Load plane model
  const loader = new GLTFLoader()

  loader.load('/models/plane.glb', (gltf) => {
    let sourceMesh = null
    gltf.scene.traverse((child) => {
      if (child.isMesh && !sourceMesh) {
        sourceMesh = child
      }
    })

    if (sourceMesh && sourceMesh.geometry) {
      loadedPlaneGeo = sourceMesh.geometry.clone()

      if (sourceMesh.matrixWorld) {
        loadedPlaneGeo.applyMatrix4(sourceMesh.matrixWorld)
      }

      loadedPlaneGeo.computeBoundingBox()
      const box = loadedPlaneGeo.boundingBox
      const center = new THREE.Vector3()
      box.getCenter(center)
      loadedPlaneGeo.translate(-center.x, -center.y, -center.z)
      const size = new THREE.Vector3()
      box.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z)
      const fitScale = 2.0 / maxDim
      loadedPlaneGeo.scale(fitScale, fitScale, fitScale)
    }

    const planeConfigs = [
      { color: 0xff6b35, scale: 1.2, speed: 0.15, radiusX: 9, radiusY: 5, offset: 0 },
      { color: 0x4ecdc4, scale: 0.9, speed: 0.22, radiusX: 11, radiusY: 4, offset: 2 },
      { color: 0xffd166, scale: 0.7, speed: 0.3,  radiusX: 7,  radiusY: 6, offset: 4 }
    ]

    planeConfigs.forEach(cfg => {
      const { group, material } = createPlaneInstance(cfg.color, cfg.scale)
      scene.add(group)
      planes.push({
        group,
        material,
        speed: cfg.speed,
        radiusX: cfg.radiusX,
        radiusY: cfg.radiusY,
        offset: cfg.offset
      })
    })

    planes.forEach((p, i) => {
      gsap.fromTo(p.group.scale, { x: 0, y: 0, z: 0 }, {
        x: 1, y: 1, z: 1, duration: 2,
        ease: 'back.out(1.5)', delay: 1.5 + i * 0.3
      })
    })

    emit('scene-ready')
  }, undefined, () => {
    emit('scene-ready')
  })

  window.addEventListener('resize', onResize)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mousedown', onMouseDown)

  initGyro()

  // Intro
  const tl = gsap.timeline()
  tl.fromTo(camBase, { z: 40 }, { z: 16, duration: 3, ease: 'power3.inOut' }, 0)
  ringsGroup.children.forEach((ring, index) => {
    gsap.fromTo(ring.scale, { x: 0, y: 0, z: 0 }, {
      x: 1, y: 1, z: 1, duration: 2.5,
      ease: 'power3.out', delay: index * 0.2
    })
  })

  animate()
})

onBeforeUnmount(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('deviceorientation', onDeviceOrientation)
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
