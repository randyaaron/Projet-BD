import { useState, useEffect } from 'react';
import { Send, Users, UserCheck, MessageSquare, Search, X, Loader2, Plus } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/legacy`;

const typeLabels: Record<number, { label: string; cls: string }> = {
  0: { label: 'Général', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  1: { label: 'Paiement', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  2: { label: 'Discipline', cls: 'bg-red-50 text-red-700 border-red-200' },
  3: { label: 'Résultats', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export function MessagerieView() {
  const [messages, setMessages] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ objet: '', information: '', idParent: '', type_message: '0' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [msg, util] = await Promise.all([
        legacyFetch<any>(`${API}/messages`),
        legacyFetch<any>(`${API}/utilisateurs`),
      ]);
      setMessages(msg.data || []);
      setParents(util.parents || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await legacyFetch(`${API}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          objet: form.objet,
          information: form.information,
          idParent: form.idParent ? parseInt(form.idParent) : undefined,
          type_message: parseInt(form.type_message),
        }),
      });
      setShowModal(false);
      setForm({ objet: '', information: '', idParent: '', type_message: '0' });
      fetchAll();
    } catch (e: any) { setError(e.message || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const filtered = messages.filter(m =>
    (m.objet?.toLowerCase().includes(search.toLowerCase()) ||
      m.parentNom?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalParents = parents.length;
  const totalEnseignants = 0; // counted via utilisateurs

  if (loading) return <div className="p-6 text-slate-500">Chargement de la messagerie…</div>;

  return (
    <div className="p-6 space-y-5 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Messagerie</h1>
          <p className="text-slate-500 text-sm mt-0.5">{messages.length} message{messages.length > 1 ? 's' : ''} · {totalParents} parent{totalParents > 1 ? 's' : ''} enregistré{totalParents > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm font-semibold">
          <Send className="w-4 h-4" /> Nouveau message
        </button>
      </div>

      {/* Groupes rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        {[
          { icon: Users, label: 'Parents d\'élèves', sub: `${totalParents} familles enregistrées`, color: 'text-blue-600 bg-blue-50', border: 'hover:border-blue-300' },
          { icon: UserCheck, label: 'Enseignants', sub: 'Corps professoral', color: 'text-emerald-600 bg-emerald-50', border: 'hover:border-emerald-300' },
          { icon: MessageSquare, label: 'Messages envoyés', sub: `${messages.length} au total`, color: 'text-purple-600 bg-purple-50', border: 'hover:border-purple-300' },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 cursor-pointer transition-colors ${card.border}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm">{card.label}</p>
              <p className="text-slate-500 text-xs">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un message…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
      </div>

      {/* Liste messages */}
      <div className="flex-1 space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 text-center py-16 text-slate-400 text-sm">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun message pour l'instant.</p>
            <p className="text-xs mt-1 opacity-70">Cliquez sur "Nouveau message" pour envoyer la première communication.</p>
          </div>
        ) : (
          filtered.map((m: any) => {
            const typeInfo = typeLabels[m.type_message] || typeLabels[0];
            return (
              <div key={m.idMessages} className="bg-white rounded-xl border border-slate-200 px-5 py-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-slate-900 font-semibold text-sm truncate">{m.objet}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-semibold flex-shrink-0 ${typeInfo.cls}`}>{typeInfo.label}</span>
                      {m.valider === 0 && <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200 font-semibold">En attente</span>}
                    </div>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{m.information}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      {m.parentNom && <span>Destinataire : <strong className="text-slate-600">{m.parentNom} {m.parentPrenom}</strong></span>}
                      {m.expNom && <span>De : <strong className="text-slate-600">{m.expNom} {m.expPrenom}</strong></span>}
                      {m.created_at && <span>{new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal nouveau message */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSend} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-lg">Nouveau message</h2>
              <button type="button" onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-semibold">Destinataire (parent)</label>
              <select value={form.idParent} onChange={e => setForm({...form, idParent: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                <option value="">-- Tous les parents --</option>
                {parents.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-semibold">Type de message</label>
              <select value={form.type_message} onChange={e => setForm({...form, type_message: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none">
                <option value="0">Général</option>
                <option value="1">Paiement / Scolarité</option>
                <option value="2">Discipline</option>
                <option value="3">Résultats scolaires</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-semibold">Objet *</label>
              <input required value={form.objet} onChange={e => setForm({...form, objet: e.target.value})} placeholder="Ex: Réunion parents le 15 juin" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-semibold">Message *</label>
              <textarea required rows={4} value={form.information} onChange={e => setForm({...form, information: e.target.value})} placeholder="Rédigez votre message ici…" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 font-semibold">Annuler</button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 font-semibold">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
