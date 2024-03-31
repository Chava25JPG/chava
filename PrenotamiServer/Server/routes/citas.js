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
    
    try {
        const usuariosConsulados = await obtenerUsuariosConsulados();
        let indiceUsuarioActual = 0;

        while (true) {

            
            let options = new chrome.Options();
            //options.addArguments('user-data-dir=/home/chava25/.config/google-chrome/Default');
            // options.addArguments('headless'); // Ejecutar sin GUI
            options.addArguments('no-sandbox'); // Ejecuta r Chrome sin sandbox (necesario en ciertos entornos sin GUI)
            // options.addArguments('disable-dev-shm-usage'); // Evitar problemas de memoria en contenedores Docker
            // options.addArguments('disable-gpu'); // Desactivar GPU, útil en modo headless
            // options.addArguments('window-size=1920,1080');
            options.addArguments('--start-fullscreen'); 

            
            const driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            //.setChromeOptions(new chrome.Options().setChromeBinaryPath('/usr/bin/google-chrome'))
            .build();


            const { Usuario } = usuariosConsulados[indiceUsuarioActual];
            
            await esperarAleatoriamente(10000, 70000);
            await driver.get(urlPrenotami);

            await interactuarOrganicamente(driver);
            await interactuarConElemento(driver, By.id('login-email'), Usuario);
            console.log(Contrasenia);
            await interactuarConElemento(driver, By.id('login-password'), Contrasenia, true);

            await esperarAleatoriamente(1000, 50000);
            await navegarYVerificarElemento(driver, By.id('advanced'), true);
            await esperarAleatoriamente(1000, 5000);

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
            
            indiceUsuarioActual = (indiceUsuarioActual + 1) % usuariosConsulados.length; // Avanzar al siguiente usuario o volver al inicio

            if (indiceUsuarioActual === 0) {
                // const logoutButton = await driver.findElement(By.xpath("//form[@id='logoutForm']/button"));
                // await logoutButton.click();
                //console.log("Sesión cerrada.");

                // Si hemos vuelto al inicio, esperar 30 minutos antes de empezar de nuevo
                console.log("Esperando 30 minutos antes de reiniciar el ciclo...");
                await new Promise(resolve => setTimeout(resolve, 1200000)); // 30 minutos
            } else {
                // Esperar 5 minutos antes del próximo usuario
                // const logoutButton = await driver.findElement(By.xpath("//form[@id='logoutForm']/button"));
                // await logoutButton.click();
                // console.log("Sesión cerrada.");

                console.log("Esperando 5 minutos antes del próximo usuario...");
                await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutos
            }
        }
    } catch (error) {
        console.error('Elemento no encontrado, cerrando el navegador y reiniciando el ciclo.', error);
    } finally {
        let options = new chrome.Options();
            //options.addArguments('user-data-dir=/home/chava25/.config/google-chrome/Default');
            // options.addArguments('headless'); // Ejecutar sin GUI
            options.addArguments('no-sandbox'); // Ejecuta r Chrome sin sandbox (necesario en ciertos entornos sin GUI)
            // options.addArguments('disable-dev-shm-usage'); // Evitar problemas de memoria en contenedores Docker
            // options.addArguments('disable-gpu'); // Desactivar GPU, útil en modo headless
            // options.addArguments('window-size=1920,1080');
            options.addArguments('--start-fullscreen'); 

            
            const driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            //.setChromeOptions(new chrome.Options().setChromeBinaryPath('/usr/bin/google-chrome'))
            .build();
        await driver.quit();
        console.log("Navegador cerrado.");
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
    
    // Simulación de movimientos del mouse antes de interactuar con el elemento
    let acciones = driver.actions({async: true});
    await acciones.move({origin: elemento}).perform();

    // Simula errores tipográficos y correcciones
    for (const char of texto) {
        await elemento.sendKeys(char);
        let shouldMakeTypo = Math.random() < 0.1; // 10% de probabilidad de error tipográfico
        if (shouldMakeTypo) {
            await elemento.sendKeys(Key.BACK_SPACE); // Borrar y reescribir
            await elemento.sendKeys(char);
        }
        await driver.sleep(100 + Math.random() * 150); // Espera entre cada carácter
    }

    if (esSubmit) {
        await esperarAleatoriamente(1000, 2000); // Pequeña pausa antes de enviar
        await elemento.sendKeys(Key.RETURN);
    }
    await esperarAleatoriamente(2000, 8000);
}

async function navegarYVerificarElemento(driver, locator, click = false) {
    let elemento = await driver.wait(until.elementLocated(locator), 20000);
    await driver.wait(until.elementIsVisible(elemento), 20000);
    if (click) {
        await elemento.click();
    }
    await esperarAleatoriamente(1000, 10000);
}

async function manejarBoton(driver, botonInfo) {
    try {
        if (botonInfo.paginate) {
            await navegarYVerificarElemento(driver, By.xpath("//a[contains(@class, 'paginate_button') and @data-dt-idx='2']"), true);
            await esperarAleatoriamente(1000, 8000);
        }

        let botonPrenota = await driver.wait(until.elementLocated(By.xpath(botonInfo.xpath)), 20000);
        await botonPrenota.click();
        let currentUrl = await driver.getCurrentUrl();

        if (currentUrl.includes(botonInfo.urlPart)) {
            console.log(`Citas disponibles para ${botonInfo.message}, redireccionado a: ${currentUrl}`);
            enviarNotificacion(consuladoIdEncontrado, botonInfo.TPCid);
        } else {
            console.log('No se encontró disponibilidad o redirección desconocida.');
        }
    } catch (error) {
        console.error('Elemento no encontrado, cerrando el navegador y reiniciando el ciclo.', error);
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
