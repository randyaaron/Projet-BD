'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewHomeworkPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    school_class_id: '',
    term_id: '1', // Hardcoded to 1 for now, or could fetch active term
    title: '',
    type: 'DEVOIR',
    date: '',
    total_points: '20'
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('sanctum_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/classes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Adjust based on the actual shape of your classes response
          const classesData = Array.isArray(data) ? data : data.classes || [];
          setClasses(classesData);
        }
      } catch (e) {
        console.error("Failed to fetch classes", e);
      } finally {
        setFetching(false);
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.school_class_id || !formData.title || !formData.date) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('sanctum_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          school_class_id: parseInt(formData.school_class_id),
          term_id: parseInt(formData.term_id),
          title: formData.title,
          type: formData.type,
          date: formData.date,
          total_points: parseFloat(formData.total_points)
        })
      });

      if (res.ok) {
        alert('Devoir créé avec succès !');
        router.push('/teacher/homework');
      } else {
        const errData = await res.json();
        alert('Erreur: ' + (errData.message || 'Création échouée'));
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Nouveau devoir" 
        subtitle="Créer une évaluation pour vos élèves"
      />
      
      <div className="p-6 max-w-3xl mx-auto">
        <Link href="/teacher/homework" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 font-medium text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux devoirs
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Classe</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.school_class_id}
                  onChange={e => setFormData({...formData, school_class_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionnez une classe...</option>
                  {!fetching && classes.map((c: any) => (
                    // The TeacherClassController returns assignments which have a school_class relation
                    <option key={c.school_class_id || c.id} value={c.school_class_id || c.id}>
                      {c.school_class?.name || c.name || `Classe #${c.school_class_id || c.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date du devoir</label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Titre du devoir</label>
              <Input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Contrôle sur les fractions"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type d'évaluation</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="DEVOIR">Devoir à la maison</option>
                  <option value="CONTROLE">Contrôle continu</option>
                  <option value="EXAMEN">Examen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Note sur (Points)</label>
                <Input 
                  type="number"
                  min="1"
                  step="0.5"
                  value={formData.total_points}
                  onChange={e => setFormData({...formData, total_points: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Link href="/teacher/homework">
                <Button variant="outline" type="button">Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Créer le devoir
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
