import { useEffect, useState, useCallback } from 'react';
import { driverService } from '../services';
import { Modal, ModalActions, Field, inputCls } from './Fleet';
import toast from 'react-hot-toast';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', licenseNumber: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await driverService.getAll({ search, page, limit: 10 });
      setDrivers(res.data.drivers);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (d) => {
    setSelected(d);
    setForm({ name: d.user?.name || '', phone: d.phone, licenseNumber: d.licenseNumber });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await driverService.update(selected.id, form);
      toast.success('Driver updated'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver and their account?')) return;
    try { await driverService.remove(id); toast.success('Driver deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>Driver Management</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{total} drivers registered</p>
        </div>
      </div>

      <div className="relative mb-stack-md w-full sm:w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input type="text" placeholder="Search drivers..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
      </div>

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
                  {['Name', 'Email', 'Phone', 'License', 'Vehicle', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] block mb-2 text-outline">person</span>
                      No drivers found
                    </td>
                  </tr>
                ) : drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-container-low transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {d.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-body-sm font-semibold text-on-surface">{d.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-sm text-on-surface-variant">{d.user?.email}</td>
                    <td className="px-6 py-4 font-data-numeric text-data-numeric text-on-surface-variant">{d.phone}</td>
                    <td className="px-6 py-4 font-data-numeric text-data-numeric text-on-surface-variant">{d.licenseNumber}</td>
                    <td className="px-6 py-4">
                      {d.vehicle ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full font-label-caps text-label-caps bg-primary/10 text-primary">
                          {d.vehicle.vehicleNumber}
                        </span>
                      ) : <span className="text-outline italic text-body-sm">None</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(d)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(d.id)}
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

      {modal && (
        <Modal title="Edit Driver" onClose={() => setModal(false)}>
          {[
            { key: 'name', label: 'Full Name', type: 'text' },
            { key: 'phone', label: 'Phone', type: 'tel' },
            { key: 'licenseNumber', label: 'License Number', type: 'text' },
          ].map(({ key, label, type }) => (
            <Field key={key} label={label}>
              <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
            </Field>
          ))}
          <ModalActions onCancel={() => setModal(false)} onSave={handleSave} saving={saving} />
        </Modal>
      )}
    </div>
  );
};

export default Drivers;
