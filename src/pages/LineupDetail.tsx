import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import MapCanvas from '../components/MapCanvas';
import { getDisplayMapImage } from '../lib/maps';
import { getMediaBlob } from '../lib/storage/localMediaDb';
import { useLineupsStore } from '../store/lineups';

export const LineupDetail: React.FC = () => {
  const { lineupId } = useParams();
  const lineup = useLineupsStore((s) => s.lineups.find((l) => l.id === lineupId));
  const navigate = useNavigate();

  const mapImage = React.useMemo(() => {
    if (!lineup?.map) return undefined;
    return getDisplayMapImage(lineup.map);
  }, [lineup?.map]);

  const videoUrls = React.useMemo(() => {
    if (!lineup) return [];
    const combined = [...(lineup.videoUrls ?? []), ...(lineup.videoUrl ? [lineup.videoUrl] : [])];
    return Array.from(new Set(combined));
  }, [lineup]);

  const [previewUrls, setPreviewUrls] = React.useState<Record<string, string>>({});

  const groupedImages = React.useMemo(() => {
    if (!lineup) return [] as Array<{ group?: string; images: any[] }>;
    const map = new Map<string, any[]>();
    for (const img of lineup.uploadedImages) {
      const key = img.group ?? '';
      const arr = map.get(key) ?? [];
      arr.push(img);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([group, images]) => ({
      group: group || undefined,
      images
    }));
  }, [lineup]);

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
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <Tooltip label={lineup.favorite ? 'Unfavorite' : 'Favorite'}>
          <ActionIcon
            onClick={() => useLineupsStore.getState().toggleFavorite(lineup.id)}
            size="md"
            variant="light"
          >
            {lineup.favorite ? <IconStarFilled size={18} /> : <IconStar size={18} />}
          </ActionIcon>
        </Tooltip>
      </div>
      <div>
        {lineup.map} • {lineup.site} • {lineup.utilityType}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 12 }}>
        <Button component={Link} to={`/lineups/${lineup.id}/edit`} size="xs">
          Edit
        </Button>
        <Button
          component={Link}
          to={`/lineups/new?cloneFrom=${lineup.id}`}
          variant="light"
          size="xs"
        >
          Add Same Target Variant
        </Button>
      </div>
      <p>{lineup.description}</p>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          marginBottom: 12
        }}
      >
        {lineup.uploadedImages.length > 0 && (
          <div style={{ flex: '2 1 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {groupedImages.map(({ group, images }) => (
                <div
                  key={group ?? 'ungrouped'}
                  style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10 }}
                >
                  {group && <h4 style={{ margin: '6px 0' }}>{group}</h4>}
                  <div
                    style={{
                      display: 'grid',
                      gap: 12,
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'
                    }}
                  >
                    {images.map((img: any) => (
                      <div
                        key={img.id}
                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                      >
                        <img
                          src={previewUrls[img.id]}
                          alt="lineup uploaded"
                          style={{
                            width: '100%',
                            maxHeight: 320,
                            objectFit: 'contain',
                            borderRadius: 6
                          }}
                        />
                        {img.note && <div style={{ fontSize: 14, color: '#444' }}>{img.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {videoUrls.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <h4 style={{ margin: '8px 0' }}>MP4 Links</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {videoUrls.map((url) => (
                    <div
                      key={url}
                      style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}
                    >
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
        )}

        <div style={{ flex: '1 1 0' }}>
          <MapCanvas
            mapImage={mapImage}
            style={{ marginBottom: 0 }}
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
        </div>
      </div>

      {/* MP4 links moved into the uploaded images column above */}
    </div>
  );
};

export default LineupDetail;
