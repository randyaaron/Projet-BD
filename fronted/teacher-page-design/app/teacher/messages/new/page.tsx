'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewMessagePage() {
  const router = useRouter();
  const [parents, setParents] = useState<{ id: number, nom: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    idParent: '',
    objet: '',
    information: ''
  });

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const token = localStorage.getItem('sanctum_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/messages/parents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setParents(data.parents || []);
        }
      } catch (e) {
        console.error("Failed to fetch parents", e);
      } finally {
        setFetching(false);
      }
    };
    fetchParents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idParent || !formData.objet || !formData.information) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('sanctum_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          idParent: parseInt(formData.idParent),
          objet: formData.objet,
          information: formData.information
        })
      });

      if (res.ok) {
        alert('Message envoyé avec succès !');
        router.push('/teacher/messages');
      } else {
        alert('Erreur lors de l\'envoi du message');
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
        title="Nouveau message" 
        subtitle="Envoyer un message à un parent d'élève"
      />
      
      <div className="p-6 max-w-3xl mx-auto">
        <Link href="/teacher" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 font-medium text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Destinataire (Parent)</label>
              <select 
                className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.idParent}
                onChange={e => setFormData({...formData, idParent: e.target.value})}
                required
              >
                <option value="">Sélectionnez un parent...</option>
                {!fetching && parents.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Objet du message</label>
              <Input 
                value={formData.objet}
                onChange={e => setFormData({...formData, objet: e.target.value})}
                placeholder="Ex: Convocation, Retards fréquents, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea 
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[200px] resize-y"
                placeholder="Saisissez votre message ici..."
                value={formData.information}
                onChange={e => setFormData({...formData, information: e.target.value})}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Link href="/teacher">
                <Button variant="outline" type="button">Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Envoyer le message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
