import { useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, Lock, Plus } from 'lucide-react';

const trimestres = [
  { id: 1, nom: 'Trimestre 1', debut: '15 Sept. 2025', fin: '05 Déc. 2025', statut: 'terminé', bulletins: 452 },
  { id: 2, nom: 'Trimestre 2', debut: '08 Déc. 2025', fin: '20 Mars 2026', statut: 'terminé', bulletins: 448 },
  { id: 3, nom: 'Trimestre 3', debut: '23 Mars 2026', fin: '30 Juin 2026', statut: 'en cours', bulletins: 0 },
];

const statutConfig: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  'en cours': { label: 'En cours',  icon: Clock,        cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  'terminé':  { label: 'Terminé',   icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'à venir':  { label: 'À venir',   icon: Lock,         cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const sessions = [
  { id: 1, nom: 'Session de Juin 2026',      type: 'Examen de fin d\'année', date: '15-25 Juin 2026', statut: 'à venir' },
  { id: 2, nom: 'Composition T2',            type: 'Composition',            date: '16-20 Mars 2026', statut: 'terminé' },
  { id: 3, nom: 'Composition T1',            type: 'Composition',            date: '01-05 Déc. 2025', statut: 'terminé' },
];

export function TrimestresView() {
  const [tab, setTab] = useState<'trimestres' | 'sessions'>('trimestres');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Trimestres & Sessions</h1>
          <p className="text-slate-500 text-sm mt-0.5">Année académique 2025 – 2026</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['trimestres', 'sessions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} style={{ fontWeight: tab === t ? 600 : 400 }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {tab === 'trimestres' && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-slate-700 text-sm mb-3" style={{ fontWeight: 600 }}>Progression de l'année</p>
            <div className="flex gap-1 h-3">
              {[{ w: '33%', cls: 'bg-emerald-500', label: 'T1' }, { w: '33%', cls: 'bg-emerald-500', label: 'T2' }, { w: '34%', cls: 'bg-blue-500', label: 'T3' }].map((s, i) => (
                <div key={i} className={`${s.cls} rounded-full`} style={{ width: s.w }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>Sept. 2025</span><span>Déc. 2025</span><span>Mars 2026</span><span>Juin 2026</span>
            </div>
          </div>

          {trimestres.map(t => {
            const conf = statutConfig[t.statut];
            const Icon = conf.icon;
            return (
              <div key={t.id} className={`bg-white rounded-xl border shadow-sm p-5 ${t.statut === 'en cours' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.statut === 'en cours' ? 'bg-blue-600' : 'bg-slate-100'}`}>
                      <CalendarDays className={`w-5 h-5 ${t.statut === 'en cours' ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-slate-900" style={{ fontWeight: 700 }}>{t.nom}</h3>
                      <p className="text-slate-500 text-sm">{t.debut} → {t.fin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.bulletins > 0 && (
                      <span className="text-xs text-slate-500">{t.bulletins} bulletins générés</span>
                    )}
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${conf.cls}`} style={{ fontWeight: 600 }}>
                      <Icon className="w-3.5 h-3.5" /> {conf.label}
                    </span>
                    {t.statut === 'terminé' && (
                      <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-xs" style={{ fontWeight: 600 }}>Voir bulletins</button>
                    )}
                    {t.statut === 'en cours' && (
                      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs" style={{ fontWeight: 600 }}>Clôturer</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'sessions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Session', 'Type', 'Dates', 'Statut', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sessions.map(s => {
                const conf = statutConfig[s.statut];
                const Icon = conf.icon;
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-900" style={{ fontWeight: 600 }}>{s.nom}</td>
                    <td className="px-5 py-3 text-slate-500">{s.type}</td>
                    <td className="px-5 py-3 text-slate-500">{s.date}</td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border w-fit ${conf.cls}`} style={{ fontWeight: 600 }}>
                        <Icon className="w-3 h-3" /> {conf.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-blue-600 text-xs hover:text-blue-700" style={{ fontWeight: 600 }}>Détails</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-slate-900 mb-5" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Ajouter une session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Nom de la session</label>
                <input placeholder="Ex : Composition T3" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Type</label>
                <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                  <option>Composition</option><option>Examen de fin d'année</option><option>Contrôle continu</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Date de début', 'Date de fin'].map(l => (
                  <div key={l}>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>{l}</label>
                    <input type="date" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50" style={{ fontWeight: 600 }}>Annuler</button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm" style={{ fontWeight: 600 }}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
