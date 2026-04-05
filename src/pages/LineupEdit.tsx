import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapCanvas from '../components/MapCanvas';
import { getDisplayMapImage } from '../lib/maps';
import { useLineupsStore } from '../store/lineups';

const LineupEdit: React.FC = () => {
  const { lineupId } = useParams();
  const navigate = useNavigate();
  const getById = useLineupsStore((s) => s.getById);
  const updateLineup = useLineupsStore((s) => s.updateLineup);

  const lineup = getById(lineupId ?? '');
  const mapImage = getDisplayMapImage(lineup?.map);

  const [name, setName] = useState(lineup?.name ?? '');
  const [description, setDescription] = useState(lineup?.description ?? '');
  const [startPosition, setStartPosition] = useState(lineup?.startPosition ?? '');
  const [startCoords, setStartCoords] = useState<[number, number] | undefined>(
    lineup?.startCoords as any
  );
  const [targetCoords, setTargetCoords] = useState<[number, number] | undefined>(
    lineup?.targetCoords as any
  );
  const [mode, setMode] = useState<'none' | 'start' | 'target'>('none');

  if (!lineup) return <div style={{ padding: 16 }}>Lineup not found</div>;

  const onMapClick = (normalized: [number, number]) => {
    if (mode === 'none') return;
    if (mode === 'start') setStartCoords(normalized);
    if (mode === 'target') setTargetCoords(normalized);
  };

  const save = () => {
    updateLineup(lineup.id, {
      name,
      description,
      startPosition,
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
          <label>
            Start Position
            <input
              value={startPosition}
              onChange={(e) => setStartPosition(e.target.value)}
              placeholder="e.g. T Spawn Corner"
            />
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

          <MapCanvas
            mapImage={mapImage}
            onNormalizedClick={onMapClick}
            lines={[
              {
                id: 'edit-line',
                from: startCoords,
                to: targetCoords,
                color: '#ff6b6b',
                width: 3
              }
            ]}
            markers={[
              {
                id: 'edit-start',
                at: startCoords,
                fill: '#4dabf7',
                radius: 10
              },
              {
                id: 'edit-target',
                at: targetCoords,
                fill: '#ffd43b',
                radius: 8
              }
            ]}
          />

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
