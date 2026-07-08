import { useState, useEffect, useRef } from 'react';
import { Search, FileOutput, CheckCircle, Send, Eye, Loader2, RefreshCw, BookOpen, Printer, X } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

// ─── Helpers ──────────────────────────────────────────────────────────────
function avgColor(avg: number): string {
  if (avg >= 16) return '#16a34a';
  if (avg >= 14) return '#2563eb';
  if (avg >= 10) return '#d97706';
  return '#dc2626';
}

// ─── Bulletin imprimable ──────────────────────────────────────────────────
function BulletinPrint({ data, onClose }: { data: any; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || '';
    const win = window.open('', '_blank', 'width=900,height=1100');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Bulletin – ${data.eleve?.nom} ${data.eleve?.prenom}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Roboto', Arial, sans-serif; font-size: 12px; color: #111; background: white; }
          .page { width: 210mm; margin: 0 auto; padding: 15mm; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
          th { background: #1e3a5f; color: white; font-weight: 700; text-align: center; }
          .center { text-align: center; }
          .right { text-align: right; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body><div class="page">${content}</div></body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const eleve = data.eleve || {};
  const matieres: any[] = data.matieres || [];
  const totalCoeff = matieres.reduce((s: number, m: any) => s + (m.coefficient || 1), 0);
  const avg = data.moyenne_generale;
  const sanctions: any[] = data.sanctions || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-6 px-4">
      {/* Contrôles */}
      <div className="fixed top-4 right-4 z-50 flex gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-bold shadow-xl transition-colors"
        >
          <Printer className="w-4 h-4" /> Imprimer / PDF
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 px-4 py-2 rounded-xl font-bold shadow-xl transition-colors border border-slate-200"
        >
          <X className="w-4 h-4" /> Fermer
        </button>
      </div>

      {/* Feuille bulletin */}
      <div
        ref={printRef}
        style={{
          background: 'white',
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          fontFamily: "'Roboto', Arial, sans-serif",
          fontSize: '12px',
          color: '#111',
          borderRadius: '4px',
        }}
      >
        {/* ── EN-TÊTE OFFICIEL ── */}
        <div style={{ borderBottom: '3px double #1e3a5f', paddingBottom: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '70px', height: '70px', border: '3px solid #1e3a5f',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, background: '#f0f5ff'
            }}>
              <span style={{ fontSize: '26px', fontWeight: 900, color: '#1e3a5f', letterSpacing: '-2px' }}>LG</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#555' }}>
                République du Cameroun — Paix · Travail · Patrie
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a5f', marginTop: '4px' }}>
                {data.ecole || 'École Les Génies'}
              </div>
              <div style={{ fontSize: '11px', color: '#333', marginTop: '2px' }}>
                B.P. xxx — Yaoundé, Cameroun · Tél : (+237) xxx xxx xxx
              </div>
              <div style={{
                marginTop: '8px', display: 'inline-block',
                background: '#1e3a5f', color: 'white',
                padding: '3px 20px', borderRadius: '2px',
                fontSize: '13px', fontWeight: 700, letterSpacing: '1px'
              }}>
                BULLETIN DE NOTES — {(data.trimestre || 'TRIMESTRE').toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: '100px' }}>
              <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Année</div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e3a5f' }}>{data.annee || '2025-2026'}</div>
            </div>
          </div>
        </div>

        {/* ── IDENTITÉ ÉLÈVE ── */}
        <div style={{
          border: '2px solid #1e3a5f', borderRadius: '4px',
          padding: '10px 14px', marginBottom: '14px', background: '#f8faff'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            <div>
              <span style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nom & Prénom</span>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e3a5f', marginTop: '2px' }}>
                {eleve.nom} {eleve.prenom}
              </div>
            </div>
            <div>
              <span style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Classe</span>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e3a5f', marginTop: '2px' }}>
                {data.classe || '—'}
              </div>
            </div>
            <div>
              <span style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Matricule</span>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e3a5f', marginTop: '2px' }}>
                {eleve.matricule}
              </div>
            </div>
            <div>
              <span style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Date de naissance</span>
              <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>
                {eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '—'}
              </div>
            </div>
            <div>
              <span style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Lieu de naissance</span>
              <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>
                {eleve.lieuNaissance || '—'}
              </div>
            </div>
            <div>
              <span style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Sexe</span>
              <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>
                {String(eleve.sexe) === '2' ? 'Féminin' : 'Masculin'}
              </div>
            </div>
          </div>
        </div>

        {/* ── TABLEAU DES NOTES ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <thead>
            <tr>
              <th style={{ background: '#1e3a5f', color: 'white', border: '1px solid #1e3a5f', padding: '7px 10px', textAlign: 'left', fontWeight: 700, width: '32%' }}>
                Matière
              </th>
              <th style={{ background: '#1e3a5f', color: 'white', border: '1px solid #1e3a5f', padding: '7px', textAlign: 'center', fontWeight: 700, width: '8%' }}>
                Coeff.
              </th>
              <th style={{ background: '#1e3a5f', color: 'white', border: '1px solid #1e3a5f', padding: '7px', textAlign: 'center', fontWeight: 700, width: '30%' }}>
                Note(s) obtenue(s) /20
              </th>
              <th style={{ background: '#1e3a5f', color: 'white', border: '1px solid #1e3a5f', padding: '7px', textAlign: 'center', fontWeight: 700, width: '12%' }}>
                Moy. /20
              </th>
              <th style={{ background: '#1e3a5f', color: 'white', border: '1px solid #1e3a5f', padding: '7px', textAlign: 'center', fontWeight: 700, width: '18%' }}>
                Appréciation
              </th>
            </tr>
          </thead>
          <tbody>
            {matieres.map((m: any, i: number) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f5f7fa' }}>
                <td style={{ border: '1px solid #ccc', padding: '6px 10px', fontWeight: 600 }}>{m.matiere}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', color: '#555' }}>{m.coefficient || 1}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>
                  {(m.notes || []).map((n: number) => n.toFixed(2)).join(' / ')}
                </td>
                <td style={{
                  border: '1px solid #ccc', padding: '6px', textAlign: 'center',
                  fontWeight: 700, fontSize: '13px',
                  color: m.moyenne !== null ? avgColor(m.moyenne) : '#999'
                }}>
                  {m.moyenne !== null ? m.moyenne.toFixed(2) : '—'}
                </td>
                <td style={{
                  border: '1px solid #ccc', padding: '6px', textAlign: 'center',
                  fontStyle: 'italic', fontSize: '11px', color: '#333'
                }}>
                  {m.appreciation || '—'}
                </td>
              </tr>
            ))}

            <tr style={{ background: '#e8edf5' }}>
              <td style={{ border: '1px solid #1e3a5f', padding: '7px 10px', fontWeight: 700, color: '#1e3a5f' }}>
                TOTAL / MOYENNE GÉNÉRALE
              </td>
              <td style={{ border: '1px solid #1e3a5f', padding: '7px', textAlign: 'center', fontWeight: 700, color: '#1e3a5f' }}>
                {totalCoeff}
              </td>
              <td style={{ border: '1px solid #1e3a5f', padding: '7px' }}></td>
              <td style={{
                border: '1px solid #1e3a5f', padding: '7px', textAlign: 'center',
                fontWeight: 900, fontSize: '15px',
                color: avg !== null ? avgColor(avg) : '#999'
              }}>
                {avg !== null ? avg.toFixed(2) : '—'}
              </td>
              <td style={{
                border: '1px solid #1e3a5f', padding: '7px', textAlign: 'center',
                fontWeight: 700, fontSize: '12px', color: '#1e3a5f'
              }}>
                {data.mention || '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── DISCIPLINE ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '14px', marginBottom: '14px' }}>
          <div style={{ border: '1px solid #1e3a5f', borderRadius: '4px', padding: '10px' }}>
            <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e3a5f', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>
              Discipline & Assiduité
            </h4>
            <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.6' }}>
              <p>• <strong>Absences non justifiées :</strong> {data.total_absences || 0} heures</p>
              {sanctions.length > 0 ? (
                sanctions.map((s: any, idx: number) => (
                  <p key={idx}>• <strong>Sanction ({new Date(s.date).toLocaleDateString('fr-FR')}) :</strong> {s.motif}</p>
                ))
              ) : (
                <p>✓ Aucune sanction disciplinaire enregistrée ce trimestre.</p>
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #1e3a5f', borderRadius: '4px', padding: '10px', background: '#f8faff' }}>
            <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e3a5f', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>
              Observation du Titulaire
            </h4>
            <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#444', marginTop: '10px' }}>
              {avg !== null ? (
                avg >= 14 ? `Très bon trimestre pour ${eleve.prenom}.` :
                avg >= 10 ? `Résultats passables.` :
                `Trimestre difficile. ${eleve.prenom} doit intensifier ses efforts.`
              ) : 'Aucune note.'}
            </div>
          </div>
        </div>

        {/* ── TAMPON & CACHET + SIGNATURES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '20px', alignItems: 'flex-end' }}>

          {/* Colonne 1 : Tampon circulaire du Directeur */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#555', letterSpacing: '1px', marginBottom: '8px' }}>
              Cachet &amp; Signature du Directeur
            </div>
            {/* Tampon circulaire */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
              <div style={{
                width: '90px', height: '90px',
                border: '3px solid #1e3a5f', borderRadius: '50%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative', padding: '8px',
                background: 'rgba(30,58,95,0.04)',
              }}>
                {/* Anneau texte extérieur simulé */}
                <div style={{ fontSize: '6px', fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center', lineHeight: '1.2' }}>
                  ÉCOLE LES GÉNIES
                </div>
                <div style={{ width: '60px', borderTop: '1px solid #1e3a5f', margin: '3px 0' }} />
                <div style={{ fontSize: '7px', fontWeight: 700, color: '#1e3a5f', textAlign: 'center', letterSpacing: '1px' }}>
                  DIRECTION
                </div>
                <div style={{ fontSize: '6px', color: '#1e3a5f', textAlign: 'center', marginTop: '2px' }}>
                  YAOUNDÉ — CMR
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px dashed #999', paddingTop: '6px', height: '30px' }} />
          </div>

          {/* Colonne 2 : Signature du Titulaire */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#555', letterSpacing: '1px', marginBottom: '8px' }}>
              Signature du Titulaire
            </div>
            <div style={{ height: '90px', border: '1px dashed #bbb', borderRadius: '4px', background: '#fafafa', marginBottom: '6px' }} />
            <div style={{ borderTop: '1px dashed #999', paddingTop: '6px', height: '30px' }} />
          </div>

          {/* Colonne 3 : Cachet rectangle de l'école */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#555', letterSpacing: '1px', marginBottom: '8px' }}>
              Signature du Parent / Tuteur
            </div>
            {/* Cachet rectangulaire */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
              <div style={{
                border: '2.5px solid #1e3a5f', borderRadius: '6px',
                padding: '6px 10px', width: '110px',
                background: 'rgba(30,58,95,0.04)',
              }}>
                <div style={{ fontSize: '7px', fontWeight: 900, color: '#1e3a5f', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '1px' }}>
                  ÉCOLE LES GÉNIES
                </div>
                <div style={{ borderTop: '1px solid #1e3a5f', margin: '3px 0' }} />
                <div style={{ fontSize: '6px', color: '#1e3a5f', textAlign: 'center', letterSpacing: '0.5px' }}>
                  B.P. xxx — Yaoundé
                </div>
                <div style={{ fontSize: '6px', color: '#1e3a5f', textAlign: 'center' }}>
                  (+237) xxx xxx xxx
                </div>
                <div style={{ borderTop: '1px solid #1e3a5f', margin: '3px 0' }} />
                <div style={{ fontSize: '6px', fontWeight: 700, color: '#1e3a5f', textAlign: 'center' }}>
                  ANNÉE SCOLAIRE {new Date().getFullYear()}/{new Date().getFullYear() + 1}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px dashed #999', paddingTop: '6px', height: '30px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BulletinsView() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [rapports, setRapports] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [annees, setAnnees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [selectedBulletin, setSelectedBulletin] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);

  const openBulletin = async (matricule: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/legacy/parent/bulletin-detail/${matricule}/annuel`);
      if (!res.ok) throw new Error('Erreur de chargement du bulletin');
      const payload = await res.json();
      setSelectedBulletin(payload);
    } catch (e) {
      console.error(e);
      alert('Impossible de charger le bulletin');
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [el, rp, cls, an] = await Promise.all([
        legacyFetch<any>(`${API}/eleves`),
        legacyFetch<any>(`${API}/discipline`),
        legacyFetch<any>(`${API}/classes`),
        legacyFetch<any>(`${API}/annees`),
      ]);
      setEleves(el.data || []);
      setRapports(rp.data || []);
      setClasses(cls.data || []);
      setAnnees(an.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const anneeActuelle = annees[annees.length - 1];

  // Compter les rapports par élève
  const rapportParMatricule: Record<number, number> = {};
  rapports.forEach((r: any) => {
    rapportParMatricule[r.matricule] = (rapportParMatricule[r.matricule] || 0) + 1;
  });

  const filtered = eleves.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-slate-500">Chargement des bulletins…</div>;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Bulletins scolaires</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {eleves.length} élèves · Année {anneeActuelle?.libelle || '—'} · {rapports.length} rapport{rapports.length > 1 ? 's' : ''} disciplinaire{rapports.length > 1 ? 's' : ''} enregistré{rapports.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 font-semibold">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Élèves inscrits', val: eleves.length, color: 'text-slate-900', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Garçons', val: eleves.filter(e => String(e.sexe) === '1').length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Filles', val: eleves.filter(e => String(e.sexe) === '2').length, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
          { label: 'Rapports disciplinaires', val: rapports.length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
            <p className="text-slate-500 text-xs">{s.label}</p>
            <p className={`mt-0.5 ${s.color}`} style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.val}</p>
          </div>
        ))}
      </div>



      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, prénom ou matricule…" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
        </div>
        <select value={filterClasse} onChange={e => setFilterClasse(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none">
          <option value="">Toutes les classes</option>
          {classes.map((c: any) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
        </select>
      </div>

      {/* Table élèves */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-slate-700 text-sm font-semibold">{filtered.length} élève{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['Matricule', 'Élève', 'Sexe', 'Rapports disciplinaires', 'Statut'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">{h}</th>
              ))}
              <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase tracking-wide font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-sm">Aucun élève trouvé.</td></tr>
            )}
            {filtered.map((e: any) => {
              const nbRapports = rapportParMatricule[e.matricule] || 0;
              return (
                <tr key={e.matricule} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono">{e.matricule}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${String(e.sexe) === '2' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                        {e.prenom?.charAt(0)}{e.nom?.charAt(0)}
                      </div>
                      <p className="text-slate-900 font-semibold">{e.nom} {e.prenom}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{String(e.sexe) === '2' ? '♀ Fille' : '♂ Garçon'}</td>
                  <td className="px-5 py-3">
                    {nbRapports > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold">
                        {nbRapports} rapport{nbRapports > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">Aucun</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border font-semibold ${e.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {e.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button 
                      onClick={() => openBulletin(e.matricule)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Voir Bulletin
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL BULLETIN */}
      {selectedBulletin && (
        <BulletinPrint data={selectedBulletin} onClose={() => setSelectedBulletin(null)} />
      )}
    </div>
  );
}
