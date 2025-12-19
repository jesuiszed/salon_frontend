import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaUsers, FaCut, FaCalendarAlt, 
  FaBox, FaUserTie, FaChartLine, FaSignOutAlt,
  FaHeart
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isPatronne } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Tableau de bord' },
    { path: '/appointments', icon: <FaCalendarAlt />, label: 'Rendez-vous' },
    { path: '/clients', icon: <FaUsers />, label: 'Clients' },
    { path: '/services', icon: <FaCut />, label: 'Prestations' },
    { path: '/products', icon: <FaBox />, label: 'Stocks' },
  ];

  if (isPatronne()) {
    menuItems.push(
      { path: '/employees', icon: <FaUserTie />, label: 'Employés' },
      { path: '/reports', icon: <FaChartLine />, label: 'Rapports' }
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaHeart className="logo-icon" />
        <h2 className="sidebar-title">Salon Coiffure</h2>
      </div>

      <div className="user-info">
        <div className="user-avatar">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div className="user-details">
          <div className="user-name">{user?.first_name} {user?.last_name}</div>
          <div className="user-role">{user?.role === 'patronne' ? 'Patronne' : 'Employé'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={logout} className="logout-btn">
        <FaSignOutAlt />
        <span>Déconnexion</span>
      </button>
    </div>
  );
};

export default Sidebar;
