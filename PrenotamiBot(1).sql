-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 28-03-2024 a las 20:20:25
-- Versión del servidor: 10.6.16-MariaDB-0ubuntu0.22.04.1
-- Versión de PHP: 8.1.2-1ubuntu2.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `PrenotamiBot`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Consulados`
--

CREATE TABLE `Consulados` (
  `ConsuladoID` int(11) NOT NULL,
  `Nombre` varchar(255) NOT NULL,
  `Ubicacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Consulados`
--

INSERT INTO `Consulados` (`ConsuladoID`, `Nombre`, `Ubicacion`) VALUES
(1, 'Consulado Italiano de Buenos Aires', 'Buenos Aires'),
(2, 'Consulado Italiano de La Plata', 'La Plata'),
(3, 'Consulado Italiano de Bahía Blanca', 'Bahía Blanca'),
(4, 'Consulado Italiano de Mar del Plata', 'Mar del Plata'),
(5, 'Consulado Italiano de Córdoba', 'Córdoba'),
(6, 'Consulado Italiano de Lomas de Zamora', 'Lomas de Zamora'),
(7, 'Consulado Italiano de Morón', 'Morón'),
(8, 'Consulado Italiano de Rosario', 'Rosario'),
(9, 'Consulado Italiano de Mendoza', 'Mendoza');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `PreferenciasUsuario`
--

CREATE TABLE `PreferenciasUsuario` (
  `PreferenciaID` int(11) NOT NULL,
  `UsuarioID` int(11) DEFAULT NULL,
  `ConsuladoID` int(11) DEFAULT NULL,
  `TipoCitaID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `PreferenciasUsuario`
--

INSERT INTO `PreferenciasUsuario` (`PreferenciaID`, `UsuarioID`, `ConsuladoID`, `TipoCitaID`) VALUES
(11, 12, 1, 2),
(16, 17, 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TiposCitas`
--

CREATE TABLE `TiposCitas` (
  `TipoCitaID` int(11) NOT NULL,
  `Descripcion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `TiposCitas`
--

INSERT INTO `TiposCitas` (`TipoCitaID`, `Descripcion`) VALUES
(1, 'Ciudadanía por descendencia Hijos adultos directos'),
(2, 'Ciudadanía por descendencia Reconstrucción de la ciudadanía'),
(3, 'Pasaporte Solicitud de Pasaporte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `UsuarioAdministrativo`
--

CREATE TABLE `UsuarioAdministrativo` (
  `UsuarioID` int(11) NOT NULL,
  `Usuario` varchar(255) NOT NULL,
  `Contrasenia` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `UsuarioAdministrativo`
--

INSERT INTO `UsuarioAdministrativo` (`UsuarioID`, `Usuario`, `Contrasenia`) VALUES
(1, 'admin', '$2b$10$tq6isgBBY2xAklDCd3chluBw.y.CYQMzA6FBZJMtechSNyiFEP392');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Usuarios`
--

CREATE TABLE `Usuarios` (
  `UsuarioID` int(11) NOT NULL,
  `ChatID` bigint(20) NOT NULL,
  `UbicacionLat` float(10,6) DEFAULT NULL,
  `UbicacionLon` float(10,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Usuarios`
--

INSERT INTO `Usuarios` (`UsuarioID`, `ChatID`, `UbicacionLat`, `UbicacionLon`) VALUES
(12, 5933579206, 17.568010, -99.507744),
(17, 6817238219, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `UsuariosConsulados`
--

CREATE TABLE `UsuariosConsulados` (
  `ConsuladoUsuarioID` int(11) NOT NULL,
  `ConsuladoID` int(11) DEFAULT NULL,
  `Usuario` varchar(255) NOT NULL,
  `Contrasenia` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `UsuariosConsulados`
--

INSERT INTO `UsuariosConsulados` (`ConsuladoUsuarioID`, `ConsuladoID`, `Usuario`, `Contrasenia`) VALUES
(1, 1, 'saseza8@gmail.com', 'Zaragoza@2525');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Consulados`
--
ALTER TABLE `Consulados`
  ADD PRIMARY KEY (`ConsuladoID`);

--
-- Indices de la tabla `PreferenciasUsuario`
--
ALTER TABLE `PreferenciasUsuario`
  ADD PRIMARY KEY (`PreferenciaID`),
  ADD KEY `UsuarioID` (`UsuarioID`),
  ADD KEY `ConsuladoID` (`ConsuladoID`),
  ADD KEY `TipoCitaID` (`TipoCitaID`);

--
-- Indices de la tabla `TiposCitas`
--
ALTER TABLE `TiposCitas`
  ADD PRIMARY KEY (`TipoCitaID`);

--
-- Indices de la tabla `UsuarioAdministrativo`
--
ALTER TABLE `UsuarioAdministrativo`
  ADD PRIMARY KEY (`UsuarioID`);

--
-- Indices de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  ADD PRIMARY KEY (`UsuarioID`),
  ADD UNIQUE KEY `ChatID` (`ChatID`),
  ADD KEY `idx_ubicacion` (`UbicacionLat`,`UbicacionLon`);

--
-- Indices de la tabla `UsuariosConsulados`
--
ALTER TABLE `UsuariosConsulados`
  ADD PRIMARY KEY (`ConsuladoUsuarioID`),
  ADD KEY `ConsuladoID` (`ConsuladoID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Consulados`
--
ALTER TABLE `Consulados`
  MODIFY `ConsuladoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `PreferenciasUsuario`
--
ALTER TABLE `PreferenciasUsuario`
  MODIFY `PreferenciaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `TiposCitas`
--
ALTER TABLE `TiposCitas`
  MODIFY `TipoCitaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `UsuarioAdministrativo`
--
ALTER TABLE `UsuarioAdministrativo`
  MODIFY `UsuarioID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  MODIFY `UsuarioID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `UsuariosConsulados`
--
ALTER TABLE `UsuariosConsulados`
  MODIFY `ConsuladoUsuarioID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `PreferenciasUsuario`
--
ALTER TABLE `PreferenciasUsuario`
  ADD CONSTRAINT `PreferenciasUsuario_ibfk_1` FOREIGN KEY (`UsuarioID`) REFERENCES `Usuarios` (`UsuarioID`),
  ADD CONSTRAINT `PreferenciasUsuario_ibfk_2` FOREIGN KEY (`ConsuladoID`) REFERENCES `Consulados` (`ConsuladoID`),
  ADD CONSTRAINT `PreferenciasUsuario_ibfk_3` FOREIGN KEY (`TipoCitaID`) REFERENCES `TiposCitas` (`TipoCitaID`);

--
-- Filtros para la tabla `UsuariosConsulados`
--
ALTER TABLE `UsuariosConsulados`
  ADD CONSTRAINT `UsuariosConsulados_ibfk_1` FOREIGN KEY (`ConsuladoID`) REFERENCES `Consulados` (`ConsuladoID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
