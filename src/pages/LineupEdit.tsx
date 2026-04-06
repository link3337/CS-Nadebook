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
import {
  Badge,
  Button,
  Divider,
  Fieldset,
  Group,
  Paper,
  Radio,
  Stack,
  Text,
  TextInput,
  Textarea
} from '@mantine/core';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapCanvas from '../components/MapCanvas';
import { getDisplayMapImage } from '../lib/maps';
import { deleteMediaBlob, getMediaBlob, saveMediaBlob } from '../lib/storage/localMediaDb';
import { Lineup } from '../models/lineup';
import { useLineupsStore } from '../store/lineups';

const utilityTypeOptions: Array<{ value: Lineup['utilityType']; label: string }> = [
  { value: 'smoke', label: 'Smoke' },
  { value: 'flash', label: 'Flash' },
  { value: 'he', label: 'HE' },
  { value: 'molotov', label: 'Molotov' }
];

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
    <Paper
      ref={setNodeRef}
      withBorder
      radius="md"
      p="sm"
      style={{
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
      <Text size="xs" c="dimmed" style={{ userSelect: 'none' }}>
        Drag to reorder {img.fileName ? `(${img.fileName})` : ''}
      </Text>
      <img
        src={previewUrl}
        alt="lineup upload"
        style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 6 }}
      />
      <Textarea
        placeholder="Notes for this image"
        value={img.note ?? ''}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => onNoteChange(img.id, e.target.value)}
      />
      <Group gap="xs" wrap="wrap">
        <Button type="button" variant="light" size="xs" onPointerDown={(e) => e.stopPropagation()} onClick={() => onMoveUp(img.id)} disabled={index === 0}>
          ↑ Up
        </Button>
        <Button
          type="button"
          variant="light"
          size="xs"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onMoveDown(img.id)}
          disabled={index === total - 1}
        >
          ↓ Down
        </Button>
        <Button type="button" color="red" variant="light" size="xs" onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(img.id)}>
          Remove Image
        </Button>
      </Group>
    </Paper>
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
    <Paper
      ref={setNodeRef}
      withBorder
      radius="md"
      p="sm"
      style={{
        display: 'grid',
        gap: 6,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <Text size="xs" c="dimmed" style={{ userSelect: 'none' }}>Drag to reorder</Text>
      <a href={url} target="_blank" rel="noreferrer" onPointerDown={(e) => e.stopPropagation()}>
        {url}
      </a>
      <Group gap="xs" wrap="wrap">
        <Button type="button" variant="light" size="xs" onPointerDown={(e) => e.stopPropagation()} onClick={() => onMoveUp(url)} disabled={index === 0}>
          ↑ Up
        </Button>
        <Button
          type="button"
          variant="light"
          size="xs"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onMoveDown(url)}
          disabled={index === total - 1}
        >
          ↓ Down
        </Button>
        <Button type="button" color="red" variant="light" size="xs" onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(url)}>
          Remove Link
        </Button>
      </Group>
    </Paper>
  );
};

