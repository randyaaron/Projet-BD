import { useState, useEffect } from 'react';
import { Search, Plus, CreditCard, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';

export function PaiementsView() {
  const [payments, setPayments] = useState<any[]>([]);
  const [modes, setModes] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [annees, setAnnees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    matricule: '',
    montant: '',
    idMode: '',
    idAca: '',
    comentaire: '',
    datePaie: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pay, mod, el, ann] = await Promise.all([
        legacyFetch<any>(`${API}/paiements`),
        legacyFetch<any>(`${API}/modes`),
        legacyFetch<any>(`${API}/eleves?limit=300`),
        legacyFetch<any>(`${API}/annees`),
      ]);
      setPayments(pay.data || []);
      setModes(mod.data || []);
      setEleves(el.data || []);
      setAnnees(ann.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await legacyFetch(`${API}/paiements`, {
        method: 'POST',
        body: JSON.stringify({
          matricule: parseInt(form.matricule),
          montant: parseFloat(form.montant),
          idMode: parseInt(form.idMode) || 1,
          idAca: parseInt(form.idAca) || undefined,
          comentaire: form.comentaire || undefined,
          datePaie: form.datePaie,
        }),
      });
      setShowModal(false);
      setForm({ matricule: '', montant: '', idMode: '', idAca: '', comentaire: '', datePaie: new Date().toISOString().split('T')[0] });
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const total = payments.reduce((s, p) => s + (p.montant || 0), 0);

  const filtered = payments.filter(p => {
    const nom = `${p.nom || ''} ${p.prenom || ''}`.toLowerCase();
    const mat = String(p.matricule || '');
    return nom.includes(search.toLowerCase()) || mat.includes(search);
  });

  if (loading) return <div className="p-6 text-slate-500">Chargement des paiements…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Paiements</h1>
          <p className="text-slate-500 text-sm mt-0.5">{payments.length} paiement{payments.length > 1 ? 's' : ''} — Total collecté : <span className="text-blue-600 font-semibold">{fmt(total)}</span></p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Enregistrer un paiement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total paiements', val: fmt(total), cls: 'text-blue-700' },
          { label: 'Nombre de transactions', val: payments.length, cls: 'text-slate-900' },
          { label: 'Élèves concernés', val: new Set(payments.map(p => p.matricule)).size, cls: 'text-emerald-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className={`mt-0.5 ${s.cls}`} style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par élève ou matricule…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['#', 'Élève', 'Matricule', 'Montant', 'Mode', 'Année', 'Date', 'Commentaire'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400">Aucun paiement trouvé.</td></tr>
            ) : filtered.map((p: any) => (
              <tr key={p.idPaie} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-400 text-xs">{p.idPaie}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs flex-shrink-0" style={{ fontWeight: 700 }}>
                      {p.nom?.charAt(0)}{p.prenom?.charAt(0)}
                    </div>
                    <span className="text-slate-900" style={{ fontWeight: 600 }}>{p.nom} {p.prenom}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{p.matricule}</td>
                <td className="px-4 py-3">
                  <span className="text-emerald-700 font-semibold">{fmt(p.montant)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs" style={{ fontWeight: 600 }}>
                    {p.modeLibelle || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{p.annee || '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{p.datePaie && p.datePaie !== '0000-00-00' ? new Date(p.datePaie).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{p.comentaire !== 'INDEFINI' ? p.comentaire : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Enregistrer un paiement</h2>
              <button type="button" onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Élève *</label>
              <select required value={form.matricule} onChange={e => setForm({ ...form, matricule: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">-- Sélectionner un élève --</option>
                {eleves.map((el: any) => (
                  <option key={el.matricule} value={el.matricule}>{el.nom} {el.prenom} (#{el.matricule})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Montant (FCFA) *</label>
              <input required type="number" min="0" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="Ex: 75000" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Mode de paiement</label>
                <select value={form.idMode} onChange={e => setForm({ ...form, idMode: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  {modes.map((m: any) => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Année académique</label>
                <select value={form.idAca} onChange={e => setForm({ ...form, idAca: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  <option value="">-- Dernière en cours --</option>
                  {annees.map((a: any) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Date du paiement</label>
              <input type="date" value={form.datePaie} onChange={e => setForm({ ...form, datePaie: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Commentaire (optionnel)</label>
              <input type="text" value={form.comentaire} onChange={e => setForm({ ...form, comentaire: e.target.value })} placeholder="Pension T1, frais inscription…" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>Annuler</button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {submitting ? 'Enregistrement…' : 'Valider'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
