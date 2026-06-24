import { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, Trash2, ChevronLeft, ChevronRight, X, Loader2, Users, GraduationCap, MapPin, Calendar } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';
const PAGE_SIZE = 10;


export function ElevesView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sallesList, setSallesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [filterSexe, setFilterSexe] = useState('');
  const [page, setPage] = useState(1);

  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  useEffect(() => {
    fetchEleves();
    legacyFetch<any>(`${API}/classes`).then(r => setClassesList(r.data || [])).catch(console.error);
    legacyFetch<any>(`${API}/salles`).then(r => setSallesList(r.data || [])).catch(console.error);
  }, []);

  const fetchEleves = async () => {
    setLoading(true);
    try {
      const res: any = await legacyFetch(`${API}/eleves`);
      setEleves(res.data || []);
    } catch (err) {
      console.error('Erreur de chargement des élèves', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompatibleSalles = (currentClass: string) => {
    const assignedRooms = sallesList.filter((s: any) => s.actif === 1 && s.idClasse && s.idClasse !== 999);
    if (!currentClass || currentClass === 'Non assigné' || currentClass === 'Non assignée') {
      return assignedRooms;
    }
    const prefix = currentClass.split('-')[0];
    const compatible = assignedRooms.filter((s: any) => {
      const sLib = s.classeLibelle || '';
      return sLib.startsWith(prefix);
    });
    return compatible.length > 0 ? compatible : assignedRooms;
  };

  const handleAssignClass = async (matricule: number, idSalle: string) => {
    setAssignLoading(String(matricule));
    try {
      await legacyFetch(`${API}/eleves/${matricule}/assign-class`, {
        method: 'POST',
        body: JSON.stringify({ idSalle: idSalle ? parseInt(idSalle) : null })
      });
      if (!idSalle) {
        setEleves(prev => prev.map(e => e.matricule === matricule ? { ...e, classe: null, idSalle: null } : e));
      } else {
        const salle = sallesList.find(s => String(s.idSalle) === idSalle);
        if (salle) {
          setEleves(prev => prev.map(e => e.matricule === matricule ? { ...e, classe: salle.classeLibelle || salle.libelle, idSalle: salle.idSalle } : e));
        } else {
          fetchEleves();
        }
      }
    } catch (err) {
      console.error("Erreur d'assignation", err);
      alert("Impossible d'assigner la classe.");
    } finally {
      setAssignLoading(null);
    }
  };

  const handleToggleActif = async (matricule: number) => {
    const eleve = eleves.find(e => e.matricule === matricule);
    const willBeActive = eleve ? !eleve.actif : false;
    try {
      await legacyFetch(`${API}/eleves/${matricule}/toggle`, { method: 'PATCH' });
      if (willBeActive) {
        await fetchEleves();
      } else {
        setEleves(prev => prev.map(e => e.matricule === matricule ? {
          ...e,
          actif: 0,
          idSalle: null,
          classe: null
        } : e));
      }
    } catch (e: any) { alert(e.message || 'Erreur lors du changement de statut'); }
  };

  const filtered = eleves.filter(e => {
    const fullName = `${e.nom} ${e.prenom}`.toLowerCase();
    const matricule = String(e.matricule || '');
    const matchSearch = fullName.includes(search.toLowerCase()) || matricule.includes(search);
    const matchSexe = filterSexe === '' || String(e.sexe) === filterSexe;
    const matchClasse = filterClasse === '' || String(e.idClasse) === filterClasse;
    return matchSearch && matchSexe && matchClasse;
  });

  const pages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getAvatarUrl = (nom: string, prenom: string, sexe: number | string) => {
    const isGirl = String(sexe) === '2';
    return isGirl ? '/avatars/african_girl_student.png' : '/avatars/african_boy_student.png';
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center space-x-2 text-blue-600">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-medium">Chargement des élèves...</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600 p-1.5 bg-blue-100 rounded-lg" />
            Gestion des Élèves
          </h1>
          <p className="text-slate-500 mt-2">
            Consultez la liste des élèves, assignez-les à des classes et gérez leurs statuts.
          </p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total inscrits', val: eleves.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Garçons', val: eleves.filter(e => String(e.sexe) === '1').length, icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
          { label: 'Filles', val: eleves.filter(e => String(e.sexe) === '2').length, icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
          { label: 'Inactifs', val: eleves.filter(e => !e.actif).length, icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`bg-white rounded-2xl shadow-sm border ${s.border} p-5 flex items-center gap-4 transition-transform hover:-translate-y-1`}>
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <Icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTRES */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 flex-1 w-full focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Rechercher par nom, prénom ou matricule..." 
            className="flex-1 bg-transparent outline-none text-slate-700 font-medium placeholder-slate-400" 
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <select 
              value={filterClasse} 
              onChange={e => { setFilterClasse(e.target.value); setPage(1); }} 
              className="w-full pl-4 pr-10 py-3 border-2 border-slate-100 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-slate-50"
            >
              <option value="">Toutes les classes</option>
              {classesList.map((c: any) => <option key={c.idClasse} value={String(c.idClasse)}>{c.libelle}</option>)}
            </select>
            <GraduationCap className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative flex-1 sm:w-40">
            <select 
              value={filterSexe} 
              onChange={e => { setFilterSexe(e.target.value); setPage(1); }} 
              className="w-full pl-4 pr-10 py-3 border-2 border-slate-100 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-slate-50"
            >
              <option value="">Tous sexes</option>
              <option value="1">Garçons</option>
              <option value="2">Filles</option>
            </select>
            <Users className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['Matricule', 'Élève', 'Classe assignée', 'Naissance', 'Statut', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map(el => (
              <tr key={el.matricule} className={`hover:bg-slate-50/80 transition-colors ${!el.actif ? 'opacity-70' : ''}`}>
                <td className="px-6 py-4 text-slate-400 font-mono font-medium">{el.matricule}</td>
                <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedProfile(el)}>
                  <div className="flex items-center gap-4 group">
                    <div className="relative">
                      <img src={getAvatarUrl(el.nom, el.prenom, el.sexe)} alt="Avatar" className="w-12 h-12 rounded-xl border-2 border-slate-100 shadow-sm object-cover group-hover:border-blue-400 transition-colors bg-white" />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${el.actif ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors text-base">{el.nom} {el.prenom}</p>
                      <p className="text-slate-400 text-xs font-medium">{String(el.sexe) === '2' ? 'Fille' : 'Garçon'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {assignLoading === String(el.matricule) ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border-2 border-blue-100">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-xs font-bold text-blue-600">Assignation...</span>
                      </div>
                    ) : !el.actif ? (
                      <span className="px-3 py-2 bg-slate-50 text-slate-400 border-2 border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {el.classe || 'Non assigné'}
                      </span>
                    ) : (
                      <div className="relative group">
                        <select
                          value={el.idSalle || ''}
                          onChange={(e) => handleAssignClass(el.matricule, e.target.value)}
                          className={`text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl border-2 outline-none cursor-pointer transition-all appearance-none shadow-sm group-hover:shadow-md
                            ${el.classe 
                              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20' 
                              : 'bg-white border-blue-300 border-dashed text-blue-500 hover:border-blue-400 hover:bg-blue-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                            }`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '1rem 1rem'
                          }}
                        >
                          <option value="">Non assigné</option>
                          {getCompatibleSalles(el.classe).map((s: any) => (
                            <option key={s.idSalle} value={s.idSalle}>
                              {s.classeLibelle} (Salle: {s.libelle})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {el.dateNaissance ? new Date(el.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleActif(el.matricule)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all hover:-translate-y-0.5 ${
                      el.actif 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:shadow-sm' 
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:shadow-sm'
                    }`}
                  >
                    {el.actif ? 'Compte Actif' : 'Désactivé'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelectedProfile(el)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-colors font-bold flex items-center gap-2">
                    <Eye className="w-4 h-4" /> <span className="text-xs">Profil</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun élève ne correspond à votre recherche.</p>
          </div>
        )}
        
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-slate-500 text-sm font-medium">
              Affichage de {paged.length} sur {filtered.length} élèves
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-colors shadow-sm">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-slate-700 font-bold px-3">Page {page} sur {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-colors shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profil Modal Élève */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
              <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors backdrop-blur-md">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-12 left-8">
                <img src={getAvatarUrl(selectedProfile.nom, selectedProfile.prenom, selectedProfile.sexe)} alt="Profile" className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-white object-cover" />
              </div>
            </div>

            <div className="px-8 pt-16 pb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">{selectedProfile.nom} {selectedProfile.prenom}</h2>
                  <p className="text-blue-600 font-bold mt-1">Matricule : {selectedProfile.matricule}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${selectedProfile.actif ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {selectedProfile.actif ? 'Compte Actif' : 'Compte Inactif'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Users className="w-4 h-4" /> Sexe</p>
                  <p className="text-slate-800 font-bold">{String(selectedProfile.sexe) === '2' ? 'Féminin' : 'Masculin'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Classe</p>
                  <p className="text-slate-800 font-bold">{selectedProfile.classe || 'Non assignée'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date de naissance</p>
                  <p className="text-slate-800 font-bold">{selectedProfile.dateNaissance ? new Date(selectedProfile.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><MapPin className="w-4 h-4" /> Lieu de naissance</p>
                  <p className="text-slate-800 font-bold">{selectedProfile.lieuNaissance || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
