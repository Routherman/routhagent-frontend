import React, { useState, useRef, useEffect } from 'react';

export default function Chat({ messages = [], contact, onHeaderClick, onSendMessage }) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSendMessage(inputValue);
        setInputValue('');
      }
    }
  };
  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] border-l border-r border-gray-100 min-w-0">
      {/* Chat Header */}
      <div 
        className="h-[76px] min-h-[76px] flex items-center justify-between px-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onHeaderClick}
      >
        <div>
          <h2 className="font-bold text-[15px] text-gray-900">{contact?.name || 'Contact'}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            {contact?.online && <span className="w-1.5 h-1.5 bg-[#4cd964] rounded-full"></span>}
            <span className="text-[12px] text-gray-500">{contact?.online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
           <button className="hover:text-gray-800 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
           </button>
           <button className="hover:text-gray-800 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
           </button>
           <button className="hover:text-gray-800 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </button>
           <button className="hover:text-gray-800 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
           </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex flex-col gap-5">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col max-w-[80%] ${m.isMine ? 'self-end items-end' : 'self-start items-start'}`}>
              
              {/* Message Bubble */}
              <div className={`p-4 rounded-[20px] ${m.isMine ? 'bg-[#c2dce0] text-gray-800 rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-600 rounded-tl-sm'}`}>
                
                {m.file && (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl mb-2 shadow-sm border border-gray-100">
                    <div className="w-10 h-10 bg-[#e8f5e9] rounded-lg flex items-center justify-center text-[#4caf50] text-[10px] font-bold tracking-wider">ZIP</div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-800">{m.file.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{m.file.size} - Downloaded</p>
                    </div>
                  </div>
                )}
                
                {m.audio && (
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <button className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:bg-gray-500">
                      <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                    <div className="flex-1 h-8 flex items-center overflow-hidden">
                       <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none">
                         <path d="M0 12 L2 12 L2 8 L4 8 L4 16 L6 16 L6 10 L8 10 L8 14 L10 14 L10 6 L12 6 L12 18 L14 18 L14 4 L16 4 L16 20 L18 20 L18 8 L20 8 L20 16 L22 16 L22 10 L24 10 L24 14 L26 14 L26 6 L28 6 L28 18 L30 18 L30 12 L32 12" stroke="#9ca3af" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                         <path d="M34 12 L100 12" stroke="#d1d5db" strokeWidth="2" strokeDasharray="2 4"/>
                       </svg>
                    </div>
                    <span className="text-[11px] font-medium text-gray-500">{m.audio.duration}</span>
                  </div>
                )}
                
                {!m.file && !m.audio && (
                  <p className="text-[14px] leading-relaxed">{m.text}</p>
                )}
              </div>
              
              {/* Message Time/Status */}
              <span className="text-[11px] font-medium text-gray-400 mt-1.5 px-1 flex items-center gap-1">
                {m.status === 'Read' && <span className="italic">{m.status}</span>}
                {m.status === 'Delivered' && <span className="italic">{m.status}</span>}
                {!m.status && m.isMine && <span className="italic">Sent</span>}
                {m.time}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 mx-6 mb-6 bg-white border border-gray-200 rounded-[20px] shadow-sm flex flex-col gap-3">
         <input 
            type="text" 
            placeholder="Enter to send, Shift + Enter to add new line" 
            className="w-full outline-none text-[14px] text-gray-700 bg-transparent placeholder-gray-300"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
         />
         <div className="flex justify-between items-center text-gray-400 pt-3 border-t border-gray-50 mt-1">
            <div className="flex gap-4 items-center">
              <span className="font-serif font-bold text-[15px] cursor-pointer hover:text-gray-600 transition-colors">B</span>
              <span className="font-serif italic text-[15px] cursor-pointer hover:text-gray-600 transition-colors">I</span>
              <span className="font-serif underline text-[15px] cursor-pointer hover:text-gray-600 transition-colors">U</span>
              <div className="w-px h-4 bg-gray-200 mx-1"></div>
              <svg className="w-[18px] h-[18px] cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              <svg className="w-[18px] h-[18px] cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </div>
            <div className="flex gap-4 items-center">
              <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
         </div>
      </div>
    </div>
  );
}
