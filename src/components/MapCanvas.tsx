import React from 'react';

export const MAP_VIEW_WIDTH = 1000;
export const MAP_VIEW_HEIGHT = 600;

export type NormalizedCoords = [number, number];
export type UtilityType = 'smoke' | 'flash' | 'molotov' | 'he';

type MapLine = {
  id: string;
  from?: NormalizedCoords;
  to?: NormalizedCoords;
  color?: string;
  width?: number;
  opacity?: number;
  onClick?: () => void;
};

type MapMarker = {
  id: string;
  at?: NormalizedCoords;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  markerShape?: 'circle' | 'utility-target';
  utilityType?: UtilityType;
  onClick?: () => void;
};

type MapLabel = {
  id: string;
  at?: NormalizedCoords;
  text: string;
  dx?: number;
  dy?: number;
  fontSize?: number;
  fill?: string;
  onClick?: () => void;
};

type MapCanvasProps = {
  mapImage?: string;
  lines?: MapLine[];
  markers?: MapMarker[];
  labels?: MapLabel[];
  onNormalizedClick?: (coords: NormalizedCoords) => void;
  style?: React.CSSProperties;
};

const toViewBox = (coords?: NormalizedCoords): [number, number] | null => {
  if (!coords) return null;
  return [coords[0] * MAP_VIEW_WIDTH, coords[1] * MAP_VIEW_HEIGHT];
};

const renderUtilityTargetShape = (
  marker: MapMarker,
  x: number,
  y: number,
  onClick?: (e: React.MouseEvent<SVGGElement>) => void
) => {
  const r = marker.radius ?? 8;
  const stroke = marker.stroke ?? '#111';
  const strokeWidth = marker.strokeWidth ?? 1;

  const bgByUtility: Record<UtilityType, string> = {
    smoke: '#94a3b8',
    molotov: '#f97316',
    flash: '#fde047',
    he: '#22c55e'
  };

  const utility = marker.utilityType;
  const bg = utility ? bgByUtility[utility] : (marker.fill ?? '#4dabf7');

  const iconPath = (() => {
    if (utility === 'smoke') {
      return (
        <path
          d="M7.8 14.5c-1.9 0-3.3-1.4-3.3-3.1 0-1.7 1.4-3.1 3.3-3.1.4-2.1 2.2-3.5 4.5-3.5 2 0 3.8 1.2 4.4 3 2 0 3.6 1.5 3.6 3.4 0 1.9-1.6 3.4-3.6 3.4H7.8z"
          fill="#ffffff"
        />
      );
    }

    if (utility === 'molotov') {
      return (
        <path
          d="M12 3.5c1.2 1.9.8 3.3-.2 4.5 1.7.3 3.2 1.7 3.2 3.8 0 2.3-1.8 4.2-4.1 4.2-2.1 0-3.9-1.5-4-3.7-.1-1.9 1.2-3.3 2.7-4.2.9-.6 1.6-1.3 1.9-2.2.2-.8.1-1.6.5-2.4z"
          fill="#fff7ed"
        />
      );
    }

    if (utility === 'flash') {
      return (
        <path
          d="M11.8 4l1.7 4.1 4.5.3-3.4 3 1.1 4.4-3.9-2.4-3.8 2.4 1-4.4-3.4-3 4.5-.3L11.8 4z"
          fill="#111827"
        />
      );
    }

    if (utility === 'he') {
      return (
        <g>
          <circle cx="12" cy="12" r="4.2" fill="#ecfeff" />
          <rect x="11.3" y="5.1" width="1.4" height="2.4" rx="0.5" fill="#ecfeff" />
          <path d="M9 6.2h6" stroke="#ecfeff" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      );
    }

    return <circle cx="12" cy="12" r="4" fill="#ffffff" />;
  })();

  return (
    <g onClick={onClick}>
      <circle cx={x} cy={y} r={r} fill={bg} stroke={stroke} strokeWidth={strokeWidth} />
      <g transform={`translate(${x - r}, ${y - r}) scale(${(r * 2) / 24})`}>{iconPath}</g>
    </g>
  );
};

