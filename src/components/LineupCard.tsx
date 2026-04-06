import { ActionIcon, Tooltip } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Lineup } from '../models/lineup';
import { useLineupsStore } from '../store/lineups';

type Props = {
  lineup: Lineup;
};

export const LineupCard: React.FC<Props> = ({ lineup }) => {
  const toggleFavorite = useLineupsStore((s) => s.toggleFavorite);
  const favorite = useLineupsStore((s) => s.lineups.find((l) => l.id === lineup.id)?.favorite);
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>{lineup.name}</h3>
          <div style={{ fontSize: 12, color: '#666' }}>
            {lineup.map} • {lineup.site} • {lineup.utilityType}
          </div>
        </div>
        <Tooltip label={lineup.favorite ? 'Unfavorite' : 'Favorite'} position="left">
          <ActionIcon onClick={() => toggleFavorite(lineup.id)} variant="light" size="lg">
            {favorite ? <IconStarFilled size={18} /> : <IconStar size={18} />}
          </ActionIcon>
        </Tooltip>
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
