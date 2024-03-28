import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UsuariosConsulados() {
    const [usuarios, setUsuarios] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [usuarioEditado, setUsuarioEditado] = useState({ usuario: '', contrasenia: '' });
    const navigate = useNavigate();
  

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/usuarios-consulados', {
                headers: {
                    Authorization: ` ${token}`,
                },
            });
            setUsuarios(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Redirigir al inicio si la respuesta es un error 401 (No autorizado)
                navigate('/');
            }
            console.error("Error cargando los usuarios de consulados:", error.response || error);
        }
    };

    const abrirModal = (usuario) => {
        setEditando(usuario.ConsuladoUsuarioID);
        setUsuarioEditado({ usuario: usuario.Usuario, contrasenia: usuario.Contrasenia });
        setIsModalOpen(true);
      };
    
    const cerrarModal = () => {
    setIsModalOpen(false);
    };

    const iniciarEdicion = (usuario) => {
        setEditando(usuario.ConsuladoUsuarioID);
        setUsuarioEditado({ usuario: usuario.Usuario, contrasenia: usuario.Contrasenia, ConsuladoNombre: usuario.ConsuladoNombre });
    };

    const handleInputChange = (e) => {
        setUsuarioEditado({ ...usuarioEditado, [e.target.name]: e.target.value });
    };

    const guardarEdicion = async () => {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3001/usuarios-consulados/${editando}`, usuarioEditado, {
            headers: {
                'Authorization': ` ${token}`
            }
        });
        setEditando(null);
        cargarUsuarios();
        cerrarModal();
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="container mx-auto mt-10">
          {isModalOpen && (
            <div className="fixed inset-0 z-50 overflow-auto bg-smoke-light flex">
              <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
                <div>
                  <h1 className="text-xl font-bold">Editar Usuario</h1>
                  <input
                    type="text"
                    placeholder="Usuario"
                    name="usuario"
                    value={usuarioEditado.usuario}
                    onChange={handleInputChange}
                    className="w-full p-2 my-2 border rounded"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    name="contrasenia"
                    value={usuarioEditado.contrasenia}
                    onChange={handleInputChange}
                    className="w-full p-2 my-2 border rounded"
                  />
                </div>
                <div className="flex justify-between">
                  <button onClick={guardarEdicion} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Guardar</button>
                  <button onClick={cerrarModal} className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400">Cancelar</button>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consulado
                </th>
                <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Editar</span>
                </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                <tr key={usuario.ConsuladoUsuarioID}>
                    {editando === usuario.ConsuladoUsuarioID ? (
                    <td colSpan="3" className="px-6 py-4 whitespace-nowrap">
                        <input
                        name="usuario"
                        value={usuarioEditado.usuario}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                        />
                        <input
                        name="contrasenia"
                        value={usuarioEditado.contrasenia}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                        />
                        <button onClick={guardarEdicion} className="text-white bg-blue-600 hover:bg-blue-700 rounded py-2 px-4 ml-2">Guardar</button>
                    </td>
                    ) : (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.Usuario}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.ConsuladoNombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => abrirModal(usuario)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        </td>
                    </>
                    )}
                </tr>
                ))}
            </tbody>
            </table>
          </div>
          <button onClick={cerrarSesion} className="text-white bg-red-600 hover:bg-red-700 rounded py-2 px-4 mt-4">Salir</button>
        </div>
      );
}

export default UsuariosConsulados;












