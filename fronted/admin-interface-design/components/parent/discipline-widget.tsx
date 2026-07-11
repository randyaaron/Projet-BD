import { AlertTriangle, CheckCircle, FileWarning } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface DisciplineReport {
  id: string
  date: string
  type: "warning" | "observation" | "praise"
  subject: string
  teacher: string
}

interface DisciplineWidgetProps {
  reports: DisciplineReport[]
  childName: string
}

export function DisciplineWidget({ reports, childName }: DisciplineWidgetProps) {
  const typeConfig = {
    warning: { 
      icon: AlertTriangle, 
      label: "Avertissement", 
      className: "bg-red-100 text-red-700",
      iconClass: "text-red-500"
    },
    observation: { 
      icon: FileWarning, 
      label: "Observation", 
      className: "bg-amber-100 text-amber-700",
      iconClass: "text-amber-500"
    },
    praise: { 
      icon: CheckCircle, 
      label: "Félicitation", 
      className: "bg-emerald-100 text-emerald-700",
      iconClass: "text-emerald-500"
    },
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Discipline</h3>
            <p className="text-sm text-slate-500">Rapports disciplinaires</p>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-900">Aucun rapport</p>
          <p className="text-xs text-slate-500 mt-1">{childName} a un excellent comportement</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <FileWarning className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Discipline</h3>
            <p className="text-sm text-slate-500">Rapports disciplinaires</p>
          </div>
        </div>
        <Badge variant="outline" className="border-slate-200">
          {reports.length} rapport{reports.length > 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="divide-y divide-slate-100">
        {reports.slice(0, 3).map((report) => {
          const config = typeConfig[report.type]
          const Icon = config.icon
          return (
            <Link
              key={report.id}
              href={`/parent/discipline/${report.id}`}
              className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
            >
              <Icon className={`h-5 w-5 ${config.iconClass} mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 truncate">{report.subject}</p>
                  <Badge className={config.className}>{config.label}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">Par {report.teacher} - {report.date}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
