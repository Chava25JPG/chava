const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const mysql = require('mysql');


const usuario = 'saseza8@gmail.com';
const Contrasenia = 'Zaragoza0';
const urlPrenotami = 'https://prenotami.esteri.it/';
const urlServices = 'https://prenotami.esteri.it/Services';

const enviarNotificacion = require ('./envNotificacion.js');
const consuladoIdEncontrado = 1;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Zaragoza2525',
    database: 'PrenotamiBot'
  });
  
function query(sql, parameters) {
return new Promise((resolve, reject) => {
    pool.query(sql, parameters, (error, results) => {
    if (error) {
        return reject(error);
    }
    resolve(results);
    });
});
}

async function obtenerUsuariosConsulados() {
    return new Promise((resolve, reject) => {
        query('SELECT Usuario, Contrasenia FROM UsuariosConsulados', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}



async function verificarDisponibilidadCitas() {
    let driver;

    try {
        const usuariosConsulados = await obtenerUsuariosConsulados();
        let indiceUsuarioActual = 0;

        buclePrincipal: while (true) { // Etiqueta del bucle principal
            let options = new chrome.Options();
            options.addArguments('no-sandbox'); // Ejecuta Chrome sin sandbox (necesario en ciertos entornos sin GUI)
            options.addArguments('--start-fullscreen');

            driver = new Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .build();

            const { Usuario } = usuariosConsulados[indiceUsuarioActual];

            await esperarAleatoriamente(1000, 70000);
            await driver.get(urlPrenotami);

            await interactuarOrganicamente(driver);
            await esperarAleatoriamente(1000, 50000);
            await interactuarConElemento(driver, By.id('login-email'), Usuario);
            console.log(Contrasenia);
            await esperarAleatoriamente(1000, 50000);
            await interactuarConElemento(driver, By.id('login-password'), Contrasenia, true);

            try {
                await esperarAleatoriamente(1000, 500000);
                await navegarYVerificarElemento(driver, By.id('advanced'), true);
            } catch (error) {
                console.error('Elemento "advanced" no encontrado, reiniciando ciclo.', error);
                await driver.quit();
                continue buclePrincipal; // Salta al inicio del bucle principal
            }

            await esperarAleatoriamente(1000, 50000);
            // Aquí iría la lógica actual que tienes para manejar los botones y verificar las citas

            
            let botones = [
                { xpath: "//a[@href='/Services/Booking/222']/button", urlPart: '/Services/Booking/222', message: 'Ciudadanía por descendencia "Hijos adultos directos"', TPCid: '1'},
                { xpath: "//a[@href='/Services/Booking/224']/button", urlPart: '/Services/Booking/224', message: 'Ciudadanía por descendencia "Reconstrucción de la ciudadanía"',TPCid: '2'},
                { xpath: "//a[@href='/Services/Booking/584']/button", urlPart: '/Services/Booking/584', paginate: true, message: 'Pasaporte "Solicitud de pasaporte"',TPCid: '3'}
            ];

            for (let botonInfo of botones) {
                await manejarBoton(driver, botonInfo);
                // Espera aleatoria entre cada acción para simular comportamiento humano
                await esperarAleatoriamente(1000, 80000);
            }

            // Reiniciar el ciclo con una espera aleatoria
            await esperarAleatoriamente(1000, 15000);
            await driver.quit();
            console.log("Cerrando");

            indiceUsuarioActual = (indiceUsuarioActual + 1) % usuariosConsulados.length;

            if (indiceUsuarioActual === 0) {
                console.log("Esperando 30 minutos antes de reiniciar el ciclo...");
                await esperarAleatoriamente(100000, 1200000); // 30 minutos
            } else {
                console.log("Esperando 5 minutos antes del próximo usuario...");
                await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutos
            }
        }
    } catch (error) {
        console.error('Error inesperado, cerrando el navegador y reiniciando el ciclo.', error);
        if (driver) {
            await driver.quit();
        }
    }
}



async function interactuarOrganicamente(driver) {
    // Simulación de interacciones humanas
    let acciones = driver.actions({bridge: true});
    // Aseguramos que los valores sean enteros
    let x = Math.floor(Math.random() * 100);
    let y = Math.floor(Math.random() * 100);
    await acciones.move({x: x, y: y}).perform();
    await driver.sleep(2000); // Espera
    await driver.executeScript("window.scrollBy(0,250)"); // Scroll hacia abajo
    await driver.sleep(2000); // Espera
    await driver.executeScript("window.scrollBy(0,-250)"); // Scroll hacia arriba
}
async function interactuarConElemento(driver, locator, texto, esSubmit = false) {
    let elemento = await driver.wait(until.elementLocated(locator), 100000);
    await driver.wait(until.elementIsVisible(elemento), 100000);
    
    // Simulación de movimientos del mouse más naturales y aleatorios antes de interactuar con el elemento
    let acciones = driver.actions({async: true});
    // Mover el cursor fuera del elemento y luego dentro de él para simular un enfoque más humano
    await acciones.move({x: 0, y: 0}).move({origin: elemento}).perform();

    // Introduce una mayor variabilidad en los errores tipográficos y las correcciones
    for (const char of texto) {
        await elemento.sendKeys(char);
        let shouldMakeTypo = Math.random() < 0.05; // Reduce la probabilidad de error tipográfico al 5%
        if (shouldMakeTypo) {
            await elemento.sendKeys(Key.BACK_SPACE); // Simula una corrección
            let typoDelay = 300 + Math.random() * 200; // Espera un poco más antes de corregir
            await driver.sleep(typoDelay);
            await elemento.sendKeys(char);
        }
        let typingDelay = 100 + Math.random() * 200; // Varía más el tiempo entre cada carácter
        await driver.sleep(typingDelay);
    }

    // Implementa una función para pausas aleatorias más sofisticada
    async function esperarAleatoriamente(min, max) {
        let espera = min + Math.random() * (max - min);
        await driver.sleep(espera);
    }

    if (esSubmit) {
        await esperarAleatoriamente(2000, 5000); // Varía la pausa antes de enviar
        await elemento.sendKeys(Key.RETURN);
    }
    await esperarAleatoriamente(3000, 7000); // Espera después de enviar
}


async function navegarYVerificarElemento(driver, locator, click = false) {
    try {
        // Encuentra el elemento con espera implícita
        let elemento = await driver.wait(until.elementLocated(locator), 20000);
        // Espera a que el elemento sea visible
        await driver.wait(until.elementIsVisible(elemento), 20000);

        // Mover el cursor hacia el elemento de forma impredecible
        let acciones = driver.actions({ bridge: true });
        await acciones.move({ origin: elemento }).perform();

        // Espera un poco antes de hacer clic, para simular la indecisión humana
        await esperarAleatoriamente(500, 1500);

        if (click) {
            // Realiza movimientos leves del ratón antes de hacer clic
            await acciones.move({
                origin: elemento,
                x: Math.round((Math.random() - 0.5) * 10),
                y: Math.round((Math.random() - 0.5) * 10)
            }).perform();
            await esperarAleatoriamente(100, 500); // Espera breve antes de hacer clic
            await elemento.click();
        }

        // Agrega una espera después del clic para simular el tiempo de reacción humano
        if (click) await esperarAleatoriamente(2000, 5000);
    } catch (error) {
        console.error('Error al navegar y verificar el elemento:', error);
        throw error; // Propagar el error para manejo adicional si es necesario
    }
}

async function manejarBoton(driver, botonInfo) {
    try {
        if (botonInfo.paginate) {
            await navegarYVerificarElemento(driver, By.xpath("//a[contains(@class, 'paginate_button') and @data-dt-idx='2']"), true);
            await esperarAleatoriamente(1000, 8000);
        }

        let botonPrenota = await driver.wait(until.elementLocated(By.xpath(botonInfo.xpath)), 20000);
        await botonPrenota.click();
        await driver.sleep(5000); // Esperar a que la página cargue completamente

        // Verificar si hay un error de red
        let bodyClass = await driver.findElement(By.css('body')).getAttribute('class');
        if (!bodyClass.includes('neterror')) {
            let currentUrl = await driver.getCurrentUrl();
            if (currentUrl.includes(botonInfo.urlPart)) {
                console.log(`Citas disponibles para ${botonInfo.message}, redireccionado a: ${currentUrl}`);
                enviarNotificacion(consuladoIdEncontrado, botonInfo.TPCid);
            } else {
                console.log('No se encontró disponibilidad o redirección desconocida.');
            }
        } else {
            console.log('Se detectó un error de red.');
        }
    } catch (error) {
        console.error('Error al verificar la disponibilidad de citas:', error);
        
    } finally {
        
    }
    await esperarAleatoriamente(10000, 60000); // Espera antes de continuar
    await driver.get(urlServices); // Vuelve a la página principal antes de continuar con el siguiente botón
    await esperarAleatoriamente(10000, 60000); // Espera antes de continuar
}

// Función para esperar un tiempo aleatorio entre dos valores
async function esperarAleatoriamente(min, max) {
    const espera = Math.floor(Math.random() * (max - min + 1) + min);
    console.log(`Esperando ${espera / 1000} segundos...`);
    await new Promise(resolve => setTimeout(resolve, espera));
}

verificarDisponibilidadCitas();
