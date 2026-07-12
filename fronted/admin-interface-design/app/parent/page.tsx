'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, CreditCard, FileText, TrendingUp, Bell, MessageSquare, Calendar, AlertCircle, CheckCircle, Clock, AlertTriangle, Users, GraduationCap, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const statusConfig: Record<string, { label: string, className: string }> = {
  excellent: { label: "Excellent", className: "bg-emerald-100 text-emerald-700" },
  good: { label: "Bien", className: "bg-amber-100 text-amber-700" },
  "needs-attention": { label: "À surveiller", className: "bg-red-100 text-red-700" },
}

const paymentStatusConfig: Record<string, { icon: any, label: string, className: string, iconClass: string }> = {
  paid: { icon: CheckCircle, label: "Payé", className: "bg-emerald-100 text-emerald-700", iconClass: "text-emerald-500" },
  pending: { icon: Clock, label: "En attente", className: "bg-amber-100 text-amber-700", iconClass: "text-amber-500" },
  overdue: { icon: AlertTriangle, label: "En retard", className: "bg-red-100 text-red-700", iconClass: "text-red-500" },
}

const eventTypeConfig: Record<string, { icon: any, className: string }> = {
  exam: { icon: FileText, className: "bg-red-100 text-red-600" },
  meeting: { icon: Users, className: "bg-blue-100 text-blue-600" },
  event: { icon: GraduationCap, className: "bg-amber-100 text-amber-600" },
  holiday: { icon: Calendar, className: "bg-emerald-100 text-emerald-600" },
}

function ParentDashboardContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [bulletinsCount, setBulletinsCount] = useState(0);

  useEffect(() => {
    let userId = searchParams.get('userId');
    if (!userId && typeof window !== 'undefined') {
      userId = localStorage.getItem('user_id');
    }
    
    if (userId) {
      if (typeof window !== 'undefined') localStorage.setItem('user_id', userId);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy/parent/${userId}/dashboard?t=${Date.now()}`)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/legacy/parent/${userId}/bulletins?t=${Date.now()}`)
            .then(b => b.json())
            .then(bData => {
                setBulletinsCount(bData.bulletins?.length || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        })
        .catch(err => {
           console.error(err);
           setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  if (!data) {
    return <div className="flex h-screen items-center justify-center bg-slate-50">Aucune donnée disponible.</div>;
  }

  const { children = [], payments = [], messages = [], events = [], parent } = data;
  const totalDue = payments.filter((p: any) => p.status !== "paid").reduce((sum: number, p: any) => sum + p.amount, 0)
  const unreadMessages = messages.filter((m: any) => m.unread).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500">Bienvenue, {parent ? `${parent.prenom} ${parent.nom}` : 'Parent'}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-amber-600 hover:bg-amber-50">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-amber-500 text-xs text-white flex items-center justify-center">
              {unreadMessages}
            </span>
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md hover:border-amber-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Mes enfants</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{children.length}</p>
                <p className="mt-1 text-sm text-slate-500">inscrits cette année</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md hover:border-amber-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Moyenne générale</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {data.children.length > 0 
                    ? (data.children.reduce((acc: number, c: any) => acc + c.average, 0) / data.children.length).toFixed(2) 
                    : '—'}
                </p>
                <p className="mt-1 text-sm text-slate-500">tous enfants confondus</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md hover:border-amber-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Bulletins disponibles</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{bulletinsCount}</p>
                <p className="mt-1 text-sm text-slate-500">Trimestre en cours</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md hover:border-amber-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Paiements en attente</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{totalDue.toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-500">FCFA à régler</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Section enfants */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Mes enfants</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {children.map((child) => {
              const status = statusConfig[child.status]
              const initials = child.name.split(" ").map(n => n[0]).join("")
              return (
                <div key={child.id} className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:border-amber-300">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-amber-200">
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-lg font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">{child.name}</h3>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-sm text-slate-500 font-medium">{child.class}</p>
                        <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-2 py-1 w-max">
                          👨‍🏫 Titulaire : <span className="font-semibold text-slate-600">{child.teacher}</span>
                        </p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                            <TrendingUp className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Moyenne</p>
                            <p className="text-sm font-semibold text-slate-900">{child.average}/20</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                            <span className="text-sm font-bold text-emerald-600">#{child.rank}</span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Classement</p>
                            <p className="text-sm font-semibold text-slate-900">sur {child.totalStudents}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50">
                      <Link href={`/parent/bulletins`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Bulletin
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href={`/parent/notes`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Notes
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grille principale remaniée */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Section Paiements (plus compacte) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col">
             <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Suivi Financier</h3>
                    <p className="text-xs text-slate-500">Paiements et scolarité</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Total à régler</p>
                  <p className="text-xl font-black text-amber-600">{totalDue.toLocaleString()} FCFA</p>
                </div>
             </div>
             
             <div className="flex-1 p-5">
               {payments.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                    <CheckCircle className="w-10 h-10 text-emerald-300 mb-2" />
                    <p className="font-medium text-slate-600">Aucun paiement en attente</p>
                    <p className="text-xs">Vous êtes à jour dans vos règlements.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {payments.slice(0, 4).map((payment: any) => {
                      const config = paymentStatusConfig[payment.status]
                      const StatusIcon = config.icon
                      return (
                        <div key={payment.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-sm transition-all flex items-center justify-between">
                           <div>
                             <p className="text-sm font-bold text-slate-800">{payment.label}</p>
                             <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                               <Clock className="w-3 h-3" /> {payment.dueDate}
                             </p>
                           </div>
                           <div className="text-right">
                             <p className="text-sm font-black text-slate-900">{payment.amount.toLocaleString()}</p>
                             <Badge className={config.className + " mt-1 scale-90 origin-right"}>{config.label}</Badge>
                           </div>
                        </div>
                      )
                    })}
                 </div>
               )}
             </div>
             <div className="p-3 border-t border-slate-100 bg-slate-50">
               <Button asChild variant="ghost" className="w-full text-amber-600 hover:bg-amber-100">
                 <Link href="/parent/paiements">Historique complet des paiements</Link>
               </Button>
             </div>
          </div>

          {/* Section Messages (colonne droite) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Messagerie</h3>
                  <p className="text-xs text-slate-500">{unreadMessages} message(s) non lu(s)</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[350px]">
               {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                   <MessageSquare className="w-10 h-10 text-slate-200 mb-2" />
                   <p className="text-sm">Boîte de réception vide</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                   {messages.map((message: any) => (
                     <div key={message.id} className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${message.unread ? 'bg-blue-50/30' : ''}`}>
                       <div className="flex items-start gap-3">
                         <Avatar className="h-9 w-9 border border-slate-200 shrink-0">
                           <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                             {message.sender.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                           </AvatarFallback>
                         </Avatar>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between gap-2">
                             <p className="text-sm font-bold text-slate-800 truncate">{message.sender.name}</p>
                             <p className="text-[10px] font-medium text-slate-400 shrink-0">{message.date}</p>
                           </div>
                           <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">{message.subject}</p>
                           <p className="text-xs text-slate-500 truncate mt-1">{message.preview}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <Button asChild variant="ghost" className="w-full text-blue-600 hover:bg-blue-100">
                 <Link href="/parent/messages">Ouvrir la messagerie</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>}>
      <ParentDashboardContent />
    </Suspense>
  );
}
