import { TeacherSidebar } from '@/components/teacher/teacher-sidebar';

export const metadata = {
  title: 'Espace Enseignant | Les Genies',
  description: 'Plateforme de gestion scolaire - Espace Enseignant',
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherSidebar />
      <div className="pl-64 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
