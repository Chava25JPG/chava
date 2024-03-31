const mysql = require('mysql');
const TelegramBot = require('node-telegram-bot-api');

// Configuración del bot de Telegram
const token = '6868127032:AAGEOTurKOofiT0vr6nhgbeBxJ7yGeoHON0';
const bot = new TelegramBot(token, { polling: true });

// Configuración del pool de conexiones a la base de datos
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Zaragoza2525',
    database: 'PrenotamiBot'
});

function query(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

async function eliminarRegistrosUsuario(chatId) {
    try {
        const resultsUsuario = await query("SELECT UsuarioID FROM Usuarios WHERE ChatId = ?", [chatId]);
        if (resultsUsuario.length > 0) {
            const usuarioID = resultsUsuario[0].UsuarioID;
            await query("DELETE FROM PreferenciasUsuario WHERE UsuarioID = ?", [usuarioID]);
            await query("DELETE FROM Usuarios WHERE UsuarioID = ?", [usuarioID]);
        }
    } catch (error) {
        console.error("Error al eliminar registros de usuario:", error);
    }
}

async function enviarNotificacion(consuladoId, tipoCitaId) {
    const sql = `
        SELECT u.ChatId
        FROM Usuarios u
        INNER JOIN PreferenciasUsuario pu ON u.UsuarioID = pu.UsuarioID
        WHERE pu.ConsuladoID = ? AND pu.TipoCitaID = ?;
    `;

    try {
        const results = await query(sql, [consuladoId, tipoCitaId]);
        const mensaje = "¡Buenas noticias! Hay citas disponibles para tu selección. https://prenotami.esteri.it/";

        for (let row of results) {
            await bot.sendMessage(row.ChatId, mensaje);
            await eliminarRegistrosUsuario(row.ChatId);
        }
    } catch (error) {
        console.error('Error durante la notificación o eliminación de registros:', error);
    }
}

module.exports = enviarNotificacion;

// No olvides cerrar el pool cuando tu aplicación se termine
process.on('SIGINT', () => {
    pool.end(err => {
        if (err) console.log('Error cerrando el pool de conexiones', err);
        console.log('Pool cerrado');
        process.exit();
    });
});