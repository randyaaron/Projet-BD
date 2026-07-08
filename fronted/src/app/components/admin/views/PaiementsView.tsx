import { useState, useEffect } from 'react';
import { Search, Plus, CreditCard, X, Loader2, UserPlus, AlertCircle, CheckCircle2, UploadCloud, ImageIcon } from 'lucide-react';
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

export function PaiementsView() {
  const [payments, setPayments] = useState<any[]>([]);
  const [modes, setModes] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [estNouvelEleve, setEstNouvelEleve] = useState(true);

  const rawRole = (localStorage.getItem('legacy_admin_type_label') || '').toLowerCase();
  const canCreatePayment = rawRole === 'super_admin' || rawRole === '0' || rawRole === 'secretaire' || rawRole === '3';

  const emptyForm = () => ({
    typePaiement: "Frais d'inscription",
    // Frais d'inscription — infos élève (saisie manuelle)
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '1', parentNom: '',
    montantVerse: '',
    // Tranches — sélection élève
    matricule: '',
    idMode: '',
    datePaie: new Date().toISOString().split('T')[0],
    photoFile: null as File | null,
  });
  const [form, setForm] = useState(emptyForm());

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pay, mod, el, preInsc] = await Promise.all([
        legacyFetch<any>(`${API}/paiements`),
        legacyFetch<any>(`${API}/modes`),
        legacyFetch<any>(`${API}/eleves?limit=300`),
        legacyFetch<any>(`${API}/pre-inscriptions`),
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const isInscription = form.typePaiement === "Frais d'inscription";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isInscription && estNouvelEleve) {
      if (!form.nom.trim() || !form.prenom.trim()) {
        setError("Veuillez renseigner le nom et prénom de l'élève.");
        return;
      }
      if (!form.montantVerse) { setError('Veuillez renseigner le montant.'); return; }

      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('nom', form.nom.trim());
        formData.append('prenom', form.prenom.trim());
        if (form.dateNaissance) formData.append('date_naissance', form.dateNaissance);
        if (form.lieuNaissance) formData.append('lieu_naissance', form.lieuNaissance);
        formData.append('sexe', form.sexe);
        if (form.parentNom) formData.append('parent_nom', form.parentNom);
        formData.append('montant_verse', form.montantVerse);
        formData.append('id_mode', form.idMode || '1');
        formData.append('commentaire', "Frais d'inscription");
        if (form.datePaie) formData.append('date_paiement', form.datePaie);
        if (form.photoFile) formData.append('photo', form.photoFile);

        // → POST vers pre_inscriptions
        await legacyFetch(`${API}/pre-inscriptions`, {
          method: 'POST',
          body: formData,
        });
        setSuccess("Pré-inscription enregistrée ! L'administration va attribuer le matricule.");
        setTimeout(() => setSuccess(''), 5000);
        setShowModal(false);
        setForm(emptyForm());
        fetchAll();
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'enregistrement");
      } finally { setSubmitting(false); }

    } else {
      // Tranche 1/2/3 ou Inscription (existant) — sélection élève classique
      if (!form.matricule) { setError('Veuillez sélectionner un élève.'); return; }
      if (!form.montantVerse) { setError('Veuillez renseigner le montant.'); return; }

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
            onClick={() => { setShowModal(true); setError(''); setForm(emptyForm()); }}
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
              {['#', 'Élève', 'Matricule', 'Type', 'Montant', 'Mode', 'Date'].map(h => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ────────────────── MODAL ────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Enregistrer un paiement</h2>
              <button type="button" onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
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

            {/* ── FRAIS D'INSCRIPTION : saisie manuelle infos élève ── */}
            {isInscription && estNouvelEleve && (
              <div className="space-y-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
                  <UserPlus className="w-4 h-4" /> Informations de l'élève à pré-inscrire
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
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Parent / Tuteur</label>
                    <input type="text" value={form.parentNom} onChange={e => setForm({ ...form, parentNom: e.target.value })}
                      placeholder="Nom du parent ou tuteur" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 600 }}>Photo de l'élève (Optionnel)</label>
                    <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-colors">
                      <input type="file" accept="image/*" onChange={e => setForm({ ...form, photoFile: e.target.files?.[0] || null })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        {form.photoFile ? (
                          <>
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">{form.photoFile.name}</p>
                            <p className="text-xs text-slate-500 mt-1">Cliquez pour modifier</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white text-slate-400 group-hover:text-blue-500 rounded-full flex items-center justify-center mb-2 shadow-sm transition-colors border border-slate-100">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-600 group-hover:text-blue-700">Cliquez ou glissez une photo ici</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG ou JPEG (Max. 2MB)</p>
                          </>
                        )}
                      </div>
                    </div>
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
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>
                Annuler
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {submitting ? 'Enregistrement…' : isInscription ? 'Soumettre l inscription' : 'Valider le paiement'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
