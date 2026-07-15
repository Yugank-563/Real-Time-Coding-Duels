import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Swords, Cpu, BarChart3, Activity, Users, Target, Trophy } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { selectUser } from '../features/index';
import { useDocumentTitle } from '../hooks/index';
import api from '../utils/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible:{
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const FEATURES_DATA = [
  {
    icon: Swords,
    hoverShadowClass: 'hover:shadow-[0_10px_30px_rgba(0,245,196,0.05)]',
    hoverBgClass: 'group-hover:bg-[rgba(0,245,196,0.05)]',
    iconColorClass: 'text-[var(--accent-blue)]',
    title: 'Real-Time Battles',
    desc: 'Face real opponents in live coding duels. First to solve the algorithm wins the rating.'
  },
  {
    icon: Cpu,
    hoverShadowClass: 'hover:shadow-[0_10px_30px_rgba(108,99,255,0.05)]',
    hoverBgClass: 'group-hover:bg-[rgba(108,99,255,0.05)]',
    iconColorClass: 'text-[var(--accent-primary)]',
    title: 'AI Code Analysis',
    desc: 'After every battle, our advanced AI reviews your code and suggests crucial optimizations.'
  },
  {
    icon: BarChart3,
    hoverShadowClass: 'hover:shadow-[0_10px_30px_rgba(255,184,0,0.05)]',
    hoverBgClass: 'group-hover:bg-[rgba(255,184,0,0.05)]',
    iconColorClass: 'text-[var(--accent-amber)]',
    title: 'Rating System',
    desc: 'Climb the global leaderboard with a rigorous, skill-based rating that actually reflects your level.'
  }
];

const HOW_IT_WORKS_DATA = [
  {
    num: 1,
    borderClass: 'border-[var(--accent-blue)]',
    shadowClass: 'shadow-[0_0_15px_rgba(0,245,196,0.2)]',
    title: 'Match Instantly',
    desc: 'Find an opponent at your exact skill level in seconds.'
  },
  {
    num: 2,
    borderClass: 'border-[var(--accent-primary)]',
    shadowClass: 'shadow-[0_0_15px_rgba(108,99,255,0.2)]',
    title: 'Solve Under Pressure',
    desc: 'Race against the clock to write the fastest, optimized algorithm.'
  },
  {
    num: 3,
    borderClass: 'border-[var(--accent-amber)]',
    shadowClass: 'shadow-[0_0_15px_rgba(255,184,0,0.2)]',
    title: 'Climb the Ranks',
    desc: 'Gain rating, learn from AI analysis, and dominate the leaderboard.'
  }
];

const HeroHeading = () => (
  <div className="flex flex-col items-center mb-8">
    <h1 className="text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] font-extrabold tracking-[-0.03em] leading-[1.1] text-center flex flex-col items-center gap-1 w-full">
      <span
        className="animate-slideUpFadeIn block text-white/90"
        style={{ animationDelay: '150ms' }}
      >
        Think <span className="whitespace-nowrap">Faster<span className="inline-block w-[0.18em] h-[0.18em] bg-[var(--accent-blue)] rounded-full ml-[2px]" /></span>
      </span>
      <span
        className="animate-slideUpFadeIn block text-white/90"
        style={{ animationDelay: '300ms' }}
      >
        Solve Under <span className="whitespace-nowrap">Pressure<span className="inline-block w-[0.18em] h-[0.18em] bg-[var(--accent-blue)] rounded-full ml-[2px]" /></span>
      </span>
      <span
        className="animate-slideUpFadeIn block text-white/90 tracking-[-0.02em]"
        style={{ animationDelay: '450ms' }}
      >
        Perform When It
      </span>
      <span
        className="animate-slideUpFadeIn block text-white/90 tracking-[-0.02em]"
        style={{ animationDelay: '600ms' }}
      >
        Matters <span className="whitespace-nowrap">Most<span className="inline-block w-[0.18em] h-[0.18em] bg-[var(--accent-blue)] rounded-full ml-[2px]" /></span>
      </span>
    </h1>
  </div>
);

const HeroDescription = () => (
  <p className="text-[1rem] md:text-[1.15rem] text-slate-300 text-center leading-[1.8] tracking-[0.01em] font-normal animate-slideUpFadeIn max-w-5xl mx-auto" style={{ animationDelay: '600ms' }}>
    Transform problem-solving practice into real-time coding battles. Improve your speed, boost your <span className="whitespace-nowrap">decision-making</span>, and prepare for real coding challenges.
  </p>
);

