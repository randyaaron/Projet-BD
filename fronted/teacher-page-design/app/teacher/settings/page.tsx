'use client';

import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  HelpCircle,
  ChevronRight,
  Camera,
  Mail,
  Phone
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const settingsSections = [
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Gérer vos préférences de notifications',
  },
  {
    id: 'security',
    icon: Lock,
    title: 'Sécurité',
    description: 'Mot de passe et authentification',
  },
  {
    id: 'appearance',
    icon: Palette,
    title: 'Apparence',
    description: 'Thème et affichage',
  },
  {
    id: 'language',
    icon: Globe,
    title: 'Langue et région',
    description: 'Paramètres régionaux',
  },
  {
    id: 'help',
    icon: HelpCircle,
    title: 'Aide et support',
    description: 'Documentation et contact',
  },
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Paramètres" 
        subtitle="Gérer votre compte et vos préférences"
      />
      
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {/* Profile Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <User className="h-5 w-5 text-emerald-600" />
              Profil
            </h2>
            <p className="mt-1 text-sm text-slate-500">Vos informations personnelles</p>

            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-emerald-100">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback className="bg-emerald-600 text-2xl text-white">MB</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-colors hover:bg-emerald-700">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Prénom</label>
                    <Input 
                      defaultValue="Marie" 
                      className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Nom</label>
                    <Input 
                      defaultValue="Boucher" 
                      className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>


                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Mail className="h-4 w-4 text-slate-400" />
                      Email
                    </label>
                    <Input 
                      type="email"
                      defaultValue="marie.boucher@ecole.fr" 
                      className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Phone className="h-4 w-4 text-slate-400" />
                      Téléphone
                    </label>
                    <Input 
                      type="tel"
                      defaultValue="06 12 34 56 78" 
                      className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Enregistrer les modifications
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Bell className="h-5 w-5 text-emerald-600" />
              Préférences de notification
            </h2>
            <p className="mt-1 text-sm text-slate-500">Choisissez comment vous souhaitez être notifié</p>

            <div className="mt-6 space-y-4">
              {[
                { id: 'messages', label: 'Nouveaux messages', description: 'Recevoir une notification pour chaque nouveau message', enabled: true },
                { id: 'absences', label: 'Absences signalées', description: 'Être notifié des nouvelles absences dans vos classes', enabled: true },
                { id: 'homework', label: 'Devoirs rendus', description: 'Notification quand un élève rend un devoir', enabled: false },
                { id: 'grades', label: 'Rappel de saisie des notes', description: 'Rappel pour saisir les notes après un contrôle', enabled: true },
              ].map((pref) => (
                <div 
                  key={pref.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{pref.label}</p>
                    <p className="text-sm text-slate-500">{pref.description}</p>
                  </div>
                  <Switch defaultChecked={pref.enabled} />
                </div>
              ))}
            </div>
          </div>

          {/* Other Settings */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {settingsSections.slice(1).map((section) => (
                <button
                  key={section.id}
                  className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    <section.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{section.title}</p>
                    <p className="text-sm text-slate-500">{section.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>


        </div>
      </div>
    </main>
  );
}
