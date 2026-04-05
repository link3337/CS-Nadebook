import { Badge, Card, Center, Chip, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { MAPS } from '../lib/maps';
import { useLineupsStore } from '../store/lineups';

const MapCard: React.FC<{
  id: string;
  name: string;
  imageUrl: string;
  count: number;
  isNew?: boolean;
}> = ({ id, name, imageUrl, count, isNew }) => {
  return (
    <Link to={`/maps/${id}`} style={{ textDecoration: 'none' }}>
      <Card p={0} style={{ cursor: 'pointer' }} shadow="sm" radius="md">
        <div
          style={{
            height: 220,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.6) 70%)'
            }}
          />
          <div style={{ position: 'absolute', left: 16, bottom: 18, color: 'white' }}>
            <Text size="xl">{name}</Text>
            <Text size="sm" color="white" style={{ opacity: 0.9 }}>
              {count} nades
            </Text>
          </div>
          {isNew && (
            <Badge
              color="green"
              variant="filled"
              style={{ position: 'absolute', right: 12, top: 12 }}
            >
              NEW
            </Badge>
          )}
        </div>
        <Card.Section p="md">
          <Group>
            <Text>{name}</Text>
            <Text color="dimmed">{count} nades</Text>
          </Group>
        </Card.Section>
      </Card>
    </Link>
  );
};

export const Maps: React.FC = () => {
  const allLineups = useLineupsStore((s) => s.lineups);

  return (
    <div style={{ padding: 20 }}>
      <SimpleGrid cols={4} spacing="lg">
        {MAPS.map((m) => {
          const count = allLineups.filter((l) => l.map === m.id).length;
          const isNew = m.id === 'de_mirage';

          return (
            <MapCard
              key={m.id}
              id={m.id}
              name={m.name}
              imageUrl={m.posterUrl}
              count={count}
              isNew={isNew}
            />
          );
        })}
      </SimpleGrid>

      <div style={{ marginTop: 18 }}>
        <Center>
          <Stack align="center">
            <Group>
              {MAPS.map((m) => (
                <Chip component={Link} key={m.id} variant="filled" radius="sm">
                  {m.name}
                </Chip>
              ))}
            </Group>
          </Stack>
        </Center>
      </div>
    </div>
  );
};

export default Maps;
