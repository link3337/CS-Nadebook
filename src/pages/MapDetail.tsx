import { Button } from '@mantine/core';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import type { NormalizedCoords } from '../components/MapCanvas';
import MapCanvas from '../components/MapCanvas';
import { getDisplayMapImage } from '../lib/maps';
import { useLineupsStore } from '../store/lineups';

type UtilityFilter = 'all' | 'smoke' | 'he' | 'molotov' | 'flash';

const utilityOptions: Array<{ value: UtilityFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'smoke', label: 'Smoke' },
  { value: 'he', label: 'HE' },
  { value: 'molotov', label: 'Molotov' },
  { value: 'flash', label: 'Flashbang' }
];

const targetKey = (coords?: NormalizedCoords) => {
  if (!coords) return '';
  return `${coords[0].toFixed(4)}|${coords[1].toFixed(4)}`;
};

const MapDetail: React.FC = () => {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const [selectedTargetKey, setSelectedTargetKey] = React.useState<string | null>(null);
  const [utilityFilter, setUtilityFilter] = React.useState<UtilityFilter>('all');
  const allLineups = useLineupsStore((s) => s.lineups);
  const lineups = React.useMemo(
    () => allLineups.filter((l) => l.map === mapId),
    [allLineups, mapId]
  );

  const utilityFilteredLineups = React.useMemo(() => {
    if (utilityFilter === 'all') return lineups;
    return lineups.filter((l) => l.utilityType === utilityFilter);
  }, [lineups, utilityFilter]);

  const mapImage = React.useMemo(() => getDisplayMapImage(mapId), [mapId]);

  const overlays = React.useMemo(
    () =>
      utilityFilteredLineups
        .map((l, idx) => ({
          lineup: l,
          color: ['#ff6b6b', '#4dabf7', '#ffd43b'][idx % 3]
        }))
        .filter((item) => item.lineup.startCoords && item.lineup.targetCoords),
    [utilityFilteredLineups]
  );

  const filteredOverlays = React.useMemo(() => {
    if (!selectedTargetKey) return overlays;
    return overlays.filter(
      ({ lineup }) =>
        targetKey(lineup.targetCoords as NormalizedCoords | undefined) === selectedTargetKey
    );
  }, [overlays, selectedTargetKey]);

  const filteredLineups = React.useMemo(() => {
    if (!selectedTargetKey) return utilityFilteredLineups;
    return utilityFilteredLineups.filter(
      (l) => targetKey(l.targetCoords as NormalizedCoords | undefined) === selectedTargetKey
    );
  }, [utilityFilteredLineups, selectedTargetKey]);

  const targetGroups = React.useMemo(() => {
    const map = new Map<
      string,
      {
        at: NormalizedCoords;
        count: number;
        lineups: string[];
      }
    >();

    overlays.forEach(({ lineup }) => {
      const key = targetKey(lineup.targetCoords as NormalizedCoords | undefined);
      if (!key || !lineup.targetCoords) return;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.lineups.push(lineup.name);
      } else {
        map.set(key, {
          at: lineup.targetCoords as NormalizedCoords,
          count: 1,
          lineups: [lineup.name]
        });
      }
    });

    return Array.from(map.entries()).map(([key, value]) => ({ key, ...value }));
  }, [overlays]);

  const multiTargetKeys = React.useMemo(
    () => new Set(targetGroups.filter((g) => g.count > 1).map((g) => g.key)),
    [targetGroups]
  );

  const selectedTargetGroup = React.useMemo(
    () => targetGroups.find((g) => g.key === selectedTargetKey),
    [targetGroups, selectedTargetKey]
  );

  React.useEffect(() => {
    if (!selectedTargetKey) return;
    if (!targetGroups.some((g) => g.key === selectedTargetKey)) {
      setSelectedTargetKey(null);
    }
  }, [selectedTargetKey, targetGroups]);

  return (
    <div style={{ padding: 16, display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 8 }}>
          <BackButton
            onClick={() => navigate(-1)}
          />
        </div>
        <h2>Map: {mapId}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {utilityOptions.map((option) => (
            <Button
              key={option.value}
              size="xs"
              variant={utilityFilter === option.value ? 'filled' : 'light'}
              onClick={() => setUtilityFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <MapCanvas
          mapImage={mapImage}
          onNormalizedClick={() => {
            if (selectedTargetKey) setSelectedTargetKey(null);
          }}
          lines={filteredOverlays.map(({ lineup, color }) => ({
            id: `line-${lineup.id}`,
            from: lineup.startCoords,
            to: lineup.targetCoords,
            color,
            width: 4,
            onClick: () => navigate(`/lineups/${lineup.id}`)
          }))}
          markers={[
            ...filteredOverlays.map(({ lineup, color }) => ({
              id: `start-${lineup.id}`,
              at: lineup.startCoords,
              fill: color,
              radius: 8,
              onClick: () => navigate(`/lineups/${lineup.id}`)
            })),
            ...filteredOverlays
              .filter(({ lineup }) => !multiTargetKeys.has(targetKey(lineup.targetCoords as NormalizedCoords | undefined)))
              .map(({ lineup, color }) => ({
                id: `target-${lineup.id}`,
                at: lineup.targetCoords,
                markerShape: 'utility-target',
                utilityType: lineup.utilityType,
                fill: '#fff',
                stroke: color,
                strokeWidth: 2,
                radius: 8,
                onClick: () => navigate(`/lineups/${lineup.id}`)
              })),
            ...targetGroups
              .filter((g) => g.count > 1)
              .map((g) => ({
                id: `target-group-${g.key}`,
                at: g.at,
                fill: '#111',
                stroke: '#fff',
                strokeWidth: 2,
                radius: 11,
                onClick: () => setSelectedTargetKey(g.key)
              }))
          ]}
          labels={[
            ...filteredOverlays.map(({ lineup }) => ({
              id: `label-${lineup.id}`,
              at: lineup.targetCoords,
              text: lineup.name,
              onClick: () => navigate(`/lineups/${lineup.id}`)
            })),
            ...targetGroups
              .filter((g) => g.count > 1)
              .map((g) => ({
                id: `target-group-count-${g.key}`,
                at: g.at,
                text: String(g.count),
                dx: -4,
                dy: 5,
                fontSize: 12,
                fill: '#fff',
                onClick: () => setSelectedTargetKey(g.key)
              }))
          ]}
        />
      </div>

      <aside style={{ width: 360 }}>
        <h3>Lineups on {mapId}</h3>
        {selectedTargetKey && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Showing {filteredLineups.length} lineup(s) at selected target
              {selectedTargetGroup ? ` (shared by ${selectedTargetGroup.count})` : ''}.
            </div>
            <Button size="xs" variant="light" onClick={() => setSelectedTargetKey(null)}>
              Show all targets
            </Button>
          </div>
        )}
        <div style={{ display: 'grid', gap: 12 }}>
          {filteredLineups.map((l) => (
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
          {filteredLineups.length === 0 && (
            <div style={{ color: '#666', fontSize: 13 }}>No lineups match this target.</div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default MapDetail;
