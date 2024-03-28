CREATE DATABASE IF NOT EXISTS PrenotamiBot;
USE PrenotamiBot;

-- Crear tabla para los usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    UsuarioID INT AUTO_INCREMENT PRIMARY KEY,
    ChatID BIGINT NOT NULL,
    UbicacionLat FLOAT(10, 6), -- Latitud
    UbicacionLon FLOAT(10, 6), -- Longitud
    UNIQUE(ChatID)
);

-- Crear tabla para los consulados
CREATE TABLE IF NOT EXISTS Consulados (
    ConsuladoID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Ubicacion VARCHAR(255)
);

-- Crear tabla para los tipos de citas
CREATE TABLE IF NOT EXISTS TiposCitas (
    TipoCitaID INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion VARCHAR(255) NOT NULL
);

-- Crear tabla para relacionar usuarios con sus preferencias
CREATE TABLE IF NOT EXISTS PreferenciasUsuario (
    PreferenciaID INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioID INT,
    ConsuladoID INT,
    TipoCitaID INT,
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (ConsuladoID) REFERENCES Consulados(ConsuladoID),
    FOREIGN KEY (TipoCitaID) REFERENCES TiposCitas(TipoCitaID)
);

-- Indexes para mejorar la búsqueda por ubicación (opcional)
CREATE INDEX idx_ubicacion ON Usuarios(UbicacionLat, UbicacionLon);
