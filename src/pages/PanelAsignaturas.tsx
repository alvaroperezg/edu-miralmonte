import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

interface Asignatura {
  id: number;
  nombre: string;
}

interface Profesor {
  id: number;
  nombre: string;
  asignaturas: number[]; // Array de IDs de asignaturas
}

interface Curso {
  id: number;
  nombre: string;
}

const PanelAsignaturas: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nuevaAsignatura, setNuevaAsignatura] = useState<Asignatura>({
    id: 0,
    nombre: '',
  });

  // Cargar asignaturas, cursos y profesores desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [asignaturasRes, profesoresRes, cursosRes] = await Promise.all([
          axios.get('http://localhost:5000/api/asignaturas'),
          axios.get('http://localhost:5000/api/profesores'),
          axios.get('http://localhost:5000/api/cursos'),
        ]);

        setAsignaturas(asignaturasRes.data || []);
        setProfesores(profesoresRes.data || []);
        setCursos(cursosRes.data || []);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  const guardarAsignatura = () => {
    if (nuevaAsignatura.nombre) {
      if (nuevaAsignatura.id === 0) {
        // Crear nueva asignatura
        axios
          .post('http://localhost:5000/api/asignaturas', nuevaAsignatura)
          .then((response) => {
            setAsignaturas((prev) => [...prev, response.data]);
            setNuevaAsignatura({ id: 0, nombre: '' });
          })
          .catch((error) =>
            console.error('Error al guardar la asignatura:', error)
          );
      } else {
        // Editar asignatura existente
        axios
          .put(
            `http://localhost:5000/api/asignaturas/${nuevaAsignatura.id}`,
            nuevaAsignatura
          )
          .then((response) => {
            setAsignaturas((prev) =>
              prev.map((asignatura) =>
                asignatura.id === response.data.id
                  ? response.data
                  : asignatura
              )
            );
            setNuevaAsignatura({ id: 0, nombre: '' });
          })
          .catch((error) =>
            console.error('Error al editar la asignatura:', error)
          );
      }
    } else {
      alert('Por favor completa el nombre de la asignatura.');
    }
  };

  const eliminarAsignatura = (id: number) => {
    axios
      .delete(`http://localhost:5000/api/asignaturas/${id}`)
      .then(() =>
        setAsignaturas(asignaturas.filter((a) => a.id !== id))
      )
      .catch((error) =>
        console.error('Error al eliminar la asignatura:', error)
      );
  };

  const editarAsignatura = (asignatura: Asignatura) => {
    setNuevaAsignatura(asignatura);
  };

  return (
    <div className="container">
      <h1>Gestión de Asignaturas</h1>

      <div className="form-section">
        <h3>Agregar o Editar Asignatura</h3>
        <div className="form-group">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre de la asignatura"
            value={nuevaAsignatura.nombre}
            onChange={(e) =>
              setNuevaAsignatura({
                ...nuevaAsignatura,
                nombre: e.target.value,
              })
            }
          />
        </div>
        <div className="button-group">
          <button className="button primary" onClick={guardarAsignatura}>
            Guardar
          </button>
          <button
            className="button danger"
            onClick={() => setNuevaAsignatura({ id: 0, nombre: '' })}
          >
            Limpiar
          </button>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cursos</th>
            <th>Profesores</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaturas.map((asignatura) => (
            <tr key={asignatura.id}>
              <td>{asignatura.nombre}</td>
              <td>
                {cursos
                  .filter((curso) =>
                    curso.asignaturas?.includes(asignatura.id)
                  )
                  .map((curso) => curso.nombre)
                  .join(', ') || 'Sin curso'}
              </td>
              <td>
                {profesores
                  .filter((profesor) =>
                    profesor.asignaturas?.includes(asignatura.id)
                  )
                  .map((profesor) => profesor.nombre)
                  .join(', ') || 'Sin profesor'}
              </td>
              <td className="table-actions">
                <button
                  className="button edit"
                  onClick={() => editarAsignatura(asignatura)}
                >
                  Editar
                </button>
                <button
                  className="button danger"
                  onClick={() => eliminarAsignatura(asignatura.id)}
                >
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

export default PanelAsignaturas;
