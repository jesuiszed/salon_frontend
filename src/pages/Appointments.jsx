import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    date_time: '',
    client: '',
    employee: '',
    service: '',
    status: 'confirmed',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, clientsRes, servicesRes, employeesRes] = await Promise.all([
        api.get('/appointments/'),
        api.get('/clients/'),
        api.get('/services/'),
        api.get('/users/'),
      ]);

      setAppointments(appointmentsRes.data);
      setClients(clientsRes.data);
      setServices(servicesRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentAppointment) {
        await api.put(`/appointments/${currentAppointment.id}/`, formData);
      } else {
        await api.post('/appointments/', formData);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        await api.delete(`/appointments/${id}/`);
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openModal = (appointment = null) => {
    if (appointment) {
      setCurrentAppointment(appointment);
      setFormData({
        date_time: appointment.date_time.slice(0, 16),
        client: appointment.client,
        employee: appointment.employee,
        service: appointment.service,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    } else {
      setCurrentAppointment(null);
      setFormData({
        date_time: '',
        client: '',
        employee: user.id,
        service: '',
        status: 'confirmed',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentAppointment(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    const labels = {
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <FaCalendarAlt /> Rendez-vous
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="btn btn-secondary"
          >
            {viewMode === 'list' ? 'Vue Calendrier' : 'Vue Liste'}
          </button>
          <button onClick={() => openModal()} className="btn btn-primary">
            <FaPlus /> Nouveau Rendez-vous
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Client</th>
                <th>Employé</th>
                <th>Prestation</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{format(new Date(appointment.date_time), 'dd/MM/yyyy HH:mm', { locale: fr })}</td>
                  <td>{appointment.client_name}</td>
                  <td>{appointment.employee_name}</td>
                  <td>{appointment.service_name}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td>
                    <button
                      onClick={() => openModal(appointment)}
                      className="btn btn-secondary"
                      style={{ marginRight: '10px' }}
                    >
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(appointment.id)} className="btn btn-danger">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: '20px', color: 'var(--primary-purple)' }}>
            Calendrier des rendez-vous
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', padding: '10px' }}>
                {day}
              </div>
            ))}
            {appointments.slice(0, 14).map((apt, idx) => (
              <div
                key={apt.id}
                style={{
                  padding: '10px',
                  background: 'var(--light-pink)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => openModal(apt)}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {format(new Date(apt.date_time), 'HH:mm')}
                </div>
                <div>{apt.client_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {currentAppointment ? 'Modifier Rendez-vous' : 'Nouveau Rendez-vous'}
              </h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date et Heure *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.date_time}
                  onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Client *</label>
                <select
                  className="form-control"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Employé *</label>
                <select
                  className="form-control"
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Prestation *</label>
                <select
                  className="form-control"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  required
                >
                  <option value="">Sélectionner une prestation</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price}€
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Statut *</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="confirmed">Confirmé</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {currentAppointment ? 'Mettre à jour' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
