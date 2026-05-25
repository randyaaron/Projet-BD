import { TeacherHeader } from '@/components/teacher/teacher-header';
import { StatCard } from '@/components/teacher/stat-card';
import { ScheduleWidget } from '@/components/teacher/schedule-widget';
import { QuickActions } from '@/components/teacher/quick-actions';
import { RecentStudents } from '@/components/teacher/recent-students';
import { UpcomingHomework } from '@/components/teacher/upcoming-homework';
import { AlertsWidget } from '@/components/teacher/alerts-widget';
import { Users, ClipboardCheck, UserX, BookOpen } from 'lucide-react';

export default function TeacherDashboard() {
  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Tableau de bord" 
        subtitle="Bienvenue, Marie Boucher"
      />
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Élèves suivis"
            value={127}
            subtitle="5 classes actives"
            icon={Users}
            trend={{ value: 3, positive: true }}
          />
          <StatCard
            title="Notes à saisir"
            value={12}
            subtitle="Contrôle CM2 A"
            icon={ClipboardCheck}
          />
          <StatCard
            title="Absences du jour"
            value={4}
            subtitle="2 non justifiées"
            icon={UserX}
          />
          <StatCard
            title="Devoirs en cours"
            value={8}
            subtitle="3 échéances cette semaine"
            icon={BookOpen}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left Column - Schedule */}
          <div className="xl:col-span-1">
            <ScheduleWidget />
          </div>
          
          {/* Middle Column - Students & Homework */}
          <div className="space-y-6 xl:col-span-1">
            <RecentStudents />
          </div>
          
          {/* Right Column - Homework & Alerts */}
          <div className="space-y-6 xl:col-span-1">
            <UpcomingHomework />
            <AlertsWidget />
          </div>
        </div>
      </div>
    </main>
  );
}
