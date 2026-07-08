'use client';

import { useState } from 'react';
import { User, Bell, Lock, Palette, Globe, HelpCircle, ChevronRight, Camera, Mail, Phone, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const settingsSections = [
  { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Gérer vos préférences de notifications' },
  { id: 'security', icon: Lock, title: 'Sécurité', description: 'Mot de passe et authentification' },
  { id: 'language', icon: Globe, title: 'Langue et région', description: 'Paramètres régionaux' },
  { id: 'help', icon: HelpCircle, title: 'Aide et support', description: 'Contacter l\'école' },
];

export default function ParentSettings() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuration</h1>
          <p className="text-slate-500 text-sm font-medium">Gérez votre compte et vos préférences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === 'profile' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <User className="w-5 h-5" /> Mon Profil
            <ChevronRight className={`w-4 h-4 ml-auto ${activeSection === 'profile' ? 'opacity-100' : 'opacity-0'}`} />
          </button>
          
          <div className="h-px bg-slate-200 my-2" />
          
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === section.id ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <section.icon className="w-5 h-5" />
              <div className="text-left">
                <div>{section.title}</div>
                <div className="text-xs font-normal text-slate-400 mt-0.5">{section.description}</div>
              </div>
              <ChevronRight className={`w-4 h-4 ml-auto ${activeSection === section.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            
            {activeSection === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Informations personnelles</h2>
                  <p className="text-sm text-slate-500">Mettez à jour vos coordonnées.</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-3xl font-bold text-amber-700">
                      P
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 hover:bg-slate-50 transition-colors">
                      <Camera className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Parent d'Élève</h3>
                    <p className="text-slate-500 text-sm">Compte Tuteur / Parent</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Nom complet</label>
                    <input type="text" defaultValue="Parent d'Élève" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Adresse Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input type="email" defaultValue="parent@example.com" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input type="text" defaultValue="+237 600 00 00 00" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Adresse (Ville, Quartier)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input type="text" defaultValue="Douala, Akwa" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            )}

            {activeSection !== 'profile' && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Section en développement</h3>
                <p className="text-slate-500 max-w-sm">Cette section de configuration sera bientôt disponible pour gérer vos préférences avancées.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
