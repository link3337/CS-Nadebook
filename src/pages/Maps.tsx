import { SimpleGrid } from '@mantine/core';
import React from 'react';
import MapCard from '../components/MapCard';
import { MAPS } from '../lib/maps';
import { useLineupsStore } from '../store/lineups';

export const Maps: React.FC = () => {
  const allLineups = useLineupsStore((s) => s.lineups);

  return (
    <div style={{ padding: 20 }}>
      <SimpleGrid cols={4} spacing="lg">
        {MAPS.map((m) => {
          const count = allLineups.filter((l) => l.map === m.id).length;
          const isNew = m.id === 'de_mirage';

          return (
            <MapCard
              key={m.id}
              id={m.id}
              name={m.name}
              imageUrl={m.posterUrl}
              count={count}
              isNew={isNew}
            />
          );
        })}
      </SimpleGrid>
    </div>
  );
};

export default Maps;
