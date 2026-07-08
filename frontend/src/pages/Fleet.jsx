import { useEffect, useState, useCallback } from 'react';
import { vehicleService, driverService } from '../services';
import toast from 'react-hot-toast';

const STATUSES = ['ACTIVE', 'IDLE', 'MAINTENANCE', 'OFFLINE'];
const TYPES = ['Truck', 'Van', 'Motorcycle', 'Car', 'Bus'];
const emptyForm = { vehicleNumber: '', type: 'Truck', status: 'IDLE' };

const statusStyle = {
  ACTIVE:      'bg-emerald-100 text-emerald-700',
  IDLE:        'bg-amber-100 text-amber-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700',
  OFFLINE:     'bg-gray-100 text-gray-500',
};

const Fleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [drivers, setDrivers] = useState([]);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getAll({ search, status: statusFilter, page, limit: 10 });
      setVehicles(res.data.vehicles);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (v) => { setSelected(v); setForm({ vehicleNumber: v.vehicleNumber, type: v.type, status: v.status }); setModal('edit'); };
  const openAssign = async (v) => {
    setSelected(v);
    const res = await driverService.getAll({ limit: 100 });
    setDrivers(res.data.drivers);
    setAssignDriverId(v.driver?.id || '');
    setModal('assign');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await vehicleService.create(form);
      else await vehicleService.update(selected.id, form);
      toast.success(`Vehicle ${modal === 'create' ? 'created' : 'updated'}`);
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    setSaving(true);
    try {
      await vehicleService.assignDriver(selected.id, assignDriverId);
      toast.success('Driver assigned'); setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Assign failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try { await vehicleService.remove(id); toast.success('Vehicle deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>Fleet Management</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{total} vehicles registered</p>
        </div>
        <button onClick={openCreate}
          className="bg-primary text-on-primary py-3 px-6 rounded-xl font-semibold shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-stack-md">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input type="text" placeholder="Search vehicles..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-outline-variant bg-white text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-card border border-white overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-12 bg-surface-container rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-low">
                  {['Vehicle #', 'Type', 'Status', 'Driver', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] block mb-2 text-outline">directions_car</span>
                      No vehicles found
                    </td>
                  </tr>
                ) : vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-container-low transition-all group">
                    <td className="px-6 py-4 font-data-numeric text-data-numeric font-bold text-on-surface">{v.vehicleNumber}</td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{v.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-label-caps text-label-caps ${statusStyle[v.status] || 'bg-gray-100 text-gray-500'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">
                      {v.driver?.user?.name || <span className="text-outline italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(v)} title="Edit"
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => openAssign(v)} title="Assign Driver"
                          className="p-2 rounded-lg hover:bg-secondary-container text-secondary transition-all">
                          <span className="material-symbols-outlined text-[18px]">person_add</span>
                        </button>
                        <button onClick={() => handleDelete(v.id)} title="Delete"
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-surface-variant flex items-center justify-between bg-surface-container-low">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Page {page} of {pages} · {total} total
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-outline-variant text-body-sm font-medium hover:bg-surface-variant disabled:opacity-40 transition-all">
                Previous
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages}
                className="px-4 py-2 rounded-xl border border-outline-variant text-body-sm font-medium hover:bg-surface-variant disabled:opacity-40 transition-all">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add Vehicle' : 'Edit Vehicle'} onClose={() => setModal(null)}>
          <Field label="Vehicle Number">
            <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
              className={inputCls} placeholder="TRK-001" />
          </Field>
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <ModalActions onCancel={() => setModal(null)} onSave={handleSave} saving={saving} />
        </Modal>
      )}

      {/* Assign Driver Modal */}
      {modal === 'assign' && (
        <Modal title={`Assign Driver — ${selected?.vehicleNumber}`} onClose={() => setModal(null)}>
          <Field label="Select Driver">
            <select value={assignDriverId} onChange={(e) => setAssignDriverId(e.target.value)} className={inputCls}>
              <option value="">Choose a driver...</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.user?.name} · {d.licenseNumber}</option>)}
            </select>
          </Field>
          <ModalActions onCancel={() => setModal(null)} onSave={handleAssign} saving={saving} saveLabel="Assign" disabled={!assignDriverId} />
        </Modal>
      )}
    </div>
  );
};

// ── Shared Modal Components ──────────────────────────────────────────────────
export const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

export const Field = ({ label, children }) => (
  <div>
    <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">{label}</label>
    {children}
  </div>
);

export const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-3xl shadow-modal w-full max-w-md p-8 space-y-5 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-md text-headline-md" style={{ fontFamily: 'Geist, sans-serif' }}>{title}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-all">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const ModalActions = ({ onCancel, onSave, saving, saveLabel = 'Save', disabled = false }) => (
  <div className="flex gap-3 pt-2">
    <button onClick={onCancel}
      className="flex-1 px-4 py-3 rounded-xl border border-outline-variant font-body-sm font-medium hover:bg-surface-container transition-all">
      Cancel
    </button>
    <button onClick={onSave} disabled={saving || disabled}
      className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-body-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98]">
      {saving ? 'Saving...' : saveLabel}
    </button>
  </div>
);

export default Fleet;
