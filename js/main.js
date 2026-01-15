console.log('✅ main.js cargó correctamente');

// ==============================
// 1. ESTADO (localStorage)
// ==============================
const STORAGE_KEY = 'alke_wallet_state_v1';

function getDefaultState() {
  return {
    activeAccount: 'corriente',
    balances: {
      corriente: { saldo: 1250000, fecha: '13 Sep 2024' },
      credito: { disponible: 680000, fecha: '13 Sep 2024' },
      ahorro: { saldo: 4500000, fecha: '13 Sep 2024' }
    },
    transactions: []
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : getDefaultState();
}

function saveState(stateObj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
}

// Inicialización de variables globales
let state = loadState();
let activeAccount = state.activeAccount;
// Importante: Referenciamos accountBalances directamente al estado
let accountBalances = state.balances; 

// ==============================
// 2. RENDERIZADO (Interfaz)
// ==============================
const heroAmountEl = document.getElementById('hero-amount');
const heroDateEl = document.getElementById('hero-date');
const accountCards = document.querySelectorAll('.account-card');

function formatCLP(amount) {
  return '$' + Number(amount).toLocaleString('es-CL');
}

function updateHero() {
  const data = accountBalances[activeAccount];
  if (!data || !heroAmountEl) return;

  const value = (activeAccount === 'credito') ? data.disponible : data.saldo;
  heroAmountEl.textContent = formatCLP(value);
  if (heroDateEl) heroDateEl.textContent = data.fecha;
}

function updateAccountCards() {
  accountCards.forEach((card) => {
    const accountType = card.dataset.account;
    const data = accountBalances[accountType];
    const amountEl = card.querySelector('[data-field="amount"]');
    
    if (data && amountEl) {
      const value = (accountType === 'credito') ? data.disponible : data.saldo;
      amountEl.textContent = formatCLP(value);
    }

    // Aprovechamos para marcar la tarjeta activa visualmente
    if (accountType === activeAccount) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// ==============================
// 3. EVENTOS DE TARJETAS
// ==============================
accountCards.forEach((card) => {
  card.addEventListener('click', () => {
    activeAccount = card.dataset.account;
    state.activeAccount = activeAccount; // Guardamos preferencia
    saveState(state);
    
    updateHero();
    updateAccountCards();
    console.log('Cuenta activa:', activeAccount);
  });
});

// ==============================
// 4. ENVÍO DE DINERO
// ==============================
const sendMoneyForm = document.querySelector('#sendMoneyForm');
if (sendMoneyForm) {
  sendMoneyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const origin = document.querySelector('#originAccount').value;
    const amount = Number(document.querySelector('#amount').value);
    const recipient = document.querySelector('#recipient').value.trim();
    const errorBox = document.querySelector('#sendMoneyError');
    const successBox = document.querySelector('#sendMoneySuccess');

    if (!recipient || amount <= 0) {
      errorBox.textContent = 'Datos inválidos';
      return;
    }

    if (state.balances[origin].saldo < amount) {
      errorBox.textContent = 'Saldo insuficiente';
      return;
    }

    state.balances[origin].saldo -= amount;
    state.transactions.unshift({
      tipo: 'Egreso',
      nombre: `Transferencia a ${recipient}`,
      monto: amount,
      fecha: new Date().toLocaleDateString('es-CL'),
      cuenta: origin
    });

    saveState(state);
    updateHero();
    updateAccountCards();
    successBox.textContent = '¡Transferencia exitosa!';
    sendMoneyForm.reset();
  });
}

// ==============================
// 5. DEPÓSITO / TRANSFERENCIA INTERNA
// ==============================
const depositForm = document.querySelector('#depositForm');
if (depositForm) {
  depositForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(document.querySelector('#depositAmount').value);
    const dest = document.querySelector('#depositAccount').value;
    const from = document.querySelector('#depositFrom').value;
    const errorBox = document.querySelector('#depositError');
    const successBox = document.querySelector('#depositSuccess');

    if (amount <= 0 || from === dest) {
      errorBox.textContent = 'Monto inválido o cuentas iguales';
      return;
    }

    const fromField = (from === 'credito') ? 'disponible' : 'saldo';
    const destField = (dest === 'credito') ? 'disponible' : 'saldo';

    if (state.balances[from][fromField] < amount) {
      errorBox.textContent = 'Saldo insuficiente en origen';
      return;
    }

    state.balances[from][fromField] -= amount;
    state.balances[dest][destField] += amount;

    saveState(state);
    updateHero();
    updateAccountCards();
    successBox.textContent = '¡Dinero movido con éxito!';
    depositForm.reset();
  });
}

// ==============================
// INICIO AUTOMÁTICO
// ==============================
updateHero();
updateAccountCards();