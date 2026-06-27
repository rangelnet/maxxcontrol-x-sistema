import { X, Maximize2 } from 'lucide-react';
import { useState } from 'react';

export default function PreviewContainer({ title, children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>📺</span> Preview — {title}
          </h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 bg-dark-900 border border-dark-600 rounded-lg text-zinc-400 hover:text-white hover:border-brand-500 transition"
            title="Expandir Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative cursor-pointer group" onClick={() => setIsModalOpen(true)}>
          <div className="pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/10 transition-colors flex items-center justify-center rounded-xl z-50">
            <div className="opacity-0 group-hover:opacity-100 bg-brand-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transition-all transform scale-95 group-hover:scale-100 flex items-center gap-2">
              <Maximize2 className="w-3 h-3" /> Ampliar
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-dark-900 border border-dark-600 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-w-5xl w-full max-h-full"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between bg-dark-800">
              <h2 className="text-white font-bold flex items-center gap-2">
                <span>📺</span> Preview Expandido — {title}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto flex items-center justify-center flex-1 bg-dark-950">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
