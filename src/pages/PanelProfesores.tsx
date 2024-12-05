import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Profesor {
  id: number;
  nombre: string;
  email: string;
  titulaciones: string;
  cursos: string[] | string; // cursos puede ser string o array
}

const PanelProfesores: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [nuevoProfesor, setNuevoProfesor] = useState<Profesor>({
    id: 0,
    nombre: '',
    email: '',
    titulaciones: '',
    cursos: '', 
  });

  // Cargar profesores desde el backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/profesores')
      .then((response) => {
        setProfesores(response.data);
      })
      .catch((error) => {
        console.error('Error al cargar los profesores:', error);
      });
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoProfesor({
      ...nuevoProfesor,
      [e.target.name]: e.target.value,
    });
  };

  const guardarProfesor = () => {
    const cursosArray = typeof nuevoProfesor.cursos === 'string' ? nuevoProfesor.cursos.split(',') : [];
    const profesor = { ...nuevoProfesor, cursos: cursosArray };
  
    if (nuevoProfesor.id === 0) {
      // Crear nuevo profesor
      axios.post('http://localhost:5000/api/profesores', profesor)
        .then((response) => {
          setProfesores([...profesores, response.data]);
          setNuevoProfesor({ id: 0, nombre: '', email: '', titulaciones: '', cursos: '' });
        })
        .catch((error) => {
          console.error('Error al guardar el profesor:', error);
        });
    } else {
      // Editar profesor existente
      axios.put(`http://localhost:5000/api/profesores/${nuevoProfesor.id}`, profesor)
        .then((response) => {
          setProfesores(profesores.map((p) => (p.id === response.data.id ? response.data : p)));
          setNuevoProfesor({ id: 0, nombre: '', email: '', titulaciones: '', cursos: '' });
        })
        .catch((error) => {
          console.error('Error al editar el profesor:', error);
        });
    }
  };

  const editarProfesor = (profesor: Profesor) => {
    setNuevoProfesor({
      ...profesor,
      cursos: Array.isArray(profesor.cursos) ? profesor.cursos.join(',') : profesor.cursos,
    });
  };
  
  const eliminarProfesor = (id: number) => {
    axios.delete(`http://localhost:5000/api/profesores/${id}`)
      .then(() => {
        setProfesores(profesores.filter((profesor) => profesor.id !== id));
      })
      .catch((error) => {
        console.error('Error al eliminar el profesor:', error);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Profesores</h1>

      <div style={{ marginBottom: '20px' }}>
        <h3>Agregar o Editar Profesor</h3>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={nuevoProfesor.nombre}
          onChange={manejarCambio}
          style={{ marginRight: '10px' }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={nuevoProfesor.email}
          onChange={manejarCambio}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          name="titulaciones"
          placeholder="Titulaciones"
          value={nuevoProfesor.titulaciones}
          onChange={manejarCambio}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          name="cursos"
          placeholder="Cursos (separados por comas)"
          value={nuevoProfesor.cursos}
          onChange={manejarCambio}
          style={{ marginRight: '10px' }}
        />
        <button onClick={guardarProfesor}>Guardar</button>
      </div>

      <table border={1} style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Titulaciones</th>
            <th>Cursos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profesores.map((profesor) => (
            <tr key={profesor.id}>
              <td>{profesor.nombre}</td>
              <td>{profesor.email}</td>
              <td>{profesor.titulaciones}</td>
              <td>{Array.isArray(profesor.cursos) ? profesor.cursos.join(', ') : profesor.cursos}</td>
              <td>
                <button onClick={() => editarProfesor(profesor)}>Editar</button>
                <button onClick={() => eliminarProfesor(profesor.id)} style={{ marginLeft: '10px' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PanelProfesores;
