import React, { useState, useEffect } from 'react';
import { Store, BusinessType } from '../types';
import { storeService } from '../services/storeService';
import CreateStoreModal from './CreateStoreModal';
import EditStoreModal from './EditStoreModal';
import { BUSINESS_PRESETS } from '../src/config/businessPresets';
import StaffManagement from './StaffManagement';

export default function AdminDashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [adminTab, setAdminTab] = useState<'STORES' | 'STAFF'>('STORES');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const allStores = await storeService.getAllStores();
      setStores(allStores || []);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (newStore: Store) => {
    // Attach business type + presets if the modal didn't capture it
    let storeToUse = newStore;
    if (!newStore.businessType) {
      try {
        storeToUse = await storeService.updateStore(newStore.id, {
          businessType: 'RESTAURANT',
          features: BUSINESS_PRESETS.RESTAURANT,
        });
      } catch (e) {
        // swallow and still proceed
      }
    }
    setStores([...stores, storeToUse]);
    setShowCreateModal(false);
  };

  const handleEditStore = (updatedStore: Store) => {
    setStores(stores.map(s => s.id === updatedStore.id ? updatedStore : s));
    setSelectedStore(null);
    setShowEditModal(false);
  };

  const handleDeleteStore = async (storeId: string) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      try {
        await storeService.deleteStore(storeId);
        setStores(stores.filter(s => s.id !== storeId));
      } catch (error) {
        console.error('Failed to delete store:', error);
        alert('Failed to delete store');
      }
    }
  };

  const openEditModal = (store: Store) => {
    setSelectedStore(store);
    setShowEditModal(true);
  };

  // Module toggles removed from dashboard; handled in Create Store modal

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage all stores and locations</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Store
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setAdminTab('STORES')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${adminTab==='STORES' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300'}`}
            >
              Stores
            </button>
            <button
              onClick={() => setAdminTab('STAFF')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${adminTab==='STAFF' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300'}`}
            >
              Staff
            </button>
          </div>
        </div>
      </div>

      {/* Stats / Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {adminTab === 'STAFF' ? (
          <StaffManagement stores={stores} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="text-slate-600 text-sm font-medium">Total Stores</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stores.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <p className="text-slate-600 text-sm font-medium">Active Stores</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stores.filter(s => s.enabled).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-600">
            <p className="text-slate-600 text-sm font-medium">Disabled Stores</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stores.filter(s => !s.enabled).length}
            </p>
          </div>
        </div>

        {/* Stores List */}
        {stores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m5 0h5M9 7h.01M7 7a2 2 0 104 0 2 2 0 00-4 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">No stores yet</h3>
            <p className="text-slate-600 mt-2">Create your first store to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Create Store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => (
              <div
                key={store.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition overflow-hidden"
              >
                {/* Card Header */}
                <div className={`h-2 ${store.enabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                
                <div className="p-6">
                  {/* Store Name */}
                  <h3 className="text-xl font-bold text-slate-900">{store.name}</h3>
                  
                  {/* Status Badge */}
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      store.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {store.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Store Details */}
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-slate-900">{store.address}</p>
                        <p>{store.settings.storeAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{store.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5h18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 8h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
                      </svg>
                      <span>{store.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-slate-900">{store.settings.timezone}</span>
                    </div>
                  </div>

                  {/* Settings Badge */}
                  {store.settings && (
                    <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                      <p>✓ Store Code: {store.code}</p>
                      <p>✓ Currency: {store.settings.currency}</p>
                      <p>✓ Tax Rate: {store.settings.taxRate}%</p>
                    </div>
                  )}

                  {/* Business Type quick edit */}
                  <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
                    <span>Business:</span>
                    <select
                      className="px-2 py-1 border rounded-md text-xs border-slate-300"
                      value={store.businessType || 'RESTAURANT'}
                      onChange={async (e) => {
                        const nextType = e.target.value as BusinessType;
                        const updated = await storeService.updateStore(store.id, {
                          businessType: nextType,
                          features: BUSINESS_PRESETS[nextType],
                        });
                        setStores(prev => prev.map(s => s.id === store.id ? updated : s));
                      }}
                    >
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="SALON">Salon</option>
                      <option value="SARI_SARI">Sari-Sari</option>
                      <option value="LAUNDRY">Laundry</option>
                      <option value="PHARMACY">Pharmacy</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => openEditModal(store)}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStore(store.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateStoreModal
          onClose={() => setShowCreateModal(false)}
          onStoreCreated={handleCreateStore}
        />
      )}

      {showEditModal && selectedStore && (
        <EditStoreModal
          store={selectedStore}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStore(null);
          }}
          onStoreUpdated={handleEditStore}
        />
      )}
    </div>
  );
}
