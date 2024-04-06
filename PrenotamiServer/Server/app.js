var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

var app = express();

const SECRET_KEY = 'Me0JA6n6f0WMszdpvzcLVnOsvSDdQTDBgQZqar1UWGre8EtKamzIK3zZnUKogi/qCiJfzjljugfekWy/6/krTA=='; // Usa una clave secreta compleja en producción

app.use(cors());
app.use(bodyParser.json());



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const dbConfig = {
    host: "localhost",
    user: "root",
    password: "Zaragoza2525", // Deberías mover esto a variables de entorno
    database: "PrenotamiBot",
    };

    var db;

    function handleDisconnect() {
    db = mysql.createConnection(dbConfig); // Crea una nueva conexión

    db.connect(err => {
        if (err) {
        console.error('Error al conectar a la base de datos:', err);
        setTimeout(handleDisconnect, 2000); // Espera 2 segundos antes de intentar reconectar
        } else {
        console.log("Conectado a la base de datos");
        }
    });

    db.on('error', err => {
        console.error('Error de base de datos:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        handleDisconnect(); // Vuelve a conectar si se pierde la conexión
        } else {
            
            handleDisconnect();
            
        
        }
    });
    }

    handleDisconnect();



app.use('/', indexRouter);
app.use('/users', usersRouter);

// Importa la función de tu script de Selenium
const verificarDisponibilidadCitas = require('./routes/citas.js');
const botTelegramPrueba = require('./routes/registroUSRtelegram.js')


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Consulta para buscar el usuario en la base de datos
    db.query('SELECT * FROM UsuarioAdministrativo WHERE Usuario = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error al consultar la base de datos" });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }

        const user = results[0];

        // Compara la contraseña con la almacenada en la base de datos
        bcrypt.compare(password, user.Contrasenia, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Error al verificar la contraseña" });
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
            }

            // Genera el token si las credenciales son correctas
            const token = jwt.sign({ userId: user.UsuarioID }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ success: true, message: "Login exitoso", token });
        });
    });
});



const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: "Token es requerido" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Token inválido" });

        req.userId = decoded.userId;
        next();
    });
}; 




app.get('/usuarios-consulados', verifyToken, (req, res) => {
    db.query('SELECT UC.ConsuladoUsuarioID, UC.Usuario, UC.Contrasenia, C.Nombre AS ConsuladoNombre FROM UsuariosConsulados AS UC JOIN Consulados AS C ON UC.ConsuladoID = C.ConsuladoID;', (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error al obtener los usuarios de consulados" });
        }
        res.json(results);
    });
});

// Endpoint para actualizar un UsuarioConsulado
app.put('/usuarios-consulados/:id',verifyToken, (req, res) => {
    const { id } = req.params;
    const { usuario, contrasenia } = req.body; // Asegúrate de validar y hashear la contraseña si es necesario
    console.log(`Actualizando usuario del consulado con ID: ${id}`, req.body);



    db.query('UPDATE UsuariosConsulados SET Usuario = ?, Contrasenia = ? WHERE ConsuladoUsuarioID = ?', [usuario, contrasenia, id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error al actualizar el usuario del consulado" });
        }
        res.json({ success: true, message: "Usuario del consulado actualizado correctamente" });
    });
});



app.get('/bot', async (req, res)=>{
    try{
        await botTelegramPrueba();
        res.send('Chequeo de bot completado, ');
    }catch(error) {
        console.error('Error al ejecutar el script:', error);
        res.status(500).send('Error, ');
    }
})

//Crea una ruta para ejecutar el script
app.get('/chequear-citas', async (req, res) => {
    try {
        await verificarDisponibilidadCitas();
        res.send('Chequeo de citas completado.');
    } catch (error) {
        console.error('Error al ejecutar el script de Selenium:', error);
        res.status(500).send('Error al chequear las citas.');
    }
});



// Una ruta de prueba que requiere autenticación
app.get('/secret', verifyToken, (req, res) => {
    res.send('Información secreta solo para usuarios autenticados');
});


// Define el puerto y pone a la aplicación a escuchar
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;