import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaHome, FaCalendarCheck, FaEuroSign, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  
  if (!stats) {
    return (
      <div className="page">
        <div className="error">Erreur lors du chargement des statistiques. Veuillez rafraîchir la page.</div>
      </div>
    );
  }

  const pieData = {
    labels: ['Rendez-vous du jour', 'Clients totaux'],
    datasets: [
      {
        data: [stats.today_appointments, stats.total_clients],
        backgroundColor: ['#FFB6C1', '#DDA0DD'],
        borderColor: ['#FF69B4', '#DA70D6'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: ['Aujourd\'hui'],
    datasets: [
      {
        label: 'Revenus (€)',
        data: [stats.today_revenue],
        backgroundColor: 'rgba(255, 182, 193, 0.8)',
        borderColor: '#FF69B4',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <FaHome /> Tableau de Bord
        </h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)' }}>
          <div className="stat-card-content">
            <div className="stat-info">
              <div className="stat-label">Rendez-vous du jour</div>
              <div className="stat-value">{stats.today_appointments}</div>
            </div>
            <FaCalendarCheck className="stat-icon" />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #DDA0DD 0%, #DA70D6 100%)' }}>
          <div className="stat-card-content">
            <div className="stat-info">
              <div className="stat-label">Revenus du jour</div>
              <div className="stat-value">{stats.today_revenue.toFixed(2)}€</div>
            </div>
            <FaEuroSign className="stat-icon" />
          </div>
        </div>

        <div className="stat-card" style={{ background: stats.low_stock_count > 0 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #90EE90 0%, #32CD32 100%)' }}>
          <div className="stat-card-content">
            <div className="stat-info">
              <div className="stat-label">Alertes stock bas</div>
              <div className="stat-value">{stats.low_stock_count}</div>
            </div>
            <FaExclamationTriangle className="stat-icon" />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)' }}>
          <div className="stat-card-content">
            <div className="stat-info">
              <div className="stat-label">Total Clients</div>
              <div className="stat-value">{stats.total_clients}</div>
            </div>
            <FaUsers className="stat-icon" />
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3 className="chart-title">Activité du jour</h3>
          <div className="chart-wrapper">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Revenus du jour</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--primary-purple)', marginBottom: '15px' }}>Bienvenue sur votre espace de gestion</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.8' }}>
          Utilisez le menu latéral pour naviguer entre les différentes sections de l'application. 
          Vous pouvez gérer vos rendez-vous, clients, prestations et stocks en toute simplicité.
          Les statistiques ci-dessus vous donnent un aperçu de votre activité du jour.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
