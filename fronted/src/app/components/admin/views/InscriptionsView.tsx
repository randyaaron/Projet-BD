import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, Clock, ChevronLeft, ChevronRight, X, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';
const FRAIS_INSCRIPTION = 75000; // Montant fixe d'inscription en FCFA
const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';
const PAGE_SIZE = 10;

export function InscriptionsView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [modes, setModes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: '1',
    idClasse: '',
    // Paiement
    idMode: '1',
    montantVerse: String(FRAIS_INSCRIPTION),
    comentaire: 'Frais d\'inscription',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [el, cls, cyc, mod] = await Promise.all([
        legacyFetch<any>(`${API}/eleves?limit=300`),
        legacyFetch<any>(`${API}/classes`),
        legacyFetch<any>(`${API}/cycles`),
        legacyFetch<any>(`${API}/modes`),
      ]);
      setEleves(el.data || []);
      setClasses(cls.data || []);
      setCycles(cyc.data || []);
      setModes(mod.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredClasses = form.idClasse
    ? classes
    : classes;

  const handleSubmit = async () => {
    setError('');
    if (!form.matricule || !form.nom || !form.prenom || !form.dateNaissance || !form.lieuNaissance) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      // Étape 1 : Inscrire l'élève
      await legacyFetch(`${API}/eleves`, {
        method: 'POST',
        body: JSON.stringify({
          matricule: parseInt(form.matricule),
          nom: form.nom,
          prenom: form.prenom,
          dateNaissance: form.dateNaissance,
          lieuNaissance: form.lieuNaissance,
          sexe: parseInt(form.sexe),
        }),
      });

      // Étape 2 : Enregistrer le paiement des frais d'inscription automatiquement
      const montant = parseFloat(form.montantVerse) || FRAIS_INSCRIPTION;
      await legacyFetch(`${API}/paiements`, {
        method: 'POST',
        body: JSON.stringify({
          matricule: parseInt(form.matricule),
          montant,
          idMode: parseInt(form.idMode) || 1,
          comentaire: form.comentaire || 'Frais d\'inscription',
          datePaie: new Date().toISOString().split('T')[0],
        }),
      });

      setShowModal(false);
      setStep(1);
      setForm({
        matricule: '', nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '1', idClasse: '',
        idMode: '1', montantVerse: String(FRAIS_INSCRIPTION), comentaire: 'Frais d\'inscription',
      });
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const pages = Math.ceil(eleves.length / PAGE_SIZE) || 1;
  const paged = eleves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="p-6 text-slate-500">Chargement des inscriptions…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Inscriptions</h1>
          <p className="text-slate-500 text-sm mt-0.5">{eleves.length} élève{eleves.length > 1 ? 's' : ''} enregistré{eleves.length > 1 ? 's' : ''} · Frais d'inscription : <strong className="text-blue-600">{fmt(FRAIS_INSCRIPTION)}</strong></p>
        </div>
        <button onClick={() => { setShowModal(true); setStep(1); setError(''); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <UserPlus className="w-4 h-4" /> Inscrire un élève
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total inscrits', val: eleves.length, cls: 'text-slate-900' },
          { label: 'Actifs', val: eleves.filter(e => e.actif === 1).length, cls: 'text-emerald-700' },
          { label: 'Garçons', val: eleves.filter(e => String(e.sexe) === '1').length, cls: 'text-blue-700' },
          { label: 'Filles', val: eleves.filter(e => String(e.sexe) === '2').length, cls: 'text-pink-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className={`mt-0.5 ${s.cls}`} style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Frais fixe info */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 text-sm" style={{ fontWeight: 600 }}>Frais d'inscription fixes : {fmt(FRAIS_INSCRIPTION)}</p>
          <p className="text-blue-600 text-xs mt-0.5">Lors de chaque inscription, ce montant est automatiquement enregistré comme paiement dans la table Paiement. Les pensions mensuelles sont gérées séparément via l'onglet Paiements.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Matricule', 'Élève', 'Sexe', 'Date de naissance', 'Lieu', 'Statut'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Aucun élève. Cliquez sur "Inscrire un élève".</td></tr>
            ) : paged.map((el: any) => (
              <tr key={el.matricule} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-400 text-xs">{el.matricule}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${String(el.sexe) === '2' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`} style={{ fontWeight: 700 }}>
                      {el.nom?.charAt(0)}{el.prenom?.charAt(0)}
                    </div>
                    <span className="text-slate-900" style={{ fontWeight: 600 }}>{el.nom} {el.prenom}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{String(el.sexe) === '2' ? 'Fille' : 'Garçon'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{el.dateNaissance ? new Date(el.dateNaissance).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{el.lieuNaissance}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs w-fit ${el.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`} style={{ fontWeight: 600 }}>
                    {el.actif ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {el.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-slate-400 text-xs">{eleves.length} élève{eleves.length > 1 ? 's' : ''}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-slate-600 text-sm px-2">{page} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'inscription */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              {/* Étapes */}
              <div className="flex items-center gap-2">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`} style={{ fontWeight: 700 }}>{s}</div>
                    {s < 2 && <div className={`h-0.5 w-8 ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`} />}
                  </div>
                ))}
                <span className="text-slate-500 text-sm ml-2">{step === 1 ? 'Infos élève' : 'Frais d\'inscription'}</span>
              </div>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Matricule *</label>
                  <input required type="number" value={form.matricule} onChange={e => setForm({ ...form, matricule: e.target.value })} placeholder="Ex: 20260201" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Nom *</label>
                    <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="NOM" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Prénom *</label>
                    <input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Date de naissance *</label>
                    <input required type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Sexe *</label>
                    <select value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                      <option value="1">Garçon</option>
                      <option value="2">Fille</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Lieu de naissance *</label>
                  <input required value={form.lieuNaissance} onChange={e => setForm({ ...form, lieuNaissance: e.target.value })} placeholder="Ex: Yaoundé" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Classe (section)</label>
                  <select value={form.idClasse} onChange={e => setForm({ ...form, idClasse: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                    <option value="">-- À affecter plus tard --</option>
                    {classes.map((c: any) => {
                      const cycle = cycles.find((cy: any) => cy.idCycle === c.idCycle);
                      return <option key={c.idClasse} value={c.idClasse}>{c.libelle}{cycle ? ` (${cycle.libelle})` : ''}</option>;
                    })}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {/* Récap élève */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 space-y-1 text-sm">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-2" style={{ fontWeight: 600 }}>Récapitulatif</p>
                  <p><span className="text-slate-500">Nom :</span> <strong>{form.nom} {form.prenom}</strong></p>
                  <p><span className="text-slate-500">Matricule :</span> <strong>{form.matricule}</strong></p>
                  <p><span className="text-slate-500">Née le :</span> <strong>{form.dateNaissance}</strong> à <strong>{form.lieuNaissance}</strong></p>
                </div>

                {/* Frais fixes */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <p className="text-blue-800 text-sm" style={{ fontWeight: 700 }}>Frais d'inscription fixe : {fmt(FRAIS_INSCRIPTION)}</p>
                  <p className="text-blue-600 text-xs mt-0.5">Ce montant sera automatiquement enregistré dans la table Paiement.</p>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Montant versé (FCFA)</label>
                  <input type="number" value={form.montantVerse} onChange={e => setForm({ ...form, montantVerse: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  {parseFloat(form.montantVerse) < FRAIS_INSCRIPTION && form.montantVerse !== '' && (
                    <p className="text-amber-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Montant partiel — solde restant : {fmt(FRAIS_INSCRIPTION - parseFloat(form.montantVerse || '0'))}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Mode de paiement</label>
                  <select value={form.idMode} onChange={e => setForm({ ...form, idMode: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                    {modes.map((m: any) => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Commentaire</label>
                  <input value={form.comentaire} onChange={e => setForm({ ...form, comentaire: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
                </div>
                {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => step > 1 ? setStep(s => s - 1) : setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 600 }}>
                {step > 1 ? 'Retour' : 'Annuler'}
              </button>
              <button
                disabled={submitting || (step === 1 && (!form.matricule || !form.nom || !form.prenom || !form.dateNaissance || !form.lieuNaissance))}
                onClick={() => step < 2 ? setStep(2) : handleSubmit()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 2 ? <CheckCircle2 className="w-4 h-4" /> : null}
                {step < 2 ? 'Suivant →' : submitting ? 'Enregistrement…' : 'Valider & enregistrer en BD'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
