import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileText, Calendar, Clock } from 'lucide-react';

const cycleColors: Record<string, string> = {
  CP: 'bg-blue-50 text-blue-700 border-blue-200',
  CE1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CE2: 'bg-purple-50 text-purple-700 border-purple-200',
  CM1: 'bg-amber-50 text-amber-700 border-amber-200',
  CM2: 'bg-red-50 text-red-700 border-red-200',
};

const typeColors: Record<string, string> = {
  'Contrôle': 'bg-blue-50 text-blue-700 border-blue-200',
  'Devoir': 'bg-amber-50 text-amber-700 border-amber-200',
  'Examen': 'bg-red-50 text-red-700 border-red-200',
  'Interrogation': 'bg-purple-50 text-purple-700 border-purple-200',
};

const statutColors: Record<string, string> = {
  'planifiée': 'bg-amber-50 text-amber-700 border-amber-200',
  'en cours': 'bg-blue-50 text-blue-700 border-blue-200',
  'corrigée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const epreuves = [
  { id: 1, titre: 'Devoir de Mathématiques', matiere: 'Mathématiques', classe: 'CM2-A', cycle: 'CM2', type: 'Devoir', date: '12 Mai 2026', heure: '08h00', duree: '2h', max: 20, statut: 'planifiée', enseignant: 'M. Koné' },
  { id: 2, titre: 'Contrôle de Français', matiere: 'Langue Française', classe: 'CE1-B', cycle: 'CE1', type: 'Contrôle', date: '10 Mai 2026', heure: '10h00', duree: '1h30', max: 20, statut: 'corrigée', enseignant: 'Mme Camara' },
  { id: 3, titre: 'Examen Trimestre 3', matiere: 'Histoire-Géo', classe: 'CM1-A', cycle: 'CM1', type: 'Examen', date: '15 Mai 2026', heure: '08h00', duree: '2h', max: 20, statut: 'planifiée', enseignant: 'M. Coulibaly' },
  { id: 4, titre: 'Interrogation Sciences', matiere: 'Sciences Naturelles', classe: 'CM2-B', cycle: 'CM2', type: 'Interrogation', date: '08 Mai 2026', heure: '14h00', duree: '45min', max: 10, statut: 'corrigée', enseignant: 'Mme Sylla' },
  { id: 5, titre: 'Devoir d\'Anglais', matiere: 'Anglais', classe: 'CM1-B', cycle: 'CM1', type: 'Devoir', date: '13 Mai 2026', heure: '10h00', duree: '1h', max: 20, statut: 'planifiée', enseignant: 'M. Traoré' },
  { id: 6, titre: 'Contrôle de Maths', matiere: 'Mathématiques', classe: 'CE2-A', cycle: 'CE2', type: 'Contrôle', date: '09 Mai 2026', heure: '08h00', duree: '1h', max: 20, statut: 'en cours', enseignant: 'M. Koné' },
];

const classes = ['CP-A', 'CP-B', 'CE1-A', 'CE1-B', 'CE2-A', 'CE2-B', 'CM1-A', 'CM1-B', 'CM2-A', 'CM2-B'];
const matieres = ['Langue Française', 'Mathématiques', 'Sciences Naturelles', 'Histoire-Géographie', 'Anglais', 'Éducation Civique'];

export function EpreuvesView() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = epreuves.filter(e =>
    (e.titre.toLowerCase().includes(search.toLowerCase()) || e.matiere.toLowerCase().includes(search.toLowerCase())) &&
    (filterType === '' || e.type === filterType) &&
    (filterStatut === '' || e.statut === filterStatut)
  );

  const stats = [
    { label: 'Total épreuves', val: epreuves.length, cls: 'text-slate-900' },
    { label: 'Planifiées', val: epreuves.filter(e => e.statut === 'planifiée').length, cls: 'text-amber-700' },
    { label: 'En cours', val: epreuves.filter(e => e.statut === 'en cours').length, cls: 'text-blue-700' },
    { label: 'Corrigées', val: epreuves.filter(e => e.statut === 'corrigée').length, cls: 'text-emerald-700' },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Épreuves</h1>
          <p className="text-slate-500 text-sm mt-0.5">Trimestre 3 · Année 2025–2026</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Créer une épreuve
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className={`mt-0.5 ${s.cls}`} style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Titre ou matière…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Tous les types</option>
          {['Contrôle', 'Devoir', 'Examen', 'Interrogation'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Tous les statuts</option>
          {['planifiée', 'en cours', 'corrigée'].map(s => <option key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Épreuve', 'Classe', 'Type', 'Date & Heure', 'Durée', 'Barème', 'Enseignant', 'Statut', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(ep => (
              <tr key={ep.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-900" style={{ fontWeight: 600 }}>{ep.titre}</p>
                      <p className="text-slate-400 text-xs">{ep.matiere}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-lg border text-xs ${cycleColors[ep.cycle]}`} style={{ fontWeight: 600 }}>{ep.classe}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${typeColors[ep.type]}`} style={{ fontWeight: 600 }}>{ep.type}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 text-xs">{ep.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-slate-400 text-xs">{ep.heure}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{ep.duree}</td>
                <td className="px-4 py-3 text-slate-700 text-xs" style={{ fontWeight: 700 }}>/ {ep.max}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{ep.enseignant}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${statutColors[ep.statut]}`} style={{ fontWeight: 600 }}>
                    {ep.statut.charAt(0).toUpperCase() + ep.statut.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Aucune épreuve trouvée.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-slate-900 mb-5" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Créer une épreuve</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Titre de l'épreuve</label>
                <input placeholder="Ex : Devoir de Mathématiques N°2" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Matière</label>
                  <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                    {matieres.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Classe</label>
                  <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                    {classes.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Type</label>
                  <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                    {['Contrôle', 'Devoir', 'Examen', 'Interrogation'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Barème (/)</label>
                  <input type="number" placeholder="20" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Date</label>
                  <input type="date" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Durée</label>
                  <input placeholder="Ex : 2h" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>Annuler</button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm" style={{ fontWeight: 600 }}>Créer l'épreuve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
