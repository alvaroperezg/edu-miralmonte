import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Profesor {
  id: number;
  nombre: string;
}

interface Asignatura {
  id: number;
  nombre: string;
  descripcion: string;
  profesorId: number | null;
  profesor?: Profesor;
}

const PanelAsignaturas: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [nuevaAsignatura, setNuevaAsignatura] = useState<Asignatura>({
    id: 0,
    nombre: '',
    descripcion: '',
    profesorId: null,
  });

  const [tableKey, setTableKey] = useState(0); // Controlará la recreación de la tabla

  // Cargar asignaturas y profesores desde el backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/asignaturas')
      .then((response) => setAsignaturas(response.data))
      .catch((error) => console.error('Error al cargar las asignaturas:', error));

    axios.get('http://localhost:5000/api/profesores')
      .then((response) => setProfesores(response.data))
      .catch((error) => console.error('Error al cargar los profesores:', error));
  }, []);

  // Manejar cambios en el formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNuevaAsignatura({
      ...nuevaAsignatura,
      [e.target.name]: e.target.value,
    });
  };

  const guardarAsignatura = () => {
    if (nuevaAsignatura.nombre && nuevaAsignatura.descripcion) {
      if (nuevaAsignatura.id === 0) {
        // Crear nueva asignatura
        axios.post('http://localhost:5000/api/asignaturas', nuevaAsignatura)
          .then(() => {
            // Recargar asignaturas desde el backend
            axios.get('http://localhost:5000/api/asignaturas')
              .then((response) => setAsignaturas(response.data))
              .catch((error) => console.error('Error al recargar las asignaturas:', error));
            // Limpiar el formulario
            setNuevaAsignatura({ id: 0, nombre: '', descripcion: '', profesorId: null });
          })
          .catch((error) => console.error('Error al guardar la asignatura:', error));
      } else {
        // Editar asignatura existente
        axios.put(`http://localhost:5000/api/asignaturas/${nuevaAsignatura.id}`, nuevaAsignatura)
          .then(() => {
            // Recargar asignaturas desde el backend
            axios.get('http://localhost:5000/api/asignaturas')
              .then((response) => setAsignaturas(response.data))
              .catch((error) => console.error('Error al recargar las asignaturas:', error));
            // Limpiar el formulario
            setNuevaAsignatura({ id: 0, nombre: '', descripcion: '', profesorId: null });
          })
          .catch((error) => console.error('Error al editar la asignatura:', error));
      }
    } else {
      alert('Por favor completa los campos obligatorios.');
    }
  };  

  // Eliminar asignatura
  const eliminarAsignatura = (id: number) => {
    axios.delete(`http://localhost:5000/api/asignaturas/${id}`)
      .then(() => setAsignaturas(asignaturas.filter((a) => a.id !== id)))
      .catch((error) => console.error('Error al eliminar la asignatura:', error));
  };

  // Cargar datos en el formulario para editar
  const editarAsignatura = (asignatura: Asignatura) => {
    setNuevaAsignatura(asignatura);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Asignaturas</h1>

      <div style={{ marginBottom: '20px' }}>
        <h3>Agregar o Editar Asignatura</h3>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={nuevaAsignatura.nombre}
          onChange={manejarCambio}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={nuevaAsignatura.descripcion}
          onChange={manejarCambio}
          style={{ marginRight: '10px' }}
        />
        <select
          name="profesorId"
          value={nuevaAsignatura.profesorId || ''}
          onChange={(e) => setNuevaAsignatura({ ...nuevaAsignatura, profesorId: parseInt(e.target.value) })}
          style={{ marginRight: '10px' }}
        >
          <option value="">Seleccionar Profesor</option>
          {profesores.map((profesor) => (
            <option key={profesor.id} value={profesor.id}>
              {profesor.nombre}
            </option>
          ))}
        </select>
        <button onClick={guardarAsignatura}>Guardar</button>
      </div>
      <div key={tableKey}>
        <table border={1} style={{ width: '100%', textAlign: 'left' }}>
            <thead>
            <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Profesor</th>
                <th>Acciones</th>
            </tr>
            </thead>
            <tbody>
            {asignaturas.map((asignatura) => (
                <tr key={asignatura.id}>
                <td>{asignatura.nombre}</td>
                <td>{asignatura.descripcion}</td>
                <td>{asignatura.profesor ? asignatura.profesor.nombre : 'Sin asignar'}</td>
                <td>
                    <button onClick={() => editarAsignatura(asignatura)}>Editar</button>
                    <button onClick={() => eliminarAsignatura(asignatura.id)} style={{ marginLeft: '10px' }}>
                    Eliminar
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  );
};

export default PanelAsignaturas;
