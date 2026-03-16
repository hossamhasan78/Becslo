'use client';

import { createClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  category: string;
  base_hours: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({});

  const fetchServices = useCallback(async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();
  }, [fetchServices]);

  const handleToggle = async (service: Service) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);

    if (!error) {
      fetchServices();
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData(service);
  };

  const handleSave = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('services')
      .update({
        name: formData.name,
        category: formData.category,
        base_hours: formData.base_hours,
        description: formData.description,
      })
      .eq('id', editingId);

    if (!error) {
      setEditingId(null);
      fetchServices();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.category) return;

    const { error } = await supabase.from('services').insert({
      name: formData.name,
      category: formData.category,
      base_hours: formData.base_hours || 1,
      description: formData.description || '',
      is_active: true,
    });

    if (!error) {
      setIsCreating(false);
      setFormData({});
      fetchServices();
    }
  };

  if (loading) return <div className="text-gray-500">Loading services...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Services Management</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Service
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Service</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Design, Development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Hours</label>
              <input
                type="number"
                value={formData.base_hours || 1}
                onChange={(e) => setFormData({ ...formData, base_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">{category}</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categoryServices.map((service) => (
                  <tr key={service.id}>
                    {editingId === service.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={formData.base_hours || 0}
                            onChange={(e) => setFormData({ ...formData, base_hours: Number(e.target.value) })}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={handleSave} className="text-blue-600 hover:text-blue-800 mr-3">Save</button>
                          <button onClick={handleCancel} className="text-gray-600 hover:text-gray-800">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{service.base_hours}h</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{service.description}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggle(service)}
                            className={`px-2 py-1 text-xs rounded-full ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {service.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-800">Edit</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
