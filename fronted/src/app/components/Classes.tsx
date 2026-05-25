import { useEffect, useState } from 'react';
import { Users, UserCircle, AlertTriangle } from 'lucide-react';

export function Classes() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const niveaux = ['Tous', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  const [selectedNiveau, setSelectedNiveau] = useState('Tous');

  const loadClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('sanctum_token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/teacher/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Erreur chargement classes');
      const data = await response.json();
      setClasses(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const filteredClasses = selectedNiveau === 'Tous' 
    ? classes 
    : classes.filter(c => c.niveau === selectedNiveau);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Classes</h1>
        <button onClick={loadClasses} className="px-3 py-2 rounded-lg bg-[#334155] text-white text-sm hover:bg-slate-700">
          Actualiser
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {niveaux.map((niveau) => (
          <button
            key={niveau}
            onClick={() => setSelectedNiveau(niveau)}
            className={`px-4 py-2 rounded-lg ${
              selectedNiveau === niveau
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {niveau}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : filteredClasses.length === 0 ? (
          <p className="text-gray-500">Aucune classe trouvée</p>
        ) : (
          filteredClasses.map((classe) => (
          <div key={classe.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-blue-600">{classe.nom}</h3>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {classe.niveau}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <UserCircle className="w-5 h-5 text-gray-500" />
                <span>{classe.enseignant}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5 text-gray-500" />
                <span>{classe.effectif} élèves</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{classe.salle}</span>
              </div>
            </div>

            <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Voir les détails
            </button>
          </div>
          ))
        )}
      </div>
    </div>
  );
}
