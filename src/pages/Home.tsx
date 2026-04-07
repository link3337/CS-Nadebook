import React from 'react';
import LineupCard from '../components/LineupCard';
import { useLineupsStore } from '../store/lineups';
import Maps from './Maps';

export const Home: React.FC = () => {
  const lineups = useLineupsStore((s) => s.lineups);

  const recent = lineups.slice(0, 6);

  const favorites = lineups.filter((l) => l.favorite);

  return (
    <div style={{ padding: 16 }}>
      <Maps />
      <section>
        <h3>Recent</h3>
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))'
          }}
        >
          {recent.map((l, index) => (
            <LineupCard key={index} lineup={l} />
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Favorites</h3>
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))'
          }}
        >
          {favorites.map((l) => (
            <LineupCard lineup={l} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
