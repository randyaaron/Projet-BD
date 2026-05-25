"use client"

import { ParentHeader } from "@/components/parent/parent-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Download, 
  Receipt,
  Wallet
} from "lucide-react"
import { cn } from "@/lib/utils"

const payments = [
  { 
    id: "1", 
    label: "Frais de scolarité - 2ème trimestre", 
    child: "Lucas Dupont",
    amount: 75000, 
    dueDate: "15 Jan 2026", 
    status: "pending" as const,
    description: "Frais de scolarité pour le 2ème trimestre 2025-2026"
  },
  { 
    id: "2", 
    label: "Frais de scolarité - 2ème trimestre", 
    child: "Emma Dupont",
    amount: 75000, 
    dueDate: "15 Jan 2026", 
    status: "pending" as const,
    description: "Frais de scolarité pour le 2ème trimestre 2025-2026"
  },
  { 
    id: "3", 
    label: "Cantine - Janvier", 
    child: "Lucas Dupont",
    amount: 25000, 
    dueDate: "05 Jan 2026", 
    status: "overdue" as const,
    description: "Frais de cantine pour le mois de janvier"
  },
  { 
    id: "4", 
    label: "Cantine - Janvier", 
    child: "Emma Dupont",
    amount: 20000, 
    dueDate: "05 Jan 2026", 
    status: "overdue" as const,
    description: "Frais de cantine pour le mois de janvier"
  },
  { 
    id: "5", 
    label: "Fournitures scolaires", 
    child: "Lucas Dupont",
    amount: 15000, 
    dueDate: "01 Dec 2025", 
    status: "paid" as const,
    paidDate: "28 Nov 2025",
    description: "Kit de fournitures scolaires"
  },
  { 
    id: "6", 
    label: "Fournitures scolaires", 
    child: "Emma Dupont",
    amount: 12000, 
    dueDate: "01 Dec 2025", 
    status: "paid" as const,
    paidDate: "28 Nov 2025",
    description: "Kit de fournitures scolaires"
  },
  { 
    id: "7", 
    label: "Frais de scolarité - 1er trimestre", 
    child: "Lucas Dupont",
    amount: 75000, 
    dueDate: "15 Oct 2025", 
    status: "paid" as const,
    paidDate: "10 Oct 2025",
    description: "Frais de scolarité pour le 1er trimestre 2025-2026"
  },
]

const statusConfig = {
  paid: { 
    icon: CheckCircle, 
    label: "Payé", 
    className: "bg-emerald-100 text-emerald-700",
    iconClass: "text-emerald-500"
  },
  pending: { 
    icon: Clock, 
    label: "En attente", 
    className: "bg-amber-100 text-amber-700",
    iconClass: "text-amber-500"
  },
  overdue: { 
    icon: AlertTriangle, 
    label: "En retard", 
    className: "bg-red-100 text-red-700",
    iconClass: "text-red-500"
  },
}

export default function PaiementsPage() {
  const totalDue = payments.filter(p => p.status !== "paid").reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const overdueCount = payments.filter(p => p.status === "overdue").length

  return (
    <div className="min-h-screen">
      <ParentHeader 
        title="Paiements" 
        subtitle="Gérez les frais de scolarité et autres paiements" 
      />

      <div className="p-6 space-y-6">
        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-amber-100">Total à payer</p>
                <p className="text-2xl font-bold">{totalDue.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total payé</p>
                <p className="text-2xl font-bold text-slate-900">{totalPaid.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">En retard</p>
                <p className="text-2xl font-bold text-slate-900">{overdueCount} paiement{overdueCount > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des paiements */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Historique des paiements</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const config = statusConfig[payment.status]
              const StatusIcon = config.icon
              return (
                <div key={payment.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        payment.status === "paid" ? "bg-emerald-50" : payment.status === "overdue" ? "bg-red-50" : "bg-amber-50"
                      )}>
                        <StatusIcon className={cn("h-6 w-6", config.iconClass)} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{payment.label}</p>
                        <p className="text-sm text-slate-500">{payment.child}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {payment.status === "paid" 
                            ? `Payé le ${payment.paidDate}` 
                            : `Échéance: ${payment.dueDate}`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-slate-900">{payment.amount.toLocaleString()} FCFA</p>
                      <Badge className={config.className}>{config.label}</Badge>
                      {payment.status === "paid" ? (
                        <Button variant="outline" size="sm" className="border-slate-200">
                          <Receipt className="h-4 w-4 mr-2" />
                          Reçu
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
