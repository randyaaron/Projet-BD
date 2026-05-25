import { ParentHeader } from "@/components/parent/parent-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Eye, FileText } from "lucide-react"
import Link from "next/link"

const bulletins = [
  {
    id: "1",
    child: { name: "Lucas Dupont", class: "CM2", initials: "LD" },
    trimester: "1er Trimestre",
    year: "2025-2026",
    average: 15.5,
    rank: 3,
    totalStudents: 28,
    status: "available",
    date: "20 Déc 2025",
  },
  {
    id: "2",
    child: { name: "Emma Dupont", class: "CE1", initials: "ED" },
    trimester: "1er Trimestre",
    year: "2025-2026",
    average: 14.2,
    rank: 7,
    totalStudents: 25,
    status: "available",
    date: "20 Déc 2025",
  },
  {
    id: "3",
    child: { name: "Lucas Dupont", class: "CM1", initials: "LD" },
    trimester: "3ème Trimestre",
    year: "2024-2025",
    average: 14.8,
    rank: 5,
    totalStudents: 27,
    status: "archived",
    date: "28 Juin 2025",
  },
]

export default function BulletinsPage() {
  return (
    <div className="min-h-screen">
      <ParentHeader 
        title="Bulletins scolaires" 
        subtitle="Consultez et téléchargez les bulletins de vos enfants" 
      />

      <div className="p-6">
        <div className="grid gap-4">
          {bulletins.map((bulletin) => (
            <div 
              key={bulletin.id}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md hover:border-amber-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-amber-200">
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                      {bulletin.child.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{bulletin.child.name}</h3>
                      <Badge variant="outline" className="border-slate-200">{bulletin.child.class}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {bulletin.trimester} - {bulletin.year}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Publié le {bulletin.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{bulletin.average}/20</p>
                    <p className="text-xs text-slate-500">Moyenne</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">#{bulletin.rank}</p>
                    <p className="text-xs text-slate-500">sur {bulletin.totalStudents}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                      <Link href={`/parent/bulletins/${bulletin.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Consulter
                      </Link>
                    </Button>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Archive section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-400" />
            Bulletins archivés
          </h2>
          <p className="text-sm text-slate-500">Les bulletins des années précédentes sont disponibles dans les archives.</p>
        </div>
      </div>
    </div>
  )
}
