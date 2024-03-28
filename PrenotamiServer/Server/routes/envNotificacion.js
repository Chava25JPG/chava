const mysql = require('mysql');
const TelegramBot = require('node-telegram-bot-api');

// Configuración del bot de Telegram
const token = '6868127032:AAGEOTurKOofiT0vr6nhgbeBxJ7yGeoHON0';
const bot = new TelegramBot(token);

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Zaragoza2525',
    database: 'PrenotamiBot'
};

function query(db, sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

async function eliminarRegistrosUsuario(db, chatId) {
    try {
        // Obtener UsuarioID para este ChatId
        const resultsUsuario = await query(db, "SELECT UsuarioID FROM Usuarios WHERE ChatId = ?", [chatId]);
        if (resultsUsuario.length > 0) {
            const usuarioID = resultsUsuario[0].UsuarioID;
            // Eliminar registros en PreferenciasUsuario
            await query(db, "DELETE FROM PreferenciasUsuario WHERE UsuarioID = ?", [usuarioID]);
            // Eliminar registro en Usuarios
            await query(db, "DELETE FROM Usuarios WHERE UsuarioID = ?", [usuarioID]);
        }
    } catch (error) {
        console.error("Error al eliminar registros de usuario:", error);
    }
}

async function enviarNotificacion(consuladoId, tipoCitaId) {
    const db = mysql.createConnection(dbConfig);
    db.connect(err => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            return;
        }
    });

    const sql = `
        SELECT u.ChatId
        FROM Usuarios u
        INNER JOIN PreferenciasUsuario pu ON u.UsuarioID = pu.UsuarioID
        WHERE pu.ConsuladoID = ? AND pu.TipoCitaID = ?;
    `;

    try {
        const results = await query(db, sql, [consuladoId, tipoCitaId]);
        const mensaje = "¡Buenas noticias! Hay citas disponibles para tu selección. https://prenotami.esteri.it/";

        for (let row of results) {
            await bot.sendMessage(row.ChatId, mensaje);
            await eliminarRegistrosUsuario(db, row.ChatId);
        }
    } catch (error) {
        console.error('Error durante la notificación o eliminación de registros:', error);
    } finally {
        db.end();
    }
}

module.exports = enviarNotificacion;
