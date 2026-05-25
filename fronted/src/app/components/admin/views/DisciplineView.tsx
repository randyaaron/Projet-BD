import { useState } from 'react';
import { Search, ShieldAlert, AlertTriangle, Plus, Filter, Trash2, CheckCircle2 } from 'lucide-react';

export function DisciplineView() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    matricule: '',
    type: 'Bavardage',
    gravite: 'Mineur',
    description: ''
  });

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('legacy_token') || 'demo';
      const res = await fetch(`http://localhost:8000/api/legacy/discipline`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        const payload = await res.json();
        setIncidents(payload.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('legacy_token') || 'demo';
      const res = await fetch(`http://localhost:8000/api/legacy/discipline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          matricule: Number(form.matricule),
          type: form.type,
          gravite: form.gravite,
          description: form.description
        })
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ matricule: '', type: 'Bavardage', gravite: 'Mineur', description: '' });
        fetchIncidents();
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = incidents.filter(i => 
    (i.eleve.toLowerCase().includes(search.toLowerCase()) || i.classe.toLowerCase().includes(search.toLowerCase())) &&
    (filter === '' || i.gravite === filter)
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Discipline</h1>
          <p className="text-slate-500 text-sm mt-0.5">Suivi des incidents et du comportement</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Signaler un incident
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Incidents</p>
            <p className="text-2xl font-bold text-slate-900">{incidents.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Gravité Majeure</p>
            <p className="text-2xl font-bold text-slate-900">{incidents.filter(i => i.gravite === 'Majeur').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">En attente</p>
            <p className="text-2xl font-bold text-slate-900">{incidents.filter(i => i.statut === 'En attente').length}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par élève ou classe…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700">
            <option value="">Toutes les gravités</option>
            <option value="Mineur">Mineur</option>
            <option value="Moyen">Moyen</option>
            <option value="Majeur">Majeur</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Date</th>
              <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Élève</th>
              <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Classe</th>
              <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Type</th>
              <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Gravité</th>
              <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400">Aucun incident trouvé.</td></tr>
            ) : (
              filtered.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-slate-500 text-xs">{inc.date}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{inc.eleve}</td>
                  <td className="px-5 py-4 text-slate-600">{inc.classe}</td>
                  <td className="px-5 py-4 text-slate-700">{inc.type}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border
                      ${inc.gravite === 'Mineur' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                        inc.gravite === 'Moyen' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                        'bg-red-50 text-red-600 border-red-200'}
                    `}>{inc.gravite}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-700 text-xs font-medium">{inc.statut}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-slate-900 mb-5" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Signaler un incident</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Matricule Élève</label>
                <input required type="number" value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} placeholder="Ex: 1002" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Type d'incident</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    <option value="Bavardage">Bavardage</option>
                    <option value="Retard">Retard</option>
                    <option value="Insolence">Insolence</option>
                    <option value="Bagarre">Bagarre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Gravité</label>
                  <select value={form.gravite} onChange={e => setForm({...form, gravite: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    <option value="Mineur">Mineur</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Majeur">Majeur</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" rows={3}></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 600 }}>Annuler</button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
