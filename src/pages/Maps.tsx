import React from 'react';
import { Link } from 'react-router-dom';
import { MAPS } from '../lib/maps';

export const Maps: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <h2>Maps</h2>
      <ul>
        {MAPS.map((m) => (
          <li key={m.id}>
            <Link to={`/maps/${m.id}`}>{m.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Maps;
