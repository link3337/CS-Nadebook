import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLineupsStore } from '../store/lineups';

export const LineupNew: React.FC = () => {
  const [searchParams] = useSearchParams();
  const cloneFrom = searchParams.get('cloneFrom');

  const getById = useLineupsStore((s) => s.getById);
  const sourceLineup = React.useMemo(() => (cloneFrom ? getById(cloneFrom) : undefined), [cloneFrom, getById]);

  const [name, setName] = useState(sourceLineup ? `${sourceLineup.name} (Alt Start)` : '');
  const [map, setMap] = useState(sourceLineup?.map ?? '');
  const addLineup = useLineupsStore((s) => s.addLineup);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = addLineup(
      sourceLineup
        ? {
          name,
          map,
          side: sourceLineup.side,
          site: sourceLineup.site,
          utilityType: sourceLineup.utilityType,
          target: sourceLineup.target,
          targetCoords: sourceLineup.targetCoords,
          throwTechnique: sourceLineup.throwTechnique,
          description: sourceLineup.description,
          tags: sourceLineup.tags,
          imageUrls: sourceLineup.imageUrls,
          uploadedImages: sourceLineup.uploadedImages,
          videoUrls: sourceLineup.videoUrls,
          videoUrl: sourceLineup.videoUrl,
          // Force a new start location for the variant
          startPosition: '',
          startCoords: undefined
        }
        : { name, map }
    );
    navigate(`/lineups/${l.id}/edit`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>New Lineup</h2>
      {sourceLineup && (
        <p style={{ marginTop: 0, color: '#666' }}>
          Cloning target from "{sourceLineup.name}". Set a different start position after creating.
        </p>
      )}
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Map
          <input value={map} onChange={(e) => setMap(e.target.value)} />
        </label>
        <div>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
};

export default LineupNew;
