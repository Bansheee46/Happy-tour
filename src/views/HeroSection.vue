<template>
  <div id="page-main" :class="{ hidden: currentPage !== 'main' }">
    <div class="main-content">
      <h1
        class="hero-title parallax-elem magnetic interactive"
        data-speed="0.04"
        @click="$emit('ripple', true)"
      >
        <span>Авторские</span><span class="italic">Туры</span>
      </h1>
      <div class="product-card-hero parallax-elem interactive tilt-card" data-speed="-0.03">
        <div class="hero-card-image">
          <div class="hero-card-emoji">&#127796;</div>
          <span class="hero-badge">Тур дня</span>
        </div>
        <div class="hero-card-content">
          <div class="hero-card-top">
            <span class="hero-country">Индонезия</span>
            <span class="hero-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          </div>
          <h2 class="product-name" style="transform: translateZ(30px);">Бали, Индонезия</h2>
          <div class="hero-meta">
            <span>&#9201; 10 дней / 9 ночей</span>
            <span>&#127860; Все включено</span>
          </div>
          <p class="product-desc" style="font-size: 0.82rem; line-height: 1.5; color: rgba(26, 26, 46, 0.65); margin-bottom: 16px; transform: translateZ(20px);">
            Виллы среди рисовых полей, закаты на пляже Улувату и храмы Убуда.
          </p>
          <div class="product-footer" style="transform: translateZ(25px);">
            <div class="hero-pricing">
              <span class="hero-old-price">230 000 &#8381;</span>
              <span class="product-price">от 185 000 &#8381;</span>
            </div>
            <button
              class="btn magnetic interactive"
              @click.stop="addToCart({ id: 1, name: 'Бали, Индонезия', price: 185000, duration: '10 дней / 9 ночей', mealPlan: 'Все включено' })"
            >Забронировать</button>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-ui parallax-elem" data-speed="-0.03">
      <div class="fs-btn magnetic interactive" @click="toggleFullScreen">
        <div class="fs-icon"></div> Фулскрин
      </div>
      <a href="#" class="explore-btn magnetic interactive" @click.prevent="openPage('catalog')">Выбрать тур</a>
    </div>
  </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import { useStore } from '../store/cart.js'

const { currentPage, addToCart, openPage } = useStore()

defineEmits(['ripple'])

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen?.()
  }
}

onMounted(async () => {
  await nextTick()

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power2.out' })
    })
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
    })
  })

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

  document.addEventListener('mousemove', (e) => {
    if (currentPage.value !== 'main') return
    document.querySelectorAll('.parallax-elem').forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed'))
      el.style.transform = `translate(${(window.innerWidth - e.pageX * speed) / 100}px, ${(window.innerHeight - e.pageY * speed) / 100}px)`
    })
  })
})
</script>

<style scoped>
#page-main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  padding: 3vw 4vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
  transition: opacity 0.6s ease, transform 0.6s ease;
  opacity: 1;
}

#page-main.hidden {
  opacity: 0;
  pointer-events: none;
}

.main-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3.5rem, 9vw, 10rem);
  line-height: 0.85;
  letter-spacing: -0.02em;
  font-weight: 300;
  color: rgba(26, 26, 46, 0.95);
  text-shadow: 4px 4px 20px rgba(255, 255, 255, 0.9);
  pointer-events: auto;
}

.hero-title span {
  display: block;
  text-transform: uppercase;
}

.hero-title .italic {
  font-style: italic;
  padding-left: 5vw;
  letter-spacing: 0.02em;
  text-transform: none;
}

.product-card-hero {
  width: 380px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 40px 60px rgba(0, 0, 0, 0.04);
  pointer-events: auto;
  transform-style: preserve-3d;
  overflow: hidden;
}

.hero-card-image {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #e8f4f8 0%, #d1e8f0 50%, #c4dce8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-card-emoji {
  font-size: 4rem;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
  transition: transform 0.4s ease;
}

.product-card-hero:hover .hero-card-emoji {
  transform: scale(1.15) translateY(-4px);
}

.hero-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(255, 107, 53, 0.9);
  color: #fff;
}

.hero-card-content {
  padding: 22px 24px 20px;
}

.hero-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hero-country {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #ff6b35;
  font-weight: 600;
}

.hero-stars {
  color: #ffd166;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.product-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  line-height: 1;
  margin-bottom: 10px;
  font-style: italic;
}

.hero-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.72rem;
  color: rgba(26, 26, 46, 0.55);
}

.product-desc {
  font-size: 0.82rem;
  line-height: 1.55;
  color: rgba(26, 26, 46, 0.65);
  margin-bottom: 16px;
  flex-grow: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 16px;
}

.hero-pricing {
  display: flex;
  flex-direction: column;
}

.hero-old-price {
  font-size: 0.75rem;
  color: rgba(26, 26, 46, 0.3);
  text-decoration: line-through;
  line-height: 1;
  margin-bottom: 2px;
}

.product-price {
  font-size: 1.2rem;
  font-weight: 500;
  font-family: 'Cormorant Garamond', serif;
}

.btn {
  background: #1a1a2e;
  color: #fff;
  border: none;
  padding: 11px 22px;
  border-radius: 30px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn:hover {
  background: #ff6b35;
  box-shadow: 0 10px 20px rgba(255, 107, 53, 0.3);
}

.footer-ui {
  position: absolute;
  bottom: 3vw;
  left: 4vw;
  right: 4vw;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: none;
}

.fs-btn {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  pointer-events: auto;
  opacity: 0.5;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.fs-btn:hover {
  opacity: 1;
}

.fs-icon {
  width: 12px;
  height: 12px;
  border: 1px solid #1a1a2e;
  position: relative;
}

.explore-btn {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 1px solid rgba(26, 26, 46, 0.15);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.4rem;
  pointer-events: auto;
  transition: all 0.4s ease;
  color: #1a1a2e;
  text-decoration: none;
  text-align: center;
  line-height: 130px;
}

.explore-btn:hover {
  background: #1a1a2e;
  color: #fff;
  border-color: transparent;
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 768px) {
  #page-main {
    padding: 20px;
  }

  .main-content {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .hero-title {
    font-size: clamp(2.5rem, 12vw, 5rem);
    text-align: center;
  }

  .hero-title .italic {
    padding-left: 0;
  }

  .product-card-hero {
    width: 100%;
    max-width: 380px;
  }

  .footer-ui {
    bottom: 20px;
    left: 20px;
    right: 20px;
  }

  .fs-btn {
    display: none;
  }

  .explore-btn {
    display: none;
  }
}
</style>
