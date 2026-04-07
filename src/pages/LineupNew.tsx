import React from 'react';
import { useSearchParams } from 'react-router-dom';
import LineupEdit from './LineupEdit';

export const LineupNew: React.FC = () => {
  const [searchParams] = useSearchParams();
  const cloneFrom = searchParams.get('cloneFrom') ?? undefined;
  const mapParam = searchParams.get('map') ?? undefined;

  return <LineupEdit isNew sourceLineupId={cloneFrom} initialMap={mapParam} />;
};

export default LineupNew;
