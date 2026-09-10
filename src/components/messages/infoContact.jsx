import React from 'react';

export default function InfoContact({ contact }) {
  if (!contact) return null;

  return (
    <div className="w-[300px] flex-shrink-0 flex flex-col h-full bg-white overflow-y-auto">
      {/* Header Info */}
      <div className="flex flex-col items-center pt-8 pb-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-[15px] mb-6">Information</h3>
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-gray-50 shadow-sm">
           <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-[18px] font-bold text-gray-900">{contact.name}</h2>
        <p className="text-[13px] text-gray-500 mt-1 font-medium">{contact.name.toLowerCase().replace(' ', '_')}255@gmail.com</p>
        <p className="text-[13px] text-gray-500 mt-1 font-medium">+62 813-4545-210</p>
      </div>
      
      {/* Media Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800 text-[14px]">Media</h4>
          <span className="text-[11px] font-medium text-gray-400 hover:text-gray-600 cursor-pointer">Show More</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop" className="w-full aspect-square rounded-xl object-cover shadow-sm" />
          <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop" className="w-full aspect-square rounded-xl object-cover shadow-sm" />
          <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shadow-sm cursor-pointer hover:bg-gray-700 transition">
            +5
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800 text-[14px]">Files</h4>
          <span className="text-[11px] font-medium text-gray-400 hover:text-gray-600 cursor-pointer">Show More</span>
        </div>
        <div className="flex flex-col gap-5">
           {/* File 1 */}
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 text-[10px] font-bold shadow-sm">ZIP</div>
              <div className="flex-1 min-w-0">
                 <p className="text-[13px] font-semibold text-gray-800 truncate">Logo Company</p>
                 <p className="text-[11px] font-medium text-gray-400 mt-0.5">2.1 Mb · Today</p>
              </div>
              <button className="w-6 h-6 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 flex-shrink-0">
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
           </div>
           {/* File 2 */}
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500 text-[10px] font-bold shadow-sm">PDF</div>
              <div className="flex-1 min-w-0">
                 <p className="text-[13px] font-semibold text-gray-800 truncate">New Customer Guide</p>
                 <p className="text-[11px] font-medium text-gray-400 mt-0.5">1.7 Mb · Feb 21, 2021</p>
              </div>
              <button className="w-6 h-6 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 flex-shrink-0">
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
           </div>
        </div>
      </div>
      
      {/* Links Section */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800 text-[14px]">Links</h4>
          <span className="text-[11px] font-medium text-gray-400 hover:text-gray-600 cursor-pointer">Show More</span>
        </div>
        <div className="flex flex-col gap-4">
           {/* Link 1 */}
           <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden shadow-sm">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[13px] font-semibold text-gray-800 truncate">Social Web Components</p>
                 <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-tight">11 Screens, Published on Dribbble with... https://dribbble.com/shots/14774353</p>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}
