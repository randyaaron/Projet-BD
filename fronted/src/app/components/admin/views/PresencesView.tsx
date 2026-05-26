import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle, CalendarDays } from 'lucide-react';
import { legacyFetch } from '../../../lib/legacyApi';

const API = 'http://localhost:8000/api/legacy';

export function PresencesView() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await legacyFetch<any[]>(`${API}/admin/attendance`);
      setAttendanceData(data || []);
    } catch (e: any) {
      setError(e.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const totalPresents = attendanceData.reduce((sum, item) => sum + (item.presents || 0), 0);
  const totalAbsents = attendanceData.reduce((sum, item) => sum + (item.absents || 0), 0);
  const totalEleves = attendanceData.reduce((sum, item) => sum + (item.total || 0), 0);

  const tauxPresence = totalEleves > 0 ? ((totalPresents / totalEleves) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.375rem', fontWeight: 700 }}>Présences Globales</h1>
          <p className="text-slate-500 text-sm mt-0.5">Suivi de l'assiduité par classe pour la journée</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg text-slate-600 text-sm font-semibold">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <button onClick={loadAttendance} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm" style={{ fontWeight: 600 }}>
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Taux global</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{tauxPresence}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Présents</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{totalPresents}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Absents</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{totalAbsents}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Classe</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Effectif total</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Présents</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Absents</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Taux de présence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Chargement des données...</td></tr>
            ) : attendanceData.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Aucune donnée trouvée.</td></tr>
            ) : (
              attendanceData.map((item) => {
                const taux = item.total > 0 ? ((item.presents / item.total) * 100).toFixed(0) : '0';
                return (
                  <tr key={item.classe} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.classe}</td>
                    <td className="px-6 py-4 text-slate-600">{item.total}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        {item.presents}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-red-600 font-medium">
                        <XCircle className="w-4 h-4" />
                        {item.absents}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 min-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${Number(taux) >= 90 ? 'bg-emerald-500' : Number(taux) >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${taux}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{taux}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
