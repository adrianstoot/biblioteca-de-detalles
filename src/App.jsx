import React, { useState, useEffect, useCallback } from 'react';
import detailsData from './data/details.json';
import Viewer3D from './components/Viewer3D';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import DetailInfoPanel from './components/DetailInfoPanel';

export default function App() {
  const [details] = useState(detailsData);
  const [selectedDetail, setSelectedDetail] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      if (urlId) {
        const clean = urlId.toLowerCase().trim();
        const found = detailsData.find(d => 
          d.id.toLowerCase() === clean ||
          (d.maquetaId && d.maquetaId.toLowerCase() === clean) ||
          (d.fileCode && d.fileCode.toLowerCase() === clean) ||
          d.title.toLowerCase() === clean ||
          String(d.maquetaNumber) === clean ||
          `maqueta-${d.maquetaNumber}` === clean
        );
        if (found) return found;
      }
    }
    return detailsData[0];
  });

  const handleSelectDetail = useCallback((detail) => {
    setSelectedDetail(detail);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('id', detail.maquetaId || detail.id);
      window.history.replaceState(null, '', url);
    }
  }, []);

  const [materialPreset, setMaterialPreset] = useState('steel_hot_rolled');
  const [showEdges, setShowEdges] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropsOpen, setIsPropsOpen] = useState(true);

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.key === 'ArrowRight') {
      const idx = details.findIndex(d => d.id === selectedDetail.id);
      if (idx !== -1 && idx < details.length - 1) {
        handleSelectDetail(details[idx + 1]);
      }
    } else if (e.key === 'ArrowLeft') {
      const idx = details.findIndex(d => d.id === selectedDetail.id);
      if (idx > 0) {
        handleSelectDetail(details[idx - 1]);
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      setAutoRotate(prev => !prev);
    }
  }, [details, selectedDetail, handleSelectDetail]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleResetView = () => {
    setMaterialPreset('steel_hot_rolled');
    setShowEdges(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-800 antialiased font-sans">
      {/* Top Header */}
      <Toolbar
        currentDetail={selectedDetail}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isPropsOpen={isPropsOpen}
        onToggleProps={() => setIsPropsOpen(!isPropsOpen)}
        onResetView={handleResetView}
        onSelectFirst={() => handleSelectDetail(details[0])}
      />

      {/* Main Workspace: Left Biblioteca + 3D Viewport + Right Propiedades */}
      <div className="flex-1 flex relative overflow-hidden bg-[#f8fafc]">
        {/* Left: Biblioteca */}
        <Sidebar
          details={details}
          selectedDetail={selectedDetail}
          onSelectDetail={handleSelectDetail}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center: 3D Viewport */}
        <main className="flex-1 relative h-full w-full overflow-hidden bg-[#f8fafc]">
          <Viewer3D
            currentDetail={selectedDetail}
            materialPreset={materialPreset}
            showEdges={showEdges}
            showGrid={showGrid}
            autoRotate={autoRotate}
          />
        </main>

        {/* Right: Propiedades */}
        <DetailInfoPanel
          detail={selectedDetail}
          isOpen={isPropsOpen}
          onClose={() => setIsPropsOpen(false)}
          materialPreset={materialPreset}
          onChangeMaterial={setMaterialPreset}
          showEdges={showEdges}
          onToggleEdges={() => setShowEdges(!showEdges)}
        />
      </div>
    </div>
  );
}
