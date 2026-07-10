import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, School, X, Loader2, BookOpen } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy`;

const cycleColors: Record<string, { bg: string, text: string, border: string }> = {
  SIL: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  CP:  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  CE1: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CE2: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  CM1: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CM2: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
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

  if (loading) return (
    <div className="flex h-full items-center justify-center space-x-2 text-blue-600">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-medium">Chargement des classes...</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <School className="w-8 h-8 text-blue-600 p-1.5 bg-blue-100 rounded-lg" />
            Gestion des Classes
          </h1>
          <p className="text-slate-500 mt-2">
            Organisez les classes de l'établissement réparties par cycles d'enseignement.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Nouvelle classe
        </button>
      </div>

      {/* STATS CYCLES */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cycles.map((c: any) => {
          const count = classes.filter(cl => cl.idCycle === c.idCycle).length;
          const styling = cycleColors[c.libelle] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
          return (
            <div key={c.idCycle} className={`rounded-2xl border-2 p-4 text-center transition-transform hover:-translate-y-1 ${styling.bg} ${styling.border}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${styling.text} opacity-80`}>{c.libelle}</p>
              <p className={`text-3xl font-extrabold ${styling.text}`}>{count}</p>
              <p className={`text-xs font-medium mt-1 ${styling.text} opacity-80`}>classe{count > 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      {/* FILTRES & RECHERCHE */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 flex-1 w-full focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Rechercher une classe par nom..." 
            className="flex-1 bg-transparent outline-none text-slate-700 font-medium placeholder-slate-400" 
          />
        </div>
        <div className="relative w-full sm:w-64">
          <select 
            value={filterCycle} 
            onChange={e => setFilterCycle(e.target.value)} 
            className="w-full pl-4 pr-10 py-3 border-2 border-slate-100 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-slate-50"
          >
            <option value="">Tous les cycles</option>
            {cycles.map((c: any) => <option key={c.idCycle} value={String(c.idCycle)}>{c.libelle}</option>)}
          </select>
          <BookOpen className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Liste des Classes ({filtered.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Nom de la Classe</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Cycle</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400 font-medium text-base">Aucune classe trouvée.</td></tr>
              ) : filtered.map((cls: any) => {
                const styling = cycleColors[cls.cycleLibelle] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
                return (
                  <tr key={cls.idClasse} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-medium">#{cls.idClasse}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                          <School className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-slate-900 font-bold text-base">{cls.libelle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${styling.bg} ${styling.text} ${styling.border}`}>
                        {cls.cycleLibelle}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer la classe">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Nouvelle Classe</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Libellé de la classe</label>
                <input 
                  required 
                  value={form.libelle} 
                  onChange={e => setForm({ ...form, libelle: e.target.value })} 
                  placeholder="Ex : SIL-A, CP-B, CE1..." 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Cycle d'enseignement</label>
                <div className="relative">
                  <select 
                    required 
                    value={form.idCycle} 
                    onChange={e => setForm({ ...form, idCycle: e.target.value })} 
                    className="w-full pl-4 pr-10 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors appearance-none bg-white"
                  >
                    <option value="">-- Sélectionner un cycle --</option>
                    {cycles.map((c: any) => <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>)}
                  </select>
                  <BookOpen className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {submitting ? 'Création...' : 'Créer la classe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
