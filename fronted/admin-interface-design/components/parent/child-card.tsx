import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"

interface ChildCardProps {
  child: {
    id: string
    name: string
    class: string
    photo?: string
    average: number
    rank?: number
    totalStudents?: number
    status: "excellent" | "good" | "needs-attention"
  }
}

export function ChildCard({ child }: ChildCardProps) {
  const statusConfig = {
    excellent: { label: "Excellent", className: "bg-emerald-100 text-emerald-700" },
    good: { label: "Bien", className: "bg-amber-100 text-amber-700" },
    "needs-attention": { label: "A surveiller", className: "bg-red-100 text-red-700" },
  }

  const status = statusConfig[child.status]
  const initials = child.name.split(" ").map(n => n[0]).join("")

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:border-amber-300">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-amber-200">
          <AvatarImage src={child.photo} alt={child.name} />
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
            {child.rank && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <span className="text-sm font-bold text-emerald-600">#{child.rank}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Classement</p>
                  <p className="text-sm font-semibold text-slate-900">sur {child.totalStudents}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50">
          <Link href={`/parent/bulletins/${child.id}`}>
            <FileText className="h-4 w-4 mr-2" />
            Bulletin
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
          <Link href={`/parent/notes/${child.id}`}>
            <BookOpen className="h-4 w-4 mr-2" />
            Notes
          </Link>
        </Button>
      </div>
    </div>
  )
}
