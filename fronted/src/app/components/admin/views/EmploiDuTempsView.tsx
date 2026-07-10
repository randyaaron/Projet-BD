import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy`;

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const CRENEAUX = ['07:30', '08:30', '09:30', '10:00', '11:00', '12:00', '13:30', '14:30', '15:30', '16:30'];

const COURS_COLORS = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-emerald-50 border-emerald-200 text-emerald-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-amber-50 border-amber-200 text-amber-800',
  'bg-red-50 border-red-200 text-red-800',
  'bg-pink-50 border-pink-200 text-pink-800',
  'bg-indigo-50 border-indigo-200 text-indigo-800',
  'bg-teal-50 border-teal-200 text-teal-800',
  'bg-orange-50 border-orange-200 text-orange-800',
  'bg-cyan-50 border-cyan-200 text-cyan-800',
];

export function EmploiDuTempsView() {
  const [classes, setClasses] = useState<any[]>([]);
  const [cours, setCours] = useState<any[]>([]);
  const [edt, setEdt] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClasse, setSelectedClasse] = useState<any>(null);
  const [classIdx, setClassIdx] = useState(0);

  // Ajout d'un créneau
  const [showModal, setShowModal] = useState(false);
  const [slotForm, setSlotForm] = useState({ jour: 'Lundi', heure: '07:30', idCours: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const rawRole = (localStorage.getItem('legacy_admin_type_label') || '').toLowerCase();
  const canEdit = !(rawRole === 'directeur' || rawRole === '1' || rawRole === 'fondateur' || rawRole === '2');

  useEffect(() => {
    legacyFetch<any>(`${API}/classes`)
      .then(res => {
        const cls = res.data || [];
        setClasses(cls);
        if (cls.length > 0) setSelectedClasse(cls[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClasse) return;
    setLoading(true);
    Promise.all([
      legacyFetch<any>(`${API}/edt?idClasse=${selectedClasse.idClasse}`),
      legacyFetch<any>(`${API}/cours?idClasse=${selectedClasse.idClasse}`),
    ]).then(([edtRes, coursRes]) => {
      setEdt(edtRes.data || []);
      setCours(coursRes.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedClasse]);

  const changeClasse = (dir: number) => {
    const next = (classIdx + dir + classes.length) % classes.length;
    setClassIdx(next);
    setSelectedClasse(classes[next]);
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await legacyFetch(`${API}/edt`, {
        method: 'POST',
        body: JSON.stringify({
          jour: slotForm.jour,
          heure: slotForm.heure,
          idClasse: selectedClasse.idClasse,
          idCours: parseInt(slotForm.idCours),
        }),
      });
      setShowModal(false);
      setSlotForm({ jour: 'Lundi', heure: '07:30', idCours: '' });
      // Refresh
      const edtRes = await legacyFetch<any>(`${API}/edt?idClasse=${selectedClasse.idClasse}`);
      setEdt(edtRes.data || []);
    } catch (e: any) { setError(e.message || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteSlot = async (idTemps: number) => {
    await legacyFetch(`${API}/edt/${idTemps}`, { method: 'DELETE' });
    setEdt(prev => prev.filter(s => s.idTemps !== idTemps));
  };

  // Construire la grille : edt[jour][heure] → slot
  const getSlot = (jour: string, heure: string) =>
    edt.find(s => s.jour === jour && s.heure === heure) || null;

  // Couleur par cours
  const coursColorMap: Record<number, string> = {};
  [...new Set(edt.map(s => s.idCours))].forEach((id, i) => {
    coursColorMap[id as number] = COURS_COLORS[i % COURS_COLORS.length];
  });

  // Extraire le titulaire de la classe depuis le premier slot (tous ont le même)
  const titulaire = edt.length > 0 ? {
    nom: edt[0].enseignantNom,
    prenom: edt[0].enseignantPrenom,
  } : null;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Emploi du temps</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {selectedClasse ? `Classe : ${selectedClasse.libelle} · ` : ''}
            {edt.length} créneau{edt.length > 1 ? 'x' : ''} enregistré{edt.length > 1 ? 's' : ''}
          </p>
        </div>
        {selectedClasse && canEdit && (
          <button onClick={() => { setShowModal(true); setError(''); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Ajouter un créneau
          </button>
        )}
      </div>

      {/* Sélecteur de classe */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
        <button onClick={() => changeClasse(-1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex-1 flex items-center gap-2 flex-wrap justify-center">
          {classes.map((c: any, i: number) => (
            <button key={c.idClasse}
              onClick={() => { setClassIdx(i); setSelectedClasse(c); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${selectedClasse?.idClasse === c.idClasse ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              style={{ fontWeight: selectedClasse?.idClasse === c.idClasse ? 600 : 400 }}>
              {c.libelle}
            </button>
          ))}
        </div>
        <button onClick={() => changeClasse(1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Bannière titulaire de la classe */}
      {selectedClasse && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {titulaire?.nom?.charAt(0) ?? '?'}{titulaire?.prenom?.charAt(0) ?? ''}
          </div>
          <div>
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Enseignant titulaire</p>
            {titulaire?.nom ? (
              <p className="text-blue-900 font-bold">{titulaire.nom} {titulaire.prenom}</p>
            ) : (
              <p className="text-blue-400 italic text-sm">Aucun titulaire affecté à cette classe</p>
            )}
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-blue-400">Classe</p>
            <p className="text-blue-800 font-bold text-sm">{selectedClasse.libelle}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-center py-10">Chargement de l'emploi du temps…</div>
      ) : (
        <>
          {edt.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
              Aucun créneau enregistré pour la classe <strong>{selectedClasse?.libelle}</strong>. Cliquez sur "Ajouter un créneau" pour commencer à construire l'emploi du temps.
            </div>
          )}

          {/* Grille EDT */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-slate-500 text-xs uppercase tracking-wide w-24" style={{ fontWeight: 600 }}>
                    <Clock className="w-3.5 h-3.5 inline mr-1" />Heure
                  </th>
                  {JOURS.map(j => (
                    <th key={j} className="px-3 py-3 text-center text-slate-700 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{j}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRENEAUX.map((heure, idx) => (
                  <tr key={heure} className="border-b border-slate-50">
                    <td className="px-4 py-2 text-slate-400 text-xs" style={{ fontWeight: 600 }}>
                      {heure} – {CRENEAUX[idx + 1] || '17:30'}
                    </td>
                    {JOURS.map(jour => {
                      const slot = getSlot(jour, heure);
                      return (
                        <td key={jour} className="px-2 py-1.5">
                          {slot ? (
                            <div className={`rounded-lg border px-2 py-1.5 group relative ${coursColorMap[slot.idCours] || COURS_COLORS[0]}`}>
                              <p className="text-xs truncate" style={{ fontWeight: 700 }}>{slot.coursLibelle}</p>
                              <p className="text-xs opacity-50">coeff. {slot.coefficient}</p>
                              {canEdit && (
                                <button
                                  onClick={() => handleDeleteSlot(slot.idTemps)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 text-red-500"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ) : canEdit ? (
                            <div className="h-10 rounded-lg border border-dashed border-slate-200 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer hover:bg-slate-50"
                              onClick={() => { setSlotForm({ jour, heure, idCours: '' }); setShowModal(true); }}>
                              <Plus className="w-3 h-3 text-slate-400" />
                            </div>
                          ) : (
                            <div className="h-10 rounded-lg" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Légende */}
          {edt.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 text-xs">Légende :</span>
              {Object.entries(coursColorMap).map(([id, cls]) => {
                const slot = edt.find(s => s.idCours === parseInt(id));
                return slot ? (
                  <span key={id} className={`px-2 py-0.5 rounded text-xs border ${cls}`} style={{ fontWeight: 600 }}>
                    {slot.coursLibelle}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </>
      )}

      {/* Modal ajout créneau */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSlot} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Ajouter un créneau — {selectedClasse?.libelle}
              </h2>
              <button type="button" onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Jour *</label>
                <select required value={slotForm.jour} onChange={e => setSlotForm({ ...slotForm, jour: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  {JOURS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Heure *</label>
                <select required value={slotForm.heure} onChange={e => setSlotForm({ ...slotForm, heure: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  {CRENEAUX.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Cours (matière) *</label>
              <select required value={slotForm.idCours} onChange={e => setSlotForm({ ...slotForm, idCours: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                <option value="">-- Sélectionner un cours --</option>
                {cours.map((c: any) => <option key={c.idCours} value={c.idCours}>{c.libelle} (coeff. {c.coefficient})</option>)}
              </select>
              {cours.length === 0 && (
                <p className="text-amber-600 text-xs mt-1">Aucun cours disponible pour cette classe. Créez-en d'abord dans l'onglet "Cours & Matières".</p>
              )}
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>Annuler</button>
              <button type="submit" disabled={submitting || !slotForm.idCours} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
