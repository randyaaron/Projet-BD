'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText, Loader2, AlertCircle, Printer, X,
  ChevronRight, BookOpen, Shield, Award, User
} from 'lucide-react';

const API = 'http://localhost:8000/api/legacy';

// ─── Helpers ──────────────────────────────────────────────────────────────
function avgColor(avg: number): string {
  if (avg >= 16) return '#16a34a';
  if (avg >= 14) return '#2563eb';
  if (avg >= 10) return '#d97706';
  return '#dc2626';
}
function mention(avg: number): string {
  if (avg >= 16) return 'Très Bien';
  if (avg >= 14) return 'Bien';
  if (avg >= 12) return 'Assez Bien';
  if (avg >= 10) return 'Passable';
  return 'Insuffisant';
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
            {/* Logo / Médaillon */}
            <div style={{
              width: '70px', height: '70px', border: '3px solid #1e3a5f',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, background: '#f0f5ff'
            }}>
              <span style={{ fontSize: '26px', fontWeight: 900, color: '#1e3a5f', letterSpacing: '-2px' }}>LG</span>
            </div>

            {/* Titre central */}
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

            {/* Année académique */}
            <div style={{ textAlign: 'right', minWidth: '100px' }}>
              <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Année</div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e3a5f' }}>{data.annee}</div>
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

            {/* Ligne totaux */}
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
                fontWeight: 700, color: avg !== null ? avgColor(avg) : '#999'
              }}>
                {avg !== null ? mention(avg) : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── RÉSUMÉ GÉNÉRAL ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          {[
            { label: 'Rang', value: `${data.rang} / ${data.effectif}` },
            { label: 'Mention', value: data.mention || '—' },
            { label: 'Absences', value: String(data.total_absences ?? 0) },
            { label: 'Retards', value: String(data.total_retards ?? 0) },
          ].map((item, i) => (
            <div key={i} style={{
              border: '1.5px solid #1e3a5f', borderRadius: '4px',
              padding: '8px', textAlign: 'center', background: '#f8faff'
            }}>
              <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
              <div style={{ fontWeight: 900, fontSize: '16px', color: '#1e3a5f', marginTop: '4px' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* ── CONDUITE & DISCIPLINE ── */}
        <div style={{ border: '2px solid #1e3a5f', borderRadius: '4px', marginBottom: '14px', overflow: 'hidden' }}>
          <div style={{
            background: '#1e3a5f', color: 'white',
            padding: '5px 12px', fontWeight: 700, fontSize: '11px',
            textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            Conduite et Discipline
          </div>
          <div style={{ padding: '10px 12px' }}>
            {sanctions.length === 0 ? (
              <p style={{ color: '#16a34a', fontStyle: 'italic', fontWeight: 600 }}>
                ✓ Aucune sanction disciplinaire enregistrée ce trimestre. Conduite exemplaire.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#f0f5ff', border: '1px solid #ccc', padding: '5px 8px', textAlign: 'left', fontSize: '11px' }}>Date</th>
                    <th style={{ background: '#f0f5ff', border: '1px solid #ccc', padding: '5px 8px', textAlign: 'left', fontSize: '11px' }}>Motif</th>
                    <th style={{ background: '#f0f5ff', border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center', fontSize: '11px' }}>Points perdus</th>
                  </tr>
                </thead>
                <tbody>
                  {sanctions.map((s: any, i: number) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{s.date}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{s.motif}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>-{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── APPRÉCIATION GÉNÉRALE du MAÎTRE ── */}
        <div style={{ border: '2px solid #1e3a5f', borderRadius: '4px', marginBottom: '18px' }}>
          <div style={{
            background: '#1e3a5f', color: 'white',
            padding: '5px 12px', fontWeight: 700, fontSize: '11px',
            textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            Appréciation du Maître/de la Maîtresse
          </div>
          <div style={{ padding: '16px 12px', minHeight: '60px', background: '#fffef0' }}>
            <p style={{ fontStyle: 'italic', color: '#555', fontSize: '11px' }}>
              {avg === null ? '—' :
                avg >= 16 ? `${eleve.prenom} fait preuve d'un excellent niveau scolaire. Élève modèle, continuez ainsi !` :
                avg >= 14 ? `Très bon trimestre pour ${eleve.prenom}. Des efforts réguliers qui portent leurs fruits.` :
                avg >= 12 ? `Bon travail de la part de ${eleve.prenom}. Quelques lacunes à combler, mais des bases solides.` :
                avg >= 10 ? `${eleve.prenom} a passé le cap de la moyenne. Il(Elle) doit fournir plus d'efforts pour progresser.` :
                `${eleve.prenom} est en difficulté. Un suivi renforcé est vivement recommandé.`
              }
            </p>
          </div>
        </div>

        {/* ── TAMPON & CACHET + SIGNATURES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '4px', alignItems: 'flex-end' }}>

          {/* Colonne 1 : Tampon circulaire du Directeur */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#333', letterSpacing: '1px', marginBottom: '8px' }}>
              Cachet &amp; Signature du Directeur
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '90px', height: '90px',
                border: '3px solid #1e3a5f', borderRadius: '50%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '8px',
                background: 'rgba(30,58,95,0.04)',
              }}>
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
            <div style={{
              marginTop: '10px', height: '60px',
              borderBottom: '1px dashed #999',
              background: '#fafafa'
            }} />
          </div>

          {/* Colonne 2 : Signature du Maître/Maîtresse */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#333', letterSpacing: '1px', marginBottom: '8px' }}>
              Signature du Maître / Maîtresse
            </div>
            <div style={{
              marginTop: '10px', height: '90px',
              border: '1px dashed #999', borderRadius: '4px',
              background: '#fafafa'
            }} />
            <div style={{ borderTop: '1px dashed #999', paddingTop: '6px', height: '30px' }} />
          </div>

          {/* Colonne 3 : Cachet rectangulaire + Signature du Parent */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#333', letterSpacing: '1px', marginBottom: '8px' }}>
              Signature du Parent
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div style={{
                border: '2.5px solid #1e3a5f', borderRadius: '6px',
                padding: '6px 10px', width: '110px',
                background: 'rgba(30,58,95,0.04)',
              }}>
                <div style={{ fontSize: '7px', fontWeight: 900, color: '#1e3a5f', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '1px' }}>
                  ÉCOLE LES GÉNIES
                </div>
                <div style={{ borderTop: '1px solid #1e3a5f', margin: '3px 0' }} />
                <div style={{ fontSize: '6px', color: '#1e3a5f', textAlign: 'center' }}>
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
            <div style={{
              marginTop: '10px', height: '30px',
              borderBottom: '1px dashed #999',
              background: '#fafafa'
            }} />
          </div>
        </div>

        {/* Pied de page */}
        <div style={{
          marginTop: '16px', paddingTop: '8px',
          borderTop: '1px solid #ccc', textAlign: 'center',
          fontSize: '10px', color: '#888'
        }}>
          Document généré le {new Date().toLocaleDateString('fr-FR')} — {data.ecole || 'École Les Génies'} — Année {data.annee}
        </div>
      </div>
    </div>
  );
}

// ─── Page liste bulletins ─────────────────────────────────────────────────
function BulletinsContent() {
  const searchParams = useSearchParams();
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBulletin, setSelectedBulletin] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const urlId = searchParams.get('userId');
    if (urlId) localStorage.setItem('parent_user_id', urlId);
    const userId = urlId || localStorage.getItem('parent_user_id');
    if (!userId) { setLoading(false); return; }

    fetch(`${API}/parent/${userId}/bulletins`)
      .then(r => r.json())
      .then(res => setBulletins(res.bulletins || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const openBulletin = async (b: any) => {
    setDetailLoading(true);
    // Extract trimestre ID from bulletin id (format: "matricule_idTrimes")
    const parts = String(b.id).split('_');
    const matricule = parts[0];
    const idTrimes = parts[1];
    try {
      const res = await fetch(`${API}/parent/bulletin-detail/${matricule}/${idTrimes}`);
      const data = await res.json();
      setSelectedBulletin(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulletins scolaires</h1>
          <p className="text-slate-500 text-sm">Cliquez sur un bulletin pour l'afficher ou l'imprimer</p>
        </div>
      </div>

      {bulletins.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center gap-4 text-slate-400">
          <AlertCircle className="w-14 h-14 text-amber-200" />
          <p className="font-semibold text-slate-600">Aucun bulletin disponible</p>
          <p className="text-sm text-center">Les bulletins apparaîtront ici à la fin de chaque trimestre, une fois que des notes auront été saisies.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bulletins.map((b: any) => {
            const avg = b.average;
            const color = avg >= 16 ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
              : avg >= 10 ? 'text-amber-700 bg-amber-100 border-amber-300'
              : 'text-red-700 bg-red-100 border-red-300';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                onClick={() => openBulletin(b)}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar élève */}
                  <div className="w-14 h-14 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-lg flex-shrink-0">
                    {b.child?.nom?.[0]}{b.child?.prenom?.[0]}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-base">{b.child?.nom} {b.child?.prenom}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{b.child?.class} · Année {b.annee}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        Disponible
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{b.trimestre}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm ${color}`}>
                        <Award className="w-3.5 h-3.5" />
                        Moy. {avg.toFixed(2)}/20
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">{b.totalMatières} matière{b.totalMatières > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Flèche */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-700 flex items-center justify-center transition-colors">
                      {detailLoading
                        ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 group-hover:text-white" />
                        : <ChevronRight className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                      }
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Ouvrir</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulletin imprimable */}
      {selectedBulletin && (
        <BulletinPrint data={selectedBulletin} onClose={() => setSelectedBulletin(null)} />
      )}
    </div>
  );
}

export default function BulletinsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <BulletinsContent />
    </Suspense>
  );
}
