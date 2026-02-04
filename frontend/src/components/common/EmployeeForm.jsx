import React, { useState } from 'react';

const EmployeeForm = ({ onComplete, onCancel, positions }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    documentNumber: '',
    phone: '',
    address: '',
    positionId: '',
  });

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
          ✅ Crear Empleado
        </button>
      </div>

      <style jsx>{`
        .employee-form {
          padding: 0;
        }

        .form-section {
          margin-bottom: 14px;
        }

        .form-section:last-child {
          margin-bottom: 0;
        }

        .form-section h3 {
          margin-top: 0;
          margin-bottom: 8px;
          color: #333;
          font-size: 14px;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.col-span-2 {
          grid-column: span 2;
        }

        .form-group label {
          margin-bottom: 4px;
          font-weight: 500;
          color: #555;
          font-size: 13px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #dc3545;
        }

        .error-text {
          color: #dc3545;
          font-size: 11px;
          margin-top: 2px;
        }

        .info-card {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .info-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }

        .info-value {
          font-weight: 600;
          color: #333;
          font-size: 13px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #ddd;
        }

        .btn-cancel,
        .btn-submit {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #6c757d;
          color: white;
        }

        .btn-cancel:hover {
          background: #5a6268;
        }

        .btn-submit {
          background: #28a745;
          color: white;
        }

        .btn-submit:hover {
          background: #218838;
        }

        @media (max-width: 768px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }

          .form-group.col-span-2 {
            grid-column: 1 / -1;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </form>
  );
};

export default EmployeeForm;
