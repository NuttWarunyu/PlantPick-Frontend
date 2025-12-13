import React, { useState, useRef, useEffect } from 'react';
import { Leaf, Circle, Square, Layers } from 'lucide-react';
import { GardenAnalysisResult, Position } from '../services/aiService';

interface AnnotatedImageProps {
  imageSrc: string;
  analysisResult: GardenAnalysisResult;
  onMarkerClick?: (type: string, name: string, index: number) => void;
}

const AnnotatedImage: React.FC<AnnotatedImageProps> = ({ 
  imageSrc, 
  analysisResult,
  onMarkerClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const getMarkerPosition = (position: Position | undefined, containerWidth: number, containerHeight: number) => {
    if (!position) return null;
    return {
      left: `${position.x}%`,
      top: `${position.y}%`
    };
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'plant':
        return 'bg-green-500 border-green-600';
      case 'lawn':
        return 'bg-emerald-500 border-emerald-600';
      case 'pathway':
        return 'bg-blue-500 border-blue-600';
      case 'other':
        return 'bg-purple-500 border-purple-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'plant':
        return <Leaf className="w-4 h-4" />;
      case 'lawn':
        return <Circle className="w-4 h-4" />;
      case 'pathway':
        return <Square className="w-4 h-4" />;
      case 'other':
        return <Layers className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  if (!imageSize) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative inline-block w-full">
        <img
          src={imageSrc}
          alt="Garden Analysis"
          className="w-full h-auto rounded-xl shadow-lg border-2 border-green-100"
        />
        
        {/* Overlay markers */}
        <div className="absolute inset-0">
          {/* Plant markers */}
          {analysisResult.plants.map((plant, index) => {
            if (!plant.position) return null;
            const markerId = `plant-${index}`;
            const isHovered = hoveredMarker === markerId;
            const pos = getMarkerPosition(plant.position, imageSize.width, imageSize.height);
            if (!pos) return null;
            
            return (
              <div
                key={markerId}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                  isHovered ? 'z-20 scale-125' : 'z-10'
                }`}
                style={pos}
                onMouseEnter={() => setHoveredMarker(markerId)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => onMarkerClick?.('plant', plant.name, index)}
              >
                <div className={`${getMarkerColor('plant')} rounded-full p-2 border-2 shadow-lg text-white flex items-center justify-center`}>
                  {getMarkerIcon('plant')}
                </div>
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                    <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-lg">
                      {plant.name}
                      {plant.quantity > 1 && ` (${plant.quantity} ต้น)`}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Lawn marker */}
          {analysisResult.lawn?.type && analysisResult.lawn.position && (
            <div
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                hoveredMarker === 'lawn' ? 'z-20 scale-125' : 'z-10'
              }`}
              style={getMarkerPosition(analysisResult.lawn.position, imageSize.width, imageSize.height) || {}}
              onMouseEnter={() => setHoveredMarker('lawn')}
              onMouseLeave={() => setHoveredMarker(null)}
              onClick={() => onMarkerClick?.('lawn', analysisResult.lawn!.type!, -1)}
            >
              <div className={`${getMarkerColor('lawn')} rounded-full p-2 border-2 shadow-lg text-white flex items-center justify-center`}>
                {getMarkerIcon('lawn')}
              </div>
              {hoveredMarker === 'lawn' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                  <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-lg">
                    {analysisResult.lawn.type}
                    {analysisResult.lawn.area && ` (${analysisResult.lawn.area})`}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pathway markers */}
          {analysisResult.pathways?.map((pathway, index) => {
            if (!pathway.position) return null;
            const markerId = `pathway-${index}`;
            const isHovered = hoveredMarker === markerId;
            
            return (
              <div
                key={markerId}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                  isHovered ? 'z-20 scale-125' : 'z-10'
                }`}
                style={getMarkerPosition(pathway.position, imageSize.width, imageSize.height) || {}}
                onMouseEnter={() => setHoveredMarker(markerId)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => onMarkerClick?.('pathway', pathway.material, index)}
              >
                <div className={`${getMarkerColor('pathway')} rounded-full p-2 border-2 shadow-lg text-white flex items-center justify-center`}>
                  {getMarkerIcon('pathway')}
                </div>
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                    <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-lg">
                      {pathway.material}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Other elements markers */}
          {analysisResult.otherElements?.map((element, index) => {
            if (!element.position) return null;
            const markerId = `other-${index}`;
            const isHovered = hoveredMarker === markerId;
            
            return (
              <div
                key={markerId}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                  isHovered ? 'z-20 scale-125' : 'z-10'
                }`}
                style={getMarkerPosition(element.position, imageSize.width, imageSize.height) || {}}
                onMouseEnter={() => setHoveredMarker(markerId)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => onMarkerClick?.('other', element.type, index)}
              >
                <div className={`${getMarkerColor('other')} rounded-full p-2 border-2 shadow-lg text-white flex items-center justify-center`}>
                  {getMarkerIcon('other')}
                </div>
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                    <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-lg">
                      {element.type}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-600"></div>
          <span>ต้นไม้</span>
        </div>
        {analysisResult.lawn?.type && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-emerald-600"></div>
            <span>สนามหญ้า</span>
          </div>
        )}
        {analysisResult.pathways && analysisResult.pathways.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-blue-600"></div>
            <span>ทางเดิน</span>
          </div>
        )}
        {analysisResult.otherElements && analysisResult.otherElements.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-purple-600"></div>
            <span>องค์ประกอบอื่นๆ</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotatedImage;

