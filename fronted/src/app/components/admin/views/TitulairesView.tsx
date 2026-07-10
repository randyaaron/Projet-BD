import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, X, Loader2, UserCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy`;

const getAvatarUrl = (name: string) => {
  if (!name) return '/avatars/teacher_m_1.png';
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isFemale = hash % 3 === 0;
  const num = (hash % 5) + 1;
  return isFemale ? `/avatars/teacher_f_${num}.png` : `/avatars/teacher_m_${num}.png`;
};

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
    if (!confirm('Êtes-vous sûr de vouloir retirer ce titulaire de sa classe ?')) return;
    await legacyFetch(`${API}/titulaires/${idTitulaire}`, { method: 'DELETE' });
    setTitulaires(prev => prev.filter(t => t.idTitulaire !== idTitulaire));
  };

  // FIX: Filter out teachers that are already assigned
  const assignedTeacherIds = titulaires.map(t => t.idPers);
  const availableEnseignants = enseignants.filter(e => !assignedTeacherIds.includes(e.idPers));

  if (loading) return (
    <div className="flex h-full items-center justify-center space-x-2 text-blue-600">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-medium">Chargement des affectations...</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-blue-600 p-1.5 bg-blue-100 rounded-lg" />
            Affectation des Titulaires
          </h1>
          <p className="text-slate-500 mt-2">
            Gérez quel enseignant est responsable de quelle salle de classe. Un enseignant ne peut être titulaire que d'une seule classe.
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Nouvelle Affectation
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium text-sm uppercase tracking-wider mb-1">Postes Pourvus</p>
              <p className="text-4xl font-extrabold">{titulaires.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><UserCheck className="w-6 h-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-1">Salles sans titulaire</p>
              <p className="text-4xl font-extrabold text-amber-500">{Math.max(0, salles.length - titulaires.length)}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl"><ShieldAlert className="w-6 h-6 text-amber-500" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-1">Enseignants Libres</p>
              <p className="text-4xl font-extrabold text-emerald-500">{availableEnseignants.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl"><Users className="w-6 h-6 text-emerald-500" /></div>
          </div>
        </div>
      </div>

      {/* AFFECTATIONS ACTUELLES */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-500" /> Titulaires en poste
          </h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{titulaires.length} actifs</span>
        </div>
        
        {titulaires.length === 0 ? (
          <div className="text-center py-16">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Aucune affectation pour le moment.</p>
            <p className="text-slate-400 text-sm mt-1">Cliquez sur "Nouvelle Affectation" pour commencer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {titulaires.map((t: any) => (
              <div key={t.idTitulaire} className="flex flex-col p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-shadow relative group">
                <button
                  onClick={() => handleRemove(t.idTitulaire)}
                  className="absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Retirer l'enseignant de cette classe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <img src={getAvatarUrl(t.enseignantNom)} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm" />
                  <div>
                    <p className="font-bold text-slate-900 text-lg leading-tight">{t.enseignantNom}</p>
                    <p className="text-slate-500 text-sm">{t.enseignantPrenom}</p>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase mb-0.5">Affectation</p>
                    <p className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md inline-block text-sm">
                      {t.salleLibelle || `Salle #${t.idSalle}`}
                    </p>
                  </div>
                  {t.classeLibelle && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium uppercase mb-0.5">Niveau</p>
                      <p className="font-bold text-slate-700">{t.classeLibelle}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ENSEIGNANTS DISPONIBLES */}
      {availableEnseignants.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Enseignants en attente d'affectation
            </h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{availableEnseignants.length} disponibles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Enseignant</th>
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Contact</th>
                  <th className="text-right px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availableEnseignants.map((e: any) => (
                  <tr key={e.idPers} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(e.nom)} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-bold text-slate-900">{e.nom} {e.prenom}</p>
                          <p className="text-slate-400 text-xs">ID: {e.idPers}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{e.mobile || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setForm({ idPers: String(e.idPers), idSalle: '' }); setShowModal(true); setError(''); }}
                        className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors"
                      >
                        Affecter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL AFFECTATION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form onSubmit={handleAssign} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Nouvelle Affectation</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Choisir l'enseignant</label>
                <div className="relative">
                  <select required value={form.idPers} onChange={e => setForm({ ...form, idPers: e.target.value })} className="w-full pl-4 pr-10 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors appearance-none bg-white">
                    <option value="">-- Sélectionner un enseignant --</option>
                    {availableEnseignants.map((e: any) => (
                      <option key={e.idPers} value={e.idPers}>{e.nom} {e.prenom}</option>
                    ))}
                  </select>
                  <Users className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assigner à la classe (salle)</label>
                <select required value={form.idSalle} onChange={e => setForm({ ...form, idSalle: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors bg-white">
                  <option value="">-- Sélectionner une classe --</option>
                  {salles.filter((s: any) => s.actif === 1 && s.idClasse != null && s.idClasse !== 999).map((s: any) => (
                    <option key={s.idSalle} value={s.idSalle}>
                      {s.libelle} {s.classeLibelle ? `(${s.classeLibelle})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? 'Affectation...' : 'Valider'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
