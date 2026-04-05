import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapCanvas from '../components/MapCanvas';
import { getDisplayMapImage } from '../lib/maps';
import { deleteMediaBlob, getMediaBlob, saveMediaBlob } from '../lib/storage/localMediaDb';
import { Lineup } from '../models/lineup';
import { useLineupsStore } from '../store/lineups';

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return items;
  }
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
};

type SortableImageItemProps = {
  img: Lineup['uploadedImages'][number];
  index: number;
  total: number;
  previewUrl?: string;
  onNoteChange: (id: string, note: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
};

const SortableImageItem: React.FC<SortableImageItemProps> = ({
  img,
  index,
  total,
  previewUrl,
  onNoteChange,
  onMoveUp,
  onMoveDown,
  onRemove
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.id
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 8,
        display: 'grid',
        gap: 8,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ fontSize: 12, color: '#555', userSelect: 'none' }}>
        Drag to reorder {img.fileName ? `(${img.fileName})` : ''}
      </div>
      <img
        src={previewUrl}
        alt="lineup upload"
        style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 6 }}
      />
      <textarea
        placeholder="Notes for this image"
        value={img.note ?? ''}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => onNoteChange(img.id, e.target.value)}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => onMoveUp(img.id)} disabled={index === 0}>
          ↑ Up
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onMoveDown(img.id)}
          disabled={index === total - 1}
        >
          ↓ Down
        </button>
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(img.id)}>
          Remove Image
        </button>
      </div>
    </div>
  );
};

type SortableVideoItemProps = {
  url: string;
  index: number;
  total: number;
  onMoveUp: (url: string) => void;
  onMoveDown: (url: string) => void;
  onRemove: (url: string) => void;
};

const SortableVideoItem: React.FC<SortableVideoItemProps> = ({
  url,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: 8,
        display: 'grid',
        gap: 6,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
        cursor: 'grab',
        background: '#fff'
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ fontSize: 12, color: '#555', userSelect: 'none' }}>Drag to reorder</div>
      <a href={url} target="_blank" rel="noreferrer" onPointerDown={(e) => e.stopPropagation()}>
        {url}
      </a>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => onMoveUp(url)} disabled={index === 0}>
          ↑ Up
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onMoveDown(url)}
          disabled={index === total - 1}
        >
          ↓ Down
        </button>
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(url)}>
          Remove Link
        </button>
      </div>
    </div>
  );
};

