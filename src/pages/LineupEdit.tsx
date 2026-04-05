import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMapImage } from '../lib/maps';
import { useLineupsStore } from '../store/lineups';

const viewBoxWidth = 1000;
const viewBoxHeight = 600;

const toNormalized = (px: number, py: number) =>
  [px / viewBoxWidth, py / viewBoxHeight] as [number, number];
const toViewBox = (coords?: [number, number]) => {
  if (!coords) return null;
  return [coords[0] * viewBoxWidth, coords[1] * viewBoxHeight] as [number, number];
};

const LineupEdit: React.FC = () => {
  const { lineupId } = useParams();
  const navigate = useNavigate();
  const getById = useLineupsStore((s) => s.getById);
  const updateLineup = useLineupsStore((s) => s.updateLineup);

  const lineup = getById(lineupId ?? '');
  const mapImage = getMapImage(lineup?.map ?? '');

  const [name, setName] = useState(lineup?.name ?? '');
  const [description, setDescription] = useState(lineup?.description ?? '');
  const [startCoords, setStartCoords] = useState<[number, number] | undefined>(
    lineup?.startCoords as any
  );
  const [targetCoords, setTargetCoords] = useState<[number, number] | undefined>(
    lineup?.targetCoords as any
  );
  const [mode, setMode] = useState<'none' | 'start' | 'target'>('none');

  if (!lineup) return <div style={{ padding: 16 }}>Lineup not found</div>;

  const onSvgClick = (e: React.MouseEvent<SVGElement>) => {
    if (mode === 'none') return;
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const nx = px * (viewBoxWidth / rect.width);
    const ny = py * (viewBoxHeight / rect.height);
    const normalized = toNormalized(nx, ny);
    if (mode === 'start') setStartCoords(normalized);
    if (mode === 'target') setTargetCoords(normalized);
  };

  const save = () => {
    updateLineup(lineup.id, {
      name,
      description,
      startCoords: startCoords as any,
      targetCoords: targetCoords as any
    });
    navigate(`/lineups/${lineup.id}`);
  };

  return (
    <div style={{ padding: 16, display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <h2>Edit Lineup</h2>
        <div style={{ display: 'grid', gap: 8, maxWidth: 640 }}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div>
            <strong>Coordinate Picker</strong>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => setMode(mode === 'start' ? 'none' : 'start')}
                style={{ background: mode === 'start' ? '#ddd' : undefined }}
              >
                {mode === 'start' ? 'Setting start (click map)' : 'Set Start'}
              </button>
              <button
                onClick={() => setMode(mode === 'target' ? 'none' : 'target')}
                style={{ background: mode === 'target' ? '#ddd' : undefined }}
              >
                {mode === 'target' ? 'Setting target (click map)' : 'Set Target'}
              </button>
              <button
                onClick={() => {
                  setStartCoords(undefined);
                  setTargetCoords(undefined);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
            <svg
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              width="100%"
              height={400}
              onClick={onSvgClick}
              style={{ display: 'block' }}
            >
              {mapImage && (
                <image
                  href={mapImage}
                  x={0}
                  y={0}
                  width={viewBoxWidth}
                  height={viewBoxHeight}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {/* markers */}
              {startCoords &&
                (() => {
                  const p = toViewBox(startCoords);
                  return (
                    <circle
                      cx={p![0]}
                      cy={p![1]}
                      r={10}
                      fill="#4dabf7"
                      stroke="#000"
                      strokeWidth={1}
                    />
                  );
                })()}
              {targetCoords &&
                (() => {
                  const p = toViewBox(targetCoords);
                  return (
                    <circle
                      cx={p![0]}
                      cy={p![1]}
                      r={8}
                      fill="#ffd43b"
                      stroke="#000"
                      strokeWidth={1}
                    />
                  );
                })()}
              {startCoords &&
                targetCoords &&
                (() => {
                  const s = toViewBox(startCoords)!;
                  const t = toViewBox(targetCoords)!;
                  return (
                    <line
                      x1={s[0]}
                      y1={s[1]}
                      x2={t[0]}
                      y2={t[1]}
                      stroke="#ff6b6b"
                      strokeWidth={3}
                      strokeOpacity={0.9}
                    />
                  );
                })()}
            </svg>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save}>Save</button>
            <button onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </div>
      </div>

      <aside style={{ width: 360 }}>
        <h3>Preview</h3>
        <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
          <div>
            <strong>Start:</strong>{' '}
            {startCoords ? `${startCoords[0].toFixed(3)}, ${startCoords[1].toFixed(3)}` : '—'}
          </div>
          <div>
            <strong>Target:</strong>{' '}
            {targetCoords ? `${targetCoords[0].toFixed(3)}, ${targetCoords[1].toFixed(3)}` : '—'}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LineupEdit;
