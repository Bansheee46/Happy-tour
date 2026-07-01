<template>
  <div class="cart-panel" :class="{ active: isCartOpen }">
    <div class="panel-header">
      <h3 class="panel-title">Ваши заявки</h3>
      <button class="cart-close magnetic interactive" @click="toggleCart()">✕</button>
    </div>
    <div class="cart-items">
      <template v-if="cart.length === 0">
        <p class="cart-empty">Добавьте тур в заявку</p>
      </template>
      <div
        v-for="(item, index) in cart"
        :key="index"
        class="cart-item"
      >
        <div class="cart-item-info">
          <h4>{{ item.name }}</h4>
          <p>{{ item.duration }}</p>
          <p class="cart-item-price">{{ item.price.toLocaleString('ru-RU') }} ₽</p>
          <button class="cart-item-remove interactive" @click="removeFromCart(index)">Удалить из заявки</button>
        </div>
      </div>
    </div>
    <div class="cart-footer">
      <div class="cart-total">
        <span>Итого:</span>
        <span class="cart-total-price">{{ cartTotal.toLocaleString('ru-RU') }} ₽</span>
      </div>
      <button class="btn checkout-btn magnetic interactive" @click="checkout()">Отправить заявку</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'
import { useStore } from '../store/cart.js'

const { cart, cartTotal, isCartOpen, toggleCart, removeFromCart, checkout } = useStore()

onMounted(() => {
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
})
</script>

<style scoped>
.cart-panel {
  position: fixed;
  top: 0;
  right: -100%;
  width: 480px;
  height: 100vh;
  background: rgba(15, 15, 20, 0.65);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  z-index: 2000;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding: 40px;
  display: flex;
  flex-direction: column;
  transition: right 0.7s cubic-bezier(0.77, 0, 0.175, 1);
  color: #fff;
  pointer-events: auto;
}

.cart-panel.active {
  right: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
}

.panel-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.2rem;
  font-style: italic;
}

.cart-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  transition: transform 0.3s, color 0.3s;
  padding: 10px;
}

.cart-close:hover {
  color: #ff6b35;
  transform: rotate(90deg);
}

.cart-items {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 15px;
}

.cart-empty {
  text-align: center;
  opacity: 0.3;
  font-style: italic;
  margin-top: 50px;
  font-size: 1.2rem;
}

.cart-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(-5px);
  border-color: rgba(255, 107, 53, 0.3);
}

.cart-item-info h4 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  margin-bottom: 5px;
  letter-spacing: 1px;
}

.cart-item-info p {
  font-size: 0.85rem;
  opacity: 0.6;
}

.cart-item-price {
  font-size: 1rem;
  margin-top: 8px;
  font-weight: 500;
}

.cart-item-remove {
  font-size: 0.7rem;
  color: #ff6b35;
  background: none;
  border: none;
  text-transform: uppercase;
  margin-top: 10px;
  font-weight: 500;
  letter-spacing: 1px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.cart-item-remove:hover {
  opacity: 1;
  text-decoration: underline;
}

.cart-footer {
  margin-top: 20px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  margin-bottom: 25px;
}

.cart-total-price {
  color: #ff6b35;
}

.btn {
  background: #1a1a2e;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 0.8rem;
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

.checkout-btn {
  width: 100%;
  padding: 20px;
  font-size: 1.1rem;
  background: #fff;
  color: #1a1a2e;
  font-weight: 500;
}

.checkout-btn:hover {
  background: #ff6b35;
  color: white;
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 768px) {
  .cart-panel {
    width: 100%;
    right: -100%;
    padding: 24px 20px;
  }

  .panel-title {
    font-size: 1.6rem;
  }

  .panel-header {
    margin-bottom: 24px;
  }

  .cart-item {
    padding: 16px;
  }

  .cart-item-info h4 {
    font-size: 1.2rem;
  }

  .cart-total {
    font-size: 1.5rem;
  }

  .checkout-btn {
    padding: 18px;
    font-size: 1rem;
  }
}
</style>
