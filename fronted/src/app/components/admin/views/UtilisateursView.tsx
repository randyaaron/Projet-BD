import { useState, useEffect, useCallback } from 'react';
import { Shield, UserCheck, Users, UserPlus, X, Loader2, Eye, EyeOff, Search, UploadCloud, CheckCircle2 } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

type Tab = 'admins' | 'enseignants' | 'parents';
type ModalType = 'enseignant' | 'parent' | 'admin' | null;

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
  const [form, setForm] = useState({ nom: '', prenom: '', mobile: '', email: '', username: '', password: '', idCours: '', idPers: '', typeAdmin: '2', photoFile: null as File | null });
  const [selectedMatricules, setSelectedMatricules] = useState<number[]>([]);
  // Résultat de la recherche par nom de parent
  const [parentSearchResult, setParentSearchResult] = useState<{ eleves: any[], parent: any | null } | null>(null);
  const [searchingParent, setSearchingParent] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [profileType, setProfileType] = useState<'enseignant' | 'parent' | null>(null);

  const getAvatarUrl = (user: any, type: 'enseignant' | 'parent' | 'admin') => {
    if (user.photo_url && user.photo_url !== 'INDEFINI') {
      return `http://localhost:8000${user.photo_url}`;
    }
    // Generate photorealistic African AI portraits
    if (type === 'enseignant' || type === 'parent') {
      const str = `${user.nom}-${user.prenom || ''}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      return (Math.abs(hash) % 2 === 0) ? '/avatars/african_male_teacher.png' : '/avatars/african_female_teacher.png';
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.nom)}&backgroundColor=f1f5f9`;
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, c, el] = await Promise.all([
        legacyFetch<any>(`${API}/utilisateurs`),
        legacyFetch<any>(`${API}/cours`),
        legacyFetch<any>(`${API}/eleves?no_parent_account=1`),
      ]);
      setData(u);
      setCours(c.data || []);
      setEleves(el.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Recherche d'élèves par nom de parent (debounced)
  const searchParentByName = useCallback(async (nom: string) => {
    if (modalType !== 'parent' || nom.length < 3) { setParentSearchResult(null); return; }
    setSearchingParent(true);
    try {
      const res: any = await legacyFetch(`${API}/eleves/by-parent-name?nom=${encodeURIComponent(nom)}`);
      setParentSearchResult(res);
      if (res.parent) {
        setForm(prev => ({ ...prev, idPers: String(res.parent.idPers) }));
      }
      // Pré-sélectionner tous les élèves détectés
      if (res.eleves && res.eleves.length > 0) {
        setSelectedMatricules(res.eleves.map((el: any) => el.matricule));
      }
    } catch { setParentSearchResult(null); }
    finally { setSearchingParent(false); }
  }, [modalType]);

  useEffect(() => {
    if (modalType !== 'parent' || form.nom.length < 3) return;
    const t = setTimeout(() => searchParentByName(form.nom), 500);
    return () => clearTimeout(t);
  }, [form.nom, modalType, searchParentByName]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      const endpoint = modalType === 'enseignant' ? 'enseignant' : modalType === 'admin' ? 'admin' : 'parent';
      
      const formData = new FormData();
      formData.append('nom', form.nom);
      formData.append('mobile', form.mobile);
      formData.append('username', form.username);
      formData.append('password', form.password);
      
      if (modalType === 'enseignant' || modalType === 'parent') {
        formData.append('prenom', form.prenom);
        formData.append('email', form.email);
      }
      
      if (modalType === 'enseignant') {
        if (form.idCours) formData.append('idCours', form.idCours);
      } else if (modalType === 'parent') {
        if (selectedMatricules.length > 0) {
          selectedMatricules.forEach(m => formData.append('matricules[]', String(m)));
        }
        if (form.idPers) formData.append('idPers', form.idPers);
      } else if (modalType === 'admin') {
        formData.append('typeAdmin', form.typeAdmin);
      }

      if (form.photoFile) {
        formData.append('photo', form.photoFile);
      }

      const res: any = await legacyFetch(`${API}/utilisateurs/${endpoint}`, { method: 'POST', body: formData });
      setSuccess(res.message || 'Compte créé avec succès !');
      setForm({ nom: '', prenom: '', mobile: '', email: '', username: '', password: '', idCours: '', idPers: '', typeAdmin: '2', photoFile: null });
      setSelectedMatricules([]);
      setParentSearchResult(null);
      fetchAll();
      setTimeout(() => { setModalType(null); setSuccess(''); }, 2500);
    } catch (e: any) { setError(e.message || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const openModal = (type: ModalType) => {
    setModalType(type); setError(''); setSuccess('');
    setParentSearchResult(null);
    setSelectedMatricules([]);
    setForm({ nom: '', prenom: '', mobile: '', email: '', username: '', password: '', idCours: '', idPers: '', typeAdmin: '2', photoFile: null });
  };

  const handleToggle = async (id: number, source: string) => {
    try {
      await legacyFetch(`${API}/utilisateurs/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ source })
      });
      // Mettre à jour localement
      if (source === 'enseignant') {
        setData(prev => ({
          ...prev,
          enseignants: prev.enseignants.map(e => e.id === id ? { ...e, actif: e.actif ? 0 : 1 } : e)
        }));
      } else if (source === 'admin') {
        setData(prev => ({
          ...prev,
          admins: prev.admins.map(a => a.id === id ? { ...a, actif: a.actif ? 0 : 1 } : a)
        }));
      }
    } catch (e: any) { alert(e.message || 'Erreur lors de la modification du statut'); }
  };

  const typeLabel: Record<number, string> = { 1: 'Super Admin', 2: 'Administration', 3: 'Fondateur', 4: 'Directeur', 0: 'Intendant' };

  const rawRole = (localStorage.getItem('legacy_admin_type_label') || '').toLowerCase();
  const isRoot = rawRole === 'super_admin' || rawRole === '0';

  if (loading) return <div className="p-6 text-slate-500">Chargement…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Gestion des Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data.total} comptes dans le système</p>
        </div>
        <div className="flex gap-2">
          {isRoot && (
            <button onClick={() => openModal('admin')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors shadow-sm font-semibold">
              <Shield className="w-4 h-4" /> Admin
            </button>
          )}
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
                <tr key={e.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedProfile(e); setProfileType('enseignant'); }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(e, 'enseignant')} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 shadow-sm bg-white object-cover" />
                      <p className="font-semibold text-slate-900">{e.nom} {e.prenom}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block">{e.username}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{e.mobile || '—'}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{e.email || '—'}</td>
                  <td className="px-5 py-3" onClick={(event) => event.stopPropagation()}>
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
              {['Parent', 'Username', 'Mobile', 'Email', 'Élève lié', 'Statut'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {data.parents.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-sm">Aucun parent enregistré.</td></tr>
              )}
              {data.parents.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedProfile(p); setProfileType('parent'); }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(p, 'parent')} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 shadow-sm bg-white object-cover" />
                      <p className="font-semibold text-slate-900">{p.nom} {p.prenom}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3"><p className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block">{p.username || '—'}</p></td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{p.mobile || '—'}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{p.email || '—'}</td>
                  <td className="px-5 py-3">
                    {p.eleveNom ? (
                      <span className="text-xs text-slate-600 font-semibold">{p.eleveNom} {p.elevePrenom}</span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3" onClick={(event) => event.stopPropagation()}>
                    <button
                      onClick={() => handleToggle(p.id, 'parent')}
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${p.actif ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                    >
                      {p.actif ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Profil Modal Utilisateur */}
      {selectedProfile && profileType && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`relative h-24 ${profileType === 'enseignant' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
              <button onClick={() => { setSelectedProfile(null); setProfileType(null); }} className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-10 left-6">
                <img src={getAvatarUrl(selectedProfile, profileType)} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white object-cover" />
              </div>
            </div>
            
            <div className="px-6 pt-12 pb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedProfile.nom} {selectedProfile.prenom}</h2>
                  <p className={`${profileType === 'enseignant' ? 'text-emerald-600' : 'text-blue-600'} font-semibold text-sm capitalize`}>
                    {profileType} — ID {selectedProfile.id}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${selectedProfile.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedProfile.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Nom d'utilisateur</p>
                  <p className="text-slate-800 font-mono text-sm">{selectedProfile.username || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Mobile</p>
                  <p className="text-slate-800 font-medium text-sm">{selectedProfile.mobile || 'N/A'}</p>
                </div>
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Email</p>
                  <p className="text-slate-800 font-medium text-sm">{selectedProfile.email || 'N/A'}</p>
                </div>
                {profileType === 'parent' && selectedProfile.eleveNom && (
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Élève lié (Dernier)</p>
                    <p className="text-slate-800 font-medium text-sm">{selectedProfile.eleveNom} {selectedProfile.elevePrenom}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal création compte */}
      {modalType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-lg">
                {modalType === 'enseignant' ? '👩‍🏫 Créer un compte enseignant' : modalType === 'admin' ? '🛡️ Créer un compte admin' : '👨‍👩‍👧 Créer un compte parent'}
              </h2>
              <button type="button" onClick={() => setModalType(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-2 text-sm font-medium">{success}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Nom *</label>
                <div className="relative">
                  <input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value, idPers: ''})} placeholder="DUPONT" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  {searchingParent && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />}
                  {!searchingParent && modalType === 'parent' && <Search className="w-3.5 h-3.5 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2" />}
                </div>
                {/* Indicateur si un parent existant est trouvé */}
                {parentSearchResult?.parent && (
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">
                    ✓ Parent trouvé : {parentSearchResult.parent.prenom} {parentSearchResult.parent.nom} — compte sera lié
                  </p>
                )}
                {parentSearchResult && !parentSearchResult.parent && form.nom.length >= 3 && (
                  <p className="text-xs text-slate-400 mt-1">Aucun parent existant avec ce nom — nouveau compte créé</p>
                )}
              </div>
              {modalType !== 'admin' && (
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-semibold">Prénom *</label>
                  <input required value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} placeholder="Jean" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Mobile</label>
                <input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} placeholder="6XXXXXXXX" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
              </div>
              {modalType !== 'admin' && (
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-semibold">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jean@exemple.cm" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            </div>

            {modalType === 'admin' && (
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Type d'administrateur</label>
                <select value={form.typeAdmin} onChange={e => setForm({...form, typeAdmin: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  <option value="2">Administration</option>
                  <option value="0">Intendant</option>
                  <option value="4">Directeur</option>
                  <option value="3">Fondateur</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Photo de profil (Optionnel)</label>
              <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${form.photoFile ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {form.photoFile ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                      <p className="text-xs text-emerald-700 font-semibold">{form.photoFile.name}</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                      <p className="text-xs text-slate-500 font-medium">Cliquez pour importer la photo</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  if (e.target.files?.[0]) setForm(f => ({ ...f, photoFile: e.target.files![0] }));
                }} />
              </label>
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
                <label className="block text-xs text-slate-600 mb-1 font-semibold">
                  Élèves liés
                  {selectedMatricules.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">{selectedMatricules.length} sélectionné{selectedMatricules.length > 1 ? 's' : ''}</span>
                  )}
                </label>
                {/* Afficher uniquement les élèves détectés par l'API (liés au nom du parent saisi) */}
                <div className="border border-slate-200 rounded-lg overflow-y-auto max-h-40 bg-slate-50">
                  {(() => {
                    let list = eleves;
                    
                    // Filtrage strict : si on a tapé un nom (>= 3 chars), 
                    // on n'affiche QUE les élèves renvoyés par l'API (inscrits avec ce nom de parent)
                    if (form.nom.trim().length >= 3) {
                      list = parentSearchResult?.eleves || [];
                    }

                    if (list.length === 0) {
                      return <div className="p-4 text-center text-sm text-slate-500">
                        {form.nom.trim().length >= 3 
                          ? `Aucun élève inscrit avec le nom de parent "${form.nom}".`
                          : "Aucun élève."}
                      </div>;
                    }

                    return list.map((el: any) => {
                      const detected = parentSearchResult?.eleves?.some((pe: any) => pe.matricule === el.matricule);
                      const checked  = selectedMatricules.includes(el.matricule);
                      return (
                        <label
                          key={el.matricule}
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white transition-colors border-b border-slate-100 last:border-0 ${
                            detected ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setSelectedMatricules(prev =>
                              checked ? prev.filter(m => m !== el.matricule) : [...prev, el.matricule]
                            )}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{el.nom} {el.prenom}</p>
                            <p className="text-xs text-slate-400">Matricule {el.matricule}{detected ? ' — ⭐ déjà lié' : ''}</p>
                          </div>
                          {checked && <span className="text-xs text-blue-600 font-bold">✓</span>}
                        </label>
                      );
                    });
                  })()}
                </div>                {selectedMatricules.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Optionnel — vous pouvez créer le compte sans lier d'élève maintenant</p>
                )}
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
