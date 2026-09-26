const registerForm = document.getElementById('formulario-registro');
const loginForm = document.getElementById('formulario-login');
const messageElement = document.getElementById('mensaje');

const botonAccesoProtegido = document.getElementById('acceso-protegido');
const parrafoMensajeProtegido = document.getElementById('mensaje-protegido');

const API_URL = 'http://localhost:3000';

// Manejar el envío del formulario de registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    const res = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    messageElement.textContent = data.message || data.error;
    if (res.ok) {
        // Limpiar formulario y mostrar mensaje de éxito
        registerForm.reset();
    }
});

// Manejar el envío del formulario de login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('log-username').value;
    const password = document.getElementById('log-password').value;

    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    messageElement.textContent = data.message || data.error;
    if (res.ok) {
        // Si el login es exitoso, guardar el token (opcional)
        localStorage.setItem('token', data.token);
        loginForm.reset();
        // Redireccionar o mostrar contenido protegido
        alert('¡Login exitoso!');
    }
});


// Manejar el clic en el botón para acceder al recurso protegido
botonAccesoProtegido.addEventListener('click', async () => {
    // 1. Obtener el token almacenado en localStorage
    const token = localStorage.getItem('token');

    // 2. Si no hay token, el usuario no está logueado
    if (!token) {
        parrafoMensajeProtegido.textContent = 'Tu debes iniciar sesión para acceder a este recurso';
        parrafoMensajeProtegido.style.color = 'red';
        return;
    }

    // 3. Enviar la solicitud al endpoint protegido, incluyendo el token en el encabezado
    try {
        const res = await fetch(`${API_URL}/recurso-protegido`, {
            method: 'GET', // Ahora es un GET, ya que solo estamos pidiendo datos
            headers: {
                'Authorization': `Bearer ${token}` // OJO! se envía el token aquí
                // en el formato "Bearer TU_TOKEN"
            }
        });

        const data = await res.json();

        if (res.ok) {
            parrafoMensajeProtegido.textContent = data.message + ' ' + data.data;
            parrafoMensajeProtegido.style.color = 'green';
        } else {
            // Si el backend devuelve un error (ej. 401, 403)
            parrafoMensajeProtegido.textContent = data.error || 'Acceso fallido al recurso protegido';
            parrafoMensajeProtegido.style.color = 'red';
            // Si el token es inválido o expirado, quizás borrarlo y pedir relogin
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
            }
        }
    } catch (error) {
        console.error('Error al acceder al recurso protegido:', error);
        parrafoMensajeProtegido.textContent = 'Error de red o servidor no disponible';
        parrafoMensajeProtegido.style.color = 'red';
    }
});

//alternar entre registro e inicio de sesion
const divRegistro = document.getElementById('registro');
const divLogin = document.getElementById('login');
const enlaceIrARegistro = document.getElementById('ir-a-registro');
const enlaceIrALogin = document.getElementById('ir-a-login');

enlaceIrARegistro.addEventListener('click', (e) => {
    e.preventDefault();
    divLogin.classList.add('oculto');
    divRegistro.classList.remove('oculto');
    messageElement.textContent = ''; //para limpiar los mensajes anteriores
});

enlaceIrALogin.addEventListener('click', (e) => {
    e.preventDefault();
    divRegistro.classList.add('oculto');
    divLogin.classList.remove('oculto');
    messageElement.textContent = ''; //para limpiar los mensajes anteriores
});