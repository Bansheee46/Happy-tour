<template>
  <div id="app">
    <div class="noise-overlay"></div>
    <div class="cursor-dot" ref="cursorDot"></div>
    <div class="cursor-outline" ref="cursorOutline"></div>

    <div id="loader" ref="loader">
      <div class="loader-text">Подготовка путешествия...</div>
      <div class="loader-line"></div>
    </div>
    <div id="toast"></div>

    <ThreeCanvas
      ref="threeCanvasRef"
      :currentPage="currentPage"
      @scene-ready="onSceneReady"
    />

    <div class="vignette" :class="{ active: currentPage !== 'main' }"></div>

    <Navigation />

    <HeroSection @ripple="handleRipple" />

    <CatalogView />

    <StudioView />

    <DeliveryView />

    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { useStore, setRippleCallback } from './store/cart.js'
import ThreeCanvas from './components/ThreeCanvas.vue'
import Navigation from './components/Navigation.vue'
import HeroSection from './views/HeroSection.vue'
import CatalogView from './views/CatalogView.vue'
import StudioView from './views/StudioView.vue'
import DeliveryView from './views/DeliveryView.vue'
import CartDrawer from './components/CartDrawer.vue'

const { currentPage } = useStore()

const threeCanvasRef = ref(null)
const cursorDot = ref(null)
const cursorOutline = ref(null)
const loader = ref(null)

function handleRipple(strong) {
  threeCanvasRef.value?.triggerRipple(strong)
}

setRippleCallback((strong) => {
  threeCanvasRef.value?.triggerRipple(strong)
})

function onSceneReady() {
  setTimeout(() => {
    if (loader.value) {
      loader.value.style.opacity = '0'
      setTimeout(() => { loader.value.style.display = 'none' }, 1500)
    }

    const tl = gsap.timeline()
    tl.to('#main-nav', { opacity: 1, duration: 1, ease: 'power2.out' }, '-=1.5')
    tl.to('.hero-title', { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }, '-=1.0')
    tl.fromTo('.product-card-hero', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, '-=1.0')
    tl.to('.footer-ui', { opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.5')
  }, 2000)
}

onMounted(() => {
  document.addEventListener('contextmenu', e => e.preventDefault())

  document.addEventListener('mousemove', (e) => {
    if (cursorDot.value) {
      cursorDot.value.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
    if (cursorOutline.value) {
      cursorOutline.value.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
  })

  const interactClasses = ['interactive', 'magnetic']
  document.body.addEventListener('mouseenter', (e) => {
    if (interactClasses.some(c => e.target.classList?.contains(c))) {
      document.body.classList.add('cursor-hover')
    }
  }, true)
  document.body.addEventListener('mouseleave', (e) => {
    if (interactClasses.some(c => e.target.classList?.contains(c))) {
      document.body.classList.remove('cursor-hover')
    }
  }, true)
})
</script>

<style>
@import './assets/main.css';

#app {
  width: 100%;
  height: 100%;
  position: relative;
}

.vignette {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 0%, rgba(240, 244, 248, 0.6) 100%);
  opacity: 0;
  transition: opacity 1s ease;
}

.vignette.active {
  opacity: 1;
}

@media (max-width: 768px) {
  .cursor-dot,
  .cursor-outline {
    display: none !important;
  }
}
</style>
