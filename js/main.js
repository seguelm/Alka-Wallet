console.log('✅ main.js cargó correctamente');

// ==============================
// DATOS: saldos por cuenta (según UI)
// ==============================
const accountBalances = {
  corriente: {
    saldo: 1250000,
    fecha: '13 Sep 2024'
  },
  credito: {
    disponible: 680000,
    fecha: '13 Sep 2024'
  },
  ahorro: {
    saldo: 4500000,
    fecha: '13 Sep 2024'
  }
};

// Cuenta activa por defecto
let activeAccount = 'corriente';

// ==============================
// HERO: elementos + actualización
// ==============================
const heroAmountEl = document.getElementById('hero-amount');
const heroDateEl = document.getElementById('hero-date');

// Formato simple CLP
function formatCLP(amount) {
  return '$' + Number(amount).toLocaleString('es-CL');
}

// Actualiza el HERO según activeAccount
function updateHero() {
  const data = accountBalances[activeAccount];
  if (!data) return;

  // En crédito mostramos "disponible"
  const value = (activeAccount === 'credito') ? data.disponible : data.saldo;

  // Si por alguna razón el HTML no tiene esos ids, evitamos romper
  if (heroAmountEl) heroAmountEl.textContent = formatCLP(value);
  if (heroDateEl) heroDateEl.textContent = data.fecha;
}
// ==============================
// Tarjetas: actualizar montos chicos
// ==============================
function updateAccountCards() {
  accountCards.forEach((card) => {
    const accountType = card.dataset.account;
    const data = accountBalances[accountType];
    if (!data) return;

    // Buscar el <p> del monto dentro de la tarjeta
    const amountEl = card.querySelector('[data-field="amount"]');
    if (!amountEl) return;

    // En crédito usamos "disponible"
    const value =
      accountType === 'credito'
        ? data.disponible
        : data.saldo;

    amountEl.textContent = formatCLP(value);
  });
}


// ==============================
// Tarjetas: selección de cuenta
// ==============================
const accountCards = document.querySelectorAll('.account-card');

accountCards.forEach((card) => {
  card.addEventListener('click', () => {
    // 1) Sacar active a todas
    accountCards.forEach((c) => c.classList.remove('active'));

    // 2) Poner active a la clickeada
    card.classList.add('active');

    // 3) Leer data-account del HTML (corriente/credito/ahorro)
    activeAccount = card.dataset.account;

    // 4) Actualizar el HERO con la cuenta activa
    updateHero();

    updateAccountCards();


    // Debug simple
    console.log('Cuenta activa:', activeAccount);
  });
});

// Al cargar la página, mostrar cuenta por defecto
updateHero();

// Al cargar la página, mostrar montos chicos de las tarjetas
updateAccountCards();

/* =========================
   LOGIN
   ========================= */

const loginForm = document.querySelector('#loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const errorBox = document.querySelector('#loginError');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Limpia mensaje anterior
    errorBox.textContent = '';

    // Validación básica
    if (email === '' || password === '') {
      errorBox.textContent = 'Debes ingresar email y contraseña';
      return;
    }

    // Simular login exitoso
    window.location.href = 'menu.html';
  });
}

   
/* =========================
   SEND MONEY
   ========================= */

const sendMoneyForm = document.querySelector('#sendMoneyForm');

if (sendMoneyForm) {
  sendMoneyForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Inputs
    const recipientInput = document.querySelector('#recipient');
    const amountInput = document.querySelector('#amount');

    // Mensajes
    const errorBox = document.querySelector('#sendMoneyError');
    const successBox = document.querySelector('#sendMoneySuccess');

    // Limpiar mensajes anteriores
    errorBox.textContent = '';
    successBox.textContent = '';

    const recipient = recipientInput.value.trim();
    const amount = amountInput.value.trim();

    // Validación básica
    if (recipient === '' || amount === '') {
      errorBox.textContent = 'Debes ingresar destinatario y monto';
      return;
    }

    // Simulación de envío exitoso
    successBox.textContent = 'Dinero enviado correctamente';

    // Limpiar formulario
    sendMoneyForm.reset();
  });
}



/* =========================
   DEPOSIT - Añadir dinero
   ========================= */

const depositForm = document.querySelector('#depositForm');

if (depositForm) {
  depositForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Input monto
    const amountInput = document.querySelector('#depositAmount');

    // Mensajes
    const errorBox = document.querySelector('#depositError');
    const successBox = document.querySelector('#depositSuccess');

    // Limpiar mensajes anteriores
    errorBox.textContent = '';
    successBox.textContent = '';

    const amount = amountInput.value.trim();

    // Validación básica
    if (amount === '' || Number(amount) <= 0) {
      errorBox.textContent = 'Debes ingresar un monto válido';
      return;
    }

    // Simulación de depósito exitoso
    successBox.textContent = 'Dinero añadido correctamente';

    // Limpiar formulario
    depositForm.reset();
  });
}
