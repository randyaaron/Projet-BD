"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ParentHeaderProps {
  title: string
  subtitle?: string
}

export function ParentHeader({ title, subtitle }: ParentHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="w-64 pl-9 bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-amber-500"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-amber-600 hover:bg-amber-50">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-amber-500 p-0 text-xs text-white flex items-center justify-center">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}
