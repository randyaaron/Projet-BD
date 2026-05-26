import { useState, useEffect } from 'react';
import { Search, ShieldAlert, AlertTriangle, Plus, Trash2, User } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

export function DisciplineView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [form, setForm] = useState({
    matricule: '',
    points: 1,
    motif: 'Bavardage',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await legacyFetch<any[]>(`${API}/admin/discipline`);
      setEleves(data || []);
      
      if (selectedStudent) {
        const updated = data.find((e: any) => e.matricule === selectedStudent.matricule);
        if (updated) setSelectedStudent(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await legacyFetch(`${API}/admin/discipline/sanctions`, {
        method: 'POST',
        body: JSON.stringify({
          matricule: Number(form.matricule),
          points: Number(form.points),
          motif: form.motif
        })
      });
      setShowModal(false);
      setForm({ matricule: '', points: 1, motif: 'Bavardage' });
      fetchData();
    } catch (e) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteSanction = async (id: number) => {
    if (!confirm('Voulez-vous annuler ce retrait de points ?')) return;
    try {
      await legacyFetch(`${API}/admin/discipline/sanctions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = eleves.filter(i => 
    i.nom.toLowerCase().includes(search.toLowerCase()) || 
    i.classe.toLowerCase().includes(search.toLowerCase())
  );

  const totalSanctions = eleves.reduce((acc, curr) => acc + curr.sanctions.length, 0);
  const elevesAlerte = eleves.filter(e => e.points < 80).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Discipline & Points</h1>
          <p className="text-slate-500 text-sm mt-0.5">Score initial de 100 points. (-1 par absence, et autres malus configurables)</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Retirer des points
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Élèves</p>
            <p className="text-2xl font-bold text-slate-900">{eleves.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sanctions Appliquées</p>
            <p className="text-2xl font-bold text-slate-900">{totalSanctions}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Élèves en Alerte (&lt;80 pts)</p>
            <p className="text-2xl font-bold text-slate-900">{elevesAlerte}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Liste des élèves */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un élève..." className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 sticky top-0">
                  <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Matricule</th>
                  <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Élève</th>
                  <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Classe</th>
                  <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Absences</th>
                  <th className="px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Points</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">Chargement...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">Aucun élève trouvé.</td></tr>
                ) : (
                  filtered.map(e => (
                    <tr key={e.matricule} className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedStudent?.matricule === e.matricule ? 'bg-blue-50/50' : ''}`} onClick={() => setSelectedStudent(e)}>
                      <td className="px-5 py-3 text-slate-500 text-xs">{e.matricule}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{e.nom}</td>
                      <td className="px-5 py-3 text-slate-600">{e.classe}</td>
                      <td className="px-5 py-3 text-amber-600 font-medium">{e.absences}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border
                          ${e.points >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            e.points >= 80 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-red-50 text-red-700 border-red-200'}
                        `}>{e.points} / 100</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={(ev) => { ev.stopPropagation(); setForm({...form, matricule: String(e.matricule)}); setShowModal(true); }} className="text-xs text-red-600 hover:underline font-semibold">
                          Retirer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Détails de l'élève sélectionné */}
        {selectedStudent && (
          <div className="w-96 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.nom}</h3>
                <p className="text-slate-500 text-sm">{selectedStudent.classe} • Mat. {selectedStudent.matricule}</p>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold border-2
                  ${selectedStudent.points >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    selectedStudent.points >= 80 ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                    'bg-red-50 text-red-600 border-red-200'}`}>
                {selectedStudent.points}
              </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Détail des points perdus</h4>
            <ul className="space-y-3 mb-6 flex-1 overflow-y-auto">
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">-{selectedStudent.absences}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Absences cumulées</p>
                  <p className="text-xs text-slate-500">-1 point par absence globale</p>
                </div>
              </li>
              {selectedStudent.sanctions.length === 0 ? (
                <p className="text-sm text-slate-400 italic px-2 mt-4">Aucune sanction enregistrée.</p>
              ) : (
                selectedStudent.sanctions.map((s: any) => (
                  <li key={s.id} className="flex items-start gap-3 bg-red-50 p-3 rounded-lg border border-red-100 relative group">
                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">-{s.points}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900">{s.motif}</p>
                      <p className="text-xs text-red-500/80">{s.date}</p>
                    </div>
                    <button onClick={() => handleDeleteSanction(s.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            <button onClick={() => { setForm({...form, matricule: String(selectedStudent.matricule)}); setShowModal(true); }} className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors mt-auto">
              Retirer des points
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-slate-900 mb-5" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Retirer des points</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Matricule Élève</label>
                <input required type="number" value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} placeholder="Ex: 1002" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Nombre de points à retirer</label>
                <input required type="number" min="1" max="100" value={form.points} onChange={e => setForm({...form, points: Number(e.target.value)})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Motif de l'écart</label>
                <input required type="text" value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} placeholder="Ex: Bavardage, Bagarre, Retard abusif..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div className="flex gap-3 mt-6 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 600 }}>Annuler</button>
                <button type="submit" className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>Appliquer Sanction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
