import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';
const PAGE_SIZE = 10;


export function ElevesView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [filterSexe, setFilterSexe] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '', nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '1'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEleves();
    legacyFetch<any>(`${API}/classes`).then(r => setClassesList(r.data || [])).catch(console.error);
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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await legacyFetch('http://localhost:8000/api/legacy/eleves', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ matricule: '', nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '1' });
      fetchEleves();
    } catch (err) {
      console.error("Erreur d'ajout", err);
      alert("Erreur lors de l'ajout de l'élève");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = eleves.filter(e => {
    const fullName = `${e.nom} ${e.prenom}`.toLowerCase();
    const matricule = String(e.matricule || '');
    return (fullName.includes(search.toLowerCase()) || matricule.includes(search)) &&
           (filterSexe === '' || String(e.sexe) === filterSexe);
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
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <UserPlus className="w-4 h-4" /> Inscrire un élève
        </button>
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
        {selected.length > 0 && (
          <button className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors" style={{ fontWeight: 600 }}>
            <Trash2 className="w-4 h-4" /> Supprimer ({selected.length})
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 w-10">
                <input type="checkbox" className="rounded" onChange={e => setSelected(e.target.checked ? paged.map(el => el.matricule) : [])} />
              </th>
              {['Matricule', 'Élève', 'Classe', 'Naissance', 'Statut', ''].map(h => (
                <th key={h} className="text-left px-3 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map(el => (
              <tr key={el.matricule} className={`hover:bg-slate-50 transition-colors ${selected.includes(el.matricule) ? 'bg-blue-50/40' : ''}`}>
                <td className="px-5 py-3">
                  <input type="checkbox" checked={selected.includes(el.matricule)} onChange={() => toggleSelect(el.matricule)} className="rounded" />
                </td>
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
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs" style={{ fontWeight: 600 }}>Non Assigné</span>
                </td>
                <td className="px-3 py-3 text-slate-500 text-xs">{el.dateNaissance ? new Date(el.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${el.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`} style={{ fontWeight: 600 }}>
                    {el.actif ? 'Actif' : 'Inactif'}
                  </span>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Inscrire un élève</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Matricule</label>
                <input required value={formData.matricule} onChange={e=>setFormData({...formData, matricule: e.target.value})} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Ex: 2026101" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input required value={formData.nom} onChange={e=>setFormData({...formData, nom: e.target.value})} type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  <input required value={formData.prenom} onChange={e=>setFormData({...formData, prenom: e.target.value})} type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
                  <input required value={formData.dateNaissance} onChange={e=>setFormData({...formData, dateNaissance: e.target.value})} type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance</label>
                  <input required value={formData.lieuNaissance} onChange={e=>setFormData({...formData, lieuNaissance: e.target.value})} type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
                <select value={formData.sexe} onChange={e=>setFormData({...formData, sexe: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="1">Garçon</option>
                  <option value="2">Fille</option>
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
