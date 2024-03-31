const TelegramBot = require("node-telegram-bot-api");
const mysql = require("mysql");

// Configuración del bot de Telegram
const token = "6868127032:AAGEOTurKOofiT0vr6nhgbeBxJ7yGeoHON0";
const bot = new TelegramBot(token, { polling: true });

// Configuración del pool de conexiones a la base de datos
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Zaragoza2525",
    database: "PrenotamiBot"
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





const consulados = [
    "Consulado Italiano de Buenos Aires",
    // "Consulado Italiano de La Plata",
    // "Consulado Italiano de Bahía Blanca",
    // "Consulado Italiano de Mar del Plata",
    // "Consulado Italiano de Córdoba",
    // "Consulado Italiano de Lomas de Zamora",
    // "Consulado Italiano de Morón",
    // "Consulado Italiano de Rosario",
    // "Consulado Italiano de Mendoza",
];

const tiposCitas = [
    "Ciudadanía por descendencia Hijos adultos directos",
    "Ciudadanía por descendencia Reconstrucción de la ciudadanía",
    "Pasaporte Solicitud de Pasaporte",
];



function query(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    // Reiniciar las selecciones para el usuario
    selections[chatId] = {};
    bot.sendMessage(chatId, "Selecciona el consulado:", {
        reply_markup: {
            keyboard: consulados.map(consulado => [consulado]),
            one_time_keyboard: true,
            resize_keyboard: true
        }
    });
});

bot.onText(/\/off/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        // Verifica si existe un usuario con este ChatId y elimina sus registros asociados
        await eliminarRegistrosUsuario(chatId);
        bot.sendMessage(chatId, "Tu registro ha sido eliminado.");
    } catch (error) {
        console.error("Error al eliminar el registro:", error);
        bot.sendMessage(chatId, "Hubo un error al intentar eliminar tu registro. Por favor, intenta de nuevo.");
    }
});

// Función para eliminar registros de usuario
async function eliminarRegistrosUsuario(chatId) {
    // Obtener UsuarioID para este ChatId
    const resultsUsuario = await query( "SELECT UsuarioID FROM Usuarios WHERE ChatId = ?", [chatId]);
    if (resultsUsuario.length > 0) {
        const usuarioID = resultsUsuario[0].UsuarioID;
        // Eliminar registros en PreferenciasUsuario
        await query( "DELETE FROM PreferenciasUsuario WHERE UsuarioID = ?", [usuarioID]);
        // Eliminar registro en Usuarios
        await query( "DELETE FROM Usuarios WHERE UsuarioID = ?", [usuarioID]);
    }
}

let selections = {};

// bot.on("location", (msg) => {
//     const chatId = msg.chat.id;
//     const { latitude, longitude } = msg.location;
//     selections[chatId] = { ubicacion: { latitude, longitude } };
//     console.log(`Ubicación recibida de ${chatId}: Latitud ${latitude}, Longitud ${longitude}`);

//     bot.sendMessage(chatId, "Selecciona el consulado:", {
//         reply_markup: {
//             keyboard: consulados.map(consulado => [consulado]),
//             one_time_keyboard: true,
//             resize_keyboard: true
//         }
//     });
// });
bot.on("message", async (msg) => {
    if (msg.location) return;

    const chatId = msg.chat.id;
    const respuesta = msg.text;

    if (respuesta.startsWith('/')) return;

    if (!selections[chatId]) selections[chatId] = {};

    if (consulados.includes(respuesta)) {
        selections[chatId].consulado = respuesta;
        console.log(`Consulado seleccionado por ${chatId}: ${respuesta}`);
        bot.sendMessage(chatId, "Selecciona el tipo de cita:", {
            reply_markup: {
                keyboard: tiposCitas.map(tipoCita => [tipoCita]),
                one_time_keyboard: true,
                resize_keyboard: true
            }
        });
    } else if (tiposCitas.includes(respuesta)) {
        selections[chatId].tipoCita = respuesta;
        console.log(`Tipo de cita seleccionado por ${chatId}: ${respuesta}`);

        try {
            // Verificar si existe un registro previo para este ChatId
            const usuarioExistente = await query("SELECT UsuarioID FROM Usuarios WHERE ChatId = ?", [chatId]);
            if (usuarioExistente.length > 0) {
                // Eliminar registros existentes en PreferenciasUsuario
                await query( "DELETE FROM PreferenciasUsuario WHERE UsuarioID = ?", [usuarioExistente[0].UsuarioID]);
                // Eliminar registro existente en Usuarios
                await query( "DELETE FROM Usuarios WHERE ChatId = ?", [chatId]);
            }

            const { ubicacion, consulado, tipoCita } = selections[chatId];
            const consuladoQuery = "SELECT ConsuladoID FROM Consulados WHERE Nombre = ?";
            const tipoCitaQuery = "SELECT TipoCitaID FROM TiposCitas WHERE Descripcion = ?";

            const consuladoResults = await query( consuladoQuery, [consulado]);
            const tipoCitaResults = await query( tipoCitaQuery, [tipoCita]);

            if (consuladoResults.length > 0 && tipoCitaResults.length > 0) {
                const consuladoID = consuladoResults[0].ConsuladoID;
                const tipoCitaID = tipoCitaResults[0].TipoCitaID;

                // Insertar nuevo registro en Usuarios
                await query( "INSERT INTO Usuarios (ChatId) VALUES (?)", [chatId]);
                
                // Obtener el UsuarioID del nuevo registro insertado
                const usuarioNuevo = await query("SELECT UsuarioID FROM Usuarios WHERE ChatId = ?", [chatId]);
                
                // Insertar nuevo registro en PreferenciasUsuario
                await query( "INSERT INTO PreferenciasUsuario (UsuarioID, ConsuladoID, TipoCitaID) VALUES (?, ?, ?)", [usuarioNuevo[0].UsuarioID, consuladoID, tipoCitaID]);

                bot.sendMessage(chatId, "Gracias, te notificaremos cuando haya disponibilidad para tu selección.");
            } else {
                bot.sendMessage(chatId, "Hubo un error al procesar tu selección. Por favor, intenta de nuevo.");
            }
        } catch (error) {
            console.error("Error al procesar la selección:", error);
            bot.sendMessage(chatId, "Hubo un error al guardar tu selección. Por favor, intenta de nuevo.");
        }

        // Limpia la selección para este usuario
        delete selections[chatId];
    } else {
        bot.sendMessage(chatId, "Por favor, selecciona una opción válida.");
    }
});

