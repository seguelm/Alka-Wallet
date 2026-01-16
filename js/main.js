$(document).ready(function() {
    console.log("✅ Alke Wallet: Sistema iniciado y saldos recuperados.");

    // ==========================================
    // 1. FORZAR SALDOS INICIALES (Si están en 0 o vacíos)
    // ==========================================
    function inicializarSaldos() {
        const saldosBase = {
            corriente: { saldo: 1250000, fecha: '16 Ene 2026' },
            credito: { disponible: 680000, fecha: '16 Ene 2026' },
            ahorro: { saldo: 4500000, fecha: '16 Ene 2026' }
        };
        localStorage.setItem('alke_balances', JSON.stringify(saldosBase));
        return saldosBase;
    }

    // Intentar cargar de localStorage, si falla o está vacío, inicializar
    let dataGuardada = localStorage.getItem('alke_balances');
    let accountBalances = dataGuardada ? JSON.parse(dataGuardada) : inicializarSaldos();

    let activeAccount = 'corriente';

    // ==========================================
    // 2. ACTUALIZACIÓN DE LA INTERFAZ
    // ==========================================
    function updateUI() {
        const data = accountBalances[activeAccount];
        const displayValue = (activeAccount === 'credito') ? data.disponible : data.saldo;
        
        // Actualizar Hero (Monto grande)
        if ($('#hero-amount').length) {
            $('#hero-amount').text('$' + displayValue.toLocaleString('es-CL'));
        }
        
        // Actualizar tarjetas pequeñas
        $('.account-card').each(function() {
            const type = $(this).data('account');
            const info = accountBalances[type];
            if (info) {
                const val = (type === 'credito') ? info.disponible : info.saldo;
                $(this).find('[data-field="amount"]').text('$' + val.toLocaleString('es-CL'));
            }
        });
    }

    // ==========================================
    // 3. LÓGICA DE CONTACTOS (RUT INCLUIDO)
    // ==========================================
    function cargarContactos() {
        const $select = $('#recipient');
        if ($select.length) {
            const contactos = JSON.parse(localStorage.getItem('alke_contacts')) || [];
            $select.html('<option value="" disabled selected>Selecciona un contacto</option>');
            contactos.forEach(c => {
                $select.append(`<option value="${c.nombre}">${c.nombre} (${c.rut})</option>`);
            });
        }
    }

    $('#addContactForm').on('submit', function(e) {
        e.preventDefault();
        const nuevo = {
            nombre: $('#contactName').val(),
            rut: $('#contactRut').val(),
            banco: $('#contactBank').val()
        };

        let lista = JSON.parse(localStorage.getItem('alke_contacts')) || [];
        lista.push(nuevo);
        localStorage.setItem('alke_contacts', JSON.stringify(lista));

        // MOSTRAR MENSAJE DE ÉXITO
        $('#contactSuccess').removeClass('d-none').hide().fadeIn();
        
        setTimeout(() => {
            window.location.href = 'sendmoney.html';
        }, 2000);
    });

    // ==========================================
    // 4. OPERACIONES Y EVENTOS
    // ==========================================

    // Cambio de cuenta al hacer clic
    $('.account-card').on('click', function() {
        $('.account-card').removeClass('active');
        $(this).addClass('active');
        activeAccount = $(this).data('account');
        updateUI();
    });

    // Depósito
    $('#depositForm').on('submit', function(e) {
        e.preventDefault();
        const monto = parseInt($('#depositAmount').val());
        if (monto > 0) {
            if (activeAccount === 'credito') accountBalances.credito.disponible += monto;
            else accountBalances[activeAccount].saldo += monto;
            localStorage.setItem('alke_balances', JSON.stringify(accountBalances));
            updateUI();
            $('#depositSuccess').text(`+$${monto.toLocaleString()} añadidos.`).removeClass('d-none');
            this.reset();
        }
    });

    // Envío
    $('#sendMoneyForm').on('submit', function(e) {
        e.preventDefault();
        const monto = parseInt($('#amount').val());
        const dest = $('#recipient').val();
        const saldoAct = (activeAccount === 'credito') ? accountBalances.credito.disponible : accountBalances[activeAccount].saldo;

        if (monto > 0 && monto <= saldoAct && dest) {
            if (activeAccount === 'credito') accountBalances.credito.disponible -= monto;
            else accountBalances[activeAccount].saldo -= monto;
            localStorage.setItem('alke_balances', JSON.stringify(accountBalances));
            updateUI();
            $('#sendMoneySuccess').text(`Envío exitoso a ${dest}`).removeClass('d-none');
            this.reset();
        }
    });

    // Inicializar visualmente
    updateUI();
    cargarContactos();
});