<template>
  <nav id="main-nav" :class="{ 'menu-open': isMenuOpen }">
    <div class="logo magnetic interactive" @click="closeAllPages(); isMenuOpen = false">
      <span class="logo-happy">Happy</span><span class="logo-tour">Tour</span>
    </div>

    <button class="hamburger interactive" @click="toggleMenu" :class="{ active: isMenuOpen }">
      <span></span><span></span><span></span>
    </button>

    <div class="menu-links" :class="{ open: isMenuOpen }">
      <a
        v-for="link in links"
        :key="link.id"
        href="#"
        class="nav-link magnetic interactive"
        :class="{ active: currentPage === link.id }"
        @click.prevent="openPage(link.id); isMenuOpen = false"
      >{{ link.label }}</a>
      <a
        href="#"
        class="nav-link nav-close magnetic interactive"
        :class="{ active: currentPage !== 'main' }"
        @click.prevent="closeAllPages(); isMenuOpen = false"
      >✕ НАЗАД</a>
    </div>

    <div class="cart-btn magnetic interactive" @click="toggleCart(); isMenuOpen = false">
      Заявка <div class="cart-icon" ref="cartIconRef"><span>{{ cartCount }}</span></div>
    </div>
  </nav>

  <!-- Mobile Bottom Nav -->
  <nav class="bottom-nav" v-if="isMobile">
    <button
      v-for="item in bottomLinks"
      :key="item.id"
      class="bottom-nav-item"
      :class="{ active: currentPage === item.id || (item.id === 'main' && currentPage === 'main') }"
      @click="item.id === 'main' ? closeAllPages() : openPage(item.id)"
    >
      <div class="bottom-nav-icon" v-html="item.icon"></div>
      <span class="bottom-nav-label">{{ item.label }}</span>
      <div class="bottom-nav-indicator"></div>
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useStore } from '../store/cart.js'

const { currentPage, cartCount, openPage, closeAllPages, toggleCart } = useStore()
const isMenuOpen = ref(false)
const isMobile = ref(false)

const links = [
  { id: 'catalog', label: 'Туры' },
  { id: 'studio', label: 'О нас' },
  { id: 'delivery', label: 'Контакты' }
]

const bottomLinks = [
  {
    id: 'main',
    label: 'Главная',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>'
  },
  {
    id: 'catalog',
    label: 'Туры',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'
  },
  {
    id: 'studio',
    label: 'О нас',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>'
  },
  {
    id: 'delivery',
    label: 'Контакты',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  }
]

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  document.querySelectorAll('#main-nav .magnetic').forEach(btn => {
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
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
#main-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3vw 4vw;
  pointer-events: none;
  opacity: 0;
  transition: background 0.3s;
}

.logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  letter-spacing: 3px;
  font-weight: 600;
  text-transform: uppercase;
  pointer-events: auto;
  display: inline-block;
  padding: 10px;
  z-index: 1001;
}

.logo-happy {
  color: #1a1a2e;
}

.logo-tour {
  color: #ff6b35;
  font-style: italic;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 10px;
  pointer-events: auto;
  z-index: 1001;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: #1a1a2e;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.menu-links {
  display: flex;
  gap: 40px;
  margin-left: auto;
  margin-right: 50px;
  pointer-events: auto;
  align-items: center;
}

.nav-link {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  position: relative;
  font-weight: 500;
  color: #1a1a2e;
  text-decoration: none;
  transition: color 0.3s;
  padding: 10px;
  display: inline-block;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 10px;
  right: 10px;
  height: 1px;
  background: #ff6b35;
  transform: scaleX(0);
  transition: transform 0.4s ease;
  transform-origin: right;
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: scaleX(1);
  transform-origin: left;
}

.nav-close {
  color: #ff6b35;
  display: none;
  font-weight: 600;
}

.nav-close.active {
  display: inline-block;
  animation: fadeIn 0.5s ease forwards;
}

.cart-btn {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 500;
  transition: color 0.3s;
  padding: 10px;
}

.cart-icon {
  width: 22px;
  height: 22px;
  border: 1.5px solid #1a1a2e;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cart-btn:hover .cart-icon {
  border-color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* =========================================
   BOTTOM NAV
   ========================================= */

.bottom-nav {
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: calc(100% - 32px);
  max-width: 420px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  pointer-events: auto;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 10px 16px;
  color: rgba(26, 26, 46, 0.4);
  transition: color 0.3s ease;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  border-radius: 40px;
}

.bottom-nav-item.active {
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.08);
}

.bottom-nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bottom-nav-item.active .bottom-nav-icon {
  transform: scale(1.15) translateY(-2px);
}

.bottom-nav-label {
  font-size: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  font-family: 'Jost', sans-serif;
}

.bottom-nav-indicator {
  display: none;
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 768px) {
  #main-nav {
    padding: 16px 20px;
  }

  .hamburger {
    display: none;
  }

  .menu-links {
    display: none;
  }

  .cart-btn {
    font-size: 0.75rem;
    letter-spacing: 1px;
    padding: 8px;
  }

  .cart-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
