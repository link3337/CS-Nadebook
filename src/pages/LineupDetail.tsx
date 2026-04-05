import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLineupsStore } from '../store/lineups';

export const LineupDetail: React.FC = () => {
  const { lineupId } = useParams();
  const getById = useLineupsStore((s) => s.getById);
  const lineup = React.useMemo(() => getById(lineupId ?? ''), [getById, lineupId]);

  if (!lineup) return <div style={{ padding: 16 }}>Lineup not found</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{lineup.name}</h2>
      <div>
        {lineup.map} • {lineup.site} • {lineup.utilityType}
      </div>
      <p>{lineup.description}</p>
      <div>
        <Link to={`/lineups/${lineup.id}/edit`}>Edit</Link>
      </div>
    </div>
  );
};

export default LineupDetail;
