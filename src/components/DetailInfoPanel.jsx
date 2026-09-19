import React from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Sliders, 
  Layers, 
  Box 
} from 'lucide-react';

export default function DetailInfoPanel({ 
  detail, 
  isOpen, 
  onClose,
  materialPreset,
  onChangeMaterial,
  showEdges,
  onToggleEdges
}) {
  if (!detail || !isOpen) return null;

  // Convert dimensions to mm for authentic architectural CAD display (like ConstructoPro)
  const widthMm = Math.round((detail.dimensions?.width || 1) * 1000);
  const heightMm = Math.round((detail.dimensions?.height || 1) * 1000);
  const depthMm = Math.round((detail.dimensions?.depth || 1) * 1000);

  const materials = [
    { id: 'steel_hot_rolled', label: 'Acero Laminado S275' },
    { id: 'galvanized', label: 'Acero Galvanizado' },
    { id: 'red_primer', label: 'Imprimación Minio' },
    { id: 'stainless', label: 'Acero Inoxidable' }
  ];

  return (
    <aside className="fixed lg:static top-0 right-0 bottom-0 w-80 sm:w-84 bg-white border-l border-slate-200 flex flex-col z-30 shadow-xl lg:shadow-none select-none">
      {/* Header: Propiedades */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          Propiedades
        </h2>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Clean CAD Specs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        {/* Detail Title & Code */}
        <div>
          <span className="text-[10px] font-mono font-semibold text-blue-600 uppercase tracking-wider">
            {detail.id}
          </span>
          <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
            {detail.title}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {detail.category}
          </p>
        </div>

        {/* Dimensiones (ConstructoPro CAD style) */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Dimensiones
          </h4>
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>Ancho</span>
              <span className="font-semibold text-slate-900">
                {detail.dimensions?.width >= 2 ? `${detail.dimensions.width} m` : `${widthMm} mm`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Alto</span>
              <span className="font-semibold text-slate-900">
                {detail.dimensions?.height >= 2 ? `${detail.dimensions.height} m` : `${heightMm} mm`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Profundidad</span>
              <span className="font-semibold text-slate-900">
                {detail.dimensions?.depth >= 2 ? `${detail.dimensions.depth} m` : `${depthMm} mm`}
              </span>
            </div>
          </div>
        </div>

        {/* Acabado o Materiales Reales */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
            {detail.isTexturedModel ? 'Materiales y Acabados Reales' : 'Textura de Acero'}
          </h4>
          {detail.isTexturedModel ? (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-2 text-[11px]">
              <div className="flex items-center text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                <span>Textura / Material original del modelo</span>
              </div>
              {detail.stats?.materials && (
                <div className="pt-1.5 border-t border-slate-200/60 flex flex-wrap gap-1">
                  {detail.stats.materials.map((mat, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] text-slate-700 shadow-xs">
                      {mat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {materials.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onChangeMaterial(m.id)}
                  className={`px-2.5 py-2 text-[11px] rounded-lg border text-left transition-all ${
                    materialPreset === m.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aristas Técnicas CAD */}
        <div className="flex items-center justify-between py-2 border-t border-b border-slate-100">
          <span className="text-xs text-slate-700 font-medium">Aristas de dibujo CAD</span>
          <button
            onClick={onToggleEdges}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              showEdges ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                showEdges ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Validación & Normativa (ConstructoPro style) */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Validación Normativa
          </h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{detail.normativeReference}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{detail.structuralBehavior.split('.')[0]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{detail.stats?.geometriesCount || 0} componentes constructivos</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
