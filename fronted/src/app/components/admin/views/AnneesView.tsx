import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Archive, Calendar, X, Loader2 } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

export function AnneesView() {
  const [annees, setAnnees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ libelle: '', periode: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAnnees(); }, []);

  const fetchAnnees = async () => {
    setLoading(true);
    try {
      const res = await legacyFetch<any>(`${API}/annees`);
      setAnnees(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await legacyFetch(`${API}/annees`, {
        method: 'POST',
        body: JSON.stringify({ libelle: form.libelle, periode: form.periode }),
      });
      setShowModal(false);
      setForm({ libelle: '', periode: '' });
      fetchAnnees();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  // La dernière année (idAnnee le plus grand) est considérée comme active
  const maxId = Math.max(...annees.map(a => a.idAnnee || 0), 0);

  if (loading) return <div className="p-6 text-slate-500">Chargement des années académiques…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Années académiques</h1>
          <p className="text-slate-500 text-sm mt-0.5">{annees.length} années enregistrées en base de données</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Nouvelle année
        </button>
      </div>

      <div className="grid gap-4">
        {annees.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Aucune année académique enregistrée.</div>
        ) : annees.map(a => {
          const isActive = a.idAnnee === maxId;
          return (
            <div key={a.idAnnee} className={`bg-white rounded-xl border shadow-sm p-5 flex items-center gap-5 ${isActive ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-200'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-blue-600' : 'bg-slate-100'}`}>
                <Calendar className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.05rem' }}>{a.libelle}</h2>
                  {isActive && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs" style={{ fontWeight: 600 }}>
                      <CheckCircle2 className="w-3 h-3" /> Année la plus récente
                    </span>
                  )}
                  {!isActive && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-xs" style={{ fontWeight: 600 }}>
                      <Archive className="w-3 h-3" /> Archivée
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  Période : <span className="text-slate-700 font-medium">{a.periode || 'Non définie'}</span>
                </p>
                <p className="text-slate-400 text-xs mt-0.5">ID : {a.idAnnee}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Nouvelle année académique</h2>
              <button type="button" onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Libellé * (ex: 2026-2027)</label>
              <input required value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="2026-2027" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Période (ex: Sept-Juin)</label>
              <input value={form.periode} onChange={e => setForm({ ...form, periode: e.target.value })} placeholder="Sept-Juin" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
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
