import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, School, X, Loader2 } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

const cycleColors: Record<string, string> = {
  SIL: 'bg-pink-50 text-pink-700 border-pink-200',
  CP:  'bg-blue-50 text-blue-700 border-blue-200',
  CE1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CE2: 'bg-purple-50 text-purple-700 border-purple-200',
  CM1: 'bg-amber-50 text-amber-700 border-amber-200',
  CM2: 'bg-red-50 text-red-700 border-red-200',
};

export function ClassesView() {
  const [classes, setClasses] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCycle, setFilterCycle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ libelle: '', idCycle: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cls, cyc] = await Promise.all([
        legacyFetch<any>(`${API}/classes`),
        legacyFetch<any>(`${API}/cycles`),
      ]);
      setClasses(cls.data || []);
      setCycles(cyc.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await legacyFetch(`${API}/classes`, {
        method: 'POST',
        body: JSON.stringify({ libelle: form.libelle, idCycle: parseInt(form.idCycle) || 1 }),
      });
      setShowModal(false);
      setForm({ libelle: '', idCycle: '' });
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = classes.filter(c =>
    c.libelle.toLowerCase().includes(search.toLowerCase()) &&
    (filterCycle === '' || String(c.idCycle) === filterCycle)
  );

  if (loading) return <div className="p-6 text-slate-500">Chargement des classes…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Cycles & Classes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{classes.length} classes enregistrées en base de données</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Nouvelle classe
        </button>
      </div>

      {/* Stats par cycle */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {cycles.map((c: any) => {
          const count = classes.filter(cl => cl.idCycle === c.idCycle).length;
          const color = cycleColors[c.libelle] || 'bg-slate-50 text-slate-700 border-slate-200';
          return (
            <div key={c.idCycle} className={`rounded-xl border px-4 py-3 ${color}`}>
              <p className="text-xs uppercase tracking-wide opacity-70">{c.libelle}</p>
              <p className="mt-0.5" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{count}</p>
              <p className="text-xs opacity-70">classe{count > 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une classe…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
        <select value={filterCycle} onChange={e => setFilterCycle(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Tous les cycles</option>
          {cycles.map((c: any) => <option key={c.idCycle} value={String(c.idCycle)}>{c.libelle}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>ID</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>Classe</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>Cycle</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400">Aucune classe trouvée.</td></tr>
            ) : filtered.map((cls: any) => {
              const color = cycleColors[cls.cycleLibelle] || 'bg-slate-50 text-slate-700 border-slate-200';
              return (
                <tr key={cls.idClasse} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs">{cls.idClasse}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <School className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-slate-900" style={{ fontWeight: 600 }}>{cls.libelle}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${color}`} style={{ fontWeight: 600 }}>{cls.cycleLibelle}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Nouvelle classe</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Libellé de la classe</label>
                <input required value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="Ex : SIL-A, CP-B, CE1…" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Cycle</label>
                <select required value={form.idCycle} onChange={e => setForm({ ...form, idCycle: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  <option value="">-- Sélectionner --</option>
                  {cycles.map((c: any) => <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>)}
                </select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Création…' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
