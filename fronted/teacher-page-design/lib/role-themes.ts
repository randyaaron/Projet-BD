export const roleThemes = {
  admin: {
    primary: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    light: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    textLight: 'text-blue-600',
    sidebar: 'bg-slate-900',
    ring: 'ring-blue-500',
    gradient: 'from-blue-600 to-blue-700',
  },
  teacher: {
    primary: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    textLight: 'text-emerald-600',
    sidebar: 'bg-emerald-900',
    ring: 'ring-emerald-500',
    gradient: 'from-emerald-600 to-emerald-700',
  },
  parent: {
    primary: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    light: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textLight: 'text-amber-600',
    sidebar: 'bg-amber-900',
    ring: 'ring-amber-500',
    gradient: 'from-amber-500 to-amber-600',
  },
} as const;

export type RoleType = keyof typeof roleThemes;
