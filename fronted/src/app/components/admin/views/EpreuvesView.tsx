import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, Clock } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

const cycleColors: Record<string, string> = {
  CP: 'bg-blue-50 text-blue-700 border-blue-200',
  CE1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CE2: 'bg-purple-50 text-purple-700 border-purple-200',
  CM1: 'bg-amber-50 text-amber-700 border-amber-200',
  CM2: 'bg-red-50 text-red-700 border-red-200',
  Inconnu: 'bg-slate-50 text-slate-700 border-slate-200',
};

const typeColors: Record<string, string> = {
  'Contrôle': 'bg-blue-50 text-blue-700 border-blue-200',
  'Devoir': 'bg-amber-50 text-amber-700 border-amber-200',
  'Examen': 'bg-red-50 text-red-700 border-red-200',
};

const statutColors: Record<string, string> = {
  'planifiée': 'bg-amber-50 text-amber-700 border-amber-200',
  'en cours': 'bg-blue-50 text-blue-700 border-blue-200',
  'corrigée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function EpreuvesView() {
  const [epreuves, setEpreuves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const data = await legacyFetch<any[]>(`${API}/admin/assessments`);
      setEpreuves(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

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
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Épreuves Programmées</h1>
          <p className="text-slate-500 text-sm mt-0.5">Aperçu en lecture seule des devoirs prévus par les enseignants.</p>
        </div>
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
          {['Contrôle', 'Devoir', 'Examen'].map(t => <option key={t}>{t}</option>)}
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
              {['Épreuve', 'Classe', 'Type', 'Date & Heure', 'Durée', 'Barème', 'Enseignant', 'Statut'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">Aucune épreuve trouvée.</td></tr>
            ) : (
              filtered.map(ep => (
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
                    <span className={`px-2 py-0.5 rounded-lg border text-xs ${cycleColors[ep.cycle] || cycleColors.Inconnu}`} style={{ fontWeight: 600 }}>{ep.classe}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full border text-xs ${typeColors[ep.type] || 'bg-slate-50 text-slate-700'}`} style={{ fontWeight: 600 }}>{ep.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    {ep.type === 'Devoir' ? (
                      <span className="text-slate-400 text-xs italic">-</span>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700 text-xs">{ep.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-slate-400 text-xs">{ep.heure}</span>
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {ep.type === 'Devoir' ? '-' : ep.duree}
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-xs" style={{ fontWeight: 700 }}>/ {ep.max}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{ep.enseignant}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full border text-xs ${statutColors[ep.statut] || statutColors.brouillon}`} style={{ fontWeight: 600 }}>
                      {ep.statut.charAt(0).toUpperCase() + ep.statut.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
