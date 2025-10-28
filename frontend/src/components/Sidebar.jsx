// src/components/Sidebar.jsx

import React from 'react';
import './Sidebar.css'; // Crearemos este archivo de estilos en el Paso 3

// Recibirá 2 props:
// 1. activeTab: El nombre de la pestaña activa ('dashboard', 'mapa', etc.)
// 2. setActiveTab: La función para cambiar esa pestaña
const Sidebar = ({ activeTab, setActiveTab }) => {

  const NavItem = ({ tabName, icon, label }) => {
    // Comprueba si esta es la pestaña activa
    const isActive = activeTab === tabName;
    
    return (
      <li 
        className={`sidebar-item ${isActive ? 'active' : ''}`}
        onClick={() => setActiveTab(tabName)}
      >
        <span className="sidebar-icon">{icon}</span>
        <span className="sidebar-label">{label}</span>
      </li>
    );
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>Secciones</h3>
      </div>
      <ul className="sidebar-menu">
        <NavItem 
          tabName="dashboard" 
          icon="📊" 
          label="Dashboard Principal" 
        />
        <NavItem 
          tabName="mapa" 
          icon="🗺️" 
          label="Mapa Global" 
        />
        <NavItem 
          tabName="tendencias" 
          icon="📈" 
          label="Comparador" 
        />
      </ul>
    </nav>
  );
};

export default Sidebar;