const LineupEdit: React.FC = () => {
  const { lineupId } = useParams();
  const navigate = useNavigate();
  const getById = useLineupsStore((s) => s.getById);
  const updateLineup = useLineupsStore((s) => s.updateLineup);

  const lineup = getById(lineupId ?? '');
  const mapImage = getDisplayMapImage(lineup?.map);

  const [name, setName] = useState(lineup?.name ?? '');
  const [description, setDescription] = useState(lineup?.description ?? '');
  const [startPosition, setStartPosition] = useState(lineup?.startPosition ?? '');
  const [startCoords, setStartCoords] = useState<[number, number] | undefined>(
    lineup?.startCoords as any
  );

  const [targetCoords, setTargetCoords] = useState<[number, number] | undefined>(
    lineup?.targetCoords as any
  );

  const [uploadedImages, setUploadedImages] = useState<Lineup['uploadedImages']>(
    lineup?.uploadedImages ?? []
  );

  const [videoUrls, setVideoUrls] = useState<string[]>(() => {
    const combined = [
      ...(lineup?.videoUrls ?? []),
      ...(lineup?.videoUrl ? [lineup.videoUrl] : [])
    ];
    return Array.from(new Set(combined));
  });

  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'none' | 'start' | 'target'>('none');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  const imageIds = useMemo(() => uploadedImages.map((img) => img.id), [uploadedImages]);
  const videoIds = useMemo(() => [...videoUrls], [videoUrls]);

  if (!lineup) return <div style={{ padding: 16 }}>Lineup not found</div>;

  const onMapClick = (normalized: [number, number]) => {
    if (mode === 'none') return;
    if (mode === 'start') setStartCoords(normalized);
    if (mode === 'target') setTargetCoords(normalized);
  };

  const save = () => {
    updateLineup(lineup.id, {
      name,
      description,
      startPosition,
      uploadedImages,
      videoUrls,
      videoUrl: videoUrls[0],
      startCoords: startCoords as any,
      targetCoords: targetCoords as any
    });
    navigate(`/lineups/${lineup.id}`);
  };

  const onUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const entries = await Promise.all(
      files.map(async (file, idx) => {
        const blobId = await saveMediaBlob(file);
        return {
          id: `${Date.now()}-${idx}`,
          blobId,
          fileName: file.name,
          mimeType: file.type,
          note: ''
        };
      })
    );
    setUploadedImages((prev) => [...prev, ...entries]);
    e.target.value = '';
  };

  const updateImageNote = (id: string, note: string) => {
    setUploadedImages((prev) => prev.map((img) => (img.id === id ? { ...img, note } : img)));
  };

  const removeImage = async (id: string) => {
    const target = uploadedImages.find((img) => img.id === id);
    if (target?.blobId) {
      await deleteMediaBlob(target.blobId);
    }
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImageUp = (id: string) => {
    setUploadedImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);
      return moveItem(prev, index, index - 1);
    });
  };

  const moveImageDown = (id: string) => {
    setUploadedImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);
      return moveItem(prev, index, index + 1);
    });
  };

  const onImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setUploadedImages((prev) => {
      const fromIndex = prev.findIndex((img) => img.id === active.id);
      const toIndex = prev.findIndex((img) => img.id === over.id);
      if (fromIndex < 0 || toIndex < 0) return prev;
      return arrayMove(prev, fromIndex, toIndex);
    });
  };

  const addVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    const normalized = url.toLowerCase();
    if (!normalized.endsWith('.mp4') && !normalized.includes('.mp4?')) {
      return;
    }
    setVideoUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setVideoUrlInput('');
  };

  const removeVideoUrl = (url: string) => {
    setVideoUrls((prev) => prev.filter((v) => v !== url));
  };

  const moveVideoUp = (url: string) => {
    setVideoUrls((prev) => {
      const index = prev.findIndex((v) => v === url);
      return moveItem(prev, index, index - 1);
    });
  };

  const moveVideoDown = (url: string) => {
    setVideoUrls((prev) => {
      const index = prev.findIndex((v) => v === url);
      return moveItem(prev, index, index + 1);
    });
  };

  const onVideoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setVideoUrls((prev) => {
      const fromIndex = prev.findIndex((v) => v === active.id);
      const toIndex = prev.findIndex((v) => v === over.id);
      if (fromIndex < 0 || toIndex < 0) return prev;
      return arrayMove(prev, fromIndex, toIndex);
    });
  };

  React.useEffect(() => {
    let active = true;
    const generatedUrls: string[] = [];

    const loadPreviews = async () => {
      const next: Record<string, string> = {};

      for (const img of uploadedImages) {
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
  }, [uploadedImages]);

  return (
    <div style={{ padding: 16, display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <h2>Edit Lineup</h2>
        <div style={{ display: 'grid', gap: 8, maxWidth: 640 }}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Start Position
            <input
              value={startPosition}
              onChange={(e) => setStartPosition(e.target.value)}
              placeholder="e.g. T Spawn Corner"
            />
          </label>

          <div>
            <strong>Coordinate Picker</strong>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => setMode(mode === 'start' ? 'none' : 'start')}
                style={{ background: mode === 'start' ? '#ddd' : undefined }}
              >
                {mode === 'start' ? 'Setting start (click map)' : 'Set Start'}
              </button>
              <button
                onClick={() => setMode(mode === 'target' ? 'none' : 'target')}
                style={{ background: mode === 'target' ? '#ddd' : undefined }}
              >
                {mode === 'target' ? 'Setting target (click map)' : 'Set Target'}
              </button>
              <button
                onClick={() => {
                  setStartCoords(undefined);
                  setTargetCoords(undefined);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <MapCanvas
            mapImage={mapImage}
            onNormalizedClick={onMapClick}
            lines={[
              {
                id: 'edit-line',
                from: startCoords,
                to: targetCoords,
                color: '#ff6b6b',
                width: 3
              }
            ]}
            markers={[
              {
                id: 'edit-start',
                at: startCoords,
                fill: '#4dabf7',
                radius: 10
              },
              {
                id: 'edit-target',
                at: targetCoords,
                fill: '#ffd43b',
                radius: 8
              }
            ]}
          />

          <div style={{ marginTop: 8 }}>
            <strong>Local Images + Notes</strong>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Upload images/GIFs to local IndexedDB storage (not localStorage) to avoid quota issues.
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Reorder with drag and drop, or use arrow buttons.
            </div>
            <div style={{ marginTop: 8 }}>
              <input type="file" accept="image/*,.gif" multiple onChange={onUploadImages} />
            </div>

            {uploadedImages.length > 0 && (
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onImageDragEnd}
                >
                  <SortableContext items={imageIds} strategy={verticalListSortingStrategy}>
                    {uploadedImages.map((img, index) => (
                      <SortableImageItem
                        key={img.id}
                        img={img}
                        index={index}
                        total={uploadedImages.length}
                        previewUrl={previewUrls[img.id]}
                        onNoteChange={updateImageNote}
                        onMoveUp={moveImageUp}
                        onMoveDown={moveImageDown}
                        onRemove={(id) => void removeImage(id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          <div style={{ marginTop: 8 }}>
            <strong>MP4 Links</strong>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              MP4 videos are stored as links only (not uploaded), to keep localStorage usage low.
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Reorder links with drag and drop, or use arrow buttons.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://.../demo.mp4"
              />
              <button type="button" onClick={addVideoUrl}>
                Add MP4
              </button>
            </div>
            {videoUrls.length > 0 && (
              <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onVideoDragEnd}
                >
                  <SortableContext items={videoIds} strategy={verticalListSortingStrategy}>
                    {videoUrls.map((url, index) => (
                      <SortableVideoItem
                        key={url}
                        url={url}
                        index={index}
                        total={videoUrls.length}
                        onMoveUp={moveVideoUp}
                        onMoveDown={moveVideoDown}
                        onRemove={removeVideoUrl}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save}>Save</button>
            <button onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </div>
      </div>

      <aside style={{ width: 360 }}>
        <h3>Preview</h3>
        <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
          <div>
            <strong>Start:</strong>{' '}
            {startCoords ? `${startCoords[0].toFixed(3)}, ${startCoords[1].toFixed(3)}` : '—'}
          </div>
          <div>
            <strong>Target:</strong>{' '}
            {targetCoords ? `${targetCoords[0].toFixed(3)}, ${targetCoords[1].toFixed(3)}` : '—'}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LineupEdit;
