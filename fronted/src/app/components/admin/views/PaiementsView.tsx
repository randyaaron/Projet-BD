import { useState, useEffect } from 'react';
import { Search, Plus, CreditCard, X, Loader2, UserPlus, AlertCircle, CheckCircle2, UploadCloud, ChevronRight, ChevronLeft, Printer } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';
const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';

const PAYMENT_TYPES = [
  { id: "Frais d'inscription", label: "Frais d'inscription", color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Tranche 1', label: 'Tranche 1', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Tranche 2', label: 'Tranche 2', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Tranche 3', label: 'Tranche 3', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const VILLES = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré',
  'Bertoua', 'Ebolowa', 'Buea', 'Kribi', 'Limbe', 'Edéa', 'Dschang', 'Foumban', 'Kumba', 'Nkongsamba'];

// Detect if class name is anglophone
const isAngloClass = (lib: string) => /grade|form|class/i.test(lib);

export function PaiementsView() {
  const [payments, setPayments] = useState<any[]>([]);
  const [modes, setModes] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receiptPayment, setReceiptPayment] = useState<any>(null);
  const [estNouvelEleve, setEstNouvelEleve] = useState(true);
  const [step, setStep] = useState(1); // 1 = élève, 2 = parent

  const rawRole = (localStorage.getItem('legacy_admin_type_label') || '').toLowerCase();
  const canCreatePayment = rawRole === 'super_admin' || rawRole === '0' || rawRole === 'secretaire' || rawRole === '3';

  const emptyForm = () => ({
    typePaiement: "Frais d'inscription",
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '1',
    section: '' as '' | 'francophone' | 'anglophone',
    idClasse: '',
    montantVerse: '',
    matricule: '',
    idMode: '',
    datePaie: new Date().toISOString().split('T')[0],
    photoFile: null as File | null,
    // Parent step 2
    parentNom: '', parentPrenom: '', parentEmail: '', parentMobile: '',
    parentPhotoFile: null as File | null,
  });
  const [form, setForm] = useState(emptyForm());

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pay, mod, el, preInsc, cl] = await Promise.all([
        legacyFetch<any>(`${API}/paiements`),
        legacyFetch<any>(`${API}/modes`),
        legacyFetch<any>(`${API}/eleves?limit=300`),
        legacyFetch<any>(`${API}/pre-inscriptions`),
        legacyFetch<any>(`${API}/classes`),
      ]);
      const validPayments = pay.data || [];
      const pendingInscriptions = (preInsc.data || []).filter((pi: any) => pi.statut === 'en_attente').map((pi: any) => ({
        idPaie: 'PRE-' + pi.id,
        nom: pi.nom,
        prenom: pi.prenom,
        matricule: 'En attente',
        comentaire: "Frais d'inscription (En attente)",
        montant: pi.montant_verse,
        modeLibelle: mod.data?.find((m: any) => m.idMode === pi.id_mode)?.libelle || 'N/A',
        datePaie: pi.date_paiement,
        annee: '—'
      }));
      setPayments([...pendingInscriptions, ...validPayments]);
      setModes(mod.data || []);
      setEleves(el.data || []);
      setClasses(cl.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };


  const isInscription = form.typePaiement === "Frais d'inscription";

  // Filtered classes by section
  const filteredClasses = classes.filter((c: any) => {
    const lib = c.libelle || '';
    if (!form.section) return true;
    if (form.section === 'anglophone') return isAngloClass(lib);
    return !isAngloClass(lib);
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nom.trim() || !form.prenom.trim()) { setError("Nom et prénom de l'élève requis."); return; }
    if (!form.montantVerse) { setError('Montant requis.'); return; }
    const montantVal = parseFloat(form.montantVerse);
    if (isInscription && montantVal > 75000) { setError("Le montant d'inscription ne peut pas dépasser 75 000 F."); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isInscription && estNouvelEleve) {
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('nom', form.nom.trim());
        formData.append('prenom', form.prenom.trim());
        if (form.dateNaissance) formData.append('date_naissance', form.dateNaissance);
        if (form.lieuNaissance) formData.append('lieu_naissance', form.lieuNaissance);
        formData.append('sexe', form.sexe);
        if (form.section) formData.append('section', form.section);
        if (form.idClasse) formData.append('id_classe', form.idClasse);
        if (form.parentNom) formData.append('parent_nom', form.parentNom);
        if (form.parentPrenom) formData.append('parent_prenom', form.parentPrenom);
        if (form.parentEmail) formData.append('parent_email', form.parentEmail);
        if (form.parentMobile) formData.append('parent_mobile', form.parentMobile);
        formData.append('montant_verse', form.montantVerse);
        formData.append('id_mode', form.idMode || '1');
        formData.append('commentaire', "Frais d'inscription");
        if (form.datePaie) formData.append('date_paiement', form.datePaie);
        if (form.photoFile) formData.append('photo', form.photoFile);
        if (form.parentPhotoFile) formData.append('parent_photo', form.parentPhotoFile);

        await legacyFetch(`${API}/pre-inscriptions`, { method: 'POST', body: formData });
        setSuccess("Pré-inscription enregistrée ! L'administration va attribuer le matricule.");
        setTimeout(() => setSuccess(''), 5000);
        setShowModal(false); setStep(1); setForm(emptyForm()); fetchAll();
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'enregistrement");
      } finally { setSubmitting(false); }

    } else {
      // Tranche 1/2/3 ou Inscription (existant) — sélection élève classique
      if (!form.matricule) { setError('Veuillez sélectionner un élève.'); return; }
      if (!form.montantVerse) { setError('Veuillez renseigner le montant.'); return; }

      const montantVal = parseFloat(form.montantVerse);

      // Calculer combien a déjà été payé pour cette rubrique spécifique
      const dejaPaye = payments
        .filter(p => String(p.matricule) === String(form.matricule) && p.comentaire === form.typePaiement)
        .reduce((sum, p) => sum + Number(p.montant), 0);

      const maxAutorise = isInscription ? 75000 : 30000;
      const resteAPayer = maxAutorise - dejaPaye;

      if (resteAPayer <= 0) {
        setError(`(${form.typePaiement}) est déjà intégralement payée.`);
        return;
      }

      if (montantVal > resteAPayer) {
        setError(`Le montant saisi dépasse le reste à payer pour la tranche (Reste: ${resteAPayer.toLocaleString('fr-FR')} F).`);
        return;
      }

      setSubmitting(true);
      try {
        await legacyFetch(`${API}/paiements`, {
          method: 'POST',
          body: JSON.stringify({
            matricule: parseInt(form.matricule),
            montant: parseFloat(form.montantVerse),
            idMode: parseInt(form.idMode) || 1,
            comentaire: form.typePaiement,
            datePaie: form.datePaie,
          }),
        });
        setSuccess('Paiement enregistré avec succès.');
        setTimeout(() => setSuccess(''), 4000);
        setShowModal(false);
        setForm(emptyForm());
        fetchAll();
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'enregistrement");
      } finally { setSubmitting(false); }
    }
  };

  const total = payments.reduce((s, p) => s + (p.montant || 0), 0);
  const filtered = payments.filter(p => {
    const nom = `${p.nom || ''} ${p.prenom || ''}`.toLowerCase();
    const mat = String(p.matricule || '');
    return nom.includes(search.toLowerCase()) || mat.includes(search);
  });

  const typeStyle = (comentaire: string) => {
    if (!comentaire) return 'bg-slate-50 text-slate-600 border-slate-200';
    if (comentaire.startsWith("Frais d'inscription")) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (comentaire.includes('Tranche 1')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (comentaire.includes('Tranche 2')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (comentaire.includes('Tranche 3')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  if (loading) return <div className="p-6 text-slate-500">Chargement des paiements…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Paiements</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {payments.length} paiement{payments.length > 1 ? 's' : ''} — Total collecté : <span className="text-blue-600 font-semibold">{fmt(total)}</span>
          </p>
        </div>
        {canCreatePayment && (
          <button
            onClick={() => { setShowModal(true); setError(''); setStep(1); setForm(emptyForm()); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" /> Enregistrer un paiement
          </button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total collecté', val: fmt(total), cls: 'text-blue-700' },
          { label: "Frais d'inscription", val: payments.filter(p => String(p.comentaire || '').startsWith('Frais')).length, cls: 'text-blue-700' },
          { label: 'Tranches', val: payments.filter(p => String(p.comentaire || '').startsWith('Tranche')).length, cls: 'text-amber-700' },
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
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par élève ou matricule…"
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['#', 'Élève', 'Matricule', 'Type', 'Montant', 'Mode', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400">Aucun paiement trouvé.</td></tr>
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
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${typeStyle(p.comentaire)}`} style={{ fontWeight: 600 }}>
                    {p.comentaire?.startsWith("Frais d'inscription") ? p.comentaire
                      : p.comentaire?.startsWith('Tranche') ? p.comentaire
                        : p.comentaire !== 'INDEFINI' ? p.comentaire : '—'}
                  </span>
                </td>
                <td className="px-4 py-3"><span className="text-emerald-700 font-semibold">{fmt(p.montant)}</span></td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs" style={{ fontWeight: 600 }}>
                    {p.modeLibelle || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {p.datePaie && p.datePaie !== '0000-00-00' ? new Date(p.datePaie).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td className="px-4 py-3">
                  {!String(p.idPaie).startsWith('PRE-') && (
                    <button
                      onClick={() => setReceiptPayment(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Imprimer le reçu"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ────────────────── REÇU MODAL ────────────────── */}
      {receiptPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReceiptPayment(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()} id="receipt-modal">
            {/* Print styles injected globally */}
            <style>{`
              @media print {
                body > *:not(#receipt-print-area) { display: none !important; }
                #receipt-print-area { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
              }
            `}</style>

            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-800">Reçu de paiement</span>
              </div>
              <button onClick={() => setReceiptPayment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt content */}
            <div id="receipt-print-area" className="p-6 space-y-5">
              {/* School header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-4">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <img src="/logo_les_genies.png" alt="Logo" className="w-10 h-10 object-contain" />
                  <div className="text-left">
                    <p className="font-black text-blue-700 text-sm uppercase tracking-wide">Les Génies</p>
                    <p className="text-slate-500 text-xs">École Primaire — Année 2025/2026</p>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-1">Yaoundé, Cameroun</p>
              </div>

              {/* Receipt title */}
              <div className="text-center">
                <p className="text-slate-500 text-xs uppercase tracking-widest">Reçu N°</p>
                <p className="font-black text-slate-900 text-2xl">#{receiptPayment.idPaie}</p>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold border ${typeStyle(receiptPayment.comentaire)}`}>
                  {receiptPayment.comentaire || 'Paiement'}
                </span>
              </div>

              {/* Details grid */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                {[
                  { label: 'Élève', value: `${receiptPayment.nom || ''} ${receiptPayment.prenom || ''}` },
                  { label: 'Matricule', value: receiptPayment.matricule || '—' },
                  { label: 'Montant versé', value: fmt(receiptPayment.montant || 0), highlight: true },
                  { label: 'Mode de paiement', value: receiptPayment.modeLibelle || 'N/A' },
                  { label: 'Date', value: receiptPayment.datePaie && receiptPayment.datePaie !== '0000-00-00' ? new Date(receiptPayment.datePaie).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Année académique', value: receiptPayment.annee || '2025/2026' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.highlight ? 'text-emerald-600 text-base' : 'text-slate-800'}`}>
                      {String(row.value)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-dashed border-slate-200 pt-4 text-center">
                <p className="text-slate-400 text-xs">Ce document tient lieu de reçu officiel.</p>
                <p className="text-slate-300 text-xs mt-0.5">Émis le {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 px-6 pb-5">
              <button
                onClick={() => setReceiptPayment(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  const printContent = document.getElementById('receipt-print-area')?.innerHTML;
                  if (!printContent) return;
                  const win = window.open('', '_blank', 'width=500,height=700');
                  if (!win) return;
                  win.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8" />
                      <title>Reçu #${receiptPayment.idPaie}</title>
                      <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; background: white; }
                        .space-y-5 > * + * { margin-top: 20px; }
                        .space-y-3 > * + * { margin-top: 12px; }
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        .border-b { border-bottom: 1px solid #e2e8f0; }
                        .border-t { border-top: 1px solid #e2e8f0; }
                        .border-dashed { border-style: dashed; }
                        .border-slate-300 { border-color: #cbd5e1; }
                        .border-slate-200 { border-color: #e2e8f0; }
                        .pb-4 { padding-bottom: 16px; }
                        .pt-4 { padding-top: 16px; }
                        .p-4 { padding: 16px; }
                        .p-6 { padding: 24px; }
                        .mb-1 { margin-bottom: 4px; }
                        .mt-1 { margin-top: 4px; }
                        .mt-0\.5 { margin-top: 2px; }
                        .flex { display: flex; }
                        .items-center { align-items: center; }
                        .justify-between { justify-content: space-between; }
                        .justify-center { justify-content: center; }
                        .gap-3 { gap: 12px; }
                        .w-10 { width: 40px; } .h-10 { height: 40px; }
                        .object-contain { object-fit: contain; }
                        .font-black { font-weight: 900; }
                        .font-bold { font-weight: 700; }
                        .font-semibold { font-weight: 600; }
                        .text-blue-700 { color: #1d4ed8; }
                        .text-slate-900 { color: #0f172a; }
                        .text-slate-800 { color: #1e293b; }
                        .text-slate-500 { color: #64748b; }
                        .text-slate-400 { color: #94a3b8; }
                        .text-slate-300 { color: #cbd5e1; }
                        .text-emerald-600 { color: #059669; }
                        .text-xs { font-size: 12px; }
                        .text-sm { font-size: 14px; }
                        .text-base { font-size: 16px; }
                        .text-2xl { font-size: 28px; }
                        .uppercase { text-transform: uppercase; }
                        .tracking-wide { letter-spacing: 0.05em; }
                        .tracking-widest { letter-spacing: 0.15em; }
                        .rounded-xl { border-radius: 12px; }
                        .rounded-full { border-radius: 9999px; }
                        .bg-slate-50 { background: #f8fafc; }
                        .inline-block { display: inline-block; }
                        .px-3 { padding-left: 12px; padding-right: 12px; }
                        .py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
                        .border { border-width: 1px; border-style: solid; }
                        .bg-blue-50 { background: #eff6ff; } .text-blue-700 { color: #1d4ed8; } .border-blue-200 { border-color: #bfdbfe; }
                        .bg-amber-50 { background: #fffbeb; } .text-amber-700 { color: #b45309; } .border-amber-200 { border-color: #fde68a; }
                        .bg-emerald-50 { background: #ecfdf5; } .text-emerald-700 { color: #047857; } .border-emerald-200 { border-color: #a7f3d0; }
                      </style>
                    </head>
                    <body>${printContent}</body>
                    </html>
                  `);
                  win.document.close();
                  win.focus();
                  win.print();
                  win.close();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <Printer className="w-4 h-4" /> Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── MODAL ────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={step === 1 && isInscription && estNouvelEleve ? handleNext : handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Enregistrer un paiement</h2>
                {isInscription && estNouvelEleve && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1 Élève</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2 Parent</span>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => { setShowModal(false); setStep(1); }}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {/* Type de paiement */}
            <div>
              <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 600 }}>Type de paiement *</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_TYPES.map(pt => (
                  <button key={pt.id} type="button"
                    onClick={() => setForm(f => ({ ...emptyForm(), typePaiement: pt.id, idMode: f.idMode, datePaie: f.datePaie }))}
                    className={`px-3 py-2.5 rounded-lg border-2 text-sm text-left transition-all ${form.typePaiement === pt.id
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── FRAIS D'INSCRIPTION : Choix Nouvel / Existant ── */}
            {isInscription && (
              <div className="flex gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input type="radio" checked={estNouvelEleve} onChange={() => setEstNouvelEleve(true)} className="accent-blue-600" />
                  Nouvel élève
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input type="radio" checked={!estNouvelEleve} onChange={() => setEstNouvelEleve(false)} className="accent-blue-600" />
                  Élève existant
                </label>
              </div>
            )}

            {/* ── STEP 1: infos élève ── */}
            {step === 1 && isInscription && estNouvelEleve && (
              <div className="space-y-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
                  <UserPlus className="w-4 h-4" /> Informations de l'élève
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Nom *</label>
                    <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                      placeholder="NOM" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Prénom *</label>
                    <input type="text" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                      placeholder="Prénom" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Date de naissance</label>
                    <input type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Sexe</label>
                    <select value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none">
                      <option value="1">Garçon</option>
                      <option value="2">Fille</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Lieu de naissance</label>
                    <select value={form.lieuNaissance} onChange={e => setForm({ ...form, lieuNaissance: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none">
                      <option value="">Sélectionner une ville…</option>
                      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  {/* Section */}
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Section</label>
                    <div className="flex gap-3">
                      {['francophone', 'anglophone'].map(s => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 capitalize">
                          <input type="radio" name="section" value={s}
                            checked={form.section === s}
                            onChange={() => setForm({ ...form, section: s as any, idSalle: '' })}
                            className="accent-blue-600" />
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </label>
                      ))}
                      {form.section && (
                        <button type="button" onClick={() => setForm({ ...form, section: '', idSalle: '' })}
                          className="text-xs text-slate-400 underline ml-auto">Réinitialiser</button>
                      )}
                    </div>
                  </div>
                  {/* Classe demandée */}
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Classe demandée</label>
                    <select value={form.idClasse}
                      onChange={e => {
                        const cls = classes.find((c: any) => String(c.idClasse) === e.target.value);
                        const lib = cls?.libelle || '';
                        const detectedSection = isAngloClass(lib) ? 'anglophone' : lib ? 'francophone' : form.section;
                        setForm({ ...form, idClasse: e.target.value, section: detectedSection as any });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none">
                      <option value="">-- Aucune (optionnel) --</option>
                      {filteredClasses.map((c: any) => (
                        <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
                      ))}
                    </select>
                    {form.section && <p className="text-xs text-blue-600 mt-1 font-medium">Section détectée : {form.section} — une salle sera assignée automatiquement.</p>}
                  </div>
                  {/* Photo élève */}
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 600 }}>Photo de l'élève (Optionnel)</label>
                    <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${form.photoFile ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 bg-slate-50 hover:bg-blue-50 hover:border-blue-400'}`}>
                      {form.photoFile ? (
                        <><CheckCircle2 className="w-5 h-5 text-emerald-500 mb-0.5" /><p className="text-xs font-semibold text-emerald-700">{form.photoFile.name}</p></>
                      ) : (
                        <><UploadCloud className="w-5 h-5 text-slate-400 mb-0.5" /><p className="text-xs text-slate-500">Cliquez pour importer</p></>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={e => setForm({ ...form, photoFile: e.target.files?.[0] || null })} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: infos parent ── */}
            {step === 2 && isInscription && estNouvelEleve && (
              <div className="space-y-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <div className="flex items-center gap-2 text-purple-700 text-xs font-bold">
                  <UserPlus className="w-4 h-4" /> Informations du parent / tuteur
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Nom du parent *</label>
                    <input type="text" value={form.parentNom} onChange={e => setForm({ ...form, parentNom: e.target.value })}
                      placeholder="NOM" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/40" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Prénom</label>
                    <input type="text" value={form.parentPrenom} onChange={e => setForm({ ...form, parentPrenom: e.target.value })}
                      placeholder="Prénom" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Email</label>
                    <input type="email" value={form.parentEmail} onChange={e => setForm({ ...form, parentEmail: e.target.value })}
                      placeholder="email@exemple.cm" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Mobile</label>
                    <input type="tel" value={form.parentMobile} onChange={e => setForm({ ...form, parentMobile: e.target.value })}
                      placeholder="6XXXXXXXX" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 600 }}>Photo du parent (Optionnel)</label>
                    <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${form.parentPhotoFile ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 bg-slate-50 hover:bg-purple-50 hover:border-purple-400'}`}>
                      {form.parentPhotoFile ? (
                        <><CheckCircle2 className="w-5 h-5 text-emerald-500 mb-0.5" /><p className="text-xs font-semibold text-emerald-700">{form.parentPhotoFile.name}</p></>
                      ) : (
                        <><UploadCloud className="w-5 h-5 text-slate-400 mb-0.5" /><p className="text-xs text-slate-500">Photo du parent (optionnel)</p></>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={e => setForm({ ...form, parentPhotoFile: e.target.files?.[0] || null })} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── TRANCHE ou ÉLÈVE EXISTANT : sélection élève ── */}
            {(!isInscription || !estNouvelEleve) && (
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Élève *</label>
                <select required value={form.matricule} onChange={e => setForm({ ...form, matricule: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <option value="">-- Sélectionner un élève --</option>
                  {eleves.map((el: any) => (
                    <option key={el.matricule} value={el.matricule}>{el.nom} {el.prenom} (#{el.matricule})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Montant + Mode + Date */}
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Montant (FCFA) *</label>
              <input required type="number" min="0" value={form.montantVerse} onChange={e => setForm({ ...form, montantVerse: e.target.value })}
                placeholder="Ex: 75000" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Mode de paiement</label>
                <select value={form.idMode} onChange={e => setForm({ ...form, idMode: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  {modes.map((m: any) => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Date du paiement</label>
                <input type="date" value={form.datePaie} onChange={e => setForm({ ...form, datePaie: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 ? (
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1 py-2.5 px-4 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
              ) : (
                <button type="button" onClick={() => { setShowModal(false); setStep(1); }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>
                  Annuler
                </button>
              )}
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {submitting ? 'Enregistrement…' : (step === 1 && isInscription && estNouvelEleve) ? 'Suivant — Infos parent' : isInscription ? 'Soumettre l\'inscription' : 'Valider le paiement'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
