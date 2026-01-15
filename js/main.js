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
    transactions: [],
    contacts: [] 
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : getDefaultState();
}

function saveState(stateObj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
}

// Inicialización de variables
let state = loadState();
let activeAccount = state.activeAccount;
let accountBalances = state.balances;

// ==============================
// 2. RENDERIZADO Y FORMATEO
// ==============================
function formatCLP(amount) {
  return '$' + Number(amount).toLocaleString('es-CL');
}

function updateHero() {
  const heroAmountEl = document.getElementById('hero-amount');
  const heroDateEl = document.getElementById('hero-date');
  const data = accountBalances[activeAccount];
  
  if (!data || !heroAmountEl) return;

  const value = (activeAccount === 'credito') ? data.disponible : data.saldo;
  heroAmountEl.textContent = formatCLP(value);
  if (heroDateEl) heroDateEl.textContent = data.fecha;
}
// Esto mostrará en el formulario el nombre de la cuenta activa
const originLabel = document.getElementById('selected-account-label');
if (originLabel) {
  originLabel.textContent = `Enviando desde: Cuenta ${activeAccount}`;
}

function updateAccountCards() {
  const accountCards = document.querySelectorAll('.account-card');
  accountCards.forEach((card) => {
    const accountType = card.dataset.account;
    const data = accountBalances[accountType];
    const amountEl = card.querySelector('[data-field="amount"]');
    
    if (data && amountEl) {
      const value = (accountType === 'credito') ? data.disponible : data.saldo;
      amountEl.textContent = formatCLP(value);
    }

    if (accountType === activeAccount) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

function updateRecipientList() {
  const recipientSelect = document.getElementById('recipient'); 
  if (!recipientSelect) return;

  recipientSelect.innerHTML = '<option value="" disabled selected>Selecciona un destinatario</option>';

  const contacts = state.contacts || [];
  contacts.forEach(contact => {
    const option = document.createElement('option');
    option.value = contact.nombre; 
    option.textContent = `${contact.nombre} - ${contact.banco}`;
    recipientSelect.appendChild(option);
  });
}

// ==============================
// 3. EVENTOS DE TARJETAS (Menú)
// ==============================
const accountCards = document.querySelectorAll('.account-card');
accountCards.forEach((card) => {
  card.addEventListener('click', () => {
    activeAccount = card.dataset.account;
    state.activeAccount = activeAccount; 
    saveState(state);
    updateHero();
    updateAccountCards();
  });
});

// ==============================
// 4. ENVÍO DE DINERO (Dinámico por cuenta)
// ==============================
const sendMoneyForm = document.querySelector('#sendMoneyForm');
if (sendMoneyForm) {
  sendMoneyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(document.querySelector('#amount').value);
    const recipient = document.querySelector('#recipient').value;
    const errorBox = document.querySelector('#sendMoneyError');
    const successBox = document.querySelector('#sendMoneySuccess');

    // 1. Identificar de qué campo restar según la cuenta activa
    // Si es crédito, el campo se llama 'disponible', si no, se llama 'saldo'
    const field = (activeAccount === 'credito') ? 'disponible' : 'saldo';
    const currentBalance = state.balances[activeAccount][field];

    if (!recipient || amount <= 0) {
      errorBox.textContent = 'Por favor, ingresa un monto válido.';
      return;
    }

    // 2. Verificar si hay dinero en la cuenta seleccionada
    if (currentBalance < amount) {
      errorBox.textContent = `Saldo insuficiente en tu cuenta ${activeAccount}.`;
      successBox.textContent = '';
      return;
    }

    // 3. Restar el dinero de la cuenta activa
    state.balances[activeAccount][field] -= amount;

    // 4. Registrar la transacción
    state.transactions.unshift({
      tipo: 'Egreso',
      nombre: `Transferencia a ${recipient}`,
      monto: amount,
      fecha: new Date().toLocaleDateString('es-CL'),
      cuenta: activeAccount // Guardamos de qué cuenta salió
    });

    // 5. Guardar y Actualizar Interfaz
    saveState(state);
    updateHero();
    updateAccountCards();
    
    successBox.textContent = '¡Transferencia exitosa!';
    errorBox.textContent = '';
    sendMoneyForm.reset();
  });
}

// ==============================
// LÓGICA DE AGREGAR CONTACTO
// ==============================
const addContactForm = document.getElementById('addContactForm');

if (addContactForm) {
  addContactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newContact = {
      nombre: document.getElementById('contactName').value,
      rut: document.getElementById('contactRut').value,
      banco: document.getElementById('contactBank').value
    };

    if (!state.contacts) state.contacts = [];
    state.contacts.push(newContact);
    
    // 1. Guardamos los datos
    saveState(state); 
    
    // 2. Mostramos el mensaje que pediste
    alert('Contacto agregado exitosamente');
    
    // 3. Redirigimos automáticamente a la página de transferencia 
    // para que el usuario pueda usar su nuevo contacto de inmediato
    window.location.href = 'enviar-dinero.html';
  });
}

// ==============================
// 6. DEPÓSITO / TRANSF. INTERNA
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
// 7. EJECUCIÓN INICIAL
// ==============================
updateHero();
updateAccountCards();
updateRecipientList();