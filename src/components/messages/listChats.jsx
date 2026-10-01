import React from 'react';

export default function ListChats({ contacts, onStartMassive, onSelectContact, activeContact }) {
  return (
    <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col h-full bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="flex-1 bg-gray-50 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Search" className="bg-transparent outline-none w-full text-[13px] text-gray-700 placeholder-gray-400" />
        </div>
        <button className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.125l-2.816.93a.75.75 0 01-.95-.95l.93-2.816a4.5 4.5 0 011.125-1.89l13.416-13.416zM18.75 5.25l-1.5 1.5" />
          </svg>
        </button>
      </div>

      {/* Action Button */}
      <div className="px-4 py-3 border-b border-gray-100">
        <button 
          onClick={onStartMassive}
          className="w-full bg-[#1a1c1e] hover:bg-black text-white font-medium text-[13px] py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          Generar envío masivo
        </button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {contacts.map((c) => (
          <div 
            key={c.id} 
            onClick={() => onSelectContact(c)}
            className={`flex gap-3 p-4 cursor-pointer border-b border-gray-50 transition-colors group ${activeContact?.id === c.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <div className="relative flex-shrink-0">
              <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
              {c.online && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4cd964] border-2 border-white rounded-full"></span>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <h3 className="font-semibold text-[14px] text-gray-900 truncate group-hover:text-black">{c.name}</h3>
                  {c.categoria && c.categoria !== 'general' && (
                    <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {c.categoria}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{c.time}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <p className="text-[13px] text-gray-500 truncate">{c.lastMessage}</p>
                {c.unread > 0 && (
                  <span className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center">
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
