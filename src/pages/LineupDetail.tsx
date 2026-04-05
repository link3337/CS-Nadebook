import { Button } from '@mantine/core';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import MapCanvas from '../components/MapCanvas';
import { getDisplayMapImage } from '../lib/maps';
import { getMediaBlob } from '../lib/storage/localMediaDb';
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

  const videoUrls = React.useMemo(() => {
    if (!lineup) return [];
    const combined = [
      ...(lineup.videoUrls ?? []),
      ...(lineup.videoUrl ? [lineup.videoUrl] : [])
    ];
    return Array.from(new Set(combined));
  }, [lineup]);

  const [previewUrls, setPreviewUrls] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!lineup) return;

    let active = true;
    const generatedUrls: string[] = [];

    const loadPreviews = async () => {
      const next: Record<string, string> = {};

      for (const img of lineup.uploadedImages) {
        if (img.dataUrl) {
          next[img.id] = img.dataUrl;
          continue;
        }
        if (!img.blobId) continue;
        const blob = await getMediaBlob(img.blobId);
        if (!blob) continue;
        const objectUrl = URL.createObjectURL(blob);
        generatedUrls.push(objectUrl);
        next[img.id] = objectUrl;
      }

      if (active) {
        setPreviewUrls(next);
      } else {
        generatedUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    };

    loadPreviews();

    return () => {
      active = false;
      generatedUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [lineup]);

  if (!lineup) return <div style={{ padding: 16 }}>Lineup not found</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <BackButton onClick={() => navigate(-1)} />
      </div>
      <h2>{lineup.name}</h2>
      <div>
        {lineup.map} • {lineup.site} • {lineup.utilityType}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 12 }}>
        <Button component={Link} to={`/lineups/${lineup.id}/edit`} size="xs">
          Edit
        </Button>
        <Button component={Link} to={`/lineups/new?cloneFrom=${lineup.id}`} variant="light" size="xs">
          Add Same Target Variant
        </Button>
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
            markerShape: 'utility-target',
            utilityType: lineup.utilityType,
            radius: 9,
            stroke: '#111',
            strokeWidth: 1.2
          }
        ]}
      />

      {lineup.uploadedImages.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h3>Uploaded Images</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {lineup.uploadedImages.map((img) => (
              <div key={img.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
                <img
                  src={previewUrls[img.id]}
                  alt="lineup uploaded"
                  style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 6 }}
                />
                {img.note && <div style={{ marginTop: 8, fontSize: 14, color: '#444' }}>{img.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {videoUrls.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h3>MP4 Links</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {videoUrls.map((url) => (
              <div key={url} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
                <video controls preload="metadata" style={{ width: '100%', borderRadius: 6 }}>
                  <source src={url} type="video/mp4" />
                </video>
                <div style={{ marginTop: 8 }}>
                  <a href={url} target="_blank" rel="noreferrer">
                    Open MP4 link
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default LineupDetail;
