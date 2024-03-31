


const mysql = require('mysql');
const TelegramBot = require('node-telegram-bot-api');

// Configuración del bot de Telegram
const token = '6868127032:AAGEOTurKOofiT0vr6nhgbeBxJ7yGeoHON0'; // Usa tu token real aquí
const bot = new TelegramBot(token);

// Configuración del pool de conexiones a la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Zaragoza2525', // Usa tu contraseña real aquí
    database: 'PrenotamiBot'
});

// Función genérica para realizar consultas utilizando el pool
function query(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

async function eliminarRegistrosUsuario(chatId) {
    // Nota: No es necesario pasar db como argumento, ya que pool.query se encargará de eso.
    try {
        // Obtener UsuarioID para este ChatId
        const resultsUsuario = await query("SELECT UsuarioID FROM Usuarios WHERE ChatId = ?", [chatId]);
        if (resultsUsuario.length > 0) {
            const usuarioID = resultsUsuario[0].UsuarioID;
            // Eliminar registros en PreferenciasUsuario
            await query("DELETE FROM PreferenciasUsuario WHERE UsuarioID = ?", [usuarioID]);
            // Eliminar registro en Usuarios
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
    // Nota: No es necesario cerrar las conexiones manualmente cuando se usa un pool.
}

module.exports = enviarNotificacion;
