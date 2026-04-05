import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMapImage, getMapPoster } from '../lib/maps';
import { useLineupsStore } from '../store/lineups';

const viewBoxWidth = 1000;
const viewBoxHeight = 600;

const toViewBox = (coords?: [number, number]) => {
  if (!coords) return null;
  return [coords[0] * viewBoxWidth, coords[1] * viewBoxHeight] as [number, number];
};

export const LineupDetail: React.FC = () => {
  const { lineupId } = useParams();
  const getById = useLineupsStore((s) => s.getById);
  const lineup = React.useMemo(() => getById(lineupId ?? ''), [getById, lineupId]);
  const navigate = useNavigate();

  const mapImage = React.useMemo(() => {
    if (!lineup?.map) return undefined;
    return getMapImage(lineup.map) ?? getMapPoster(lineup.map);
  }, [lineup?.map]);

  const start = toViewBox(lineup?.startCoords as [number, number] | undefined);
  const target = toViewBox(lineup?.targetCoords as [number, number] | undefined);

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

      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          overflow: 'hidden',
          backgroundImage: mapImage ? `url(${mapImage})` : undefined,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`,
          marginBottom: 12
        }}
      >
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
        >
          {start && target && (
            <line
              x1={start[0]}
              y1={start[1]}
              x2={target[0]}
              y2={target[1]}
              stroke="#ff6b6b"
              strokeWidth={3}
              strokeOpacity={0.9}
            />
          )}
          {start && <circle cx={start[0]} cy={start[1]} r={10} fill="#4dabf7" stroke="#000" strokeWidth={1} />}
          {target && <circle cx={target[0]} cy={target[1]} r={8} fill="#ffd43b" stroke="#000" strokeWidth={1} />}
        </svg>
      </div>

      <div>
        <Link to={`/lineups/${lineup.id}/edit`}>Edit</Link>
      </div>
    </div>
  );
};

export default LineupDetail;
