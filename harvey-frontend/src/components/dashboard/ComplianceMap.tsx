import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { regionalData, RegionalData } from '@/data/complianceData';

const getSeverityColor = (severity: RegionalData['severity']) => {
  switch (severity) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

export const ComplianceMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map centered on Maharashtra, India
    mapInstance.current = L.map(mapRef.current, {
      center: [19.5, 75.5],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(mapInstance.current);

    // Add regional markers
    regionalData.forEach((region) => {
      const color = getSeverityColor(region.severity);
      
      // Create circle marker for region
      const circle = L.circleMarker(region.coordinates, {
        radius: Math.max(15, region.totalCases / 2),
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.4,
      }).addTo(mapInstance.current!);

      // Add popup
      circle.bindPopup(`
        <div style="font-family: system-ui; min-width: 150px;">
          <p style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${region.region}</p>
          <p style="font-size: 12px; color: #666; margin: 4px 0;">Total Cases: <strong>${region.totalCases}</strong></p>
          <p style="font-size: 12px; color: #666; margin: 4px 0;">Flagged: <strong style="color: ${color}">${region.flaggedCases}</strong></p>
          <p style="font-size: 12px; color: #666; margin: 4px 0;">Compliance Rate: <strong>${region.complianceRate}%</strong></p>
        </div>
      `);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Regional Compliance Overview (Visualization)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div ref={mapRef} className="h-[350px] rounded-lg overflow-hidden" />
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="text-xs text-muted-foreground">High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500/60" />
            <span className="text-xs text-muted-foreground">Medium Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="text-xs text-muted-foreground">Low Risk</span>
          </div>
        </div>

        {/* Caption */}
        <p className="text-xs text-muted-foreground text-center italic pt-1">
          This visualization represents how compliance cases can be aggregated by registration office jurisdiction. Current analysis is document-based.
        </p>
      </CardContent>
    </Card>
  );
};
