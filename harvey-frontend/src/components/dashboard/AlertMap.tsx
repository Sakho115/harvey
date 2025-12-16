import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Alert, AlertLevel } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Layers, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertMapProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  newAlertId?: string; // ID of newly added alert for flash effect
}

const getMarkerColor = (level: AlertLevel): string => {
  switch (level) {
    case 'high': return '#dc2626';
    case 'medium': return '#ca8a04';
    case 'safe': return '#16a34a';
    default: return '#6b7280';
  }
};

const createCustomIcon = (level: AlertLevel, isNew: boolean = false) => {
  const color = getMarkerColor(level);
  const size = level === 'high' ? 16 : level === 'medium' ? 14 : 12;
  const flashAnimation = isNew ? 'animation: flash 0.5s ease-out 3;' : '';
  const pulseAnimation = level === 'high' ? 'animation: pulse 2s infinite;' : '';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container" style="position: relative;">
        ${isNew ? `<div style="
          position: absolute;
          width: ${size * 3}px;
          height: ${size * 3}px;
          background: ${color};
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: ripple 1s ease-out 2;
          opacity: 0;
        "></div>` : ''}
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ${isNew ? flashAnimation : pulseAnimation}
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export function AlertMap({ alerts, onAlertClick, newAlertId }: AlertMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map centered on NYC
    mapRef.current = L.map(mapContainer.current, {
      center: [40.7580, -73.9855],
      zoom: 12,
      zoomControl: true,
    });

    // Add dark-themed tile layer
    tileLayerRef.current = L.tileLayer(tileUrls[mapStyle], {
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: mapStyle === 'satellite' ? [] : ['a', 'b', 'c', 'd'],
      maxZoom: 20
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update tile layer when style changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    
    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileUrls[mapStyle], {
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: mapStyle === 'satellite' ? [] : ['a', 'b', 'c', 'd'],
      maxZoom: 20
    }).addTo(mapRef.current);
  }, [mapStyle]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current.clear();

    // Add new markers
    alerts.forEach((alert) => {
      const isNew = alert.id === newAlertId;
      const marker = L.marker(alert.coordinates, {
        icon: createCustomIcon(alert.level, isNew),
      }).addTo(mapRef.current!);

      markersRef.current.set(alert.id, marker);

      marker.bindPopup(`
        <div style="min-width: 200px; font-family: system-ui;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${alert.type}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${alert.location}</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              background: ${getMarkerColor(alert.level)}20;
              color: ${getMarkerColor(alert.level)};
            ">${alert.level.toUpperCase()}</span>
            <span style="font-size: 12px; color: #888;">Risk: ${alert.riskScore}%</span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        onAlertClick?.(alert);
      });

      // Pan to new alert
      if (isNew) {
        mapRef.current?.panTo(alert.coordinates, { animate: true, duration: 0.5 });
      }
    });
  }, [alerts, onAlertClick, newAlertId]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-1 border border-border flex flex-col gap-1">
          {(['dark', 'light', 'satellite'] as const).map((style) => (
            <Button
              key={style}
              variant={mapStyle === style ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setMapStyle(style)}
            >
              <Layers className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
        <p className="text-xs font-medium text-foreground mb-2">Alert Levels</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-high animate-pulse" />
            <span className="text-xs text-muted-foreground">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-medium" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-safe" />
            <span className="text-xs text-muted-foreground">Safe</span>
          </div>
        </div>
      </div>

      {/* New Alert Indicator */}
      {newAlertId && (
        <div className="absolute top-4 left-4 bg-alert-high/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-alert-high/50 animate-bounce-marker">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-medium">New Alert Detected</span>
          </div>
        </div>
      )}

      {/* CSS for marker animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes flash {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
