import React, { useState, useEffect } from 'react';
import '../../styles/Forms.css';

const EmployeeForm = ({ onComplete, onCancel, positions, serverError, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    documentNumber: '',
    phone: '',
    address: '',
    positionId: '',
  });

  // Cargar datos iniciales cuando se edita
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        documentNumber: initialData.documentNumber || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        positionId: initialData.position?.id || '',
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Los nombres son obligatorios';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son obligatorios';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.positionId) {
      newErrors.positionId = 'Debe seleccionar un cargo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    // Convertir IDs a números
    const dataToSubmit = {
      ...formData,
      positionId: parseInt(formData.positionId),
    };
    
    onComplete(dataToSubmit);
  };

  const selectedPosition = positions.find(p => p.id === parseInt(formData.positionId));

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      {serverError && (
        <div className="error-alert" style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '6px',
          border: '1px solid #f5c6cb',
          whiteSpace: 'pre-line'
        }}>
          ❌ {serverError}
        </div>
      )}
      
      <div className="form-section">
        <h3>👤 Información Personal</h3>
        <div className="form-grid-2">
          <div className="form-group">
            <label>Nombres *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ej: Juan Carlos"
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>Apellidos *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ej: Pérez García"
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: juan.perez@restaurant.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Número de Documento</label>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="Ej: 12345678"
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: 555-1234"
            />
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ej: Calle 10 #20-30"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>💼 Información Laboral</h3>
        <div className="form-grid-2">
          <div className="form-group col-span-2">
            <label>Cargo *</label>
            <select
              name="positionId"
              value={formData.positionId}
              onChange={handleChange}
              className={errors.positionId ? 'error' : ''}
            >
              <option value="">Seleccione un cargo...</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.name} - {position.department}
                </option>
              ))}
            </select>
            {errors.positionId && <span className="error-text">{errors.positionId}</span>}
          </div>

          {selectedPosition && (
            <>
              <div className="info-card">
                <div className="info-label">Departamento</div>
                <div className="info-value">{selectedPosition.department}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Salario Base</div>
                <div className="info-value">
                  ${selectedPosition.baseSalary?.toLocaleString('es-CO') || 'No especificado'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancelar
        </button>
        <button type="submit" className="btn-submit">
          {initialData ? '💾 Actualizar Empleado' : '✅ Crear Empleado'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
