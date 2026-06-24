import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, Clock, ChevronLeft, ChevronRight, X, Loader2, CreditCard, AlertCircle, GraduationCap, Users } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';
const FRAIS_INSCRIPTION = 75000;
const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';
const PAGE_SIZE = 10;

const getAvatarUrl = (name: string, sexe: string) => {
  if (!name) return `/avatars/student_${sexe === '2' ? 'f' : 'm'}_1.png`;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const num = (hash % 5) + 1;
  return `/avatars/student_${sexe === '2' ? 'f' : 'm'}_${num}.png`;
};

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
    parentNom: '',
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

  const handleSubmit = async () => {
    setError('');
    if (!form.matricule || !form.nom || !form.prenom || !form.dateNaissance || !form.lieuNaissance) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      await legacyFetch(`${API}/eleves`, {
        method: 'POST',
        body: JSON.stringify({
          matricule: parseInt(form.matricule),
          nom: form.nom,
          prenom: form.prenom,
          dateNaissance: form.dateNaissance,
          lieuNaissance: form.lieuNaissance,
          sexe: parseInt(form.sexe),
          parentNom: form.parentNom,
        }),
      });

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
        matricule: '', nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '1', idClasse: '', parentNom: '',
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

  if (loading) return (
    <div className="flex h-full items-center justify-center space-x-2 text-blue-600">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-medium">Chargement des inscriptions...</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600 p-1.5 bg-blue-100 rounded-lg" />
            Inscriptions
          </h1>
          <p className="text-slate-500 mt-2">
            Gérez l'admission de nouveaux élèves et le paiement des frais d'inscription ({fmt(FRAIS_INSCRIPTION)}).
          </p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setStep(1); setError(''); }} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" /> Inscrire un élève
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium text-sm uppercase tracking-wider mb-1">Total Inscrits</p>
              <p className="text-4xl font-extrabold">{eleves.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><Users className="w-6 h-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-1">Élèves Actifs</p>
              <p className="text-4xl font-extrabold text-emerald-500">{eleves.filter(e => e.actif === 1).length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-1">Garçons</p>
              <p className="text-4xl font-extrabold text-blue-500">{eleves.filter(e => String(e.sexe) === '1').length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl"><UserPlus className="w-6 h-6 text-blue-500" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-1">Filles</p>
              <p className="text-4xl font-extrabold text-pink-500">{eleves.filter(e => String(e.sexe) === '2').length}</p>
            </div>
            <div className="p-3 bg-pink-50 rounded-xl"><UserPlus className="w-6 h-6 text-pink-500" /></div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Dernières Inscriptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Matricule</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Élève</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Sexe</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Naissance</th>
                <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Aucun élève.</td></tr>
              ) : paged.map((el: any) => (
                <tr key={el.matricule} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-medium">{el.matricule}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(el.nom, String(el.sexe))} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="text-slate-900 font-bold">{el.nom} {el.prenom}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${String(el.sexe) === '2' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                      {String(el.sexe) === '2' ? 'Fille' : 'Garçon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {el.dateNaissance ? new Date(el.dateNaissance).toLocaleDateString('fr-FR') : '—'}<br/>
                    <span className="text-xs text-slate-400">{el.lieuNaissance}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${el.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {el.actif ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {el.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-slate-500 text-sm font-medium">Page {page} sur {pages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL INSCRIPTION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Nouvelle Inscription</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>1</span>
                    <span className="font-semibold text-sm">Informations Élève</span>
                  </div>
                  <div className={`w-8 h-0.5 ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>2</span>
                    <span className="font-semibold text-sm">Frais d'Inscription</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-8 overflow-y-auto">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Matricule *</label>
                    <input required type="number" value={form.matricule} onChange={e => setForm({ ...form, matricule: e.target.value })} placeholder="Ex: 20260201" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nom *</label>
                      <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="NOM" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Prénom *</label>
                      <input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Date de naissance *</label>
                      <input required type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sexe *</label>
                      <select value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors bg-white">
                        <option value="1">Garçon</option>
                        <option value="2">Fille</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Lieu de naissance *</label>
                    <input required value={form.lieuNaissance} onChange={e => setForm({ ...form, lieuNaissance: e.target.value })} placeholder="Ex: Yaoundé" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Parent / Tuteur</label>
                    <input value={form.parentNom || ''} onChange={e => setForm({ ...form, parentNom: e.target.value })} placeholder="Nom du parent ou tuteur" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  {/* Récap */}
                  <div className="bg-slate-50 rounded-xl border-2 border-slate-100 p-5">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-3">Récapitulatif de l'élève</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div><span className="text-slate-500 text-sm">Nom complet:</span> <p className="font-bold text-slate-900">{form.nom} {form.prenom}</p></div>
                      <div><span className="text-slate-500 text-sm">Matricule:</span> <p className="font-bold text-slate-900">{form.matricule}</p></div>
                      <div className="col-span-2"><span className="text-slate-500 text-sm">Naissance:</span> <p className="font-bold text-slate-900">{form.dateNaissance} à {form.lieuNaissance}</p></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-5 flex gap-4 items-start">
                    <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-blue-900 font-bold">Frais d'inscription : {fmt(FRAIS_INSCRIPTION)}</p>
                      <p className="text-blue-700 text-sm mt-1">Ce montant sera automatiquement enregistré. Vous pouvez l'ajuster si un acompte est versé.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Montant versé (FCFA)</label>
                      <input type="number" value={form.montantVerse} onChange={e => setForm({ ...form, montantVerse: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" />
                      {parseFloat(form.montantVerse) < FRAIS_INSCRIPTION && form.montantVerse !== '' && (
                        <p className="text-amber-600 text-xs font-bold mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Reste à payer : {fmt(FRAIS_INSCRIPTION - parseFloat(form.montantVerse || '0'))}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Mode de paiement</label>
                      <select value={form.idMode} onChange={e => setForm({ ...form, idMode: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors bg-white">
                        {modes.map((m: any) => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Commentaire</label>
                    <input value={form.comentaire} onChange={e => setForm({ ...form, comentaire: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 focus:ring-0 transition-colors" />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => step > 1 ? setStep(s => s - 1) : setShowModal(false)} 
                className="flex-1 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                {step > 1 ? 'Retour' : 'Annuler'}
              </button>
              <button
                disabled={submitting || (step === 1 && (!form.matricule || !form.nom || !form.prenom || !form.dateNaissance || !form.lieuNaissance))}
                onClick={() => step < 2 ? setStep(2) : handleSubmit()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 2 ? <CheckCircle2 className="w-5 h-5" /> : null}
                {step < 2 ? 'Suivant' : submitting ? 'Enregistrement...' : 'Finaliser Inscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
