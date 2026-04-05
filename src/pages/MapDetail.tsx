import { Button } from '@mantine/core';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MAPS, getMapImage } from '../lib/maps';
import { useLineupsStore } from '../store/lineups';

const viewBoxWidth = 1000;
const viewBoxHeight = 600;

const toViewBox = (coords?: [number, number]) => {
  if (!coords) return null;
  const [x, y] = coords;
  return [x * viewBoxWidth, y * viewBoxHeight];
};

const MapDetail: React.FC = () => {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const allLineups = useLineupsStore((s) => s.lineups);
  const lineups = React.useMemo(
    () => allLineups.filter((l) => l.map === mapId),
    [allLineups, mapId]
  );

  const mapImage = React.useMemo(() => {
    if (!mapId) return undefined;
    const meta = MAPS.find((m) => m.id === mapId);
    return meta?.mapUrl ?? getMapImage(mapId);
  }, [mapId]);

  return (
    <div style={{ padding: 16, display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <Button variant="subtle" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        <h2>Map: {mapId}</h2>

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
            aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`
          }}
        >
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          >

            {/* draw lineups */}
            {lineups.map((l, idx) => {
              const s = toViewBox(l.startCoords as any);
              const t = toViewBox(l.targetCoords as any);
              if (!s || !t) return null;
              const color = ['#ff6b6b', '#4dabf7', '#ffd43b'][idx % 3];
              return (
                <g
                  key={l.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/lineups/${l.id}`)}
                >
                  <line
                    x1={s[0]}
                    y1={s[1]}
                    x2={t[0]}
                    y2={t[1]}
                    stroke={color}
                    strokeWidth={4}
                    strokeOpacity={0.9}
                  />
                  <circle cx={s[0]} cy={s[1]} r={8} fill={color} stroke="#000" strokeWidth={1} />
                  <circle cx={t[0]} cy={t[1]} r={6} fill="#fff" stroke={color} strokeWidth={2} />
                  <text x={t[0] + 10} y={t[1] - 10} fontSize={16} fill="#222">
                    {l.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <aside style={{ width: 360 }}>
        <h3>Lineups on {mapId}</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {lineups.map((l) => (
            <div key={l.id} style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <strong>{l.name}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {l.startPosition} → {l.target}
                  </div>
                </div>
                <div>
                  <button onClick={() => navigate(`/lineups/${l.id}`)}>Open</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default MapDetail;
