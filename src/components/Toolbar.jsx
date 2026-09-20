import React from 'react';
import { 
  Building2, 
  Box,
  ChevronDown, 
  RotateCcw, 
  Sliders, 
  Check, 
  PanelLeft, 
  PanelRight, 
  Maximize2 
} from 'lucide-react';

export default function Toolbar({
  currentDetail,
  isSidebarOpen,
  onToggleSidebar,
  isPropsOpen,
  onToggleProps,
  onResetView,
  onSelectFirst
}) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 select-none">
      {/* Left: Brand & Detail Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg border transition-colors ${
            isSidebarOpen ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Biblioteca de detalles"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <button 
          onClick={onSelectFirst}
          className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity group"
          title="Ir a Maqueta 1 (Detalle de referencia inicial)"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Box className="w-4 h-4 text-white stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              BIBLIOTECA DE DETALLES
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded hidden md:inline">
                ETSIE
              </span>
            </span>
          </div>
        </button>

        <span className="text-slate-300 mx-1 hidden sm:inline">/</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs">
          <span className="font-mono text-blue-600 font-bold">{currentDetail?.fileCode || `MAQUETA-${currentDetail?.maquetaNumber}`}</span>
          <span className="text-slate-900 font-semibold">{currentDetail?.title}</span>
          {currentDetail?.technicalTitle && (
            <span className="truncate max-w-[140px] sm:max-w-[260px] text-slate-500 font-normal hidden sm:inline">• {currentDetail.technicalTitle}</span>
          )}
        </div>
      </div>

      {/* Center: Clean Status */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>CTE DB-SE-A</span>
      </div>

      {/* Right: Restablecer + Panel Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restablecer vista</span>
        </button>

        <button
          onClick={onToggleProps}
          className={`p-2 rounded-lg border transition-colors ${
            isPropsOpen ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Panel de Propiedades"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
