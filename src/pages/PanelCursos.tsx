import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Curso {
  id: number;
  nombre: string;
  asignaturas: Asignatura[];
  numeroAlumnos: number;
}

interface Asignatura {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Alumno {
  id: number;
  nombre: string;
  cursoId: number;
}



const PanelCursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [nuevoAlumno, setNuevoAlumno] = useState({ nombre: '', cursoId: 0 });
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/cursos')
      .then((response) => setCursos(response.data))
      .catch((error) => console.error('Error al cargar los cursos:', error));
  }, []);
  

  const cargarAlumnos = (cursoId: number) => {
    setCursoSeleccionado(cursoId); // Establece el curso seleccionado
    axios.get(`http://localhost:5000/api/cursos/${cursoId}/alumnos`)
      .then((response) => setAlumnos(response.data))
      .catch((error) => console.error('Error al cargar los alumnos:', error));
  };
  

  const agregarAlumno = () => {
    if (nuevoAlumno.nombre && nuevoAlumno.cursoId) {
      axios.post(`http://localhost:5000/api/cursos/${nuevoAlumno.cursoId}/alumnos`, nuevoAlumno)
        .then((response) => {
          // Solo agregar a la lista local si el curso coincide con el seleccionado
          if (nuevoAlumno.cursoId === cursoSeleccionado) {
            setAlumnos((prevAlumnos) => [...prevAlumnos, response.data]);
          }
  
          // Actualizar el número de alumnos en el curso correspondiente
          setCursos((prevCursos) =>
            prevCursos.map((curso) =>
              curso.id === nuevoAlumno.cursoId
                ? { ...curso, numeroAlumnos: curso.numeroAlumnos + 1 }
                : curso
            )
          );
  
          // Limpiar el formulario
          setNuevoAlumno({ nombre: '', cursoId: 0 });
        })
        .catch((error) => {
          if (error.response && error.response.data.error) {
            alert(error.response.data.error); // Mostrar el error del backend
          } else {
            console.error('Error al agregar el alumno:', error);
          }
        });
    } else {
      alert('Por favor completa todos los campos antes de agregar un alumno.');
    }
  };  

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Cursos y Alumnos</h1>
      <div>
        <h3>Cursos</h3>
        <ul>
          {cursos.map((curso) => (
            <li key={curso.id}>
             {curso.nombre} - {curso.numeroAlumnos} alumno(s)
            <button onClick={() => cargarAlumnos(curso.id)} style={{ marginLeft: '10px' }}>
              Ver Alumnos
            </button>
          </li>
          ))}
        </ul>
        <div>
        <h3>Alumnos del Curso {cursoSeleccionado !== null && cursos.find(curso => curso.id === cursoSeleccionado)?.nombre}</h3>
        <ul>
            {alumnos.map((alumno) => (
            <li key={alumno.id}>{alumno.nombre}</li>
            ))}
        </ul>
        </div>
      </div>
      <div>
        <h3>Agregar Alumno</h3>
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
        <button onClick={agregarAlumno}>Agregar Alumno</button>
      </div>
    </div>
  );
};

export default PanelCursos;
