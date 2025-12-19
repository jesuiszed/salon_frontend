import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCut, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    service_type: 'coupe',
    price: '',
    duration_minutes: '',
    description: '',
  });

  const serviceTypes = [
    { value: 'coupe', label: 'Coupe' },
    { value: 'coloration', label: 'Coloration' },
    { value: 'meches', label: 'Mèches' },
    { value: 'brushing', label: 'Brushing' },
    { value: 'soin', label: 'Soin' },
    { value: 'autre', label: 'Autre' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/');
      setServices(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentService) {
        await api.put(`/services/${currentService.id}/`, formData);
      } else {
        await api.post('/services/', formData);
      }
      fetchServices();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prestation ?')) {
      try {
        await api.delete(`/services/${id}/`);
        fetchServices();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setCurrentService(service);
      setFormData(service);
    } else {
      setCurrentService(null);
      setFormData({
        name: '',
        service_type: 'coupe',
        price: '',
        duration_minutes: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentService(null);
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <FaCut /> Prestations
        </h1>
        <button onClick={() => openModal()} className="btn btn-primary">
          <FaPlus /> Nouvelle Prestation
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {services.map((service) => (
          <div key={service.id} className="card">
            <h3 style={{ color: 'var(--primary-purple)', marginBottom: '10px' }}>{service.name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '15px' }}>
              {serviceTypes.find(t => t.value === service.service_type)?.label}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <strong style={{ fontSize: '1.5rem', color: 'var(--primary-pink)' }}>{service.price}€</strong>
              </div>
              <div style={{ color: 'var(--text-light)' }}>
                {service.duration_minutes} min
              </div>
            </div>
            {service.description && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '15px' }}>
                {service.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => openModal(service)} className="btn btn-secondary" style={{ flex: 1 }}>
                <FaEdit /> Modifier
              </button>
              <button onClick={() => handleDelete(service.id)} className="btn btn-danger">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {currentService ? 'Modifier Prestation' : 'Nouvelle Prestation'}
              </h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom de la prestation *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type de prestation *</label>
                <select
                  className="form-control"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  required
                >
                  {serviceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Prix (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Durée (minutes) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {currentService ? 'Mettre à jour' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
