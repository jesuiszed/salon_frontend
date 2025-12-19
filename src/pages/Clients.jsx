import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    preferences: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/');
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentClient) {
        await api.put(`/clients/${currentClient.id}/`, formData);
      } else {
        await api.post('/clients/', formData);
      }
      fetchClients();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await api.delete(`/clients/${id}/`);
        fetchClients();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openModal = (client = null) => {
    if (client) {
      setCurrentClient(client);
      setFormData(client);
    } else {
      setCurrentClient(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        preferences: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentClient(null);
  };

  const filteredClients = clients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <FaUsers /> Gestion des Clients
        </h1>
        <button onClick={() => openModal()} className="btn btn-primary">
          <FaPlus /> Nouveau Client
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Rendez-vous</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td>{client.first_name} {client.last_name}</td>
                <td>{client.phone}</td>
                <td>{client.email || '-'}</td>
                <td>{client.appointments_count}</td>
                <td>
                  <button onClick={() => openModal(client)} className="btn btn-secondary" style={{ marginRight: '10px' }}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="btn btn-danger">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {currentClient ? 'Modifier Client' : 'Nouveau Client'}
              </h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Préférences</label>
                <textarea
                  className="form-control"
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  rows="3"
                />
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
                {currentClient ? 'Mettre à jour' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
