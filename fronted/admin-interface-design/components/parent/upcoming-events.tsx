import { Calendar, Clock, MapPin } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location?: string
  type: "exam" | "meeting" | "event" | "holiday"
}

interface UpcomingEventsProps {
  events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const typeConfig = {
    exam: { color: "bg-red-500", label: "Examen" },
    meeting: { color: "bg-blue-500", label: "Réunion" },
    event: { color: "bg-amber-500", label: "Événement" },
    holiday: { color: "bg-emerald-500", label: "Congé" },
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 p-5 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
          <Calendar className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Prochains événements</h3>
          <p className="text-sm text-slate-500">Calendrier scolaire</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {events.map((event) => {
          const config = typeConfig[event.type]
          return (
            <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`h-2 w-2 rounded-full ${config.color} mt-2`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{event.title}</p>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{config.label}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {event.time}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
