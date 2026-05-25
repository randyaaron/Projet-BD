"use client"

import { useState } from "react"
import { ParentHeader } from "@/components/parent/parent-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const children = [
  { id: "1", name: "Lucas Dupont", class: "CM2", initials: "LD" },
  { id: "2", name: "Emma Dupont", class: "CE1", initials: "ED" },
]

const notesData: Record<string, { subject: string; notes: { label: string; value: number; max: number; date: string; teacher: string }[]; average: number; classAverage: number }[]> = {
  "1": [
    {
      subject: "Mathématiques",
      notes: [
        { label: "Contrôle - Fractions", value: 16, max: 20, date: "10 Jan 2026", teacher: "Mme Martin" },
        { label: "Devoir - Géométrie", value: 14, max: 20, date: "05 Jan 2026", teacher: "Mme Martin" },
        { label: "Interrogation - Calcul mental", value: 18, max: 20, date: "18 Déc 2025", teacher: "Mme Martin" },
      ],
      average: 16,
      classAverage: 13.5,
    },
    {
      subject: "Français",
      notes: [
        { label: "Dictée", value: 15, max: 20, date: "08 Jan 2026", teacher: "Mme Martin" },
        { label: "Rédaction", value: 14, max: 20, date: "20 Déc 2025", teacher: "Mme Martin" },
        { label: "Grammaire", value: 16, max: 20, date: "15 Déc 2025", teacher: "Mme Martin" },
      ],
      average: 15,
      classAverage: 12.8,
    },
    {
      subject: "Histoire-Géographie",
      notes: [
        { label: "Évaluation - La Révolution", value: 17, max: 20, date: "12 Jan 2026", teacher: "Mme Martin" },
        { label: "Exposé - Les régions", value: 15, max: 20, date: "05 Déc 2025", teacher: "Mme Martin" },
      ],
      average: 16,
      classAverage: 14.2,
    },
    {
      subject: "Sciences",
      notes: [
        { label: "Expérience - États de l'eau", value: 18, max: 20, date: "09 Jan 2026", teacher: "Mme Martin" },
        { label: "Contrôle - Le corps humain", value: 14, max: 20, date: "12 Déc 2025", teacher: "Mme Martin" },
      ],
      average: 16,
      classAverage: 13.8,
    },
  ],
  "2": [
    {
      subject: "Lecture",
      notes: [
        { label: "Lecture à voix haute", value: 15, max: 20, date: "10 Jan 2026", teacher: "M. Bernard" },
        { label: "Compréhension de texte", value: 14, max: 20, date: "03 Jan 2026", teacher: "M. Bernard" },
      ],
      average: 14.5,
      classAverage: 13,
    },
    {
      subject: "Écriture",
      notes: [
        { label: "Copie", value: 16, max: 20, date: "08 Jan 2026", teacher: "M. Bernard" },
        { label: "Production écrite", value: 13, max: 20, date: "18 Déc 2025", teacher: "M. Bernard" },
      ],
      average: 14.5,
      classAverage: 12.5,
    },
    {
      subject: "Mathématiques",
      notes: [
        { label: "Addition et soustraction", value: 14, max: 20, date: "09 Jan 2026", teacher: "M. Bernard" },
        { label: "Problèmes", value: 12, max: 20, date: "20 Déc 2025", teacher: "M. Bernard" },
      ],
      average: 13,
      classAverage: 12,
    },
  ],
}

export default function NotesPage() {
  const [selectedChild, setSelectedChild] = useState(children[0].id)
  const notes = notesData[selectedChild] || []

  const getGradeColor = (value: number, max: number) => {
    const percentage = (value / max) * 100
    if (percentage >= 80) return "text-emerald-600 bg-emerald-50"
    if (percentage >= 60) return "text-amber-600 bg-amber-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <div className="min-h-screen">
      <ParentHeader 
        title="Notes et évaluations" 
        subtitle="Suivez les résultats scolaires de vos enfants" 
      />

      <div className="p-6">
        {/* Sélection de l'enfant */}
        <div className="flex gap-3 mb-6">
          {children.map((child) => (
            <Button
              key={child.id}
              variant={selectedChild === child.id ? "default" : "outline"}
              onClick={() => setSelectedChild(child.id)}
              className={cn(
                "flex items-center gap-2",
                selectedChild === child.id 
                  ? "bg-amber-500 hover:bg-amber-600 text-white" 
                  : "border-amber-200 text-amber-700 hover:bg-amber-50"
              )}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className={cn(
                  "text-xs",
                  selectedChild === child.id 
                    ? "bg-amber-600 text-white" 
                    : "bg-amber-100 text-amber-700"
                )}>
                  {child.initials}
                </AvatarFallback>
              </Avatar>
              {child.name}
              <Badge variant="outline" className={cn(
                "text-xs",
                selectedChild === child.id 
                  ? "border-amber-300 text-amber-100" 
                  : "border-slate-200"
              )}>
                {child.class}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Notes par matière */}
        <div className="space-y-6">
          {notes.map((subject) => (
            <div 
              key={subject.subject}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">{subject.subject}</h3>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Moyenne élève</p>
                    <p className="text-lg font-bold text-amber-600">{subject.average}/20</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Moyenne classe</p>
                    <p className="text-lg font-semibold text-slate-600">{subject.classAverage}/20</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {subject.notes.map((note, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{note.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{note.teacher} - {note.date}</p>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-lg font-bold",
                      getGradeColor(note.value, note.max)
                    )}>
                      {note.value}/{note.max}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
