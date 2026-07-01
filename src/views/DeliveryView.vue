<template>
  <div class="overlay-page" :class="{ active: currentPage === 'delivery' }">
    <div class="editorial-layout tilt-card">
      <div class="glass-panel">
        <h2 class="page-title split-text" ref="titleRef" style="text-align: left; transform: translateZ(40px); font-size: 3.5rem;">
          Контакты
        </h2>
        <p class="text-block text-anim-del">
          Свяжитесь с нами для <strong>индивидуального подбора тура</strong>.
          Наши эксперты помогут спланировать идеальное путешествие.
        </p>
        <p class="text-block text-anim-del">
          <strong>Телефон:</strong> +7 (999) 123-45-67<br>
          <strong>Email:</strong> hello@happytour.ru<br>
          <strong>Адрес:</strong> Москва, ул. Путешественников, 42
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import gsap from 'gsap'
import { useStore } from '../store/cart.js'

const { currentPage } = useStore()

const titleRef = ref(null)

function initTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    })
  })
}

function animateContent() {
  gsap.fromTo('.text-anim-del', { opacity: 0, z: -50 }, {
    opacity: 1, z: 30, duration: 1.5,
    stagger: 0.15, ease: 'power3.out', delay: 1.2
  })
}

function animateTitle() {
  if (!titleRef.value) return
  const chars = titleRef.value.querySelectorAll('.char')
  gsap.fromTo(chars, { opacity: 0, y: 50 }, {
    opacity: 1, y: 0, duration: 0.8,
    stagger: 0.02, ease: 'back.out(1.5)', delay: 0.8
  })
}

watch(() => currentPage.value, async (val) => {
  if (val === 'delivery') {
    await nextTick()
    animateTitle()
    animateContent()
  }
})

onMounted(() => {
  if (titleRef.value) {
    const text = titleRef.value.textContent
    titleRef.value.innerHTML = text.split('').map(char =>
      `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')
  }
  initTilt()
})
</script>

<style scoped>
.overlay-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 50;
  padding: 12vw 5vw 5vw 5vw;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease;
  overflow-y: auto;
  overflow-x: hidden;
}

.overlay-page.active {
  opacity: 1;
  pointer-events: auto;
}

.editorial-layout {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  perspective: 1000px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 60px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.05);
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

.page-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.5rem;
  margin-bottom: 50px;
  font-style: italic;
  overflow: hidden;
}

.text-block {
  font-size: 1.3rem;
  line-height: 1.8;
  margin-bottom: 30px;
  opacity: 0;
  font-weight: 300;
  transform: translateZ(30px);
}

.text-block strong {
  font-weight: 500;
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 768px) {
  .overlay-page {
    padding: 80px 16px 40px 16px;
  }

  .glass-panel {
    padding: 30px 24px;
    border-radius: 20px;
  }

  .page-title {
    font-size: 2.2rem;
    margin-bottom: 30px;
  }

  .text-block {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 20px;
  }
}
</style>
