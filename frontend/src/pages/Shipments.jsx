import { useEffect, useState, useCallback } from 'react';
import { shipmentService, vehicleService } from '../services';
import { Modal, ModalActions, Field, inputCls } from './Fleet';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED'];

const statusStyle = {
  PENDING:    'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-emerald-100 text-emerald-700',
  DELAYED:    'bg-red-100 text-red-700',
  CANCELLED:  'bg-gray-100 text-gray-500',
};

const emptyForm = {
  customerName: '', pickupAddress: '', deliveryAddress: '',
  vehicleId: '', estimatedArrival: '', status: 'PENDING',
};

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shipmentService.getAll({ search, status: statusFilter, page, limit: 10 });
      setShipments(res.data.shipments);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load shipments'); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const loadVehicles = async () => {
    const res = await vehicleService.getAll({ limit: 100 });
    setVehicles(res.data.vehicles);
  };

  const openCreate = async () => { await loadVehicles(); setForm(emptyForm); setModal('create'); };
  const openEdit = async (s) => {
    await loadVehicles();
    setSelected(s);
    setForm({
      customerName: s.customerName,
      pickupAddress: s.pickupAddress,
      deliveryAddress: s.deliveryAddress,
      vehicleId: s.vehicleId || '',
      estimatedArrival: s.estimatedArrival ? s.estimatedArrival.slice(0, 16) : '',
      status: s.status,
    });
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await shipmentService.create(form);
      else await shipmentService.update(selected.id, form);
      toast.success(`Shipment ${modal === 'create' ? 'created' : 'updated'}`);
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipment?')) return;
    try { await shipmentService.remove(id); toast.success('Shipment deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const f = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>
            Shipments
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{total} shipments total</p>
        </div>
        <button onClick={openCreate}
          className="bg-primary text-on-primary py-3 px-6 rounded-xl font-semibold shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          New Shipment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-stack-md">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input type="text" placeholder="Search by customer, address..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-outline-variant bg-white text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-card border border-white overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-12 bg-surface-container rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-low">
                  {['Customer', 'Pickup', 'Delivery', 'Status', 'Vehicle', 'ETA', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] block mb-2 text-outline">local_shipping</span>
                      No shipments found
                    </td>
                  </tr>
                ) : shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-low transition-all group">
                    <td className="px-6 py-4 font-body-sm font-semibold text-on-surface">{s.customerName}</td>
                    <td className="px-6 py-4 font-body-sm text-on-surface-variant max-w-[140px] truncate">{s.pickupAddress}</td>
                    <td className="px-6 py-4 font-body-sm text-on-surface-variant max-w-[140px] truncate">{s.deliveryAddress}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-label-caps text-label-caps ${statusStyle[s.status] || 'bg-gray-100 text-gray-500'}`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-data-numeric text-data-numeric text-on-surface-variant">
                      {s.vehicle?.vehicleNumber || <span className="text-outline">—</span>}
                    </td>
                    <td className="px-6 py-4 font-data-numeric text-[11px] text-on-surface-variant">
                      {s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(s)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          className="p-2 rounded-lg hover:bg-error-container text-error transition-all">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="px-6 py-4 border-t border-surface-variant flex items-center justify-between bg-surface-container-low">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Page {page} of {pages} · {total} total</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-outline-variant text-body-sm font-medium hover:bg-surface-variant disabled:opacity-40 transition-all">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages}
                className="px-4 py-2 rounded-xl border border-outline-variant text-body-sm font-medium hover:bg-surface-variant disabled:opacity-40 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'New Shipment' : 'Edit Shipment'} onClose={() => setModal(null)}>
          <Field label="Customer Name">
            <input type="text" {...f('customerName')} className={inputCls} placeholder="Acme Corp" />
          </Field>
          <Field label="Pickup Address">
            <input type="text" {...f('pickupAddress')} className={inputCls} placeholder="123 Main St, New York" />
          </Field>
          <Field label="Delivery Address">
            <input type="text" {...f('deliveryAddress')} className={inputCls} placeholder="456 Oak Ave, Los Angeles" />
          </Field>
          <Field label="Estimated Arrival">
            <input type="datetime-local" {...f('estimatedArrival')} className={inputCls} />
          </Field>
          <Field label="Assign Vehicle">
            <select {...f('vehicleId')} className={inputCls}>
              <option value="">No vehicle assigned</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.vehicleNumber} — {v.type}</option>
              ))}
            </select>
          </Field>
          {modal === 'edit' && (
            <Field label="Status">
              <select {...f('status')} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </Field>
          )}
          <ModalActions onCancel={() => setModal(null)} onSave={handleSave} saving={saving} />
        </Modal>
      )}
    </div>
  );
};

export default Shipments;
