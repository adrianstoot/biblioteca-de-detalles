import React, { useState, useMemo, memo } from 'react';
import { 
  Search, 
  X, 
  CheckCircle2, 
  Box, 
  Layers, 
  ChevronRight,
  Sparkles,
  Maximize2,
  Ruler
} from 'lucide-react';

/**
 * Modern Minimalist Compact 3D Detail Card
 * Ultra-sleek, compact architectural card with transparent 3D snapshot,
 * concise title, clean metadata, and smooth hover interaction.
 */
const DetailCard = memo(function DetailCard({ detail, isSelected, onSelect }) {
  const widthMm = Math.round((detail.dimensions?.width || 1) * 1000);
  const heightMm = Math.round((detail.dimensions?.height || 1) * 1000);

  // Short category label
  const categoryLabel = {
    architectural_models: 'Maqueta BIM',
    tripo_models: 'Tripo 3D',
    base: 'Base',
    rigid: 'Rígido',
    articulated: 'Articulado',
    splice: 'Empalme',
    truss: 'Cercha',
    framework: 'Forjado'
  }[detail.categoryKey] || detail.category;

  const displayTitle = detail.shortTitle || detail.title;

  return (
    <div
      onClick={() => onSelect(detail)}
      className={`group relative flex items-center gap-3 rounded-xl border transition-all duration-150 cursor-pointer p-2 select-none ${
        isSelected
          ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/30 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
      }`}
    >
      {/* 3D Model Thumbnail (compact square with transparent model) */}
      <div className="relative w-14 h-14 rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/80 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:border-slate-300 transition-colors">
        <Box className="w-6 h-6 text-slate-300 absolute inset-auto pointer-events-none" />
        <img
          src={`${import.meta.env.BASE_URL || '/'}thumbnails/${detail.id}.png`}
          alt={displayTitle}
          loading="lazy"
          decoding="async"
          className="relative z-10 max-h-12 max-w-12 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-200"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Info Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-1.5 mb-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
              }`}
            >
              {detail.id}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {categoryLabel}
            </span>
          </div>

          {isSelected && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            </span>
          )}
        </div>

        {/* Short, Concrete Title */}
        <h3 className={`text-xs font-semibold truncate leading-tight transition-colors ${
          isSelected ? 'text-blue-950 font-bold' : 'text-slate-800 group-hover:text-blue-600'
        }`}>
          {displayTitle}
        </h3>

        {/* Dimensions & Subtitle */}
        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
          <span>{widthMm}×{heightMm} mm</span>
          <span>•</span>
          <span className="truncate">{detail.fileCode}</span>
        </div>
      </div>
    </div>
  );
});

export default function Sidebar({ 
  details = [], 
  selectedDetail, 
  onSelectDetail, 
  isOpen, 
  onClose 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Category list with labels
  const categories = [
    { key: 'all', label: 'Todos' },
    { key: 'architectural_models', label: 'Maquetas Datasmith' },
    { key: 'tripo_models', label: 'Modelos Tripo' },
    { key: 'base', label: 'Bases' },
    { key: 'rigid', label: 'Rígidos' },
    { key: 'articulated', label: 'Articulados' },
    { key: 'splice', label: 'Empalmes' },
    { key: 'truss', label: 'Cerchas' },
    { key: 'framework', label: 'Estructuras' }
  ];

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: details.length };
    details.forEach((d) => {
      counts[d.categoryKey] = (counts[d.categoryKey] || 0) + 1;
    });
    return counts;
  }, [details]);

  // Filtered details
  const filteredDetails = useMemo(() => {
    return details.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryKey !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.id.toLowerCase().includes(q) ||
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.shortTitle && item.shortTitle.toLowerCase().includes(q)) ||
          (item.fullTitle && item.fullTitle.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
        );
      }
      return true;
    });
  }, [details, searchQuery, selectedCategory]);

  return (
    <aside 
      className={`fixed lg:static top-0 left-0 bottom-0 w-80 sm:w-92 bg-white border-r border-slate-200 flex flex-col z-30 transition-all duration-300 select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'
      }`}
    >
      {/* Header: Biblioteca & Search */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Catálogo de Maquetas</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                {details.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Detalles constructivos y maquetas ETSIE
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Search Pill */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, unión, perfil..."
            className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Minimal Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pb-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const count = categoryCounts[cat.key] || 0;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all text-[11px] font-medium flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List of Modern 3D Detail Cards */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar bg-[#fbfcfd]">
        {filteredDetails.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-sans space-y-2">
            <Box className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-medium text-slate-600">No se encontraron detalles</p>
            <p className="text-[11px] text-slate-400">Prueba con otra búsqueda o categoría</p>
          </div>
        ) : (
          filteredDetails.map((detail) => (
            <DetailCard
              key={detail.id}
              detail={detail}
              isSelected={selectedDetail?.id === detail.id}
              onSelect={onSelectDetail}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 bg-white text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-medium">{filteredDetails.length} de {details.length} maquetas</span>
        <span className="font-mono text-slate-400 text-[10px]">ETSIE 3D • 60 FPS</span>
      </div>
    </aside>
  );
}