const toNormalizedFromClient = (
  clientX: number,
  clientY: number,
  rect: DOMRect
): NormalizedCoords | null => {
  const scale = Math.min(rect.width / MAP_VIEW_WIDTH, rect.height / MAP_VIEW_HEIGHT);
  const drawnWidth = MAP_VIEW_WIDTH * scale;
  const drawnHeight = MAP_VIEW_HEIGHT * scale;
  const offsetX = (rect.width - drawnWidth) / 2;
  const offsetY = (rect.height - drawnHeight) / 2;

  const x = clientX - rect.left - offsetX;
  const y = clientY - rect.top - offsetY;

  if (x < 0 || y < 0 || x > drawnWidth || y > drawnHeight) {
    return null;
  }

  return [x / drawnWidth, y / drawnHeight];
};

const MapCanvas: React.FC<MapCanvasProps> = ({
  mapImage,
  lines = [],
  markers = [],
  labels = [],
  onNormalizedClick,
  style
}) => {
  const onSvgClick = (e: React.MouseEvent<SVGElement>) => {
    if (!onNormalizedClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normalized = toNormalizedFromClient(e.clientX, e.clientY, rect);
    if (!normalized) return;
    onNormalizedClick(normalized);
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundImage: mapImage ? `url(${mapImage})` : undefined,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        aspectRatio: `${MAP_VIEW_WIDTH} / ${MAP_VIEW_HEIGHT}`,
        ...style
      }}
    >
      <svg
        viewBox={`0 0 ${MAP_VIEW_WIDTH} ${MAP_VIEW_HEIGHT}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        onClick={onSvgClick}
        style={{ display: 'block', cursor: onNormalizedClick ? 'crosshair' : 'default' }}
      >
        {lines.map((line) => {
          const from = toViewBox(line.from);
          const to = toViewBox(line.to);
          if (!from || !to) return null;
          return (
            <line
              key={line.id}
              x1={from[0]}
              y1={from[1]}
              x2={to[0]}
              y2={to[1]}
              stroke={line.color ?? '#ff6b6b'}
              strokeWidth={line.width ?? 3}
              strokeOpacity={line.opacity ?? 0.9}
              style={line.onClick ? { cursor: 'pointer' } : undefined}
              onClick={
                line.onClick
                  ? (e) => {
                      e.stopPropagation();
                      line.onClick?.();
                    }
                  : undefined
              }
            />
          );
        })}

        {markers.map((marker) => {
          const point = toViewBox(marker.at);
          if (!point) return null;
          const markerClick = marker.onClick
            ? (e: React.MouseEvent<SVGElement | SVGGElement>) => {
                e.stopPropagation();
                marker.onClick?.();
              }
            : undefined;

          if (marker.markerShape === 'utility-target') {
            return (
              <g key={marker.id} style={marker.onClick ? { cursor: 'pointer' } : undefined}>
                {renderUtilityTargetShape(marker, point[0], point[1], markerClick as any)}
              </g>
            );
          }
          return (
            <circle
              key={marker.id}
              cx={point[0]}
              cy={point[1]}
              r={marker.radius ?? 8}
              fill={marker.fill ?? '#4dabf7'}
              stroke={marker.stroke ?? '#000'}
              strokeWidth={marker.strokeWidth ?? 1}
              style={marker.onClick ? { cursor: 'pointer' } : undefined}
              onClick={
                marker.onClick
                  ? (e) => {
                      e.stopPropagation();
                      marker.onClick?.();
                    }
                  : undefined
              }
            />
          );
        })}

        {labels.map((label) => {
          const point = toViewBox(label.at);
          if (!point) return null;
          return (
            <text
              key={label.id}
              x={point[0] + (label.dx ?? 10)}
              y={point[1] + (label.dy ?? -10)}
              fontSize={label.fontSize ?? 16}
              fill={label.fill ?? '#222'}
              style={label.onClick ? { cursor: 'pointer' } : undefined}
              onClick={
                label.onClick
                  ? (e) => {
                      e.stopPropagation();
                      label.onClick?.();
                    }
                  : undefined
              }
            >
              {label.text}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default MapCanvas;
