import { Button } from '@mantine/core';
import React from 'react';

type BackButtonProps = {
  onClick: () => void;
  label?: string;
};

const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Back' }) => {
  return (
    <Button variant="filled" size="sm" onClick={onClick}>
      {label}
    </Button>
  );
};

export default BackButton;
