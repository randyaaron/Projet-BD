import { ArrowRight, BookOpen, GraduationCap, Users, Shield, Award, MapPin, Phone, Mail, Palette, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useSettings } from '../contexts/SettingsContext';

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

export function LandingPage({ onNavigateToLogin }: LandingPageProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <div className="min-h-screen font-sans bg-white overflow-x-hidden relative">
      
      {/* HERO SECTION (100vh) */}
      <div className="relative h-screen flex flex-col">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0">
          <img
            src="/Interior%20of%20a%20classroom%20with%20natural%20light%20AI%20generated.jpeg"
            alt="Intérieur de salle de classe"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-slate-800/80 backdrop-blur-[2px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-white font-bold text-2xl tracking-tight drop-shadow-md">{settings.schoolName || 'Les Génies'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="dark" />
            <button
              onClick={onNavigateToLogin}
              className="hidden sm:flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-none"
            >
              Portail Numérique
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl p-4 mb-2 transform hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center">
              <img src="/logo_les_genies.png" alt="Logo Les Génies" className="w-full h-full object-contain" />
              <span className="text-blue-900 font-bold text-xs mt-1">2025/2026</span>
            </div>
            
            <span className="inline-block py-1.5 px-4 bg-blue-500/20 border border-blue-400/30 text-blue-100 rounded-full text-sm font-semibold tracking-wide backdrop-blur-md">
              Inscriptions Ouvertes 2026-2027
            </span>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
              Cultivons le potentiel <br/><span className="text-yellow-400">de chaque enfant</span>
            </h2>
            <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mb-8 leading-relaxed drop-shadow-md">
              L'École Primaire {settings.schoolName || 'Les Génies'} offre un cadre d'apprentissage exceptionnel où innovation, rigueur et épanouissement personnel se rencontrent pour bâtir l'avenir.
            </p>
            
            <div className="pt-8">
              <button
                onClick={onNavigateToLogin}
                className="group relative inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.7)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.9)] hover:-translate-y-1 overflow-hidden cursor-none"
              >
                <span className="relative z-10">Espace Parents & Élèves</span>
                <div className="relative z-10 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        </main>
        
        {/* Scroll Indicator: Bouncing Arrow */}
        <div className="relative z-10 pb-12 flex justify-center">
          <ArrowDown className="w-10 h-10 text-white/80 animate-bounce" />
        </div>
      </div>

      {/* STATISTICS SECTION */}
      <section className="bg-slate-900 py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-extrabold text-yellow-400 mb-2">1,250</p>
              <p className="text-slate-300 font-medium uppercase tracking-wider text-sm">Élèves Inscrits</p>
            </div>
            <div>
              <p className="text-5xl font-extrabold text-blue-400 mb-2">85</p>
              <p className="text-slate-300 font-medium uppercase tracking-wider text-sm">Enseignants Qualifiés</p>
            </div>
            <div>
              <p className="text-5xl font-extrabold text-emerald-400 mb-2">45</p>
              <p className="text-slate-300 font-medium uppercase tracking-wider text-sm">Salles de Classe</p>
            </div>
            <div>
              <p className="text-5xl font-extrabold text-purple-400 mb-2">98%</p>
              <p className="text-slate-300 font-medium uppercase tracking-wider text-sm">Taux de Réussite</p>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO GALLERY */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Notre École</span>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">La Vie à l'École Les Génies</h3>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Un cadre d'apprentissage moderne et stimulant au cœur de Yaoundé</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-2 row-span-2 overflow-hidden rounded-2xl h-72 md:h-full">
              <img src="/african_primary_banner.png" alt="Salle de classe" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="overflow-hidden rounded-2xl h-36 md:h-44">
              <img src="/african_primary_students.png" alt="Élèves" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="overflow-hidden rounded-2xl h-36 md:h-44">
              <img src="/african_primary_classroom.png" alt="Cours" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="overflow-hidden rounded-2xl h-36">
              <img src="/african_primary_library.png" alt="Bibliothèque" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="overflow-hidden rounded-2xl h-36">
              <img src="/african_primary_teacher.png" alt="Enseignant" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="overflow-hidden rounded-2xl h-36">
              <img src="/african_primary_activities.png" alt="Activités" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* NEW PARALLAX BANNER */}
      <section className="relative h-96 overflow-hidden my-16">
        <img 
          src="/african_primary_classroom.png" 
          alt="Apprentissage" 
          className="w-full h-full object-cover scale-110" 
          style={{transform:'scale(1.1)', objectPosition:'center 40%'}} 
        />
        <div className="absolute inset-0 bg-blue-900/80 flex flex-col items-center justify-center text-center px-6">
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">"L'excellence au quotidien"</h3>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-3xl leading-relaxed">
            Un environnement de travail rigoureux et chaleureux, conçu pour stimuler la curiosité intellectuelle, encourager l'entraide et célébrer les réussites de chaque élève.
          </p>
        </div>
      </section>

      {/* SCHOOL PRESENTATION SECTION */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Notre Projet Éducatif</h3>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Découvrez ce qui fait de l'École Les Génies un établissement de premier choix pour l'instruction de vos enfants, de la Maternelle au Cours Moyen 2.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-200/50 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-blue-700" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Pédagogie d'Excellence</h4>
            <p className="text-slate-600 leading-relaxed mb-6">
              Un programme scolaire rigoureux, dispensé par des enseignants qualifiés et passionnés, garantissant une maîtrise parfaite des fondamentaux.
            </p>
            <ul className="space-y-2 text-sm text-slate-500 font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Suivi individualisé</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Méthodes interactives</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Préparation intensive aux examens</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-200/50 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-emerald-700" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Cadre Sécurisé</h4>
            <p className="text-slate-600 leading-relaxed mb-6">
              La sécurité physique et émotionnelle de nos élèves est notre priorité absolue. Nous offrons un environnement sain et stimulant.
            </p>
            <ul className="space-y-2 text-sm text-slate-500 font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Campus fermé et surveillé</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Infirmerie sur place</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Discipline bienveillante</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-purple-50 border border-purple-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-purple-200/50 rounded-2xl flex items-center justify-center mb-6">
              <Palette className="w-7 h-7 text-purple-700" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Épanouissement</h4>
            <p className="text-slate-600 leading-relaxed mb-6">
              Au-delà des matières classiques, nous développons la créativité, l'esprit d'équipe et la confiance en soi à travers diverses activités.
            </p>
            <ul className="space-y-2 text-sm text-slate-500 font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"/> Activités sportives</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"/> Ateliers artistiques</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"/> Sorties éducatives</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PARALLAX BANNER */}
      <section className="relative h-80 overflow-hidden">
        <img src="/african_primary_students.png" alt="Éducation" className="w-full h-full object-cover scale-110" style={{transform:'scale(1.1)', objectPosition:'center 30%'}} />
        <div className="absolute inset-0 bg-blue-900/75 flex flex-col items-center justify-center text-center px-6">
          <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">"Former les esprits, bâtir l'avenir."</h3>
          <p className="text-blue-200 text-lg max-w-xl">Notre mission : révéler le génie qui sommeille en chaque enfant, de la maternelle au CM2.</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Témoignages</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">Ce que disent les familles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {name:'Marie K.', role:'Mère d\'élève – CE2', text:'Depuis que mon fils est à Les Génies, ses notes ont considérablement progressé. Le suivi des enseignants est exceptionnel.', avatar:'MK'},
              {name:'Paul N.', role:'Père d\'élève – CM1', text:'Le portail numérique est fantastique ! Je consulte les notes et l\'assiduité de ma fille à tout moment depuis mon téléphone.', avatar:'PN'},
              {name:'Awa B.', role:'Mère d\'élève – Maternelle', text:'Un environnement sécurisé et bienveillant. Mon enfant adore l\'école et les activités parascolaires proposées.', avatar:'AB'},
            ].map((t,i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s=><span key={s} className="text-yellow-400 text-lg">★</span>)}</div>
                <p className="text-slate-600 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                  <div><p className="font-bold text-slate-900 text-sm">{t.name}</p><p className="text-slate-400 text-xs">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALLATIONS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-widest">Nos Infrastructures</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">Des installations modernes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-2xl h-64 group">
              <img src="/african_primary_classroom.png" alt="Salles informatisées" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
                <div><p className="text-white font-bold text-lg">Salles de Classe Modernes</p><p className="text-slate-300 text-sm">Équipées de tableaux interactifs</p></div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl h-64 group">
              <img src="/african_primary_library.png" alt="Bibliothèque" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
                <div><p className="text-white font-bold text-lg">Bibliothèque & Médiathèque</p><p className="text-slate-300 text-sm">Plus de 2 000 ouvrages disponibles</p></div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl h-64 group">
              <img src="/african_primary_banner.png" alt="Terrain de sport" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
                <div><p className="text-white font-bold text-lg">Espaces Sportifs</p><p className="text-slate-300 text-sm">Terrain multisports & gymnase</p></div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl h-64 group">
              <img src="/african_primary_activities.png" alt="Cantine" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
                <div><p className="text-white font-bold text-lg">Cantine & Espace Détente</p><p className="text-slate-300 text-sm">Repas équilibrés chaque jour</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US / PORTAIL SECTION */}
      <section className="bg-slate-50 py-24 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Award className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Une école ancrée dans la modernité</h3>
          <p className="text-slate-600 text-lg leading-relaxed mb-10">
            L'École Les Génies met à disposition de chaque famille un <strong>Portail Numérique ultra-moderne</strong>. Suivez les notes, l'assiduité, les devoirs et communiquez avec les enseignants directement depuis votre smartphone ou votre ordinateur, 24h/24 et 7j/7.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-bold transition-colors cursor-none"
          >
            Se connecter au portail
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* LOCATION / MAP SECTION */}
      <section className="py-0 relative h-[500px] w-full">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15923.36005706443!2d11.49830575!3d3.86438095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bcf7a309a7977%3A0x7f54bad35e693c51!2sEcole%20Nationale%20Sup%C3%A9rieure%20Polytechnique%20de%20Yaound%C3%A9!5e0!3m2!1sfr!2scm!4v1718000000000!5m2!1sfr!2scm" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale opacity-90 hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-y-0 left-0 w-full md:w-1/3 bg-slate-900/90 backdrop-blur-sm p-12 flex flex-col justify-center">
          <h3 className="text-3xl font-bold text-white mb-6">Nous Trouver</h3>
          <p className="text-slate-300 leading-relaxed mb-8">
            Venez visiter notre campus et rencontrer notre équipe pédagogique pour découvrir notre environnement d'apprentissage.
          </p>
          <ul className="space-y-6 text-sm text-slate-300">
            <li className="flex items-start gap-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg"><MapPin className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-white mb-1">Campus Principal</p>
                <p>Campus de Polytechnique<br/>Yaoundé, Cameroun</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg"><Phone className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-white mb-1">Téléphone</p>
                <p>(+237) 6XX XXX XXX</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg"><Mail className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-white mb-1">Email</p>
                <p>contact@lesgenies.cm</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
              <img src="/logo_les_genies.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <p className="font-bold text-white">Les Génies</p>
          </div>
          <p>© {new Date().getFullYear()} Complexe Scolaire Les Génies. Tous droits réservés.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors cursor-none">Mentions Légales</a>
            <button onClick={onNavigateToLogin} className="hover:text-white transition-colors cursor-none">Accès Portail</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
