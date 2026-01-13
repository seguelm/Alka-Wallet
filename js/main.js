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

