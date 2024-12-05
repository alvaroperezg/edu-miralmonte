import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../src/pages/Home';
import PanelProfesores from '../src/pages/PanelProfesores';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import PanelAsignaturas from './pages/PanelAsignaturas';
import PanelCursos from './pages/PanelCursos';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profesores" element={<PanelProfesores />} />
        <Route path="/asignaturas" element={<PanelAsignaturas />} />
        <Route path="/cursos" element={<PanelCursos />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default AppRouter;
