<template>
  <div class="overlay-page" :class="{ active: currentPage === 'catalog' }">
    <div class="catalog-inner">
      <h2 class="page-title split-text" ref="titleRef">Каталог Туров</h2>

      <div class="catalog-grid">
        <div
          v-for="(item, index) in catalogData"
          :key="item.id"
          class="tour-card interactive card-anim tilt-card"
          :style="{ transitionDelay: `${index * 0.08}s` }"
        >
          <div class="tour-card-image">
            <div class="tour-card-emoji">{{ item.emoji }}</div>
            <span class="tour-badge" :class="badgeClass(item.badge)">{{ item.badge }}</span>
          </div>

          <div class="tour-card-body">
            <div class="tour-card-top">
              <div class="tour-country">{{ item.country }}</div>
              <div class="tour-hotel-stars">
                <span v-for="s in item.hotelStars" :key="s" class="star">&#9733;</span>
              </div>
            </div>

            <h3 class="tour-name">{{ item.name }}</h3>

            <p class="tour-desc">{{ item.desc }}</p>

            <div class="tour-meta">
              <div class="meta-item">
                <span class="meta-icon">&#9201;</span>
                <span>{{ item.duration }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">&#127860;</span>
                <span>{{ item.mealPlan }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">&#9992;</span>
                <span>из {{ item.departure }}</span>
              </div>
            </div>

            <div class="tour-dates">{{ item.dates }}</div>
          </div>

          <div class="tour-card-footer">
            <div class="tour-pricing">
              <div class="tour-old-price" v-if="item.oldPrice">{{ item.oldPrice.toLocaleString('ru-RU') }} &#8381;</div>
              <div class="tour-price">от {{ item.price.toLocaleString('ru-RU') }} &#8381;</div>
              <div class="tour-per-person">на человека</div>
            </div>
            <button class="btn magnetic interactive" @click.stop="addToCart(item)">Забронировать</button>
          </div>

          <button class="quick-order-btn magnetic interactive" @click.stop="openQuickOrder(item)">
            Быстрая заявка в 1 клик
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="modal">
        <div v-if="quickOrderItem" class="quick-order-overlay" @click.self="closeQuickOrder">
          <div class="quick-order-modal">
            <button class="quick-order-close" @click="closeQuickOrder">&#10005;</button>
            <h3 class="quick-order-title">Быстрая заявка</h3>
            <p class="quick-order-product">{{ quickOrderItem.name }}</p>
            <p class="quick-order-detail">{{ quickOrderItem.duration }} &middot; {{ quickOrderItem.mealPlan }}</p>
            <p class="quick-order-price">от {{ quickOrderItem.price.toLocaleString('ru-RU') }} &#8381;</p>
            <form class="quick-order-form" @submit.prevent="submitQuickOrder">
              <input
                v-model="phone"
                type="tel"
                class="quick-order-input"
                placeholder="+7 (___) ___-__-__"
                required
              />
              <button type="submit" class="btn quick-order-submit">Отправить заявку</button>
            </form>
            <p v-if="orderSent" class="quick-order-success">Заявка отправлена! Мы перезвоним вам в ближайшее время.</p>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import gsap from 'gsap'
import { useStore, catalogData } from '../store/cart.js'

const { currentPage, addToCart } = useStore()

const titleRef = ref(null)
const quickOrderItem = ref(null)
const phone = ref('')
const orderSent = ref(false)

function badgeClass(badge) {
  if (badge === 'Горящий тур') return 'badge-hot'
  if (badge === 'Премиум') return 'badge-premium'
  if (badge === 'Хит продаж') return 'badge-hit'
  return 'badge-default'
}

function openQuickOrder(item) {
  quickOrderItem.value = item
  phone.value = ''
  orderSent.value = false
}

function closeQuickOrder() {
  quickOrderItem.value = null
}

function submitQuickOrder() {
  orderSent.value = true
  setTimeout(() => {
    closeQuickOrder()
  }, 2500)
}

function initTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -4
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 4
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    })
  })
}

function initMagnetic() {
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
}

function animateTitle() {
  if (!titleRef.value) return
  const chars = titleRef.value.querySelectorAll('.char')
  gsap.fromTo(chars, { opacity: 0, y: 50 }, {
    opacity: 1, y: 0, duration: 0.8,
    stagger: 0.02, ease: 'back.out(1.5)', delay: 0.3
  })
}

function animateCards() {
  gsap.fromTo('.card-anim', { opacity: 0, y: 100 }, {
    opacity: 1, y: 0, duration: 1,
    stagger: 0.08, ease: 'back.out(1.2)', delay: 0.5
  })
}

