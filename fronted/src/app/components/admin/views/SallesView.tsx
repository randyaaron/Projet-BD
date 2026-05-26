import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, XCircle, X, Loader2 } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

export function SallesView() {
  const [salles, setSalles] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ libelle: '', position: '', idClasse: '' });
  const [submitting, setSubmitting] = useState(false);
  const [assignLoading, setAssignLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sal, cls] = await Promise.all([
        legacyFetch<any>(`${API}/salles`),
        legacyFetch<any>(`${API}/classes`),
      ]);
      setSalles(sal.data || []);
      setClasses(cls.data || []);
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
      await legacyFetch(`${API}/salles`, {
        method: 'POST',
        body: JSON.stringify({
          libelle: form.libelle,
          position: form.position || 'NON DEFINI',
          idClasse: form.idClasse ? parseInt(form.idClasse) : null,
        }),
      });
      setShowModal(false);
      setForm({ libelle: '', position: '', idClasse: '' });
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActif = async (idSalle: number) => {
    try {
      await legacyFetch(`${API}/salles/${idSalle}/toggle`, { method: 'PATCH' });
      fetchAll(); // Refresh completely to get updated classes assignments
    } catch (e: any) { alert(e.message || 'Erreur lors du changement de statut'); }
  };

  const handleAssignClass = async (idSalle: number, idClasse: string) => {
    setAssignLoading(idSalle);
    try {
      await legacyFetch(`${API}/salles/${idSalle}/assign-class`, {
        method: 'PATCH',
        body: JSON.stringify({ idClasse: idClasse ? parseInt(idClasse) : null })
      });
      fetchAll(); // Refresh to update all rooms in case a class was stolen from another room
    } catch (e: any) {
      alert(e.message || "Erreur d'assignation");
    } finally {
      setAssignLoading(null);
    }
  };

  const filtered = salles.filter(s =>
    s.libelle.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatut === '' || (filterStatut === 'actif' ? s.actif === 1 : s.actif !== 1))
  );

  const actives = salles.filter(s => s.actif === 1).length;
  const inactives = salles.filter(s => s.actif !== 1).length;

  if (loading) return <div className="p-6 text-slate-500">Chargement des salles…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Salles</h1>
          <p className="text-slate-500 text-sm mt-0.5">{salles.length} salles enregistrées en base de données</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Ajouter une salle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total salles', val: salles.length, cls: 'bg-slate-50 border-slate-200 text-slate-700' },
          { label: 'Actives',     val: actives,        cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Inactives',  val: inactives,       cls: 'bg-red-50 border-red-200 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-5 py-4 ${s.cls}`}>
            <p className="text-xs uppercase tracking-wide opacity-70">{s.label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.1 }} className="mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une salle…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Toutes</option>
          <option value="actif">Actives</option>
          <option value="inactif">Inactives</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['ID', 'Salle', 'Classe assignée', 'Position', 'Statut'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Aucune salle trouvée.</td></tr>
            ) : filtered.map((s: any) => (
              <tr key={s.idSalle} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-slate-400 text-xs">{s.idSalle}</td>
                <td className="px-5 py-3 text-slate-900" style={{ fontWeight: 600 }}>{s.libelle}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {assignLoading === s.idSalle ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : s.actif === 1 ? (
                      <select 
                        value={s.idClasse || ''} 
                        onChange={(e) => handleAssignClass(s.idSalle, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer transition-colors ${s.idClasse ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        <option value="">-- Non assignée --</option>
                        {classes.map((c: any) => (
                          <option key={c.idClasse} value={c.idClasse}>
                            {c.libelle}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs" style={{ fontWeight: 600 }}>
                        Non assignée
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-500 text-xs">{s.position}</td>
                <td className="px-5 py-3">
                  <button 
                    onClick={() => handleToggleActif(s.idSalle)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${s.actif === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                  >
                    {s.actif === 1
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /><span className="text-xs" style={{ fontWeight: 600 }}>Active</span></>
                      : <><XCircle className="w-3.5 h-3.5" /><span className="text-xs" style={{ fontWeight: 600 }}>Inactive</span></>
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Ajouter une salle</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Nom de la salle</label>
                <input required value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="Ex: Salle 6, Salle D1…" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Position / Bâtiment</label>
                <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="Ex: Bâtiment A, Rez-de-chaussée…" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Classe assignée <span className="text-slate-400 font-normal">(optionnel)</span></label>
                <select value={form.idClasse} onChange={e => setForm({ ...form, idClasse: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  <option value="">-- Aucune (sera assignée plus tard) --</option>
                  {classes.map((c: any) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                </select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
