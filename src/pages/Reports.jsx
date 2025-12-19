import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaChartLine, FaCalendar, FaDownload } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isPatronne } = useAuth();

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      alert('Veuillez sélectionner une période');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/reports/', {
        params: { start_date: startDate, end_date: endDate }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    alert('Export PDF: Fonctionnalité en développement');
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csv = [
      ['Rapport Salon de Coiffure'],
      ['Période', `${startDate} - ${endDate}`],
      [''],
      ['Revenus Total', `${reportData.total_revenue}€`],
      ['Total Rendez-vous', reportData.total_appointments],
      [''],
      ['Top Services'],
      ['Service', 'Nombre'],
      ...reportData.top_services.map(s => [s.service__name, s.count]),
      [''],
      ['Performance Employés'],
      ['Employé', 'Rendez-vous', 'Revenus'],
      ...reportData.employee_performance.map(e => [
        `${e.employee__first_name} ${e.employee__last_name}`,
        e.appointments_count,
        `${e.revenue}€`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${startDate}_${endDate}.csv`;
    a.click();
  };

  if (!isPatronne()) {
    return <div className="page"><div className="error">Accès réservé à la patronne</div></div>;
  }

  const servicesData = reportData ? {
    labels: reportData.top_services.map(s => s.service__name),
    datasets: [{
      label: 'Nombre de prestations',
      data: reportData.top_services.map(s => s.count),
      backgroundColor: [
        '#FFB6C1',
        '#DDA0DD',
        '#FF69B4',
        '#DA70D6',
        '#FFE4E1'
      ],
    }]
  } : null;

  const employeeData = reportData ? {
    labels: reportData.employee_performance.map(e => `${e.employee__first_name} ${e.employee__last_name}`),
    datasets: [{
      label: 'Revenus (€)',
      data: reportData.employee_performance.map(e => e.revenue),
      backgroundColor: 'rgba(255, 182, 193, 0.8)',
      borderColor: '#FF69B4',
      borderWidth: 2,
    }]
  } : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <FaChartLine /> Rapports & Analyses
        </h1>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ color: 'var(--primary-purple)', marginBottom: '20px' }}>
          <FaCalendar /> Sélectionner une période
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Date de début</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Date de fin</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button onClick={fetchReport} className="btn btn-primary" disabled={loading}>
            {loading ? 'Chargement...' : 'Générer Rapport'}
          </button>
        </div>
      </div>

      {reportData && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)', color: 'white' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Revenus Total</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>
                {reportData.total_revenue.toFixed(2)}€
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #DDA0DD 0%, #DA70D6 100%)', color: 'white' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Rendez-vous</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>
                {reportData.total_appointments}
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)', color: 'white' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Revenu Moyen</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>
                {reportData.total_appointments > 0
                  ? (reportData.total_revenue / reportData.total_appointments).toFixed(2)
                  : 0}€
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={exportToCSV} className="btn btn-secondary">
              <FaDownload /> Exporter CSV
            </button>
            <button onClick={exportToPDF} className="btn btn-secondary">
              <FaDownload /> Exporter PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <div className="card">
              <h3 style={{ color: 'var(--primary-purple)', marginBottom: '20px' }}>
                Top Prestations
              </h3>
              <div style={{ height: '300px' }}>
                {servicesData && <Pie data={servicesData} />}
              </div>
            </div>

            <div className="card">
              <h3 style={{ color: 'var(--primary-purple)', marginBottom: '20px' }}>
                Performance par Employé
              </h3>
              <div style={{ height: '300px' }}>
                {employeeData && <Bar data={employeeData} />}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ color: 'var(--primary-purple)', marginBottom: '15px' }}>
              Détails Performance Employés
            </h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Nombre de Rendez-vous</th>
                    <th>Revenus Générés</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.employee_performance.map((emp, idx) => (
                    <tr key={idx}>
                      <td>{emp.employee__first_name} {emp.employee__last_name}</td>
                      <td>{emp.appointments_count}</td>
                      <td><strong>{emp.revenue}€</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
