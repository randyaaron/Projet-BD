import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
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
  const [selected, setSelected] = useState<number[]>([]);

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
    // Only rooms that are active AND have a real class assigned (not null)
    const assignedRooms = sallesList.filter((s: any) => s.actif === 1 && s.idClasse);
    if (!currentClass || currentClass === 'Non assigné' || currentClass === 'Non assignée') {
      return assignedRooms; // show all available rooms when no class yet
    }
    const prefix = currentClass.split('-')[0];
    const compatible = assignedRooms.filter((s: any) => {
      const sLib = s.classeLibelle || '';
      return sLib.startsWith(prefix);
    });
    // If no compatible rooms found for this prefix, return all rooms
    return compatible.length > 0 ? compatible : assignedRooms;
  };

  const handleAssignClass = async (matricule: number, idSalle: string) => {
    if (!idSalle) return;
    setAssignLoading(String(matricule));
    try {
      await legacyFetch(`${API}/eleves/${matricule}/assign-class`, {
        method: 'POST',
        body: JSON.stringify({ idSalle: parseInt(idSalle) })
      });
      // Mettre à jour l'élève localement
      const salle = sallesList.find(s => String(s.idSalle) === idSalle);
      if (salle) {
        setEleves(prev => prev.map(e => e.matricule === matricule ? { ...e, classe: salle.classeLibelle || salle.libelle, idSalle: salle.idSalle } : e));
      } else {
        fetchEleves();
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
        // Reactivation: refresh from server to get real data
        await fetchEleves();
      } else {
        // Deactivation: optimistic update is fine
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

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const avatarColor = (sexe: number | string) => String(sexe) === '2' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700';

  if (loading) return <div className="p-6">Chargement des élèves...</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Liste des élèves (Réelle)</h1>
          <p className="text-slate-500 text-sm mt-0.5">{eleves.length} élèves inscrits en base de données</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total inscrits', val: eleves.length, cls: 'text-slate-900' },
          { label: 'Garçons', val: eleves.filter(e => String(e.sexe) === '1').length, cls: 'text-blue-700' },
          { label: 'Filles', val: eleves.filter(e => String(e.sexe) === '2').length, cls: 'text-pink-600' },
          { label: 'Inactifs', val: eleves.filter(e => !e.actif).length, cls: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className={`mt-0.5 ${s.cls}`} style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-56">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Nom, prénom ou matricule…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
        <select value={filterClasse} onChange={e => { setFilterClasse(e.target.value); setPage(1); }} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Toutes les classes</option>
          {classesList.map((c: any) => <option key={c.idClasse} value={String(c.idClasse)}>{c.libelle}</option>)}
        </select>
        <select value={filterSexe} onChange={e => { setFilterSexe(e.target.value); setPage(1); }} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Tous les sexes</option>
          <option value="1">Garçons</option>
          <option value="2">Filles</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Matricule', 'Élève', 'Classe', 'Naissance', 'Statut', ''].map(h => (
                <th key={h} className="text-left px-3 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map(el => (
              <tr key={el.matricule} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3 text-slate-500 text-xs">{el.matricule}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${avatarColor(el.sexe)}`} style={{ fontWeight: 700 }}>
                      {el.prenom?.charAt(0)}{el.nom?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-slate-900" style={{ fontWeight: 600 }}>{el.nom} {el.prenom}</p>
                      <p className="text-slate-400 text-xs">{String(el.sexe) === '2' ? 'Fille' : 'Garçon'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {assignLoading === String(el.matricule) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : !el.actif ? (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-md text-xs" style={{ fontWeight: 600 }}>
                        {el.classe || 'Non assigné'}
                      </span>
                    ) : (
                      <select
                        value={el.idSalle || ''}
                        onChange={(e) => handleAssignClass(el.matricule, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer transition-colors ${
                          el.classe ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <option value="">-- Non assigné --</option>
                        {getCompatibleSalles(el.classe).map((s: any) => (
                          <option key={s.idSalle} value={s.idSalle}>
                            {s.classeLibelle}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-500 text-xs">{el.dateNaissance ? new Date(el.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'}</td>
                <td className="px-3 py-3">
                  <button onClick={() => handleToggleActif(el.matricule)} className={`px-2 py-0.5 rounded-full text-xs border ${el.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'} transition-colors`} style={{ fontWeight: 600 }}>
                    {el.actif ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Aucun élève ne correspond à votre recherche.</div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-slate-400 text-xs">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-600 text-sm px-2">{page} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
