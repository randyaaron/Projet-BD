import { useState, useEffect } from 'react';
import { Search, FileOutput, CheckCircle, Send, Eye, Loader2, RefreshCw, BookOpen } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

export function BulletinsView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [rapports, setRapports] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [annees, setAnnees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [el, rp, cls, an] = await Promise.all([
        legacyFetch<any>(`${API}/eleves`),
        legacyFetch<any>(`${API}/discipline`),
        legacyFetch<any>(`${API}/classes`),
        legacyFetch<any>(`${API}/annees`),
      ]);
      setEleves(el.data || []);
      setRapports(rp.data || []);
      setClasses(cls.data || []);
      setAnnees(an.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const anneeActuelle = annees[annees.length - 1];

  // Compter les rapports par élève
  const rapportParMatricule: Record<number, number> = {};
  rapports.forEach((r: any) => {
    rapportParMatricule[r.matricule] = (rapportParMatricule[r.matricule] || 0) + 1;
  });

  const filtered = eleves.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-slate-500">Chargement des bulletins…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Bulletins scolaires</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {eleves.length} élèves · Année {anneeActuelle?.libelle || '—'} · {rapports.length} rapport{rapports.length > 1 ? 's' : ''} disciplinaire{rapports.length > 1 ? 's' : ''} enregistré{rapports.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 font-semibold">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Élèves inscrits', val: eleves.length, color: 'text-slate-900', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Garçons', val: eleves.filter(e => String(e.sexe) === '1').length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Filles', val: eleves.filter(e => String(e.sexe) === '2').length, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
          { label: 'Rapports disciplinaires', val: rapports.length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
            <p className="text-slate-500 text-xs">{s.label}</p>
            <p className={`mt-0.5 ${s.color}`} style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Info développement */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 text-sm font-semibold">Module bulletins — En cours d'intégration</p>
          <p className="text-blue-600 text-xs mt-0.5">
            Les notes sont saisies par les enseignants via leur interface. La génération PDF des bulletins sera disponible dès que les évaluations seront enregistrées dans la table <code className="bg-blue-100 px-1 rounded">Evaluation</code>.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, prénom ou matricule…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
        <select value={filterClasse} onChange={e => setFilterClasse(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Toutes les classes</option>
          {classes.map((c: any) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
        </select>
      </div>

      {/* Table élèves */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-slate-700 text-sm font-semibold">{filtered.length} élève{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['Matricule', 'Élève', 'Sexe', 'Rapports disciplinaires', 'Statut'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">Aucun élève trouvé.</td></tr>
            )}
            {filtered.map((e: any) => {
              const nbRapports = rapportParMatricule[e.matricule] || 0;
              return (
                <tr key={e.matricule} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono">{e.matricule}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${String(e.sexe) === '2' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                        {e.prenom?.charAt(0)}{e.nom?.charAt(0)}
                      </div>
                      <p className="text-slate-900 font-semibold">{e.nom} {e.prenom}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{String(e.sexe) === '2' ? '♀ Fille' : '♂ Garçon'}</td>
                  <td className="px-5 py-3">
                    {nbRapports > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold">
                        {nbRapports} rapport{nbRapports > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">Aucun</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border font-semibold ${e.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {e.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
