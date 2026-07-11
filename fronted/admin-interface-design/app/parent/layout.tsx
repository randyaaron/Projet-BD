"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

const navigation = [
  { name: "Tableau de bord", href: "/parent", icon: Home },
  { name: "Bulletins", href: "/parent/bulletins", icon: FileText },
  { name: "Notes", href: "/parent/notes", icon: BookOpen },
  { name: "Paiements", href: "/parent/paiements", icon: CreditCard },
  { name: "Messages", href: "/parent/messages", icon: MessageSquare },
  { name: "Discipline", href: "/parent/discipline", icon: BookOpen }, // Added Discipline tab
]

const bottomNav = [
  { name: "Configuration", href: "/parent/settings", icon: Home }, // Note: Using Settings icon below in rendering
]

export function ParentLayoutInner({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [parentName, setParentName] = useState("Parent")
  const [parentInitials, setParentInitials] = useState("P")
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Sauvegarder userId depuis l'URL dans localStorage (port 3002)
    const urlUserId = searchParams.get("userId")
    if (urlUserId) {
      localStorage.setItem("parent_user_id", urlUserId)
    }
    const userId = urlUserId || localStorage.getItem("parent_user_id")
    if (!userId) return

    fetch(`http://localhost:8000/api/legacy/parent/${userId}/dashboard`)
      .then(r => r.json())
      .then(data => {
        if (data?.parent) {
          const name = `${data.parent.prenom} ${data.parent.nom}`
          setParentName(name)
          setParentInitials(`${data.parent.prenom?.[0] || ''}${data.parent.nom?.[0] || ''}`)
        }
      })
      .catch(() => {})
  }, [searchParams])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-amber-900 transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-amber-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 shrink-0 overflow-hidden">
              <img src="/logo_les_genies.png" alt="Logo Les Génies" className="w-full h-full object-contain p-0.5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white">Les Génies</span>
                <span className="text-[10px] font-bold text-amber-200 bg-amber-800/50 w-fit px-1.5 py-0.5 rounded -mt-1">2025/2026</span>
              </div>
            )}
          </div>

          {/* Close button mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-amber-800"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-500 text-white"
                    : "text-amber-100 hover:bg-amber-800 hover:text-white",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-2">
          {bottomNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mt-2",
                  isActive
                    ? "bg-amber-500 text-white"
                    : "text-amber-100 hover:bg-amber-800 hover:text-white",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>

        {/* Collapse button - desktop only */}
        <div className="hidden lg:flex justify-center py-2 border-t border-amber-800">
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-200 hover:text-white hover:bg-amber-800"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* User section */}
        <div className="border-t border-amber-800 p-4">
          <div className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}>
            <Avatar className="h-10 w-10 border-2 border-amber-500 shrink-0">
              <AvatarFallback className="bg-amber-500 text-white">{parentInitials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{parentName}</p>
                  <p className="text-xs text-amber-200 truncate">Parent</p>
                </div>
                <button
                  onClick={() => { localStorage.removeItem('parent_user_id'); window.location.href = 'https://projet-bd-les-genies.vercel.app'; }}
                  className="p-2 text-amber-200 hover:text-white hover:bg-amber-800 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {/* Language switcher */}
          {!collapsed && (
            <div className="mt-3">
              <LanguageSwitcher variant="dark" />
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Les Genies</span>
          </div>
          <div className="ml-auto">
            <LanguageSwitcher variant="light" />
          </div>
        </header>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}

import { Suspense } from 'react';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ParentLayoutInner>{children}</ParentLayoutInner>
    </Suspense>
  );
}
