import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, X, Loader2, UserCheck } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

export function TitulairesView() {
  const [titulaires, setTitulaires] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [salles, setSalles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ idPers: '', idSalle: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tit, ens, sal] = await Promise.all([
        legacyFetch<any>(`${API}/titulaires`),
        legacyFetch<any>(`${API}/titulaires/enseignants`),
        legacyFetch<any>(`${API}/salles`),
      ]);
      setTitulaires(tit.data || []);
      setEnseignants(ens.data || []);
      setSalles(sal.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await legacyFetch(`${API}/titulaires`, {
        method: 'POST',
        body: JSON.stringify({
          idPers: parseInt(form.idPers),
          idSalle: parseInt(form.idSalle),
        }),
      });
      setShowModal(false);
      setForm({ idPers: '', idSalle: '' });
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'affectation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (idTitulaire: number) => {
    if (!confirm('Supprimer cette affectation ?')) return;
    await legacyFetch(`${API}/titulaires/${idTitulaire}`, { method: 'DELETE' });
    setTitulaires(prev => prev.filter(t => t.idTitulaire !== idTitulaire));
  };

  if (loading) return <div className="p-6 text-slate-500">Chargement…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Titulaires de classe</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {titulaires.length} affectation{titulaires.length > 1 ? 's' : ''} active{titulaires.length > 1 ? 's' : ''} · {enseignants.length} enseignant{enseignants.length > 1 ? 's' : ''} disponible{enseignants.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Affecter un titulaire
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Affectations actives', val: titulaires.length, cls: 'text-blue-700' },
          { label: 'Enseignants disponibles', val: enseignants.length, cls: 'text-emerald-700' },
          { label: 'Salles sans titulaire', val: salles.length - titulaires.length, cls: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className={`mt-0.5 ${s.cls}`} style={{ fontSize: '1.4rem', fontWeight: 700 }}>{Math.max(0, s.val)}</p>
          </div>
        ))}
      </div>

      {/* Liste des affectations */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-blue-500" />
          <h2 className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>Affectations actuelles</h2>
        </div>
        {titulaires.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucune affectation. Cliquez sur "Affecter un titulaire" pour commencer.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Enseignant', 'Salle', 'Classe associée', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {titulaires.map((t: any) => (
                <tr key={t.idTitulaire} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs flex-shrink-0" style={{ fontWeight: 700 }}>
                        {t.enseignantNom?.charAt(0)}{t.enseignantPrenom?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-slate-900" style={{ fontWeight: 600 }}>{t.enseignantNom} {t.enseignantPrenom}</p>
                        <p className="text-slate-400 text-xs">ID Personne #{t.idPers}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs" style={{ fontWeight: 600 }}>
                      {t.salleLibelle || `Salle #${t.idSalle}`}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {t.classeLibelle ? (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs" style={{ fontWeight: 600 }}>
                        {t.classeLibelle}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Non associée</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleRemove(t.idTitulaire)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer l'affectation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Liste enseignants disponibles */}
      {enseignants.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>Enseignants disponibles ({enseignants.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['ID', 'Nom', 'Prénom', 'Mobile', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {enseignants.map((e: any) => (
                <tr key={e.idPers} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs">{e.idPers}</td>
                  <td className="px-5 py-3 text-slate-900" style={{ fontWeight: 600 }}>{e.nom}</td>
                  <td className="px-5 py-3 text-slate-600">{e.prenom}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{e.mobile || '—'}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setForm({ idPers: String(e.idPers), idSalle: '' }); setShowModal(true); setError(''); }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Affecter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal affectation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAssign} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Affecter un titulaire</h2>
              <button type="button" onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Enseignant *</label>
              <select required value={form.idPers} onChange={e => setForm({ ...form, idPers: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">-- Sélectionner --</option>
                {enseignants.map((e: any) => (
                  <option key={e.idPers} value={e.idPers}>{e.nom} {e.prenom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Salle (classe) *</label>
              <select required value={form.idSalle} onChange={e => setForm({ ...form, idSalle: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">-- Sélectionner --</option>
                {salles.map((s: any) => (
                  <option key={s.idSalle} value={s.idSalle}>
                    {s.libelle} → {s.classeLibelle || 'Non assignée'}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>Annuler</button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Affectation…' : 'Confirmer l\'affectation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
