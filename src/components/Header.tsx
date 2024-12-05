import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header style={{ padding: '10px', background: '#f4f4f4' }}>
      <nav>
        <Link to="/" style={{ margin: '0 10px' }}>
          Inicio
        </Link>
        <Link to="/profesores" style={{ margin: '0 10px' }}>
          Profesores
        </Link>
        <Link to="/asignaturas" style={{ margin: '0 10px' }}>
          Asignaturas
        </Link>
        <Link to="/cursos" style={{ margin: '0 10px' }}>
          Cursos
        </Link>
      </nav>
    </header>
  );
};

export default Header;
