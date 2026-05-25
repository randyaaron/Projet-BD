import { useState, useEffect } from 'react';
import { Shield, UserCheck, Users, UserPlus, X, Loader2, Eye, EyeOff, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

type Tab = 'admins' | 'enseignants' | 'parents';
type ModalType = 'enseignant' | 'parent' | null;

export function UtilisateursView() {
  const [data, setData] = useState<any>({ admins: [], enseignants: [], parents: [], total: 0 });
  const [cours, setCours] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('enseignants');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ nom: '', prenom: '', mobile: '', email: '', username: '', password: '', idCours: '', matricule: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, c, el] = await Promise.all([
        legacyFetch<any>(`${API}/utilisateurs`),
        legacyFetch<any>(`${API}/cours`),
        legacyFetch<any>(`${API}/eleves`),
      ]);
      setData(u);
      setCours(c.data || []);
      setEleves(el.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      const endpoint = modalType === 'enseignant' ? 'enseignant' : 'parent';
      const payload = modalType === 'enseignant'
        ? { nom: form.nom, prenom: form.prenom, mobile: form.mobile, email: form.email, username: form.username, password: form.password, idCours: parseInt(form.idCours) || undefined }
        : { nom: form.nom, prenom: form.prenom, mobile: form.mobile, email: form.email, username: form.username, password: form.password, matricule: parseInt(form.matricule) || undefined };

      const res: any = await legacyFetch(`${API}/utilisateurs/${endpoint}`, { method: 'POST', body: JSON.stringify(payload) });
      setSuccess(res.message || 'Compte créé avec succès !');
      setForm({ nom: '', prenom: '', mobile: '', email: '', username: '', password: '', idCours: '', matricule: '' });
      fetchAll();
      setTimeout(() => { setModalType(null); setSuccess(''); }, 2500);
    } catch (e: any) { setError(e.message || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const openModal = (type: ModalType) => {
    setModalType(type); setError(''); setSuccess('');
    setForm({ nom: '', prenom: '', mobile: '', email: '', username: '', password: '', idCours: '', matricule: '' });
  };

  const typeLabel: Record<number, string> = { 1: 'Super Admin', 2: 'Admin', 3: 'Fondateur', 4: 'Directeur', 0: 'Secrétaire' };

  if (loading) return <div className="p-6 text-slate-500">Chargement…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Gestion des Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data.total} comptes dans le système</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openModal('enseignant')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors shadow-sm font-semibold">
            <UserPlus className="w-4 h-4" /> Enseignant
          </button>
          <button onClick={() => openModal('parent')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm font-semibold">
            <UserPlus className="w-4 h-4" /> Parent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'admins', label: 'Administrateurs', count: data.admins.length, icon: Shield, color: 'text-purple-600 bg-purple-50' },
          { key: 'enseignants', label: 'Enseignants', count: data.enseignants.length, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
          { key: 'parents', label: 'Parents', count: data.parents.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
        ].map(s => (
          <button key={s.key} onClick={() => setTab(s.key as Tab)}
            className={`bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 transition-all ${tab === s.key ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900">{s.count}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {tab === 'admins' && (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {['Nom', 'Username', 'Type', 'Mobile', 'Statut'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {data.admins.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-900">{a.nom}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs font-mono">{a.username}</td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-semibold">{typeLabel[a.role] || 'Admin'}</span></td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{a.mobile || '—'}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${a.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{a.actif ? 'Actif' : 'Inactif'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'enseignants' && (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {['Enseignant', 'Username / MDP', 'Mobile', 'Email', 'Statut'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {data.enseignants.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">Aucun enseignant.</td></tr>
              )}
              {data.enseignants.map((e: any) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {e.nom?.charAt(0)}{e.prenom?.charAt(0)}
                      </div>
                      <p className="font-semibold text-slate-900">{e.nom} {e.prenom}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block">{e.username}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{e.mobile || '—'}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{e.email || '—'}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(e.id, 'enseignant')}
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${e.actif ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      {e.actif ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'parents' && (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {['Parent', 'Username', 'Mobile', 'Email', 'Élève lié'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {data.parents.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">Aucun parent enregistré.</td></tr>
              )}
              {data.parents.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {p.nom?.charAt(0)}{p.prenom?.charAt(0)}
                      </div>
                      <p className="font-semibold text-slate-900">{p.nom} {p.prenom}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block">{p.username || '—'}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{p.mobile || '—'}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{p.email || '—'}</td>
                  <td className="px-5 py-3">
                    {p.eleveNom ? (
                      <span className="text-xs text-slate-600 font-semibold">{p.eleveNom} {p.elevePrenom}</span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal création compte */}
      {modalType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-lg">
                {modalType === 'enseignant' ? '👩‍🏫 Créer un compte enseignant' : '👨‍👩‍👧 Créer un compte parent'}
              </h2>
              <button type="button" onClick={() => setModalType(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-2 text-sm font-medium">{success}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Nom *</label>
                <input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="DUPONT" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Prénom *</label>
                <input required value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} placeholder="Jean" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Mobile</label>
                <input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} placeholder="6XXXXXXXX" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jean@exemple.cm" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Nom d'utilisateur (login) *</label>
              <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="jean.dupont" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Mot de passe *</label>
              <div className="relative">
                <input required type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 4 caractères" className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {modalType === 'enseignant' && (
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Cours principal enseigné</label>
                <select value={form.idCours} onChange={e => setForm({...form, idCours: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  <option value="">-- Sélectionner (optionnel) --</option>
                  {cours.map((c: any) => (
                    <option key={c.idCours} value={c.idCours}>{c.libelle} — {c.classeLibelle || 'Classe ?'} (coeff. {c.coefficient})</option>
                  ))}
                </select>
              </div>
            )}

            {modalType === 'parent' && (
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Élève lié (matricule)</label>
                <select value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  <option value="">-- Sélectionner l'élève --</option>
                  {eleves.map((el: any) => (
                    <option key={el.matricule} value={el.matricule}>{el.nom} {el.prenom} (mat. {el.matricule})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalType(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 font-semibold">Annuler</button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 font-semibold">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Création…' : 'Créer le compte'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
