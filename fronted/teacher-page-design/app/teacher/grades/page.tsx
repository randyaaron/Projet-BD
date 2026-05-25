'use client';

import { useState, useEffect } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  Save, 
  Download, 
  Search,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Student {
  id: number;
  name: string;
}

interface Assessment {
  id: number;
  title: string;
  date: string;
  total_points: number;
  school_class_id: number;
  grades: { student_id: number, score: string }[];
}

export default function GradesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, Record<string, string>>>({}); // assessmentId -> studentId -> score
  const [originalGradesMap, setOriginalGradesMap] = useState<Record<string, Record<string, string>>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('sanctum_token');
      try {
        const clsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/classes`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (clsRes.ok) {
          const clsData = await clsRes.json();
          const parsedClasses = Array.isArray(clsData) ? clsData : clsData.classes || [];
          setClasses(parsedClasses);
          if (parsedClasses.length > 0) {
            const defaultId = parsedClasses[0].school_class_id || parsedClasses[0].id;
            setSelectedClass(String(defaultId));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchClassData = async () => {
      const token = localStorage.getItem('sanctum_token');
      try {
        setFetching(true);
        const [stuRes, assRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/classes/${selectedClass}/students`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/assessments`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          })
        ]);

        if (stuRes.ok) {
          const stuData = await stuRes.json();
          setStudents(stuData.students || []);
        }

        if (assRes.ok) {
          const assData = await assRes.json();
          // Assuming pagination format: { data: [...] }
          const allAssessments = assData.data || [];
          const classAssessments = allAssessments.filter((a: any) => String(a.school_class_id) === selectedClass);
          setAssessments(classAssessments);

          const initialGrades: Record<string, Record<string, string>> = {};
          classAssessments.forEach((ass: Assessment) => {
            initialGrades[ass.id] = {};
            (ass.grades || []).forEach(g => {
              initialGrades[ass.id][g.student_id] = String(g.score);
            });
          });
          setGradesMap(initialGrades);
          setOriginalGradesMap(JSON.parse(JSON.stringify(initialGrades)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    };
    fetchClassData();
  }, [selectedClass]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGradeColor = (gradeStr: string | null | undefined, maxPoints: number) => {
    if (!gradeStr || gradeStr.trim() === '') return 'text-slate-400';
    const grade = parseFloat(gradeStr);
    const ratio = grade / maxPoints;
    if (ratio >= 0.8) return 'text-emerald-600';
    if (ratio >= 0.6) return 'text-slate-900';
    if (ratio >= 0.5) return 'text-amber-600';
    return 'text-rose-600';
  };

  const handleGradeChange = (assId: number, studentId: number, value: string) => {
    setGradesMap(prev => ({
      ...prev,
      [assId]: {
        ...(prev[assId] || {}),
        [studentId]: value
      }
    }));
  };

  const calculateAverage = (studentId: number) => {
    let totalScore = 0;
    let count = 0;
    assessments.forEach(ass => {
      const g = gradesMap[ass.id]?.[studentId];
      if (g && g.trim() !== '') {
        // Normalize to 20 for average calculation simplicity
        const val = parseFloat(g);
        const max = ass.total_points || 20;
        totalScore += (val / max) * 20;
        count++;
      }
    });
    return count === 0 ? null : (totalScore / count);
  };

  const hasChanges = JSON.stringify(gradesMap) !== JSON.stringify(originalGradesMap);

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    const token = localStorage.getItem('sanctum_token');
    
    try {
      // Find assessments that have changes
      const promises = [];
      for (const ass of assessments) {
        const payloadGrades = [];
        for (const stu of students) {
          const original = originalGradesMap[ass.id]?.[stu.id];
          const current = gradesMap[ass.id]?.[stu.id];
          if (current !== original && current && current.trim() !== '') {
            payloadGrades.push({ student_id: stu.id, score: parseFloat(current) });
          }
        }
        
        if (payloadGrades.length > 0) {
          promises.push(
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/grades`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                assessment_id: ass.id,
                grades: payloadGrades
              })
            })
          );
        }
      }

      await Promise.all(promises);
      alert('Notes enregistrées avec succès !');
      setOriginalGradesMap(JSON.parse(JSON.stringify(gradesMap)));
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement des notes.");
    } finally {
      setSaving(false);
    }
  };

  let gradesCount = 0;
  let totalGradesExpected = students.length * assessments.length;
  students.forEach(s => {
    assessments.forEach(a => {
      if (gradesMap[a.id]?.[s.id]?.trim()) gradesCount++;
    });
  });

  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Saisie des notes" 
        subtitle="Gérer les évaluations de vos classes"
      />
      
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                disabled={fetching}
              >
                {classes.length === 0 && <option value="">Aucune classe</option>}
                {classes.map((cls) => (
                  <option key={cls.school_class_id || cls.id} value={cls.school_class_id || cls.id}>
                    {cls.school_class?.name || cls.name || `Classe #${cls.school_class_id || cls.id}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher un élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 border-slate-200 bg-slate-50 pl-9 text-sm focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className={cn(
                'gap-2 transition-all',
                hasChanges && !saving
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              )}
              disabled={!hasChanges || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            {fetching ? (
              <div className="p-8 flex justify-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Chargement...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Élève
                    </th>
                    {assessments.length === 0 && (
                      <th className="px-4 py-3 text-center text-sm text-slate-400 font-normal">
                        Aucune évaluation trouvée.
                      </th>
                    )}
                    {assessments.map((ass) => (
                      <th key={ass.id} className="px-4 py-3 text-center">
                        <div className="text-sm font-semibold text-slate-900 truncate max-w-[150px] mx-auto" title={ass.title}>{ass.title}</div>
                        <div className="text-xs text-slate-500">{ass.date?.split('-').reverse().join('/') || ''} • /{ass.total_points || 20}</div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center">
                      <div className="text-sm font-semibold text-emerald-700">Moy. (/20)</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={assessments.length + 2} className="p-4 text-center text-sm text-slate-500">
                        Aucun élève trouvé.
                      </td>
                    </tr>
                  )}
                  {filteredStudents.map((student) => {
                    const avg = calculateAverage(student.id);
                    return (
                      <tr key={student.id} className="group transition-colors hover:bg-slate-50/50">
                        <td className="sticky left-0 z-10 bg-white px-4 py-3 group-hover:bg-slate-50/50">
                          <span className="font-medium text-slate-900">{student.name}</span>
                        </td>
                        {assessments.map((ass) => (
                          <td key={ass.id} className="px-4 py-3 text-center">
                            <input
                              type="text"
                              value={gradesMap[ass.id]?.[student.id] || ''}
                              placeholder="-"
                              onChange={(e) => handleGradeChange(ass.id, student.id, e.target.value)}
                              className={cn(
                                'w-16 rounded-lg border border-transparent bg-transparent py-1.5 text-center text-sm font-medium transition-all focus:border-emerald-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
                                getGradeColor(gradesMap[ass.id]?.[student.id], ass.total_points || 20)
                              )}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            'inline-flex items-center justify-center rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold',
                            avg !== null ? getGradeColor(String(avg), 20) : 'text-slate-400'
                          )}>
                            {avg !== null ? avg.toFixed(1) : '-'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {!fetching && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Notes saisies</p>
                <p className="text-lg font-semibold text-slate-900">{gradesCount}/{totalGradesExpected || 0}</p>
              </div>
            </div>
            {/* Autres statistiques simplifiées */}
          </div>
        )}
      </div>
    </main>
  );
}
