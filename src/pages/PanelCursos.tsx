import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

interface Curso {
  id: number;
  nombre: string;
  asignaturas: number[]; // IDs de asignaturas relacionadas
  numeroAlumnos: number;
}

interface Asignatura {
  id: number;
  nombre: string;
}

interface Profesor {
  id: number;
  nombre: string;
  cursos: number[]; // IDs de cursos relacionados
}

interface Alumno {
  id: number;
  nombre: string;
  cursoId: number;
}

const PanelCursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [nuevoAlumno, setNuevoAlumno] = useState({ nombre: '', cursoId: 0 });
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);

  // Cargar datos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cursosRes, asignaturasRes, profesoresRes] = await Promise.all([
          axios.get('http://localhost:5000/api/cursos'),
          axios.get('http://localhost:5000/api/asignaturas'),
          axios.get('http://localhost:5000/api/profesores'),
        ]);

        setCursos(cursosRes.data);
        setAsignaturas(asignaturasRes.data);
        setProfesores(profesoresRes.data);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  const cargarAlumnos = (cursoId: number) => {
    setCursoSeleccionado(cursoId); // Establece el curso seleccionado
    axios
      .get(`http://localhost:5000/api/cursos/${cursoId}/alumnos`)
      .then((response) => setAlumnos(response.data))
      .catch((error) => console.error('Error al cargar los alumnos:', error));
  };

  const agregarAlumno = () => {
    if (nuevoAlumno.nombre && nuevoAlumno.cursoId) {
      axios
        .post(`http://localhost:5000/api/cursos/${nuevoAlumno.cursoId}/alumnos`, nuevoAlumno)
        .then((response) => {
          if (nuevoAlumno.cursoId === cursoSeleccionado) {
            setAlumnos((prevAlumnos) => [...prevAlumnos, response.data]);
          }

          setCursos((prevCursos) =>
            prevCursos.map((curso) =>
              curso.id === nuevoAlumno.cursoId
                ? { ...curso, numeroAlumnos: curso.numeroAlumnos + 1 }
                : curso
            )
          );

          setNuevoAlumno({ nombre: '', cursoId: 0 });
        })
        .catch((error) => {
          if (error.response && error.response.data.error) {
            alert(error.response.data.error);
          } else {
            console.error('Error al agregar el alumno:', error);
          }
        });
    } else {
      alert('Por favor completa todos los campos antes de agregar un alumno.');
    }
  };

  return (
    <div className="container">
      <h1>Gestión de Cursos</h1>

      <div className="form-section">
        <h3>Cursos Disponibles</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Asignaturas</th>
              <th>Profesores</th>
              <th>Alumnos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((curso) => (
              <tr key={curso.id}>
                <td>{curso.nombre}</td>
                <td>
                  {asignaturas
                    .filter((asignatura) => curso.asignaturas.includes(asignatura.id))
                    .map((asignatura) => asignatura.nombre)
                    .join(', ') || 'Sin asignaturas'}
                </td>
                <td>
                  {profesores
                    .filter((profesor) => profesor.cursos.includes(curso.id))
                    .map((profesor) => profesor.nombre)
                    .join(', ') || 'Sin profesores'}
                </td>
                <td>{curso.numeroAlumnos}</td>
                <td>
                  <button
                    className="button primary"
                    onClick={() => cargarAlumnos(curso.id)}
                  >
                    Ver Alumnos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h3>Alumnos del Curso: {cursoSeleccionado !== null && cursos.find((curso) => curso.id === cursoSeleccionado)?.nombre}</h3>
        <ul>
          {alumnos.map((alumno) => (
            <li key={alumno.id}>{alumno.nombre}</li>
          ))}
        </ul>
      </div>

      <div className="form-section">
        <h3>Agregar Alumno</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Nombre del alumno"
            value={nuevoAlumno.nombre}
            onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, nombre: e.target.value })}
          />
          <select
            value={nuevoAlumno.cursoId}
            onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, cursoId: parseInt(e.target.value) })}
          >
            <option value="">Seleccionar Curso</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nombre}
              </option>
            ))}
          </select>
        </div>
        <button className="button primary" onClick={agregarAlumno}>
          Agregar Alumno
        </button>
      </div>
    </div>
  );
};

export default PanelCursos;
