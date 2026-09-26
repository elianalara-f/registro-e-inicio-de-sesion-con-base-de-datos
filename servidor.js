//cargar variables de entorno
require('dotenv').config();

//importar librerias
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const authenticateToken = require('./middleware/autenticacion_middleware');

// config. servidor y de la base de datos
const app = express();
app.use(express.json()); //permite al servidor llenar datos json
app.use(cors()); // permite solicitudes desde el frontend

//para q los archivos dentro de la carpeta public sean accesibles desde el navegador
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

//endpoint para el registro de usuarios
app.post('/registrar', async (req, res) => {
    try {
        const { username, password } = req.body;

        //validar q no falten datos
        if (!username || !password) {
            return res.status(400).json({ error: 'El nombre de usuario y contraseña son requeridos'});
        }

        //hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //insertar el nuevo usuario en supabase
        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ username, password: hashedPassword }]);

        if (error) {
            console.error('Error durante el registro:', error);
            return res.status(500).json({ error: 'El registro de usuario falló'});
        }

        res.status(201).json({ message: 'Usuario registrado correctamente'});   
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Error interno del servidor'});
    }
});


// endpoint para el login de usuarios
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        //1. buscar el usuario en la base de datos
        const { data: users, error } = await supabase
            .from('usuarios')
            .select('password')
            .eq('username', username)
            .single(); 

        if (error || !users) {
            return res.status(401).json({ error: 'Credenciales inválidas.'});
        }

        // 2. comparar la contraseña ingresada con la hasheada
        const isMatch = await bcrypt.compare(password, users.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.'});
        }

        // 3. Generar u token de autenticacion (jwt)
        const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h'});

        res.status(200).json({ message: 'Inicio de sesión exitoso!', token });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Error interno del servidor.'});
    }
});


// endpoint o ruta de ejemplo para un recurso protegido
//esta ruta solo será accesible si se proporciiona un jwt valido
app.get('/recurso-protegido', authenticateToken, (req, res) => {
    //si se llega a esta función, quiere decir q el middleware 'authenticateToken ya verificó el JWT y lo encontró válido
    //La info del usuario está disponible en `req.user`
    res.status(200).json({
        message: `Bienvenido al recurso protegido, ${req.user.username}!`,
        data: 'Esta información es sólo para usuarios autenticados'
    });
});
