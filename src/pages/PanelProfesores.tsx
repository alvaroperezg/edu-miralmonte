import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

interface Asignatura {
  id: number;
  nombre: string;
}

interface Curso {
  id: number;
  nombre: string;
}

interface Profesor {
  id: number;
  nombre: string;
  email: string;
  cursos: number[]; // IDs de los cursos
  asignaturas: number[]; // IDs de las asignaturas
}

const PanelProfesores: React.FC = () => {
  const [cursosDisponibles, setCursosDisponibles] = useState<Curso[]>([]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState<Asignatura[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [nuevoProfesor, setNuevoProfesor] = useState<Profesor>({
    id: 0,
    nombre: '',
    email: '',
    cursos: [],
    asignaturas: [],
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cursosRes, asignaturasRes, profesoresRes] = await Promise.all([
          axios.get('http://localhost:5000/api/cursos'),
          axios.get('http://localhost:5000/api/asignaturas'),
          axios.get('http://localhost:5000/api/profesores'),
        ]);

        setCursosDisponibles(cursosRes.data);
        setAsignaturasDisponibles(asignaturasRes.data);
        setProfesores(profesoresRes.data);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoProfesor({
      ...nuevoProfesor,
      [e.target.name]: e.target.value,
    });
  };

  const guardarProfesor = async () => {
    if (!nuevoProfesor.nombre || !nuevoProfesor.email) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const profesor = { ...nuevoProfesor };

    try {
      if (nuevoProfesor.id === 0) {
        const response = await axios.post('http://localhost:5000/api/profesores', profesor);
        setProfesores([...profesores, response.data]);
      } else {
        const response = await axios.put(`http://localhost:5000/api/profesores/${nuevoProfesor.id}`, profesor);
        setProfesores(profesores.map((p) => (p.id === response.data.id ? response.data : p)));
      }

      setNuevoProfesor({ id: 0, nombre: '', email: '', cursos: [], asignaturas: [] });
    } catch (error) {
      console.error('Error al guardar el profesor:', error);
    }
  };

  const editarProfesor = (profesor: Profesor) => {
    setNuevoProfesor({
      ...profesor,
      cursos: profesor.cursos || [],
      asignaturas: profesor.asignaturas || [],
    });
  };

  const eliminarProfesor = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/profesores/${id}`);
      setProfesores(profesores.filter((profesor) => profesor.id !== id));
    } catch (error) {
      console.error('Error al eliminar el profesor:', error);
    }
  };

  const toggleSeleccion = <T extends number>(lista: T[], item: T): T[] => {
    return lista.includes(item) ? lista.filter((i) => i !== item) : [...lista, item];
  };

  return (
    <div className="container">
      <h1>Gestión de Profesores</h1>

      <div className="form-section">
        <h3>Agregar o Editar Profesor</h3>
        <div className="form-group">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={nuevoProfesor.nombre}
            onChange={manejarCambio}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={nuevoProfesor.email}
            onChange={manejarCambio}
          />
          <label>Asignaturas:</label>
          <select
            multiple
            onDoubleClick={(e) => {
              const asignaturaId = parseInt((e.target as HTMLOptionElement).value, 10);
              setNuevoProfesor({
                ...nuevoProfesor,
                asignaturas: toggleSeleccion(nuevoProfesor.asignaturas, asignaturaId),
              });
            }}
          >
            {asignaturasDisponibles.map((asignatura) => (
              <option
                key={asignatura.id}
                value={asignatura.id}
                className={nuevoProfesor.asignaturas.includes(asignatura.id) ? 'selected' : ''}
              >
                {asignatura.nombre}
              </option>
            ))}
          </select>
          <label>Cursos:</label>
          <select
            multiple
            onDoubleClick={(e) => {
              const cursoId = parseInt((e.target as HTMLOptionElement).value, 10);
              setNuevoProfesor({
                ...nuevoProfesor,
                cursos: toggleSeleccion(nuevoProfesor.cursos, cursoId),
              });
            }}
          >
            {cursosDisponibles.map((curso) => (
              <option
                key={curso.id}
                value={curso.id}
                className={nuevoProfesor.cursos.includes(curso.id) ? 'selected' : ''}
              >
                {curso.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="button-group">
          <button onClick={guardarProfesor} className="button primary">
            Guardar
          </button>
          <button
            onClick={() => setNuevoProfesor({ id: 0, nombre: '', email: '', cursos: [], asignaturas: [] })}
            className="button secondary"
          >
            Limpiar
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Cursos</th>
            <th>Asignaturas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profesores.map((profesor) => (
            <tr key={profesor.id}>
              <td>{profesor.nombre}</td>
              <td>{profesor.email}</td>
              <td>
              {Array.isArray(profesor.cursos) ? (
                  profesor.cursos
                    .map((id) => cursosDisponibles.find((c) => c.id === id)?.nombre)
                    .filter(Boolean)
                    .join(', ') || 'Sin cursos'
                ) : 'Sin cursos'}
              </td>
              <td>
                {profesor.asignaturas
                  .map((id) => asignaturasDisponibles.find((a) => a.id === id)?.nombre)
                  .filter(Boolean)
                  .join(', ') || 'Sin asignar'}
              </td>
              <td>
                <button onClick={() => editarProfesor(profesor)} className="button edit">
                  Editar
                </button>
                <button onClick={() => eliminarProfesor(profesor.id)} className="button danger">
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
