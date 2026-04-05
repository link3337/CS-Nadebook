import React from 'react';
import { useLineupsStore } from '../store/lineups';
import LineupCard from '../components/LineupCard';

export const Home: React.FC = () => {
  const lineups = useLineupsStore((s) => s.lineups);

  const recent = lineups.slice(0, 6);
  const favorites = lineups.filter((l) => l.favorite).slice(0, 6);

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <section>
        <h3>Recent</h3>
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))'
          }}
        >
          {recent.map((l) => (
            <LineupCard key={l.id} lineup={l} />
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
            <LineupCard key={l.id} lineup={l} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
