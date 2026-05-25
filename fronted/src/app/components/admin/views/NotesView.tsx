import { useState, useEffect } from 'react';
import { Search, BarChart2, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';

export function NotesView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [stats, setStats] = useState({
    moyenne_ecole: null,
    total_eleves: 0,
    en_difficulte: 0,
    taux_reussite: null
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMoyennes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:8000/api/legacy/admin/moyennes`);
        if (!res.ok) throw new Error('Erreur de chargement des moyennes');
        const payload = await res.json();
        
        setEleves(payload.eleves || []);
        setStats({
          moyenne_ecole: payload.moyenne_ecole,
          total_eleves: payload.total_eleves || 0,
          en_difficulte: payload.en_difficulte || 0,
          taux_reussite: payload.taux_reussite
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    };
    fetchMoyennes();
  }, []);

  const filtered = eleves.filter(e => 
    (e.nom || '').toLowerCase().includes(search.toLowerCase()) || 
    (e.prenom || '').toLowerCase().includes(search.toLowerCase()) ||
    String(e.matricule || '').includes(search)
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Notes & Moyennes globales</h1>
          <p className="text-slate-500 text-sm mt-0.5">Suivi académique des élèves inscrits</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold">MOYENNE GLOBALE ÉCOLE</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.moyenne_ecole !== null ? `${stats.moyenne_ecole} / 20` : '—'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold">TAUX DE RÉUSSITE</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.taux_reussite !== null ? `${stats.taux_reussite}%` : '—'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold">ÉLÈVES EN DIFFICULTÉ</p>
            <p className="text-2xl font-bold text-slate-900">{stats.en_difficulte}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un élève…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Élève</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Matricule</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Absences</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Moyenne Générale</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                <p className="mt-2 text-sm">Chargement des moyennes...</p>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Aucun élève trouvé.</td></tr>
            ) : (
              filtered.map(e => (
                <tr key={e.matricule} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-900">{e.nom} {e.prenom}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs font-mono">{e.matricule}</td>
                  <td className="px-5 py-3">
                    {e.absences > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold">
                        {e.absences} absence{e.absences > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {e.moyenne_generale !== null ? (
                      <span className={`font-bold px-2 py-1 rounded text-xs ${e.moyenne_generale < 10 ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'}`}>
                        {e.moyenne_generale}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Pas de notes</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {e.statut === 'Alerte' ? (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">Alerte</span>
                    ) : e.moyenne_generale !== null ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Bon</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
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
