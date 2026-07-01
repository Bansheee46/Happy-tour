import { reactive, computed } from 'vue'
import gsap from 'gsap'

let rippleCallback = null

export function setRippleCallback(fn) {
  rippleCallback = fn
}

function fireRipple(strong = false) {
  if (rippleCallback) rippleCallback(strong)
}

export const catalogData = [
  {
    id: 2,
    name: 'Бали, Индонезия',
    country: 'Индонезия',
    price: 185000,
    oldPrice: 230000,
    desc: 'Виллы среди рисовых полей, закаты на пляже Улувату и храмы Убуда.',
    duration: '10 дней / 9 ночей',
    hotelStars: 5,
    mealPlan: 'Все включено',
    departure: 'Москва',
    dates: 'Июль — Август 2026',
    badge: 'Хит продаж',
    emoji: '\u{1F334}'
  },
  {
    id: 3,
    name: 'Санторини, Греция',
    country: 'Греция',
    price: 220000,
    oldPrice: 275000,
    desc: 'Белоснежные домики и голубые купола. Вино, море и невероятные закаты.',
    duration: '7 дней / 6 ночей',
    hotelStars: 4,
    mealPlan: 'Завтраки',
    departure: 'Москва',
    dates: 'Июнь — Сентябрь 2026',
    badge: 'Горящий тур',
    emoji: '\u{1F3DD}\uFE0F'
  },
  {
    id: 4,
    name: 'Каппадокия, Турция',
    country: 'Турция',
    price: 145000,
    oldPrice: 180000,
    desc: 'Полёт на воздушном шаре над красными скалами и подземные города.',
    duration: '5 дней / 4 ночи',
    hotelStars: 4,
    mealPlan: 'Завтраки и ужины',
    departure: 'Москва',
    dates: 'Апрель — Октябрь 2026',
    badge: 'Рекомендуем',
    emoji: '\u{1F3E5}'
  },
  {
    id: 5,
    name: 'Исландия',
    country: 'Исландия',
    price: 290000,
    oldPrice: 350000,
    desc: 'Северное сияние, гейзеры, ледники и водопады.',
    duration: '8 дней / 7 ночей',
    hotelStars: 3,
    mealPlan: 'Завтраки',
    departure: 'Москва',
    dates: 'Ноябрь — Март 2026',
    badge: 'Авторский тур',
    emoji: '\u2744\uFE0F'
  },
  {
    id: 6,
    name: 'Мальдивы',
    country: 'Мальдивы',
    price: 320000,
    oldPrice: 400000,
    desc: 'Бунгало над водой, кристально чистое море и коралловые рифы.',
    duration: '7 дней / 6 ночей',
    hotelStars: 5,
    mealPlan: 'Все включено',
    departure: 'Москва',
    dates: 'Круглый год',
    badge: 'Премиум',
    emoji: '\u{1F30A}'
  },
  {
    id: 7,
    name: 'Вьетнам',
    country: 'Вьетнам',
    price: 165000,
    oldPrice: 200000,
    desc: 'Залив Халонг, рисовые террасы и уличная еда Хошимина.',
    duration: '12 дней / 11 ночей',
    hotelStars: 4,
    mealPlan: 'Завтраки и ужины',
    departure: 'Москва',
    dates: 'Октябрь — Апрель 2026',
    badge: 'Выгодно',
    emoji: '\u{1F3F0}'
  },
  {
    id: 8,
    name: 'Куба',
    country: 'Куба',
    price: 195000,
    oldPrice: 240000,
    desc: 'Классические автомобили, сальса, ром и пляжи Варадеро.',
    duration: '10 дней / 9 ночей',
    hotelStars: 4,
    mealPlan: 'Все включено',
    departure: 'Москва',
    dates: 'Ноябрь — Апрель 2026',
    badge: 'Горящий тур',
    emoji: '\u{1F334}'
  },
  {
    id: 9,
    name: 'ОАЭ, Дубай',
    country: 'ОАЭ',
    price: 175000,
    oldPrice: 220000,
    desc: 'Небоскрёбы, пустыня, шопинг и роскошные отели.',
    duration: '7 дней / 6 ночей',
    hotelStars: 5,
    mealPlan: 'Завтраки',
    departure: 'Москва',
    dates: 'Круглый год',
    badge: 'Популярный',
    emoji: '\u{1F3D9}\uFE0F'
  }
]

const state = reactive({
  currentPage: 'main',
  cart: [],
  isCartOpen: false
})

export function useStore() {
  const cartTotal = computed(() =>
    state.cart.reduce((sum, item) => sum + item.price, 0)
  )

  const cartCount = computed(() => state.cart.length)

  function openPage(pageId) {
    if (state.currentPage === pageId) return
    state.currentPage = pageId
  }

  function closeAllPages() {
    state.currentPage = 'main'
  }

  function addToCart(product) {
    state.cart.push(product)
    fireRipple(true)
    showToast(`«${product.name}» добавлен в заявку!`)
  }

  function removeFromCart(index) {
    state.cart.splice(index, 1)
    fireRipple()
  }

  function toggleCart() {
    state.isCartOpen = !state.isCartOpen
    fireRipple()
  }

  function checkout() {
    if (state.cart.length === 0) {
      showToast('Добавьте тур в заявку!')
      return
    }
    state.cart = []
    state.isCartOpen = false
    showToast('Заявка отправлена! Мы свяжемся с вами.', 4000)
    fireRipple(true)
  }

  let toastTimeout = null
  function showToast(msg, duration = 2000) {
    const toast = document.getElementById('toast')
    if (!toast) return
    toast.textContent = msg
    toast.classList.add('show')
    clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => toast.classList.remove('show'), duration)
  }

  return {
    currentPage: computed(() => state.currentPage),
    cart: state.cart,
    cartTotal,
    cartCount,
    isCartOpen: computed(() => state.isCartOpen),
    openPage,
    closeAllPages,
    addToCart,
    removeFromCart,
    toggleCart,
    checkout
  }
}
