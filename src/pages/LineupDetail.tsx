import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MapCanvas from '../components/MapCanvas';
import { getDisplayMapImage } from '../lib/maps';
import { useLineupsStore } from '../store/lineups';

export const LineupDetail: React.FC = () => {
  const { lineupId } = useParams();
  const getById = useLineupsStore((s) => s.getById);
  const lineup = React.useMemo(() => getById(lineupId ?? ''), [getById, lineupId]);
  const navigate = useNavigate();

  const mapImage = React.useMemo(() => {
    if (!lineup?.map) return undefined;
    return getDisplayMapImage(lineup.map);
  }, [lineup?.map]);

  if (!lineup) return <div style={{ padding: 16 }}>Lineup not found</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate(-1)}>&larr; Back</button>
      </div>
      <h2>{lineup.name}</h2>
      <div>
        {lineup.map} • {lineup.site} • {lineup.utilityType}
      </div>
      <p>{lineup.description}</p>

      <MapCanvas
        mapImage={mapImage}
        style={{ marginBottom: 12 }}
        lines={[
          {
            id: `line-${lineup.id}`,
            from: lineup.startCoords,
            to: lineup.targetCoords,
            color: '#ff6b6b',
            width: 3
          }
        ]}
        markers={[
          {
            id: `start-${lineup.id}`,
            at: lineup.startCoords,
            fill: '#4dabf7',
            radius: 10
          },
          {
            id: `target-${lineup.id}`,
            at: lineup.targetCoords,
            fill: '#ffd43b',
            radius: 8
          }
        ]}
      />

      <div>
        <Link to={`/lineups/${lineup.id}/edit`}>Edit</Link>
      </div>
      <div>
        <Link to={`/lineups/new?cloneFrom=${lineup.id}`}>Add Same Target Variant</Link>
      </div>
    </div>
  );
};

export default LineupDetail;
