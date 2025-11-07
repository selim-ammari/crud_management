'use client';

import { useState, useEffect, useCallback } from 'react';
import { Device, Employee } from '../types';
import * as api from '../api/client';

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({ name: '', type: '', owner_id: '' });
  const [filterType, setFilterType] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterName, setFilterName] = useState('');
  const [error, setError] = useState('');

  const loadEmployees = async () => {
    try {
      const data = await api.fetchEmployees();
      setEmployees(data);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    }
  };

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      const ownerId = filterOwner ? parseInt(filterOwner) : undefined;
      const data = await api.fetchDevices(
        filterType || undefined,
        ownerId,
        filterName || undefined
      );
      setDevices(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterOwner, filterName]);

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const deviceData = {
        name: formData.name,
        type: formData.type,
        owner_id: formData.owner_id ? parseInt(formData.owner_id) : null,
      };
      if (editingDevice) {
        await api.updateDevice(editingDevice.id, deviceData);
      } else {
        await api.createDevice(deviceData);
      }
      setShowModal(false);
      setEditingDevice(null);
      setFormData({ name: '', type: '', owner_id: '' });
      await loadDevices();
    } catch (err: any) {
      console.error('Error saving device:', err);
      setError(err.message || 'Failed to save device');
    }
  };

  const handleEdit = (device: Device) => {
    setError('');
    setEditingDevice(device);
    setFormData({
      name: device.name,
      type: device.type,
      owner_id: device.owner_id ? device.owner_id.toString() : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    try {
      await api.deleteDevice(id);
      loadDevices();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to delete device');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDevice(null);
    setFormData({ name: '', type: '', owner_id: '' });
  };

  const uniqueTypes = Array.from(new Set(devices.map(d => d.type)));
  const deviceTypes = ['Laptop', 'Peripheral', 'Display', 'Mobile', 'Tablet'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Device Management</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Device Name"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400 min-w-[200px]"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 bg-white appearance-none pr-8 min-w-[180px]"
        >
          <option value="">Select Type</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 bg-white appearance-none pr-8 min-w-[180px]"
        >
          <option value="">Select Owner</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id.toString()}>{emp.name}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setError('');
            setEditingDevice(null);
            setFormData({ name: '', type: '', owner_id: '' });
            setShowModal(true);
          }}
          className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Device
        </button>
      </div>

      {/* Devices Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : devices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No devices found</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                  Owner
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {device.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {device.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {device.owner_name || <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(device)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="text-gray-600 hover:text-red-600 p-1"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDevice ? 'Edit Device' : 'Add Device'}
              </h3>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
                    placeholder="Enter device name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Select Type</option>
                    {deviceTypes.map(type => (
                      <option key={type} value={type} className="text-gray-900">{type}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner (Optional)
                  </label>
                  <select
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id.toString()}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingDevice ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

