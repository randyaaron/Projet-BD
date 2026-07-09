import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, Clock, ChevronLeft, ChevronRight, X, Loader2, AlertCircle, GraduationCap, Users, ClipboardList, KeyRound } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';
const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';
const PAGE_SIZE = 10;

const getAvatarUrl = (el: any) => {
  const photo = el.photoURL || el.photo_url;
  if (photo && photo !== 'INDEFINI') {
    return `http://localhost:8000${photo}`;
  }
  const name = el.nom || '';
  const sexe = String(el.sexe) || '1';
  if (!name) return `/avatars/student_${sexe === '2' ? 'f' : 'm'}_1.png`;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const num = (hash % 5) + 1;
  return `/avatars/student_${sexe === '2' ? 'f' : 'm'}_${num}.png`;
};

export function InscriptionsView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [preInscriptions, setPreInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'inscrits' | 'en_attente'>('inscrits');

  // Modal de validation (admin attribue le matricule)
  const [showValidModal, setShowValidModal] = useState(false);
  const [selectedPreInsc, setSelectedPreInsc] = useState<any>(null);
  const [matricule, setMatricule] = useState('');
  const [validating, setValidating] = useState(false);
  const [matriculeLoading, setMatriculeLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [el, preInsc] = await Promise.all([
        legacyFetch<any>(`${API}/eleves?limit=300`),
        legacyFetch<any>(`${API}/pre-inscriptions`),
      ]);
      setEleves(el.data || []);
      setPreInscriptions((preInsc.data || []).filter((p: any) => p.statut === 'en_attente'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openValidModal = async (preInsc: any) => {
    setSelectedPreInsc(preInsc);
    setMatricule('');
    setError('');
    setShowValidModal(true);
    // Auto-générer le prochain matricule disponible
    setMatriculeLoading(true);
    try {
      const res = await legacyFetch<any>(`${API}/eleves/next-matricule`);
      if (res?.matricule) setMatricule(String(res.matricule));
    } catch {
      // Laisse l'admin saisir manuellement si l'API échoue
    } finally {
      setMatriculeLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!matricule.trim()) { setError('Veuillez saisir un matricule.'); return; }
    setError('');
    setValidating(true);
    try {
      await legacyFetch(`${API}/pre-inscriptions/${selectedPreInsc.id}/valider`, {
        method: 'POST',
        body: JSON.stringify({ matricule: parseInt(matricule) }),
      });
      setSuccess(`Élève ${selectedPreInsc.nom} ${selectedPreInsc.prenom} inscrit avec succès (Matricule : ${matricule}).`);
      setTimeout(() => setSuccess(''), 6000);
      setShowValidModal(false);
      fetchAll();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la validation.");
    } finally { setValidating(false); }
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
            Gérez les inscriptions en attente et les élèves inscrits.
          </p>
        </div>
        {preInscriptions.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm">
            <ClipboardList className="w-4 h-4" />
            {preInscriptions.length} pré-inscription{preInscriptions.length > 1 ? 's' : ''} en attente
          </div>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-semibold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
        </div>
      )}

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
        <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-600 font-medium text-sm uppercase tracking-wider mb-1">En attente</p>
              <p className="text-4xl font-extrabold text-slate-600">{preInscriptions.length}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl"><ClipboardList className="w-6 h-6 text-slate-600" /></div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
        {[
          { id: 'inscrits', label: `Élèves inscrits (${eleves.length})` },
          { id: 'en_attente', label: `inscriptions en attente (${preInscriptions.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TABLE : Élèves inscrits ── */}
      {activeTab === 'inscrits' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Liste des Élèves Inscrits</h2>
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
                        <img src={getAvatarUrl(el)} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white" />
                        <span className="text-slate-900 font-bold">{el.nom} {el.prenom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${String(el.sexe) === '2' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                        {String(el.sexe) === '2' ? 'Fille' : 'Garçon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {el.dateNaissance ? new Date(el.dateNaissance).toLocaleDateString('fr-FR') : '—'}<br />
                      <span className="text-xs text-slate-400">{el.lieuNaissance}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${el.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}`}>
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
      )}

      {/* ── TABLE : Pré-inscriptions en attente ── */}
      {activeTab === 'en_attente' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-lg font-bold text-slate-800">Pré-inscriptions à valider</h2>
            <p className="text-sm text-slate-600 mt-1">
              Ces élèves ont payé leurs frais d'inscription. Cliquez sur une ligne pour leur attribuer un matricule.
            </p>
          </div>
          {preInscriptions.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucune inscription en attente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/40 border-b border-slate-100">
                    {['Nom & Prénom', 'Naissance', 'Sexe', 'Parent / Tuteur', 'Montant versé', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-slate-700 font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {preInscriptions.map((pi: any) => (
                    <tr key={pi.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">{pi.nom} {pi.prenom}</td>
                      <td className="px-5 py-4 text-slate-500">
                        {pi.date_naissance ? new Date(pi.date_naissance).toLocaleDateString('fr-FR') : '—'}<br />
                        <span className="text-xs text-slate-400">{pi.lieu_naissance || '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${String(pi.sexe) === '2' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                          {String(pi.sexe) === '2' ? 'Fille' : 'Garçon'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{pi.parent_nom || '—'}</td>
                      <td className="px-5 py-4 font-semibold text-emerald-700">{fmt(pi.montant_verse)}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{pi.date_paiement ? new Date(pi.date_paiement).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openValidModal(pi)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Attribuer matricule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL : Attribuer un matricule ── */}
      {showValidModal && selectedPreInsc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Valider l'inscription</h2>
              <button onClick={() => setShowValidModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            {/* Récap de la pré-inscription */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                <UserPlus className="w-4 h-4" /> Informations de l'élève
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Nom</label>
                  <input type="text" disabled value={selectedPreInsc.nom} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Prénom</label>
                  <input type="text" disabled value={selectedPreInsc.prenom} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Date de naissance</label>
                  <input type="date" disabled value={selectedPreInsc.date_naissance ? selectedPreInsc.date_naissance.split('T')[0] : ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Sexe</label>
                  <select disabled value={selectedPreInsc.sexe} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed">
                    <option value="1">Garçon</option>
                    <option value="2">Fille</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Lieu de naissance</label>
                  <input type="text" disabled value={selectedPreInsc.lieu_naissance || ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Parent / Tuteur</label>
                  <input type="text" disabled value={selectedPreInsc.parent_nom || ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 600 }}>Frais versés</label>
                  <input type="text" disabled value={fmt(selectedPreInsc.montant_verse)} className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50 cursor-not-allowed" />
                  <p className="text-[10px] text-slate-500 mt-1">Le paiement sera enregistré automatiquement lors de la validation.</p>
                </div>
              </div>
            </div>

            {/* Saisie du matricule */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">Matricule à attribuer *</label>
                {matriculeLoading ? (
                  <span className="flex items-center gap-1 text-xs text-blue-500">
                    <Loader2 className="w-3 h-3 animate-spin" /> Génération...
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold">✓ Auto-généré — modifiable</span>
                )}
              </div>
              <input
                type="number"
                value={matricule}
                onChange={e => setMatricule(e.target.value)}
                placeholder="Ex: 20260001"
                autoFocus
                disabled={matriculeLoading}
                className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 font-bold text-lg focus:ring-0 transition-colors
                  ${matriculeLoading ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed' : 'border-blue-300 bg-blue-50 focus:border-blue-500'}`}
              />
              <p className="text-xs text-slate-400 mt-1">Format : Année + Numéro séquentiel (ex : 20260001, 20260002...)</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowValidModal(false)}
                className="flex-1 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleValidate} disabled={validating || !matricule}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {validating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {validating ? 'Validation...' : 'Confirmer l\'inscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