const HERO_EDITOR_LINES = [
  { text: <><span className="text-purple-400">#include</span> <span className="text-green-400">&lt;iostream&gt;</span></>, delay: 100 },
  { text: <><span className="text-purple-400">using namespace</span> std;</>, delay: 350 },
  { text: <br />, delay: 0 },
  { text: <><span className="text-blue-400">int</span> <span className="text-yellow-400">main</span>() &#123;</>, delay: 600 },
  { text: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">auto</span> platform = <span className="text-green-300">"Coduelo"</span>;</>, delay: 850 },
  { text: <>&nbsp;&nbsp;&nbsp;&nbsp;cout &lt;&lt; <span className="text-green-300">"Ready for code battle!"</span> &lt;&lt; endl;</>, delay: 1100 },
  { text: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-cyan-400">0</span>;</>, delay: 1350 },
  { text: <>&#125;</>, delay: 1600 }
];

const HeroEditor = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="w-full max-w-[560px] mx-auto relative">
      <div className="p-6 md:p-8 rounded-[1.25rem] border border-slate-600/50 bg-[#0A0E17]/95 backdrop-blur-2xl transition-all duration-500 text-left relative overflow-hidden hover:border-slate-500/30 hover:shadow-[0_0_20px_rgba(0,245,196,0.05)] h-full">
        <div className="flex items-center justify-between pb-4 border-b mb-5 border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] shadow-sm" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] shadow-sm" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] shadow-sm" />
          </div>
          <span className="text-xs font-mono text-slate-400 font-medium tracking-wide">main.cpp</span>
        </div>
        <pre className="font-mono text-[0.85rem] md:text-[0.95rem] overflow-hidden space-y-2 text-slate-300 leading-[1.6]">
          {HERO_EDITOR_LINES.map((line, idx) => (
            line.delay === 0 ? line.text : (
              <div key={idx} className={isInView ? "animate-typing" : "opacity-0"} style={{ animationDelay: `${line.delay}ms` }}>
                {line.text}
              </div>
            )
          ))}
        </pre>
      </div>
    </div>
  );
};

const LandingStats = ({ stats }) => {
  const STATS_DATA = [
    { icon: Activity, color: 'text-[var(--accent-blue)]', val: stats.battlesFought, label: 'Battles Fought' },
    { icon: Users, color: 'text-[var(--accent-primary)]', val: stats.activeCoders, label: 'Coders Online' },
    { icon: Target, color: 'text-[#00F5C4]', val: stats.problemsAvailable, label: 'Problems' },
    { icon: Trophy, color: 'text-[#FFBD2E]', val: stats.maxRating, label: 'Top Rating' }
  ];

  const formatStat = (val) => `${Math.floor(val / 10) * 10}+`;

  return (
    <motion.div 
      className="w-full grid grid-cols-2 md:flex md:flex-wrap justify-center md:justify-between items-center gap-8 md:gap-4 pb-8 bg-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      {STATS_DATA.map((item, idx) => (
        <div key={idx} className="flex items-center gap-4 justify-center md:justify-start">
          <item.icon className={`w-8 h-8 ${item.color}`} strokeWidth={2.5} />
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-white leading-none tracking-tight">{formatStat(item.val)}</span>
            <span className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mt-1.5">{item.label}</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
};


const LandingPage = () => {
  useDocumentTitle('Welcome to CodUelo');
  const myUser = useSelector(selectUser);
  const navigate = useNavigate();

  const [platformStats, setPlatformStats] = useState({
    maxRating: 2455,
    battlesFought: 400,
    problemsAvailable: 49,
    activeCoders: 50
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/platform-stats');
        const data = response.data;
        // If the database has real data, use it; otherwise, keep the dummy data
        setPlatformStats({
          maxRating: data.maxRating > 0 ? data.maxRating : 2455,
          battlesFought: data.battlesFought > 0 ? data.battlesFought : 400,
          problemsAvailable: data.problemsAvailable > 0 ? data.problemsAvailable : 49,
          activeCoders: data.activeCoders > 0 ? data.activeCoders : 50
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      }
    };
    fetchStats();
  }, []);

  if (myUser) {
    return <Navigate to="/battle" replace />;
  }

  return (
    <div className="w-full text-[var(--text-primary)] relative font-sans select-none transition-colors duration-300">

      {/* ══════════════ FULL PAGE ANIMATED BACKGROUND ══════════════ */}
      {/* Portal to body so it escapes all transform/z-index contexts and stays truly fixed behind everything */}
      {createPortal(
        <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
          {/* Aurora orb 1 – top left teal */}
          <div className="absolute top-[-5%] left-[-8%] w-[700px] h-[700px] rounded-full bg-[var(--accent-blue)]/12 blur-[140px]" style={{ animation: 'aurora1 8s ease-in-out infinite' }} />
          {/* Aurora orb 2 – top right purple */}
          <div className="absolute top-[5%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--accent-primary)]/10 blur-[120px]" style={{ animation: 'aurora2 10s ease-in-out infinite' }} />
          {/* Aurora orb 3 – bottom center purple */}
          <div className="absolute bottom-[10%] left-[25%] w-[800px] h-[400px] rounded-full bg-[#a78bfa]/8 blur-[150px]" style={{ animation: 'aurora3 12s ease-in-out infinite' }} />
        </div>,
        document.body
      )}
{/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
        <motion.div 
          className="relative z-10 w-full flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center w-full pb-[12vh] relative z-10">
            <div className="w-full p-8 md:p-12 lg:p-16 rounded-[2rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_10px_30px_rgba(0,245,196,0.05),inset_0_1px_0_rgba(255,255,255,0.3)] hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-blue)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <HeroHeading />
                <HeroDescription />
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 w-full mt-8 animate-slideUpFadeIn" style={{ animationDelay: '800ms' }}>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="w-[180px] sm:w-[200px] md:w-[240px] h-[42px] sm:h-[46px] md:h-[52px] rounded-[2rem] bg-gradient-to-r from-[#00F5C4] to-[#00D4AA] text-[#0A0E17] font-extrabold text-[0.85rem] sm:text-[0.95rem] md:text-[1.1rem] hover:shadow-[0_0_25px_rgba(0,245,196,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Start Your Journey <span className="text-[1rem] md:text-xl leading-none">↗</span>
                  </button>
                  <button 
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-[180px] sm:w-[200px] md:w-[240px] h-[42px] sm:h-[46px] md:h-[52px] rounded-[2rem] bg-transparent border-2 border-white/20 text-white font-bold text-[0.85rem] sm:text-[0.95rem] md:text-[1.05rem] hover:bg-white/5 hover:border-white/40 transition-all duration-300 flex items-center justify-center"
                  >
                    Explore More
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Section Heading: Features */}
          <motion.div 
            id="features"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-center mb-16 scroll-mt-24"
          >
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-white tracking-tight">Why Choose <span className="text-[var(--accent-blue)]">Coduelo?</span></h2>
            <p className="text-slate-400 mt-2 text-[1.05rem]">The ultimate platform built specifically for competitive programmers.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {/* Cards */}
            {FEATURES_DATA.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} whileHover={{ y: -8 }} className={`flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/5 transition-all duration-300 group relative overflow-hidden shadow-sm ${feature.hoverShadowClass} hover:bg-white/[0.03]`}>
                <div className={`p-5 bg-white/[0.04] ${feature.hoverBgClass} rounded-2xl shadow-sm group-hover:scale-110 transition-all duration-500`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColorClass}`} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mt-2">{feature.title}</h3>
                <p className="text-[1rem] text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Section Heading: How it Works */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-center mt-32 mb-16"
          >
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-white tracking-tight">How It <span className="text-[#00F5C4]">Works</span></h2>
            <p className="text-slate-400 mt-2 text-[1.05rem]">Three simple steps to start dominating the leaderboards.</p>
          </motion.div>

          {/* HOW IT WORKS */}
          <motion.div 
            className="w-full relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <div className="hidden lg:block absolute top-6 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent -translate-y-1/2 z-0 opacity-60 animate-pulse shadow-[0_0_10px_rgba(108,99,255,0.5)]" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
              {HOW_IT_WORKS_DATA.map((step, idx) => (
                <motion.div key={idx} variants={itemVariants} className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full bg-[var(--bg-base)] border-2 ${step.borderClass} flex items-center justify-center font-bold text-white mb-6 ${step.shadowClass}`}>{step.num}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-[0.95rem] leading-relaxed max-w-[250px]">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

      {/* ═══════════════════════════════════════════════════
          MOTIVATIONAL FOOTER / FEATURES
      ═══════════════════════════════════════════════════ */}
      <div id="features" className="w-full relative z-10 flex flex-col items-center">
          
          {/* Section Heading: Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-center mt-32 mb-16"
          >
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-white tracking-tight">Live <span className="text-[#00F5C4]">Statistics</span></h2>
            <p className="text-slate-400 mt-2 text-[1.05rem]">Real-time metrics and activity across Coduelo.</p>
          </motion.div>

          <LandingStats stats={platformStats} />


          {/* Section Heading: Editor */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-center mt-32 mb-16"
          >
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-white tracking-tight">Built for <span className="text-[#00F5C4]">Speed</span></h2>
            <p className="text-slate-400 mt-2 text-[1.05rem]">A lightning-fast code editor designed to give you the ultimate edge in battle.</p>
          </motion.div>

          {/* Bottom Code Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="w-full flex justify-center"
          >
            <HeroEditor />
          </motion.div>

          {/* Final Call to Action Button */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
            className="mt-12 mb-12"
          >
            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                navigate('/signup');
                
              }}
              className="px-6 py-4 rounded-xl mt-8 font-bold uppercase tracking-widest flex items-center justify-center border transition-all duration-300 border-slate-800 bg-[#0D0F14]/60 text-[#00F5C4] hover:border-[#00F5C4]/50 hover:shadow-[0_0_20px_rgba(0,245,196,0.05)]"
            >
              Stop Reading, Test Your Speed
            </motion.button>
          </motion.div>
        </div>
      </div>
  );
};

export default LandingPage;