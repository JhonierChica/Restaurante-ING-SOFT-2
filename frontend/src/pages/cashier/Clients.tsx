import React, { useState, useEffect, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { ClientsIcon } from '../../components/common/Icons';
import { clientService } from '../../services/clientService';
import type { Client } from '../../types';

interface FormData {
  name: string;
  phone: string;
  identificationNumber: string;
  address: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<FormData>({
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
    } catch (err) {
      console.error('Error al cargar clientes:', err);
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

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      phone: client.phone || '',
      identificationNumber: client.identificationNumber || '',
      address: client.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (client: Client) => {
    if (window.confirm(`¿Está seguro de eliminar a ${client.name}?`)) {
      try {
        await clientService.deleteClient(client.id);
        alert('Cliente eliminado exitosamente');
        loadClients();
      } catch (err) {
        console.error('Error al eliminar cliente:', err);
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
    } catch (err: any) {
      console.error('Error al guardar cliente:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar cliente';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const columns = [
    { header: 'ID', field: 'id' as keyof Client },
    { header: 'Nombre', field: 'name' as keyof Client },
    { header: 'Teléfono', field: 'phone' as keyof Client },
    { header: 'Identificación', field: 'identificationNumber' as keyof Client },
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