const LineupEdit: React.FC = () => {
  const { lineupId } = useParams();
  const navigate = useNavigate();
  const updateLineup = useLineupsStore((s) => s.updateLineup);

  const lineup = useLineupsStore((s) => s.lineups.find((l) => l.id === lineupId) as any);
  const mapImage = getDisplayMapImage(lineup?.map);

  const [name, setName] = useState(lineup?.name ?? '');
  const [description, setDescription] = useState(lineup?.description ?? '');
  const [startPosition, setStartPosition] = useState(lineup?.startPosition ?? '');
  const [utilityType, setUtilityType] = useState<Lineup['utilityType']>(
    lineup?.utilityType ?? 'smoke'
  );
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
  const utilityLabel =
    utilityTypeOptions.find((option) => option.value === utilityType)?.label ?? utilityType;

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
      utilityType,
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
    <Group align="flex-start" gap="md" style={{ padding: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Stack gap="sm" maw={760}>
          <Text fw={700} size="xl">Edit Lineup</Text>

          <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />

          <Textarea
            label="Description"
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextInput
            label="Start Position"
            value={startPosition}
            onChange={(e) => setStartPosition(e.target.value)}
            placeholder="e.g. T Spawn Corner"
          />

          <Fieldset legend="Nade Type">
            <Radio.Group value={utilityType} onChange={(value) => setUtilityType(value as Lineup['utilityType'])}>
              <Group gap="md">
                {utilityTypeOptions.map((option) => (
                  <Radio key={option.value} value={option.value} label={option.label} />
                ))}
              </Group>
            </Radio.Group>
          </Fieldset>

          <Paper withBorder radius="md" p="sm">
            <Stack gap="xs">
              <Text fw={600}>Coordinate Picker</Text>
              <Group gap="xs">
                <Button
                  variant={mode === 'start' ? 'filled' : 'light'}
                  size="xs"
                  onClick={() => setMode(mode === 'start' ? 'none' : 'start')}
                >
                  {mode === 'start' ? 'Setting start (click map)' : 'Set Start'}
                </Button>
                <Button
                  variant={mode === 'target' ? 'filled' : 'light'}
                  size="xs"
                  onClick={() => setMode(mode === 'target' ? 'none' : 'target')}
                >
                  {mode === 'target' ? 'Setting target (click map)' : 'Set Target'}
                </Button>
                <Button
                  variant="light"
                  color="gray"
                  size="xs"
                  onClick={() => {
                    setStartCoords(undefined);
                    setTargetCoords(undefined);
                  }}
                >
                  Clear
                </Button>
              </Group>
            </Stack>
          </Paper>

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
                markerShape: 'utility-target',
                utilityType,
                radius: 9,
                stroke: '#111',
                strokeWidth: 1.2
              }
            ]}
          />

          <Paper withBorder radius="md" p="sm">
            <Stack gap="xs">
              <Text fw={600}>Local Images + Notes</Text>
              <Text size="xs" c="dimmed">
                Upload images/GIFs to local IndexedDB storage (not localStorage) to avoid quota issues.
              </Text>
              <Text size="xs" c="dimmed">
                Reorder with drag and drop, or use arrow buttons.
              </Text>
              <div>
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
            </Stack>
          </Paper>

          <Paper withBorder radius="md" p="sm">
            <Stack gap="xs">
              <Text fw={600}>MP4 Links</Text>
              <Text size="xs" c="dimmed">
                MP4 videos are stored as links only (not uploaded), to keep localStorage usage low.
              </Text>
              <Text size="xs" c="dimmed">
                Reorder links with drag and drop, or use arrow buttons.
              </Text>
              <Group gap="xs" align="flex-end">
                <TextInput
                  label="MP4 URL"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://.../demo.mp4"
                />
                <Button type="button" onClick={addVideoUrl}>
                  Add MP4
                </Button>
              </Group>
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
            </Stack>
          </Paper>

          <Divider />
          <Group gap="xs">
            <Button onClick={save}>Save</Button>
            <Button variant="light" color="gray" onClick={() => navigate(-1)}>Cancel</Button>
          </Group>
        </Stack>
      </div>

      <aside style={{ width: 360, position: 'sticky', top: 12 }}>
        <Paper withBorder radius="md" p="sm">
          <Text fw={600} mb={8}>Preview</Text>
          <Stack gap="xs">
            <Group gap={6}>
              <Badge variant="light">{utilityLabel}</Badge>
              <Badge variant="light" color={startCoords ? 'teal' : 'gray'}>
                Start {startCoords ? 'set' : 'missing'}
              </Badge>
              <Badge variant="light" color={targetCoords ? 'teal' : 'gray'}>
                Target {targetCoords ? 'set' : 'missing'}
              </Badge>
            </Group>

            <MapCanvas
              mapImage={mapImage}
              style={{ maxHeight: 210 }}
              lines={[
                {
                  id: 'preview-line',
                  from: startCoords,
                  to: targetCoords,
                  color: '#ff6b6b',
                  width: 3
                }
              ]}
              markers={[
                {
                  id: 'preview-start',
                  at: startCoords,
                  fill: '#4dabf7',
                  radius: 9
                },
                {
                  id: 'preview-target',
                  at: targetCoords,
                  markerShape: 'utility-target',
                  utilityType,
                  radius: 8,
                  stroke: '#111',
                  strokeWidth: 1.1
                }
              ]}
            />

            <Group gap={6}>
              <Badge variant="dot" color="blue">
                {uploadedImages.length} image(s)
              </Badge>
              <Badge variant="dot" color="grape">
                {videoUrls.length} mp4 link(s)
              </Badge>
              <Badge variant="dot" color={mode === 'none' ? 'gray' : 'orange'}>
                Mode: {mode}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed">
              Start: {startCoords ? `${startCoords[0].toFixed(3)}, ${startCoords[1].toFixed(3)}` : '—'}
            </Text>
            <Text size="sm" c="dimmed">
              Target: {targetCoords ? `${targetCoords[0].toFixed(3)}, ${targetCoords[1].toFixed(3)}` : '—'}
            </Text>

            {uploadedImages[0] && previewUrls[uploadedImages[0].id] && (
              <Paper withBorder radius="sm" p={6}>
                <Text size="xs" c="dimmed" mb={4}>First media in order</Text>
                <img
                  src={previewUrls[uploadedImages[0].id]}
                  alt="preview first media"
                  style={{ width: '100%', maxHeight: 140, objectFit: 'contain', borderRadius: 4 }}
                />
              </Paper>
            )}
          </Stack>
        </Paper>
      </aside>
    </Group>
  );
};

export default LineupEdit;
