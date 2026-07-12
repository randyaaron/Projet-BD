'use client';

import { useState, useEffect, Suspense } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  Save, 
  Check,
  Loader2,
  UserCircle,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

interface Student {
  matricule: number;
  nom: string;
  prenom: string;
}

interface Subject {
  id: number;
  libelle: string;
}

interface Assessment {
  id: number;
  title: string;
  type: string;
  total_points: number;
  subject_id: number;
}

function GradesContent() {
  const searchParams = useSearchParams();
  const [uid, setUid] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  
  // States
  const [evalType, setEvalType] = useState<string>('Séquence'); // Séquence, Contrôle, Devoir
  const [selectedSessionId, setSelectedSessionId] = useState<number>(2); // 2 = Séquence 1, 3 = Séquence 2
  
  // For Examen (Student -> Subjects)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [examenGradesMap, setExamenGradesMap] = useState<Record<number, Record<number, string>>>({}); // studentId -> subjectId -> note
  
  // For Devoir/Contrôle (Assessment -> Students)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [assessmentGradesMap, setAssessmentGradesMap] = useState<Record<number, string>>({}); // studentId -> note
  
  const [fetching, setFetching] = useState(true);
  const [fetchingGrades, setFetchingGrades] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let userId = searchParams.get('userId');
    if (!userId && typeof window !== 'undefined') {
      userId = localStorage.getItem('user_id');
    }
    setUid(userId);
  }, [searchParams]);

  // Initial Context Load
  useEffect(() => {
    if (!uid) return;

    const fetchContext = async () => {
      try {
        setFetching(true);
        // Fetch base context (students, subjects, examen grades from Evaluation table)
        const resCtx = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy/teacher/grades/context/${uid}?session_id=${selectedSessionId}&t=${Date.now()}`);
        if (resCtx.status === 404) {
          const body = await resCtx.json();
          setErrorMsg(body.error || 'Aucune classe assignée. Veuillez attendre une affectation.');
          return;
        }
        if (!resCtx.ok) throw new Error('Erreur de chargement');
        const ctxData = await resCtx.json();
        
        if (ctxData.error) {
          setErrorMsg(ctxData.error);
          return;
        }

        setStudents(ctxData.students || []);
        
        // Context endpoint returns subjects as idCours. We standardize to id for subjects.
        const mappedSubjects = (ctxData.subjects || []).map((s: any) => ({
          id: s.idCours || s.id,
          libelle: s.libelle
        }));
        setSubjects(mappedSubjects);

        // Load Examen Grades map
        const initExamenMap: Record<number, Record<number, string>> = {};
        ctxData.students.forEach((s: Student) => {
          initExamenMap[s.matricule] = {};
        });
        (ctxData.grades || []).forEach((g: any) => {
          if (!initExamenMap[g.matricule]) initExamenMap[g.matricule] = {};
          initExamenMap[g.matricule][g.idCours] = String(g.note);
        });
        setExamenGradesMap(initExamenMap);

        // Fetch assessments from assessments table
        const resAss = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy/teacher/assessments/context/${uid}`);
        if (resAss.ok) {
          const assData = await resAss.json();
          setAssessments(assData.assessments || []);
        }

        if (ctxData.students.length > 0) {
          setSelectedStudent(ctxData.students[0]);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Impossible de charger les données.');
      } finally {
        setFetching(false);
      }
    };

    fetchContext();
  }, [uid, selectedSessionId]);

  // Load specific assessment grades when selected
  useEffect(() => {
    if (!uid || !selectedAssessmentId || evalType === 'Séquence') return;

    const fetchAssessmentGrades = async () => {
      try {
        setFetchingGrades(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy/teacher/assessments/${selectedAssessmentId}/grades`);
        if (!res.ok) throw new Error('Erreur chargement notes');
        const data = await res.json();
        
        const initMap: Record<number, string> = {};
        (data.grades || []).forEach((g: any) => {
          initMap[g.student_id] = String(g.score);
        });
        setAssessmentGradesMap(initMap);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingGrades(false);
      }
    };

    fetchAssessmentGrades();
  }, [uid, selectedAssessmentId, evalType]);

  // Handlers
  const handleExamenGradeChange = (subjectId: number, val: string) => {
    if (!selectedStudent) return;
    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
    const num = parseFloat(val);
    if (val !== '' && (num < 0 || num > 20)) return;

    setExamenGradesMap(prev => ({
      ...prev,
      [selectedStudent.matricule]: {
        ...(prev[selectedStudent.matricule] || {}),
        [subjectId]: val
      }
    }));
  };

  const handleAssessmentGradeChange = (matricule: number, val: string, maxPoints: number) => {
    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
    const num = parseFloat(val);
    if (val !== '' && (num < 0 || num > maxPoints)) return;

    setAssessmentGradesMap(prev => ({
      ...prev,
      [matricule]: val
    }));
  };

  const saveExamenGrades = async () => {
    if (!selectedStudent || !uid) return;
    const studentGrades = examenGradesMap[selectedStudent.matricule] || {};
    const payload = Object.entries(studentGrades)
      .filter(([_, note]) => note !== '')
      .map(([idCours, note]) => ({
        idCours: parseInt(idCours),
        note: parseFloat(note as string)
      }));

    if (payload.length === 0) return;

    try {
      setSaving(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy/teacher/grades/student/${selectedStudent.matricule}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, grades: payload, session_id: selectedSessionId })
      });
      if (!res.ok) throw new Error('Erreur de sauvegarde');
      setSuccessMsg(`Notes enregistrées pour ${selectedStudent.nom}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur lors de la sauvegarde.');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const saveAssessmentGrades = async () => {
    if (!uid || !selectedAssessmentId) return;
    
    const payload = Object.entries(assessmentGradesMap)
      .filter(([_, note]) => note !== '')
      .map(([student_id, note]) => ({
        student_id: parseInt(student_id),
        score: parseFloat(note as string)
      }));

    if (payload.length === 0) return;

    try {
      setSaving(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy/teacher/assessments/${selectedAssessmentId}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, grades: payload })
      });
      if (!res.ok) throw new Error('Erreur de sauvegarde');
      setSuccessMsg(`Toutes les notes ont été enregistrées avec succès.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur lors de la sauvegarde.');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Render Logic
  const filteredAssessments = assessments.filter(a => a.type === evalType);
  const selectedAssObj = assessments.find(a => String(a.id) === selectedAssessmentId);

  return (
    <main className="min-h-screen pb-10 bg-slate-50/50">
      <TeacherHeader 
        title="Saisie des notes" 
        subtitle="Remplissez les notes pour vos élèves"
      />

      <div className="p-6 max-w-6xl mx-auto">
        
        {/* Top Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Type d'évaluation</label>
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 w-max">
              {['Séquence', 'Contrôle', 'Devoir'].map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setEvalType(t);
                    setSelectedAssessmentId('');
                  }}
                  className={cn(
                    "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                    evalType === t 
                      ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {evalType !== 'Séquence' && (
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sélectionnez l'épreuve</label>
              <select 
                value={selectedAssessmentId}
                onChange={e => setSelectedAssessmentId(e.target.value)}
                className="w-full max-w-sm h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="">-- Choisir un {evalType.toLowerCase()} --</option>
                {filteredAssessments.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
          )}

          {evalType === 'Séquence' && (
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sélectionnez la Séquence</label>
              <select 
                value={selectedSessionId}
                onChange={e => setSelectedSessionId(Number(e.target.value))}
                className="w-full max-w-sm h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium"
              >
                <option value={2}>Séquence 1</option>
                <option value={3}>Séquence 2</option>
                <option value={4}>Séquence 3</option>
                <option value={5}>Séquence 4</option>
                <option value={6}>Séquence 5</option>
                <option value={7}>Séquence 6</option>
              </select>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm flex items-center font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm flex items-center font-medium">
            <Check className="w-4 h-4 mr-2" /> {successMsg}
          </div>
        )}

        {fetching ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* SÉQUENCE VIEW */}
            {evalType === 'Séquence' && (
              <div className="flex flex-col md:flex-row gap-6 animate-in fade-in">
                {/* Student List */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-blue-600" />
                      Liste des élèves
                    </h2>
                    <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {students.map(student => (
                        <button
                          key={student.matricule}
                          onClick={() => setSelectedStudent(student)}
                          className={cn(
                            "flex items-center text-left p-3 rounded-xl border transition-all",
                            selectedStudent?.matricule === student.matricule 
                              ? "bg-blue-50 border-blue-200 shadow-sm" 
                              : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50",
                            !student.actif && "opacity-60"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-3",
                            selectedStudent?.matricule === student.matricule
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          )}>
                            {student.nom.charAt(0)}{student.prenom?.charAt(0)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "font-semibold text-sm truncate",
                                selectedStudent?.matricule === student.matricule ? "text-blue-900" : "text-slate-700"
                              )}>
                                {student.nom} {student.prenom}
                              </p>
                              {!student.actif && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Inactif</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">Matricule: {student.matricule}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grades Input */}
                <div className="w-full md:w-2/3">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    {!selectedStudent ? (
                      <div className="py-20 flex flex-col items-center text-slate-400">
                        <UserCircle className="w-12 h-12 mb-4 opacity-50" />
                        <p>Sélectionnez un élève pour saisir ses notes</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-bold text-slate-900">
                                {selectedStudent.nom} {selectedStudent.prenom}
                              </h2>
                              {!selectedStudent.actif && (
                                <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">Inactif</span>
                              )}
                            </div>
                            <p className="text-slate-500 text-sm mt-1">Saisie des notes par matière (sur 20) pour la Séquence sélectionnée</p>
                          </div>
                          <Button onClick={saveExamenGrades} disabled={saving || !selectedStudent.actif} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</> : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}
                          </Button>
                        </div>

                        {!selectedStudent.actif && (
                          <div className="mb-6 p-4 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-sm font-medium">
                            Cet élève est inactif. Vous ne pouvez pas modifier ses notes.
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {subjects.map(subject => {
                            const val = examenGradesMap[selectedStudent.matricule]?.[subject.id] || '';
                            const isFilled = val !== '';
                            return (
                              <div key={subject.id} className={cn("p-4 rounded-xl border transition-colors", isFilled ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-100", !selectedStudent.actif && "opacity-50 pointer-events-none")}>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 truncate" title={subject.libelle}>{subject.libelle}</label>
                                <div className="relative">
                                  <Input disabled={!selectedStudent.actif} type="text" placeholder=" / 20" value={val} onChange={(e) => handleExamenGradeChange(subject.id, e.target.value)} className={cn("text-lg font-bold pr-10", isFilled ? "border-emerald-200 focus-visible:ring-emerald-500 text-emerald-800" : "")} />
                                  {isFilled && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"><Check className="w-4 h-4" /></div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DEVOIR / CONTRÔLE VIEW */}
            {evalType !== 'Séquence' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                {!selectedAssessmentId ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-center max-w-sm">
                      Veuillez sélectionner une épreuve dans la liste déroulante ci-dessus pour saisir les notes de la classe entière.
                    </p>
                  </div>
                ) : fetchingGrades ? (
                  <div className="py-20 flex justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedAssObj?.title}</h2>
                        <div className="flex items-center gap-3 mt-2 text-sm font-medium text-slate-500">
                          <span className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">{evalType}</span>
                          <span className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                            Matière : {subjects.find(s => String(s.id) === String(selectedAssObj?.subject_id))?.libelle || 'Inconnue'}
                          </span>
                        </div>
                      </div>
                      <Button onClick={saveAssessmentGrades} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] shadow-sm">
                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</> : <><Save className="w-4 h-4 mr-2" /> Enregistrer les notes</>}
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider w-16 text-center">N°</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Élève</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider w-48 text-center">Note / {selectedAssObj?.total_points || 20}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {students.map((student, idx) => {
                            const val = assessmentGradesMap[student.matricule] || '';
                            const isFilled = val !== '';
                            const totalPts = selectedAssObj?.total_points || 20;
                            
                            return (
                              <tr key={student.matricule} className={cn("hover:bg-slate-50/50 transition-colors", !student.actif && "bg-slate-50/50 opacity-60")}>
                                <td className="px-6 py-4 text-center font-medium text-slate-400">{idx + 1}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                                      {student.nom.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900">{student.nom} {student.prenom}</p>
                                        {!student.actif && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Inactif</span>}
                                      </div>
                                      <p className="text-xs text-slate-500">{student.matricule}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="relative flex justify-center">
                                    <Input
                                      disabled={!student.actif}
                                      type="text"
                                      placeholder={`/ ${totalPts}`}
                                      value={val}
                                      onChange={(e) => handleAssessmentGradeChange(student.matricule, e.target.value, totalPts)}
                                      className={cn(
                                        "w-24 text-center text-lg font-bold transition-all shadow-sm",
                                        isFilled && student.actif ? "border-emerald-300 bg-emerald-50/30 focus-visible:ring-emerald-500 text-emerald-800" : "bg-white border-slate-200"
                                      )}
                                    />
                                    {isFilled && (
                                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                                        <Check className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function GradesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Chargement...</div>}>
      <GradesContent />
    </Suspense>
  );
}
