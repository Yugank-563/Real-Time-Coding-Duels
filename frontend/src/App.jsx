import React, { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('battles')

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#E2E2E9] flex flex-col">
      {/* Premium Navbar */}
      <header className="border-b border-[#24242E] bg-[#16161D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-extrabold text-xl text-white">⚔️</span>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-white to-[#A78BFA] bg-clip-text text-transparent">BATTLECODE</span>
              <span className="text-[10px] block font-semibold text-[#8B5CF6] tracking-widest mt-[-2px]">MULTIPLAYER ECOSYSTEM</span>
            </div>
          </div>
          
          <nav className="flex space-x-1">
            {['battles', 'contests', 'leaderboard', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                  activeTab === tab 
                    ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30' 
                    : 'text-[#8B8B9E] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="block text-xs text-[#8B8B9E]">Welcome back,</span>
              <span className="text-sm font-bold text-white flex items-center">⚡ Yugank-563 <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">Rank 1200</span></span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[#8B5CF6] bg-[#24242E] overflow-hidden flex items-center justify-center">
              <span className="text-sm font-bold">YK</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#16161D] to-[#24242E] border border-[#24242E] p-8 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B5CF6]/10 rounded-full filter blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#3B82F6]/5 rounded-full filter blur-[60px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/20 text-[#C084FC] text-xs font-bold tracking-wider uppercase">Battle Arena Live</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 leading-tight">
              Unleash Your <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">Algorithm Speed</span> In Real-Time
            </h1>
            <p className="text-[#8B8B9E] mt-4 text-base leading-relaxed">
              Step into head-to-head multiplayer coding duels, rise on the live ELO leaderboards, host full-scale coding contests, or review code in real-time with isolated sandboxes.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-300 transform hover:-translate-y-0.5">
                ⚔️ Find 1v1 Battle
              </button>
              <button className="px-6 py-3 rounded-xl bg-[#24242E] hover:bg-[#2C2C39] border border-[#3B3B4F] text-white font-semibold transition-all duration-300 transform hover:-translate-y-0.5">
                🏆 Enter Arena Contests
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Battles / Lobby Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#16161D] border border-[#24242E] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-2"></span>
                  Active Arena Matchmakings
                </h3>
                <span className="text-xs text-[#8B8B9E]">142 players in queue</span>
              </div>

              <div className="space-y-4">
                {[
                  { id: '1', title: '1v1 Ranked Duel', difficulty: 'Medium', lang: 'C++', ratingLimit: '1200 - 1400', players: 1 },
                  { id: '2', title: 'Blind Coding Battle', difficulty: 'Hard', lang: 'Python', ratingLimit: 'Any', players: 1 },
                  { id: '3', title: 'Dynamic Programming Sprint', difficulty: 'Medium', lang: 'JavaScript', ratingLimit: '1000 - 1300', players: 0 }
                ].map((lobby) => (
                  <div key={lobby.id} className="p-4 rounded-xl bg-[#0F0F12] border border-[#24242E] hover:border-[#8B5CF6]/50 transition-all duration-300 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{lobby.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          lobby.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {lobby.difficulty}
                        </span>
                      </div>
                      <div className="flex space-x-4 mt-2 text-xs text-[#8B8B9E]">
                        <span>💻 Language: <strong className="text-[#E2E2E9]">{lobby.lang}</strong></span>
                        <span>⭐ Elo Limit: <strong className="text-[#E2E2E9]">{lobby.ratingLimit}</strong></span>
                      </div>
                    </div>
                    <div>
                      <button className="px-4 py-2 rounded-lg bg-[#8B5CF6]/10 text-[#C084FC] hover:bg-[#8B5CF6] hover:text-white border border-[#8B5CF6]/20 transition-all duration-300 font-semibold text-xs">
                        {lobby.players === 1 ? '⚔️ Duel' : '👥 Join Room'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sandbox Playground Preview */}
            <div className="bg-[#16161D] border border-[#24242E] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">🚀 Sandbox Code Playground</h3>
              <div className="h-48 rounded-xl bg-[#0F0F12] border border-[#24242E] flex flex-col overflow-hidden">
                <div className="h-8 bg-[#16161D] border-b border-[#24242E] flex items-center px-4 justify-between">
                  <div className="flex space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/50"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
                  </div>
                  <span className="text-xs font-semibold text-[#8B8B9E]">main.cpp</span>
                </div>
                <div className="flex-1 p-4 font-mono text-xs text-emerald-400/90 overflow-y-auto">
                  <p>1 <span className="text-purple-400">#include</span> <span className="text-orange-400">&lt;iostream&gt;</span></p>
                  <p>2 <span className="text-purple-400">using namespace</span> std;</p>
                  <p>3 </p>
                  <p>4 <span className="text-blue-400">int</span> <span className="text-yellow-400">main</span>() &#123;</p>
                  <p>5 &nbsp;&nbsp;&nbsp;&nbsp;cout &lt;&lt; <span className="text-orange-400">"⚔️ BattleCode Sandbox Initialized!"</span> &lt;&lt; endl;</p>
                  <p>6 &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-red-400">0</span>;</p>
                  <p>7 &#125;</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - User Stats & Streaks */}
          <div className="space-y-6">
            <div className="bg-[#16161D] border border-[#24242E] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">📊 Arena Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#24242E]">
                  <span className="text-sm text-[#8B8B9E]">Elo Rating</span>
                  <span className="font-bold text-[#8B5CF6]">1200 pts</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#24242E]">
                  <span className="text-sm text-[#8B8B9E]">XP Tier</span>
                  <span className="font-bold text-white">Bronze II (320 XP)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#24242E]">
                  <span className="text-sm text-[#8B8B9E]">Daily Streak</span>
                  <span className="font-bold text-[#E2E2E9] flex items-center">🔥 7 Days</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-[#8B8B9E]">Win Rate</span>
                  <span className="font-bold text-emerald-400">64.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#16161D] border border-[#24242E] rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/10 rounded-full filter blur-xl pointer-events-none"></div>
              <h4 className="font-bold text-sm text-amber-400">⚡ DAILY CHALLENGE</h4>
              <p className="text-xs text-[#8B8B9E] mt-2">Solve "LRU Cache (Hard)" to win 50 XP & double streak safety token today!</p>
              <button className="w-full mt-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs tracking-wider transition-all duration-300">
                🚀 START CHALLENGE
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-[#24242E] bg-[#0F0F12] py-6 text-center text-xs text-[#8B8B9E]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>© 2026 BattleCode Ecosystem. Designed for scalable competitive programming.</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Docker Status</a>
            <a href="#" className="hover:text-white transition-colors">API Health</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
