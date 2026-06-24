import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, XCircle, X, Loader2, DoorOpen, LayoutDashboard, MapPin } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

export function SallesView() {
  const [salles, setSalles] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ libelle: '', position: '', idClasse: '' });
  const [submitting, setSubmitting] = useState(false);
  const [assignLoading, setAssignLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sal, cls] = await Promise.all([
        legacyFetch<any>(`${API}/salles`),
        legacyFetch<any>(`${API}/classes`),
      ]);
      setSalles(sal.data || []);
      setClasses(cls.data || []);
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
      await legacyFetch(`${API}/salles`, {
        method: 'POST',
        body: JSON.stringify({
          libelle: form.libelle,
          position: form.position || 'NON DEFINI',
          idClasse: form.idClasse ? parseInt(form.idClasse) : null,
        }),
      });
      setShowModal(false);
      setForm({ libelle: '', position: '', idClasse: '' });
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActif = async (idSalle: number) => {
    try {
      await legacyFetch(`${API}/salles/${idSalle}/toggle`, { method: 'PATCH' });
      fetchAll();
    } catch (e: any) { alert(e.message || 'Erreur lors du changement de statut'); }
  };

  const handleAssignClass = async (idSalle: number, idClasse: string) => {
    setAssignLoading(idSalle);
    try {
      await legacyFetch(`${API}/salles/${idSalle}/assign-class`, {
        method: 'PATCH',
        body: JSON.stringify({ idClasse: idClasse ? parseInt(idClasse) : null })
      });
      fetchAll();
    } catch (e: any) {
      alert(e.message || "Erreur d'assignation");
    } finally {
      setAssignLoading(null);
    }
  };

  const filtered = salles.filter(s =>
    s.libelle.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatut === '' || (filterStatut === 'actif' ? s.actif === 1 : s.actif !== 1))
  );

  const actives = salles.filter(s => s.actif === 1).length;
  const inactives = salles.filter(s => s.actif !== 1).length;

  if (loading) return (
    <div className="flex h-full items-center justify-center space-x-2 text-blue-600">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-medium">Chargement des salles...</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <DoorOpen className="w-8 h-8 text-blue-600 p-1.5 bg-blue-100 rounded-lg" />
            Salles de Classe
          </h1>
          <p className="text-slate-500 mt-2">
            Gérez l'infrastructure physique et assignez des salles aux classes correspondantes.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Ajouter une salle
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium text-sm uppercase tracking-wider mb-1">Total Salles</p>
              <p className="text-4xl font-extrabold">{salles.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><DoorOpen className="w-6 h-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-1">Actives / Utilisables</p>
              <p className="text-4xl font-extrabold text-emerald-500">{actives}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-1">En maintenance</p>
              <p className="text-4xl font-extrabold text-red-500">{inactives}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl"><XCircle className="w-6 h-6 text-red-500" /></div>
          </div>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 flex-1 w-full focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Rechercher une salle par nom..." 
            className="flex-1 bg-transparent outline-none text-slate-700 font-medium placeholder-slate-400" 
          />
        </div>
        <div className="relative w-full sm:w-64">
          <select 
            value={filterStatut} 
            onChange={e => setFilterStatut(e.target.value)} 
            className="w-full pl-4 pr-10 py-3 border-2 border-slate-100 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-slate-50"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Salles Actives</option>
            <option value="inactif">Salles Inactives</option>
          </select>
          <LayoutDashboard className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Liste des Salles ({filtered.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Salle</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Position</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Classe assignée</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400 font-medium text-base">Aucune salle trouvée.</td></tr>
              ) : filtered.map((s: any) => (
                <tr key={s.idSalle} className={`hover:bg-slate-50/80 transition-colors ${s.actif !== 1 ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.actif === 1 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                        <DoorOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-slate-900 font-bold text-base">{s.libelle}</span>
                        <p className="text-slate-400 text-xs">ID #{s.idSalle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {s.position}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {assignLoading === s.idSalle ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : s.actif === 1 ? (
                        <select 
                          value={s.idClasse || ''} 
                          onChange={(e) => handleAssignClass(s.idSalle, e.target.value)}
                          className={`text-sm font-bold px-3 py-2 rounded-xl border-2 outline-none cursor-pointer transition-colors appearance-none pr-8 
                            ${s.idClasse 
                              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 focus:border-blue-400' 
                              : 'bg-white border-blue-300 border-dashed text-blue-500 hover:bg-blue-50 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                            }`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '1rem 1rem'
                          }}
                        >
                          <option value="">Non assigné</option>
                          {classes.map((c: any) => (
                            <option key={c.idClasse} value={c.idClasse}>
                              {c.libelle}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold">
                          Inutilisable
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleActif(s.idSalle)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-colors ${s.actif === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                    >
                      {s.actif === 1
                        ? <><CheckCircle2 className="w-4 h-4" /><span className="text-xs font-bold">Active</span></>
                        : <><XCircle className="w-4 h-4" /><span className="text-xs font-bold">Inactive</span></>
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Nouvelle Salle</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nom de la salle</label>
                <input 
                  required 
                  value={form.libelle} 
                  onChange={e => setForm({ ...form, libelle: e.target.value })} 
                  placeholder="Ex: Salle 6, Salle D1..." 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Position / Bâtiment</label>
                <input 
                  value={form.position} 
                  onChange={e => setForm({ ...form, position: e.target.value })} 
                  placeholder="Ex: Bâtiment A, Rez-de-chaussée..." 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Classe assignée <span className="text-slate-400 font-normal">(optionnel)</span></label>
                <select 
                  value={form.idClasse} 
                  onChange={e => setForm({ ...form, idClasse: e.target.value })} 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors appearance-none bg-white"
                >
                  <option value="">-- Aucune (sera assignée plus tard) --</option>
                  {classes.map((c: any) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                </select>
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
                  {submitting ? 'Enregistrement...' : 'Enregistrer la salle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
