"use client"

import { useState } from "react"
import { ParentHeader } from "@/components/parent/parent-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft,
  Inbox,
  Mail,
  MailOpen,
  Paperclip,
  Search,
  Send,
  Star,
  Trash2,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

const messages = [
  {
    id: "1",
    sender: { name: "Mme Martin", role: "Enseignante CM2", avatar: "" },
    subject: "Sortie scolaire au musée des sciences",
    preview: "Nous organisons une sortie au musée des sciences le 20 janvier...",
    content: `Cher(e) parent,

Nous organisons une sortie scolaire au musée des sciences le lundi 20 janvier 2026.

Détails de la sortie :
- Départ : 8h30 de l'école
- Retour prévu : 16h00
- Pique-nique à prévoir (ou possibilité de déjeuner à la cafétéria du musée - 3500 FCFA)
- Transport en bus scolaire

Veuillez remplir et retourner l'autorisation de sortie signée avant le 15 janvier.

Pour toute question, n'hésitez pas à me contacter.

Cordialement,
Mme Martin`,
    date: "Aujourd'hui",
    time: "10:34",
    unread: true,
    starred: false,
  },
  {
    id: "2",
    sender: { name: "Direction", role: "Administration" },
    subject: "Réunion parents-professeurs du 2ème trimestre",
    preview: "La réunion du 2ème trimestre aura lieu le samedi 18 janvier...",
    content: `Chers parents,

Nous avons le plaisir de vous inviter à la réunion parents-professeurs du 2ème trimestre qui se tiendra :

Date : Samedi 18 janvier 2026
Horaires : 14h00 - 17h00
Lieu : Salle polyvalente de l'école

Cette réunion sera l'occasion de :
- Faire le point sur les résultats du 1er trimestre
- Discuter des objectifs pour le 2ème trimestre
- Échanger avec les enseignants

Merci de confirmer votre présence.

La Direction`,
    date: "Hier",
    time: "14:22",
    unread: true,
    starred: true,
  },
  {
    id: "3",
    sender: { name: "M. Bernard", role: "Enseignant CE1" },
    subject: "Devoirs de vacances pour Emma",
    preview: "Voici les exercices à faire pendant les vacances...",
    content: `Bonjour,

Voici les devoirs de vacances pour Emma :

1. Lecture : 15 minutes par jour minimum
2. Cahier d'exercices : pages 34 à 38
3. Écriture : copier les mots de vocabulaire du carnet

Emma progresse bien cette année. Continuez à l'encourager dans sa lecture.

Bonnes vacances !
M. Bernard`,
    date: "12 Jan",
    time: "16:45",
    unread: false,
    starred: false,
  },
  {
    id: "4",
    sender: { name: "Cantine", role: "Service restauration" },
    subject: "Menu de la semaine du 13 janvier",
    preview: "Retrouvez le menu de la cantine pour la semaine...",
    content: `Menu de la semaine du 13 au 17 janvier 2026

Lundi : Salade de carottes, Poulet rôti, Riz, Yaourt
Mardi : Betteraves, Poisson pané, Purée, Fruit
Mercredi : Concombre, Steak haché, Frites, Compote
Jeudi : Tomates, Spaghetti bolognaise, Fromage
Vendredi : Salade verte, Omelette, Haricots verts, Gâteau

Bon appétit !`,
    date: "11 Jan",
    time: "09:00",
    unread: false,
    starred: false,
  },
]

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const unreadCount = messages.filter(m => m.unread).length

  return (
    <div className="min-h-screen">
      <ParentHeader 
        title="Messagerie" 
        subtitle="Communication avec l'école" 
      />

      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
            {/* Liste des messages */}
            <div className={cn(
              "w-full md:w-96 border-r border-slate-100 flex flex-col",
              selectedMessage && "hidden md:flex"
            )}>
              {/* Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-slate-900">Boîte de réception</span>
                    {unreadCount > 0 && (
                      <Badge className="bg-amber-500 text-white">{unreadCount}</Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => setShowCompose(true)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-9 bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              {/* Liste */}
              <div className="flex-1 overflow-y-auto">
                {messages.map((message) => {
                  const initials = message.sender.name.split(" ").map(n => n[0]).join("")
                  return (
                    <button
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={cn(
                        "w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors",
                        selectedMessage?.id === message.id && "bg-amber-50",
                        message.unread && "bg-amber-50/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              "text-sm truncate",
                              message.unread ? "font-semibold text-slate-900" : "text-slate-600"
                            )}>
                              {message.sender.name}
                            </p>
                            <div className="flex items-center gap-1">
                              {message.starred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                              <span className="text-xs text-slate-400 whitespace-nowrap">{message.date}</span>
                            </div>
                          </div>
                          <p className={cn(
                            "text-sm truncate",
                            message.unread ? "font-medium text-slate-900" : "text-slate-600"
                          )}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{message.preview}</p>
                        </div>
                        {message.unread && (
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contenu du message */}
            <div className={cn(
              "flex-1 flex flex-col",
              !selectedMessage && "hidden md:flex"
            )}>
              {selectedMessage ? (
                <>
                  {/* Header du message */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="md:hidden"
                        onClick={() => setSelectedMessage(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-amber-600">
                          <Star className={cn(
                            "h-4 w-4",
                            selectedMessage.starred && "fill-amber-500 text-amber-500"
                          )} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Corps du message */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">{selectedMessage.subject}</h2>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {selectedMessage.sender.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{selectedMessage.sender.name}</p>
                        <p className="text-sm text-slate-500">{selectedMessage.sender.role}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm text-slate-500">{selectedMessage.date}</p>
                        <p className="text-xs text-slate-400">{selectedMessage.time}</p>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      {selectedMessage.content.split('\n').map((line, i) => (
                        <p key={i} className="text-slate-700 mb-2">{line || <br />}</p>
                      ))}
                    </div>
                  </div>

                  {/* Répondre */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Répondre à ce message..." 
                        className="flex-1 bg-white"
                      />
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MailOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Sélectionnez un message pour le lire</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Nouveau message */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Nouveau message</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCompose(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Destinataire</label>
                  <Input placeholder="Sélectionnez un destinataire..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Sujet</label>
                  <Input placeholder="Objet du message..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Message</label>
                  <Textarea placeholder="Écrivez votre message..." rows={6} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Joindre
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCompose(false)}>
                    Annuler
                  </Button>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