watch(() => currentPage.value, async (val) => {
  if (val === 'catalog') {
    await nextTick()
    initTilt()
    initMagnetic()
    animateTitle()
    animateCards()
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
  initMagnetic()
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
  padding: 10vw 4vw 5vw 4vw;
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

.catalog-inner {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.page-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 4rem;
  margin-bottom: 50px;
  font-style: italic;
  overflow: hidden;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 30px;
  padding-bottom: 100px;
  width: 100%;
}

.tour-card {
  position: relative;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(50px);
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out, box-shadow 0.3s ease;
  overflow: hidden;
}

.tour-card:hover {
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
}

.tour-card-image {
  position: relative;
  height: 180px;
  background: linear-gradient(135deg, #e8f4f8 0%, #d1e8f0 50%, #c4dce8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tour-card-emoji {
  font-size: 4.5rem;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
  transition: transform 0.4s ease;
}

.tour-card:hover .tour-card-emoji {
  transform: scale(1.15) translateY(-4px);
}

.tour-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.badge-hot { background: rgba(255, 68, 68, 0.9); color: #fff; }
.badge-premium { background: rgba(26, 26, 46, 0.85); color: #ffd166; }
.badge-hit { background: rgba(255, 107, 53, 0.9); color: #fff; }
.badge-default { background: rgba(78, 205, 196, 0.85); color: #fff; }

.tour-card-body {
  padding: 24px 24px 16px 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.tour-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tour-country {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #ff6b35;
  font-weight: 600;
}

.tour-hotel-stars { display: flex; gap: 2px; }
.star { color: #ffd166; font-size: 0.8rem; }

.tour-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.6rem;
  line-height: 1.15;
  margin-bottom: 10px;
  font-style: italic;
  color: #1a1a2e;
}

.tour-desc {
  font-size: 0.8rem;
  line-height: 1.55;
  color: rgba(26, 26, 46, 0.65);
  margin-bottom: 16px;
  flex-grow: 1;
}

.tour-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: rgba(26, 26, 46, 0.7);
}

.meta-icon { font-size: 0.85rem; width: 20px; text-align: center; }

.tour-dates {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(26, 26, 46, 0.45);
  padding-top: 10px;
  border-top: 1px solid rgba(26, 26, 46, 0.08);
}

.tour-card-footer {
  padding: 16px 24px 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(26, 26, 46, 0.06);
}

.tour-pricing { display: flex; flex-direction: column; }

.tour-old-price {
  font-size: 0.78rem;
  color: rgba(26, 26, 46, 0.35);
  text-decoration: line-through;
  line-height: 1;
  margin-bottom: 2px;
}

.tour-price {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.1;
}

.tour-per-person {
  font-size: 0.62rem;
  color: rgba(26, 26, 46, 0.4);
  margin-top: 2px;
}

.btn {
  background: #1a1a2e;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn:hover {
  background: #ff6b35;
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
}

.quick-order-btn {
  background: none;
  border: none;
  border-top: 1px solid rgba(26, 26, 46, 0.06);
  color: #ff6b35;
  padding: 14px 24px;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.quick-order-btn:hover {
  background: rgba(255, 107, 53, 0.06);
}

/* Quick Order Modal */
.quick-order-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 9000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.quick-order-modal {
  background: #fff;
  border-radius: 24px;
  padding: 45px;
  max-width: 420px;
  width: 90%;
  position: relative;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.15);
}

.quick-order-close {
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #1a1a2e;
  transition: color 0.3s, transform 0.3s;
  padding: 5px;
}

.quick-order-close:hover {
  color: #ff6b35;
  transform: rotate(90deg);
}

.quick-order-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  font-style: italic;
  margin-bottom: 8px;
}

.quick-order-product { font-size: 1.05rem; font-weight: 500; color: #1a1a2e; margin-bottom: 4px; }
.quick-order-detail { font-size: 0.85rem; color: rgba(26, 26, 46, 0.5); margin-bottom: 4px; }

.quick-order-price {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  color: #ff6b35;
  margin-bottom: 24px;
}

.quick-order-form { display: flex; flex-direction: column; gap: 14px; }

.quick-order-input {
  width: 100%;
  padding: 15px 18px;
  border: 1px solid rgba(26, 26, 46, 0.12);
  border-radius: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.3s;
}

.quick-order-input:focus { border-color: #ff6b35; }

.quick-order-submit { width: 100%; padding: 15px; font-size: 0.85rem; }

.quick-order-success {
  text-align: center;
  color: #2ecc71;
  font-size: 0.85rem;
  margin-top: 14px;
  font-style: italic;
}

.modal-enter-active { transition: opacity 0.3s ease; }
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .quick-order-modal { transition: transform 0.3s ease; }
.modal-enter-from .quick-order-modal { transform: scale(0.95) translateY(10px); }

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 768px) {
  .overlay-page {
    padding: 80px 16px 40px 16px;
  }

  .page-title {
    font-size: 2.5rem;
    margin-bottom: 30px;
  }

  .catalog-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .tour-card {
    border-radius: 16px;
  }

  .tour-card-image {
    height: 140px;
  }

  .tour-card-emoji {
    font-size: 3.5rem;
  }

  .tour-card-body {
    padding: 18px 18px 12px 18px;
  }

  .tour-name {
    font-size: 1.3rem;
  }

  .tour-desc {
    font-size: 0.75rem;
  }

  .tour-card-footer {
    padding: 12px 18px 16px 18px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .tour-price {
    font-size: 1.3rem;
  }

  .btn {
    width: 100%;
    padding: 14px;
    text-align: center;
  }

  .quick-order-modal {
    padding: 30px 24px;
    border-radius: 20px;
  }

  .quick-order-title {
    font-size: 1.5rem;
  }
}
</style>
