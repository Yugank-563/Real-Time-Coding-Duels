import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swords, Trophy, Terminal } from 'lucide-react';
import { useDocumentTitle } from '../hooks/index';
import Footer from '../components/layout/Footer';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/index';

const RANDOM_BUTTON_MESSAGES = [
  "Let's Code",
  "Join the Battle",
  "Start Your Battle",
  "Battle-Test Your Brain",
  "Prove You're Not a Robot",
  "Stop Reading, Start Coding", 
  "Sharpen Your Problem Solving",
];

const AboutPage = () => {
  useDocumentTitle('About');
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [buttonText] = useState(() => RANDOM_BUTTON_MESSAGES[Math.floor(Math.random() * RANDOM_BUTTON_MESSAGES.length)]);

  // Animation variants for smooth premium stagger loads
  const containerVariants = {
    hidden: { opacity: 0 },
    visible:{
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-base text-text-primary pt-24 transition-colors duration-300 overflow-hidden relative flex flex-col">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 pb-6 w-full">
        
        {/* ── HERO SECTION ── */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Code in Motion.{' '}
            <span className={`bg-clip-text text-transparent bg-gradient-to-r block mt-2 ${
              'from-[#6C63FF] via-[#00F5C4] to-cyan-300'
            }`}>
              Unleash Your Algorithm Speed in Real-Time
            </span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8">
            Race against the clock, match with global developers, and master Data Structures & Algorithms (DSA) in a gamified real-time coding arena.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all duration-300 group border-slate-800 bg-[#0D0F14]/60 text-[#00F5C4] hover:border-[#00F5C4]/50 hover:bg-[#00F5C4]/5 hover:shadow-[0_0_20px_rgba(0,245,196,0.12)]"
                >
                  <span>{buttonText}</span>
                </motion.button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* ── CORE VISION & MISSION (User Prompt Content Integrated) ── */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Left Block: Narrative text */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">
              A New Dimension of{' '}
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
                'from-[#00F5C4] to-cyan-300'
              }`}>
                Real-Time DSA Battles
              </span>
            </h2>
            <p className="text-text-secondary leading-relaxed text-base">
              Coduelo transforms standard algorithmic learning into an immersive multi-user experience. Build your speed, sharpen your problem-solving reflexes, and master Data Structures &amp; Algorithms (DSA) through instant 1v1 arenas, live matchmaking, and dynamic coding rooms.
            </p>
          </div>

          {/* Right Block: Premium Interactive Code Sandbox Mockup (Wow factor!) */}
          <div className="lg:col-span-5 relative">
            <div className={`p-6 rounded-2xl border-2 bg-surface/50 backdrop-blur-xl shadow-2xl relative overflow-hidden ${
              'border-slate-700/80 shadow-[#00F5C4]/5'
            }`}>
              <div className={`flex items-center justify-between pb-4 border-b mb-4 ${
                'border-slate-700/80'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-mono text-text-secondary">main.cpp</span>
              </div>
              <pre className={`font-mono text-xs overflow-x-auto space-y-1.5 ${'text-slate-300'}`}>
                <div>
                  <span className={'text-purple-400'}>#include</span>{' '}
                  <span className={'text-green-400'}>&lt;iostream&gt;</span>
                </div>
                <div>
                  <span className={'text-purple-400'}>using namespace</span> std;
                </div>
                <br />
                <div>
                  <span className={'text-blue-400'}>int</span>{' '}
                  <span className={'text-yellow-400'}>main</span>() &#123;
                </div>
                <div>
                  &nbsp;&nbsp;<span className={'text-blue-400'}>auto</span> platform ={' '}
                  <span className={'text-green-300'}>"Coduelo"</span>;
                </div>
                <div>
                  &nbsp;&nbsp;cout &lt;&lt;{' '}
                  <span className={'text-green-300'}>"Ready for code battle!"</span>{' '}
                  &lt;&lt; endl;
                </div>
                <div>
                  &nbsp;&nbsp;<span className={'text-purple-400'}>return</span>{' '}
                  <span className={'text-cyan-400'}>0</span>;
                </div>
                <div>&#125;</div>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* ── FEATURES GRID ── */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Card 1: 1v1 Arena */}
          <motion.div 
            variants={itemVariants}
            className="p-8 rounded-2xl bg-surface border border-border/80 relative group hover:border-border transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all ${
              'bg-purple-600/10 text-purple-400 group-hover:bg-purple-600/20'
            }`}>
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">1v1 Real-Time Battles</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Match instantly with global developers. Solve DSA problems side-by-side inside our synchronous editor and race to compile the most optimal solution first.
            </p>
          </motion.div>

          {/* Card 2: Interactive IDE */}
          <motion.div 
            variants={itemVariants}
            className="p-8 rounded-2xl bg-surface border border-border/80 relative group hover:border-border transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all ${
              'bg-cyan-600/10 text-[#00F5C4] group-hover:bg-[#00F5C4]/20'
            }`}>
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Collaborative Web IDE</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              A sleek, multi-language IDE equipped with real-time sync, visual syntax highlighting, advanced autocomplete, and instant test harnesses.
            </p>
          </motion.div>

          {/* Card 3: Rated Arenas */}
          <motion.div 
            variants={itemVariants}
            className="p-8 rounded-2xl bg-surface border border-border/80 relative group hover:border-border transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all ${
              'bg-amber-600/10 text-amber-400 group-hover:bg-amber-600/20'
            }`}>
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Leaderboards</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Climb ratings and top the global leaderboards by competing in live multi-user DSA arenas.
            </p>
          </motion.div>
        </motion.div>


      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
