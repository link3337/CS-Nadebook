import React from 'react';

export const MAP_VIEW_WIDTH = 1000;
export const MAP_VIEW_HEIGHT = 600;

export type NormalizedCoords = [number, number];

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
