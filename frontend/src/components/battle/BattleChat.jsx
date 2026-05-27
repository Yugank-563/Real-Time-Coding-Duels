import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

const BattleChat = ({ messages, isOpen, onClose, onSendMessage, myUserId, battleType, teamId }) => {
  const [inputText, setInputText] = useState('');
  const [chatTab, setChatTab] = useState('all'); 
  const chatBottomRef = useRef(null);
 
  const filteredMessages = messages.filter(m => {
    if (battleType === 'team') {
      if (chatTab === 'team') {
        return m.scope === 'team';
      } else {
        return m.scope !== 'team';
      }
    }
    return true;
  });
 
  // Auto-scroll chats to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, isOpen]);
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    if (battleType === 'team') {
      onSendMessage(inputText, chatTab, chatTab === 'team' ? teamId : null);
    } else {
      onSendMessage(inputText, 'all', null);
    }
    setInputText('');
  };
 
  if (!isOpen) return null;
 
  return (
    <div className="w-[300px] border-l border-[#1E2D40] bg-[#141B2D] flex flex-col h-full shrink-0 shadow-2xl relative font-sans">
      
      {/* ── CHAT HEADER ── */}
      <div className="p-4 border-b border-[#1E2D40] flex items-center justify-between bg-[#0D1520]/60 shrink-0 select-none">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#00E5FF] flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4" /> Battle Chat
        </h3>
        
        <button 
          onClick={onClose}
          className="p-1 rounded-lg border border-[#1E2D40] hover:border-red-400 hover:text-red-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
 
      {/* ── TABS FOR TEAM BATTLE ── */}
      {battleType === 'team' && (
        <div className="flex bg-[#0D1520]/80 p-1 border-b border-[#1E2D40] shrink-0">
          <button
            type="button"
            onClick={() => setChatTab('all')}
            className={`flex-1 py-1.5 rounded-lg text-center text-[10px] font-bold uppercase tracking-wider transition-all ${
              chatTab === 'all'
                ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Chat
          </button>
          <button
            type="button"
            onClick={() => setChatTab('team')}
            className={`flex-1 py-1.5 rounded-lg text-center text-[10px] font-bold uppercase tracking-wider transition-all ${
              chatTab === 'team'
                ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Team Only
          </button>
        </div>
      )}
 
      {/* ── MESSAGES CHANNEL ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin text-xs">
        
        {filteredMessages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-center px-4 select-none">
            {chatTab === 'team' 
              ? 'Private Teammate Channel. Discuss algorithms safely away from opponent eyes!'
              : 'No messages sent yet. Discuss algorithmic strategies or banter duels!'}
          </div>
        )}
 
        {filteredMessages.map((m, i) => {
          const isMe = m.userId === myUserId;
          const isSystem = !m.userId; // System notifications have no userId
 
          if (isSystem) {
            return (
              <div key={i} className="text-center text-[10px] text-[#7A9AB8]/60 bg-[#0D1520]/40 border border-[#1E2D40]/30 rounded-lg p-2 font-mono">
                {m.message}
              </div>
            );
          }
 
          return (
            <div key={i} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[9px] font-bold text-[#7A9AB8] px-1">
                @{m.username}
                {m.scope === 'team' && <span className="text-[8px] text-[#00E5FF] font-mono ml-1.5">[TEAM]</span>}
              </span>
              <div 
                className={`max-w-[85%] p-3 rounded-2xl leading-normal break-words shadow ${
                  isMe 
                    ? 'bg-[#00E5FF]/10 text-white border border-[#00E5FF]/20 rounded-tr-sm' 
                    : 'bg-[#0D1520] text-[#E0E6F0] border border-[#1E2D40] rounded-tl-sm'
                }`}
              >
                {m.message}
              </div>
              <span className="text-[8px] text-[#7A9AB8]/50 px-1 font-mono">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        
        <div ref={chatBottomRef} />
      </div>
 
      {/* ── INPUT CONTROL FOOTER ── */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#1E2D40] bg-[#0D1520]/30 shrink-0 select-none">
        <div className="flex gap-2">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={chatTab === 'team' ? "Message teammate..." : "Message everyone..."}
            className="flex-1 bg-[#0D1520] border border-[#1E2D40] focus:border-[#00E5FF] rounded-xl px-3 py-2 text-xs outline-none text-[#E0E6F0] placeholder:text-[#7A9AB8]/40"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-[#00E5FF] hover:brightness-110 text-[#0B0F1A] flex items-center justify-center transition-all hover:scale-[1.03] shadow-[0_0_12px_rgba(0,229,255,0.1)] shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
 
    </div>
  );
};

export default BattleChat;
