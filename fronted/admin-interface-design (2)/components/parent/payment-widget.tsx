import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface Payment {
  id: string
  label: string
  amount: number
  dueDate: string
  status: "paid" | "pending" | "overdue"
}

interface PaymentWidgetProps {
  payments: Payment[]
  totalDue: number
}

export function PaymentWidget({ payments, totalDue }: PaymentWidgetProps) {
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

  return (
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
          const config = statusConfig[payment.status]
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
          <Link href="/parent/paiements">
            Voir tous les paiements
          </Link>
        </Button>
      </div>
    </div>
  )
}
