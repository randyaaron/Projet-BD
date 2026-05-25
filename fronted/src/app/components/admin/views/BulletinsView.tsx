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
  const [selectedBulletin, setSelectedBulletin] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);

  const openBulletin = async (matricule: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/legacy/admin/bulletin/${matricule}`);
      if (!res.ok) throw new Error('Erreur de chargement du bulletin');
      const payload = await res.json();
      setSelectedBulletin(payload);
    } catch (e) {
      console.error(e);
      alert('Impossible de charger le bulletin');
    }
  };

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
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-sm">Aucun élève trouvé.</td></tr>
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
                  <td className="px-5 py-3">
                    <button 
                      onClick={() => openBulletin(e.matricule)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Voir Bulletin
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL BULLETIN */}
      {selectedBulletin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FileOutput className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Bulletin Scolaire</h2>
                  <p className="text-sm text-slate-500">
                    {selectedBulletin.eleve.nom} {selectedBulletin.eleve.prenom} • Classe: {selectedBulletin.classe}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedBulletin(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <CheckCircle className="w-5 h-5 opacity-0 absolute" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Header Bulletin */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold">MOYENNE GÉNÉRALE</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {selectedBulletin.moyenne_generale !== null ? `${selectedBulletin.moyenne_generale}/20` : 'N/A'}
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                    {selectedBulletin.mention}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold">ASSIDUITÉ</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {selectedBulletin.total_absences}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">Absences enregistrées</p>
                </div>
              </div>

              {/* Notes table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Matière</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Moyenne</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBulletin.matieres.length === 0 ? (
                      <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">Aucune note enregistrée</td></tr>
                    ) : (
                      selectedBulletin.matieres.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{m.matiere}</td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">
                            {m.moyenne !== null ? m.moyenne : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                <Send className="w-4 h-4" /> Envoyer au parent
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <FileOutput className="w-4 h-4" /> Exporter PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
