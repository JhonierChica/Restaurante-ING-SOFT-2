import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { ClientsIcon } from '../../components/common/Icons';
import { clientService } from '../../services/clientService';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    identificationNumber: '',
    address: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      phone: '',
      identificationNumber: '',
      address: '',
    });
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      phone: client.phone || '',
      identificationNumber: client.identificationNumber || '',
      address: client.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (client) => {
    if (window.confirm(`¿Está seguro de eliminar a ${client.name}?`)) {
      try {
        await clientService.deleteClient(client.id);
        alert('Cliente eliminado exitosamente');
        loadClients();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const clientData = {
        name: formData.name,
        phone: formData.phone,
        identificationNumber: formData.identificationNumber,
        address: formData.address,
      };

      if (editingClient) {
        await clientService.updateClient(editingClient.id, clientData);
        alert('Cliente actualizado exitosamente');
      } else {
        await clientService.createClient(clientData);
        alert('Cliente creado exitosamente');
      }
      setShowModal(false);
      loadClients();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar cliente';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'name' },
    { header: 'Teléfono', field: 'phone' },
    { header: 'Identificación', field: 'identificationNumber' },
  ];

  if (loading) return <Loading message="Cargando clientes..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={<><ClientsIcon size={24} /> Gestión de Clientes</>}
          actions={
            <Button onClick={handleAdd}>
              + Nuevo Cliente
            </Button>
          }
        >
          <Table
            columns={columns}
            data={clients}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
          onConfirm={handleSubmit}
          size="medium"
        >
          <div className="form-grid-2">
            <Input
              label="Nombre Completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Número de Identificación"
              name="identificationNumber"
              value={formData.identificationNumber}
              onChange={handleChange}
            />
            <Input
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <Input
              label="Dirección"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Clients;
