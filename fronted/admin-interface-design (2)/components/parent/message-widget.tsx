import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  sender: {
    name: string
    role: string
    avatar?: string
  }
  subject: string
  preview: string
  date: string
  unread: boolean
}

interface MessageWidgetProps {
  messages: Message[]
  unreadCount: number
}

export function MessageWidget({ messages, unreadCount }: MessageWidgetProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <MessageSquare className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Messagerie</h3>
            <p className="text-sm text-slate-500">Communication avec l&apos;école</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-amber-500 text-white">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</Badge>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {messages.map((message) => {
          const initials = message.sender.name.split(" ").map(n => n[0]).join("")
          return (
            <Link
              key={message.id}
              href={`/parent/messages/${message.id}`}
              className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${message.unread ? "text-slate-900" : "text-slate-600"}`}>
                    {message.sender.name}
                  </p>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{message.date}</span>
                </div>
                <p className="text-xs text-slate-500">{message.sender.role}</p>
                <p className={`text-sm mt-1 truncate ${message.unread ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                  {message.subject}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{message.preview}</p>
              </div>
              {message.unread && (
                <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
        <Button asChild variant="outline" className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50">
          <Link href="/parent/messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Link>
        </Button>
        <Button asChild className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
          <Link href="/parent/messages/new">
            <Send className="h-4 w-4 mr-2" />
            Nouveau
          </Link>
        </Button>
      </div>
    </div>
  )
}
