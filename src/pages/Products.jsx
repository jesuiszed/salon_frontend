import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaBox, FaPlus, FaEdit, FaExclamationTriangle } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    purchase_price: '',
    low_stock_alert: 5,
    notes: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct.id}/`, formData);
      } else {
        await api.post('/products/', formData);
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData(product);
    } else {
      setCurrentProduct(null);
      setFormData({
        name: '',
        quantity: '',
        purchase_price: '',
        low_stock_alert: 5,
        notes: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
  };

  const lowStockProducts = products.filter(p => p.is_low_stock);

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <FaBox /> Gestion des Stocks
        </h1>
        <button onClick={() => openModal()} className="btn btn-primary">
          <FaPlus /> Nouveau Produit
        </button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="card" style={{ background: '#FFF3CD', borderLeft: '4px solid #856404', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaExclamationTriangle style={{ color: '#856404', fontSize: '1.5rem' }} />
            <div>
              <strong>Alerte stock bas !</strong> {lowStockProducts.length} produit(s) nécessite(nt) un réapprovisionnement.
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix d'achat</th>
              <th>Alerte stock</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={product.is_low_stock ? { background: '#FFF3CD' } : {}}>
                <td>{product.name}</td>
                <td>
                  <strong style={{ fontSize: '1.2rem' }}>{product.quantity}</strong>
                </td>
                <td>{product.purchase_price}€</td>
                <td>{product.low_stock_alert}</td>
                <td>
                  {product.is_low_stock ? (
                    <span className="badge badge-warning">Stock bas</span>
                  ) : (
                    <span className="badge badge-success">OK</span>
                  )}
                </td>
                <td>
                  <button onClick={() => openModal(product)} className="btn btn-secondary">
                    <FaEdit />
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
                {currentProduct ? 'Modifier Produit' : 'Nouveau Produit'}
              </h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom du produit *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantité *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Prix d'achat (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Seuil d'alerte stock *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.low_stock_alert}
                  onChange={(e) => setFormData({ ...formData, low_stock_alert: e.target.value })}
                  required
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
                {currentProduct ? 'Mettre à jour' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
