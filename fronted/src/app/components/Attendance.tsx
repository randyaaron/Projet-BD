import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export function Attendance() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('sanctum_token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/teacher/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Erreur chargement présences');
      const data = await response.json();
      setAttendanceData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const totalPresents = attendanceData.reduce((sum, item) => sum + item.presents, 0);
  const totalAbsents = attendanceData.reduce((sum, item) => sum + item.absents, 0);
  const totalRetards = attendanceData.reduce((sum, item) => sum + item.retards, 0);
  const totalEleves = attendanceData.reduce((sum, item) => sum + item.total, 0);

  const tauxPresence = totalEleves > 0 ? ((totalPresents / totalEleves) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Présences</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>Aujourd'hui: {new Date().toLocaleDateString('fr-FR')}</span>
          </div>
          <button onClick={loadAttendance} className="px-3 py-2 rounded-lg bg-[#334155] text-white text-sm hover:bg-slate-700">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Taux de présence</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{tauxPresence}%</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Présents</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{totalPresents}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Absents</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{totalAbsents}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Retards</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{totalRetards}</p>
            </div>
            <Clock className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Présences par classe</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effectif total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Présents</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absents</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retards</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Chargement...</td></tr>
            ) : attendanceData.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Aucune donnée trouvée</td></tr>
            ) : (
              attendanceData.map((item) => {
                const taux = item.total > 0 ? ((item.presents / item.total) * 100).toFixed(0) : '0';
                return (
                  <tr key={item.classe} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{item.classe}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {item.presents}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        {item.absents}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-orange-600">
                        <Clock className="w-4 h-4" />
                        {item.retards}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${taux}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{taux}%</span>
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
