import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useAboutData } from '../../hooks/useAboutData';
import { aboutApi } from '../../lib/aboutApi';
import { AboutSettings, AboutStat, AboutValue, AboutTimelineItem, AboutTeamMember } from '../../lib/types';
import { validateAboutSettings, validateAboutStat, validateAboutValue, validateAboutTimelineItem, validateAboutTeamMember } from '../../lib/validation';
import  AboutSettingsForm  from './forms/AboutSettingsForm';
import { ImageUploadField } from './ImageUploadField';

const AdminAbout: React.FC = () => {
  const { data, loading, error, refetch } = useAboutData();
  const [activeTab, setActiveTab] = useState<'settings' | 'stats' | 'values' | 'timeline' | 'team'>('settings');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabs = [
    { id: 'settings', label: 'Hero Settings' },
    { id: 'stats', label: 'Statistics' },
    { id: 'values', label: 'Values' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'team', label: 'Team' }
  ];

  const handleSave = async () => {
    try {
      let validationErrors: Record<string, string> = {};
      
      switch (activeTab) {
        case 'settings':
          validationErrors = validateAboutSettings(formData);
          if (Object.keys(validationErrors).length === 0) {
            await aboutApi.updateSettings(formData);
          }
          break;
        case 'stats':
          validationErrors = validateAboutStat(formData);
          if (Object.keys(validationErrors).length === 0) {
            if (editingItem) {
              await aboutApi.updateStat(editingItem.id, formData);
            } else {
              await aboutApi.createStat(formData);
            }
          }
          break;
        case 'values':
          validationErrors = validateAboutValue(formData);
          if (Object.keys(validationErrors).length === 0) {
            if (editingItem) {
              await aboutApi.updateValue(editingItem.id, formData);
            } else {
              await aboutApi.createValue(formData);
            }
          }
          break;
        case 'timeline':
          validationErrors = validateAboutTimelineItem(formData);
          if (Object.keys(validationErrors).length === 0) {
            if (editingItem) {
              await aboutApi.updateTimelineItem(editingItem.id, formData);
            } else {
              await aboutApi.createTimelineItem(formData);
            }
          }
          break;
        case 'team':
          validationErrors = validateAboutTeamMember(formData);
          if (Object.keys(validationErrors).length === 0) {
            if (editingItem) {
              await aboutApi.updateTeamMember(editingItem.id, formData);
            } else {
              await aboutApi.createTeamMember(formData);
            }
          }
          break;
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});
      setEditingItem(null);
      setIsCreating(false);
      setFormData({});
      refetch();
    } catch (error) {
      console.error('Error saving:', error);
      setErrors({ general: 'Failed to save. Please try again.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (activeTab) {
        case 'stats':
          await aboutApi.deleteStat(id);
          break;
        case 'values':
          await aboutApi.deleteValue(id);
          break;
        case 'timeline':
          await aboutApi.deleteTimelineItem(id);
          break;
        case 'team':
          await aboutApi.deleteTeamMember(id);
          break;
      }
      refetch();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsCreating(false);
    setErrors({});
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({});
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setIsCreating(false);
    setFormData({});
    setErrors({});
  };

  const renderSettingsTab = () => {
    if (!data?.settings) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Hero Section Settings</h3>
          <button
            onClick={() => startEdit(data.settings)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit2 className="w-4 h-4" />
            Edit Settings
          </button>
        </div>

        {editingItem ? (
          <AboutSettingsForm
            data={formData}
            onChange={setFormData}
            errors={errors}
            onSave={handleSave}
            onCancel={cancelEdit}
          />
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <p className="text-gray-900">{data.settings.hero_title || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <p className="text-gray-900">{data.settings.hero_subtitle || 'Not set'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
                {data.settings.hero_image_url ? (
                  <img
                    src={data.settings.hero_image_url}
                    alt="Hero"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500">No image set</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderListTab = (items: any[], type: string) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold capitalize">{type}</h3>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add {type.slice(0, -1)}
          </button>
        </div>

        {(isCreating || editingItem) && (
          <div className="bg-white p-6 border rounded-lg">
            {renderForm(type)}
          </div>
        )}

        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {renderItemPreview(item, type)}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderForm = (type: string) => {
    return (
      <div className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {errors.general}
          </div>
        )}

        {type === 'stats' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={formData.number || ''}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.number ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., 10+"
              />
              {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.label ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., Years of Experience"
              />
              {errors.label && <p className="text-red-500 text-sm mt-1">{errors.label}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Clock"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order || 10}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {type === 'values' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., Quality"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                rows={3}
                placeholder="Describe this value..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Heart"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order || 10}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {type === 'timeline' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="text"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.year ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., 2020"
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., Company Founded"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                rows={3}
                placeholder="Describe this milestone..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order || 10}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {type === 'team' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., John Doe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.position ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., CEO"
              />
              {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Brief bio..."
              />
            </div>
            <ImageUploadField
              label="Profile Image"
              value={formData.image_url || ''}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              error={errors.image_url}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order || 10}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={cancelEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderItemPreview = (item: any, type: string) => {
    switch (type) {
      case 'stats':
        return (
          <div>
            <div className="font-semibold text-lg">{item.number}</div>
            <div className="text-gray-600">{item.label}</div>
            <div className="text-sm text-gray-500">Icon: {item.icon}</div>
          </div>
        );
      case 'values':
        return (
          <div>
            <div className="font-semibold">{item.title}</div>
            <div className="text-gray-600 text-sm">{item.description}</div>
            <div className="text-sm text-gray-500">Icon: {item.icon}</div>
          </div>
        );
      case 'timeline':
        return (
          <div>
            <div className="font-semibold">{item.year} - {item.title}</div>
            <div className="text-gray-600 text-sm">{item.description}</div>
          </div>
        );
      case 'team':
        return (
          <div className="flex items-center gap-4">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-gray-600 text-sm">{item.position}</div>
              {item.description && (
                <div className="text-gray-500 text-xs mt-1">{item.description.substring(0, 100)}...</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error loading about data: {error}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">About Page Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'stats' && renderListTab(data?.stats || [], 'stats')}
        {activeTab === 'values' && renderListTab(data?.values || [], 'values')}
        {activeTab === 'timeline' && renderListTab(data?.timeline || [], 'timeline')}
        {activeTab === 'team' && renderListTab(data?.team || [], 'team')}
      </div>
    </div>
  );
};

export default AdminAbout;