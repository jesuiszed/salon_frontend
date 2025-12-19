import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUserTie, FaPlus, FaEdit } from 'react-icons/fa';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const { isPatronne } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    phone: '',
    specialties: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users/');
      setEmployees(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEmployee) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${currentEmployee.id}/`, updateData);
      } else {
        await api.post('/users/', formData);
      }
      fetchEmployees();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const openModal = (employee = null) => {
    if (employee) {
      setCurrentEmployee(employee);
      setFormData({ ...employee, password: '' });
    } else {
      setCurrentEmployee(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'employee',
        phone: '',
        specialties: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentEmployee(null);
  };

  if (!isPatronne()) {
    return <div className="page"><div className="error">Accès réservé à la patronne</div></div>;
  }

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <FaUserTie /> Gestion des Employés
        </h1>
        <button onClick={() => openModal()} className="btn btn-primary">
          <FaPlus /> Nouvel Employé
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {employees.map((employee) => (
          <div key={employee.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-purple))',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </div>
              <div>
                <h3 style={{ color: 'var(--primary-purple)', margin: 0 }}>
                  {employee.first_name} {employee.last_name}
                </h3>
                <span className={`badge ${employee.role === 'patronne' ? 'badge-info' : 'badge-success'}`}>
                  {employee.role === 'patronne' ? 'Patronne' : 'Employé'}
                </span>
              </div>
            </div>

            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '10px' }}>
              <div><strong>Email:</strong> {employee.email}</div>
              <div><strong>Téléphone:</strong> {employee.phone || '-'}</div>
              <div><strong>Spécialités:</strong> {employee.specialties || '-'}</div>
            </div>

            <button onClick={() => openModal(employee)} className="btn btn-secondary" style={{ width: '100%' }}>
              <FaEdit /> Modifier
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {currentEmployee ? 'Modifier Employé' : 'Nouvel Employé'}
              </h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom d'utilisateur *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mot de passe {currentEmployee ? '(laisser vide pour ne pas changer)' : '*'}</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!currentEmployee}
                />
              </div>

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
                <label>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Rôle *</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="employee">Employé</option>
                  <option value="patronne">Patronne</option>
                </select>
              </div>

              <div className="form-group">
                <label>Spécialités</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Ex: Coupe, Coloration"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {currentEmployee ? 'Mettre à jour' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
