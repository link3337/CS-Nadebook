import React from 'react';
import { Lineup } from '../models/lineup';
import { Link } from 'react-router-dom';

type Props = {
  lineup: Lineup;
};

export const LineupCard: React.FC<Props> = ({ lineup }) => {
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>{lineup.name}</h3>
          <div style={{ fontSize: 12, color: '#666' }}>
            {lineup.map} • {lineup.site} • {lineup.utilityType}
          </div>
        </div>
        <div>{lineup.favorite ? '★' : '☆'}</div>
      </div>
      <p style={{ marginTop: 8 }}>{lineup.description}</p>
      <div>
        <Link to={`/lineups/${lineup.id}`}>Open</Link>
        {' | '}
        <Link to={`/lineups/${lineup.id}/edit`}>Edit</Link>
      </div>
    </div>
  );
};

export default LineupCard;
