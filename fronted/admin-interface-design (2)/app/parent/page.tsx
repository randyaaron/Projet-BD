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

  useEffect(() => {
    let userId = searchParams.get('userId');
    if (!userId && typeof window !== 'undefined') {
      userId = localStorage.getItem('user_id');
    }
    
    if (userId) {
      if (typeof window !== 'undefined') localStorage.setItem('user_id', userId);
      fetch(`http://localhost:8000/api/legacy/parent/${userId}/dashboard`)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          setLoading(false);
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
                <p className="mt-2 text-3xl font-bold text-slate-900">14.85</p>
                <p className="mt-1 text-sm text-slate-500">tous enfants confondus</p>
                <p className="mt-2 text-sm font-medium text-emerald-600">↑ +0.5 ce trimestre</p>
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
                <p className="mt-2 text-3xl font-bold text-slate-900">2</p>
                <p className="mt-1 text-sm text-slate-500">1er trimestre 2025-2026</p>
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
                      <p className="text-sm text-slate-500 mt-1">{child.class}</p>
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

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Paiements et Messages */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paiements */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-500 to-amber-600">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Paiements</h3>
                    <p className="text-sm text-amber-100">Frais de scolarité</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-amber-100">Total dû</p>
                  <p className="text-2xl font-bold text-white">{totalDue.toLocaleString()} FCFA</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {payments.map((payment) => {
                  const config = paymentStatusConfig[payment.status]
                  const StatusIcon = config.icon
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${config.iconClass}`} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{payment.label}</p>
                          <p className="text-xs text-slate-500">Échéance: {payment.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-slate-900">{payment.amount.toLocaleString()} FCFA</p>
                        <Badge className={config.className}>{config.label}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  <Link href="/parent/paiements">Voir tous les paiements</Link>
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Messages</h3>
                    <p className="text-sm text-slate-500">{unreadMessages} non lus</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                  <Link href="/parent/messages">Voir tout</Link>
                </Button>
              </div>
              <div className="divide-y divide-slate-100">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer ${message.unread ? 'bg-amber-50/50' : ''}`}>
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                        {message.sender.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{message.sender.name}</p>
                          {message.unread && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                        </div>
                        <p className="text-xs text-slate-500">{message.date}</p>
                      </div>
                      <p className="text-sm text-slate-500">{message.sender.role}</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">{message.subject}</p>
                      <p className="text-sm text-slate-500 truncate">{message.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite - Événements */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Événements à venir</h3>
                    <p className="text-sm text-slate-500">{events.length} prochains</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {events.map((event) => {
                  const config = eventTypeConfig[event.type]
                  const EventIcon = config.icon
                  return (
                    <div key={event.id} className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.className}`}>
                        <EventIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{event.date} • {event.time}</p>
                        {event.location && (
                          <p className="text-xs text-slate-400 mt-0.5">{event.location}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rapports de discipline */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Discipline</h3>
                    <p className="text-sm text-slate-500">Lucas Dupont</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-amber-100 text-amber-700">Observation</Badge>
                      <p className="text-xs text-slate-500">10 Jan 2026</p>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mt-2">Bavardage en classe</p>
                    <p className="text-xs text-slate-500 mt-1">Par Mme Martin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
