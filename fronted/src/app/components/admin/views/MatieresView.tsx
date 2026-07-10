import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, X, Loader2, Trash2 } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy`;

const coefColor = (c: number) => {
  if (c >= 3) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (c >= 2) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export function MatieresView() {
  const [cours, setCours] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ libelle: '', coefficient: '1', note: '20', idClasse: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cr, cls] = await Promise.all([
        legacyFetch<any>(`${API}/cours`),
        legacyFetch<any>(`${API}/classes`),
      ]);
      setCours(cr.data || []);
      setClasses(cls.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await legacyFetch(`${API}/cours`, {
        method: 'POST',
        body: JSON.stringify({
          libelle: form.libelle,
          coefficient: parseFloat(form.coefficient) || 1,
          note: parseFloat(form.note) || 20,
          idClasse: parseInt(form.idClasse),
        }),
      });
      setShowModal(false);
      setForm({ libelle: '', coefficient: '1', note: '20', idClasse: '' });
      fetchAll();
    } catch (e: any) { setError(e.message || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const filtered = cours.filter(c =>
    c.libelle.toLowerCase().includes(search.toLowerCase()) &&
    (filterClasse === '' || String(c.idClasse) === filterClasse)
  );

  // Stats: cours uniques par libellé
  const uniqueCours = [...new Set(cours.map((c: any) => c.libelle))];

  if (loading) return <div className="p-6 text-slate-500">Chargement des cours…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Cours & Matières</h1>
          <p className="text-slate-500 text-sm mt-0.5">{cours.length} cours · {uniqueCours.length} matières distinctes</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Nouveau cours
        </button>
      </div>

      {/* Stats matières distinctes */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {uniqueCours.slice(0, 10).map((libelle: string) => {
          const count = cours.filter((c: any) => c.libelle === libelle).length;
          return (
            <div key={libelle} className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-sm">
              <p className="text-xs text-slate-500 truncate">{libelle}</p>
              <p className="text-slate-900 mt-0.5" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{count} classe{count > 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une matière…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
        <select value={filterClasse} onChange={e => setFilterClasse(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Toutes les classes</option>
          {classes.map((c: any) => <option key={c.idClasse} value={String(c.idClasse)}>{c.libelle}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['ID', 'Matière', 'Classe', 'Coefficient', 'Note max'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Aucun cours trouvé.</td></tr>
            ) : filtered.map((c: any) => (
              <tr key={c.idCours} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-slate-400 text-xs">{c.idCours}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-slate-900" style={{ fontWeight: 600 }}>{c.libelle}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs" style={{ fontWeight: 600 }}>
                    {c.classeLibelle || '—'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${coefColor(c.coefficient)}`} style={{ fontWeight: 700 }}>
                    Coeff. {c.coefficient}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600 text-xs">{c.note}/20</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Ajouter un cours</h2>
              <button type="button" onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Nom de la matière *</label>
              <input required value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="Ex: Mathématiques" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Classe *</label>
              <select required value={form.idClasse} onChange={e => setForm({ ...form, idClasse: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                <option value="">-- Sélectionner --</option>
                {classes.map((c: any) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Coefficient</label>
                <input type="number" min="1" max="5" step="0.5" value={form.coefficient} onChange={e => setForm({ ...form, coefficient: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Note max</label>
                <input type="number" min="10" max="20" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>Annuler</button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Création…' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
