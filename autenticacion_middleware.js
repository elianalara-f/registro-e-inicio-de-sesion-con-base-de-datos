const jwt = require('jsonwebtoken');

// Con este middleware se verificará la validez del JWT en las solicitudes
const authenticateToken = (req, res, next) => {
    // Se obtiene el token del HTTP header 'Authorization'
    // Los tokens se envía en el formato "Bearer <TOKEN_JWT>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae solo la parte del token

    // Con esto se verifica si existe token, en caso de que no haya, quiere decir que el usuario no está autenticado
    if (token == null) {
        return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    // Con jwt.verify() toma el token, la clave secreta y una función callback para manejar el resultado.
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // Si hay un error al verificar (token inválido, expirado, etc.)
        if (err) {
            console.error('JWT error de verificación:', err);
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }

        // Si el token es válido, la información del usuario se extrae y
        // se adjunta al objeto `req`. Esto hace que la información del usuario
        // esté disponible en la siguiente función de la ruta.
        req.user = user;
        next(); // Llama a la siguiente función middleware o al controlador de la ruta
    });
   
};

module.exports = authenticateToken;