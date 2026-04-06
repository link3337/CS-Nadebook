import { Badge, Card, Text } from '@mantine/core';
import React from 'react';
import { Link } from 'react-router-dom';

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
      </Card>
    </Link>
  );
};
export default MapCard;
