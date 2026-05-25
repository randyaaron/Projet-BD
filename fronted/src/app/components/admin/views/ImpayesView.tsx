import { useState, useEffect } from 'react';
import { AlertCircle, FileText, Phone, Search, Loader2, RefreshCw } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

export function ImpayesView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [el, pa] = await Promise.all([
        legacyFetch<any>(`${API}/eleves`),
        legacyFetch<any>(`${API}/paiements`),
      ]);
      setEleves(el.data || []);
      setPaiements(pa.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Calculer les impayés: élèves dont le total payé < 75000 (frais inscription)
  const FRAIS_INSCRIPTION = 75000;
  const paiementParMatricule: Record<number, number> = {};
  paiements.forEach((p: any) => {
    paiementParMatricule[p.matricule] = (paiementParMatricule[p.matricule] || 0) + Number(p.montant);
  });

  const impayes = eleves.filter((e: any) => {
    const totalPaye = paiementParMatricule[e.matricule] || 0;
    return totalPaye < FRAIS_INSCRIPTION;
  });

  const filtered = impayes.filter((e: any) =>
    `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalDu = filtered.reduce((sum, e: any) => {
    const paye = paiementParMatricule[e.matricule] || 0;
    return sum + Math.max(0, FRAIS_INSCRIPTION - paye);
  }, 0);

  if (loading) return <div className="p-6 text-slate-500">Chargement…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Impayés & Relances</h1>
          <p className="text-slate-500 text-sm mt-0.5">Élèves n'ayant pas encore payé les frais d'inscription (75 000 F)</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Impayés</p>
            <p className="text-2xl font-bold text-red-600">{totalDu.toLocaleString('fr-FR')} F</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Dossiers en retard</p>
            <p className="text-2xl font-bold text-slate-900">{impayes.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Taux de recouvrement</p>
            <p className="text-2xl font-bold text-slate-900">
              {eleves.length > 0 ? Math.round(((eleves.length - impayes.length) / eleves.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, prénom ou matricule…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-slate-700 text-sm font-semibold">{filtered.length} élève{filtered.length > 1 ? 's' : ''} avec solde impayé</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-emerald-600 text-sm font-medium">
            🎉 Aucun impayé ! Tous les élèves filtrés ont payé leurs frais.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Matricule', 'Élève', 'Sexe', 'Montant dû', 'Déjà payé', 'Reste à payer'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((e: any) => {
                const paye = paiementParMatricule[e.matricule] || 0;
                const reste = Math.max(0, FRAIS_INSCRIPTION - paye);
                return (
                  <tr key={e.matricule} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-5 py-3 text-slate-400 text-xs font-mono">{e.matricule}</td>
                    <td className="px-5 py-3">
                      <p className="text-slate-900 font-semibold">{e.nom} {e.prenom}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{e.sexe == 1 ? 'M' : 'F'}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-bold">
                        {FRAIS_INSCRIPTION.toLocaleString('fr-FR')} F
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${paye > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                        {paye.toLocaleString('fr-FR')} F
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-bold">
                        {reste.toLocaleString('fr-FR')} F
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
