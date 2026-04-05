import React from 'react';
import { useLineupsStore } from '../store/lineups';

export const Practice: React.FC = () => {
  const allLineups = useLineupsStore((s) => s.lineups);
  const needsPractice = React.useMemo(
    () => allLineups.filter((l) => l.practiceState !== 'mastered'),
    [allLineups]
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>Practice</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {needsPractice.map((l) => (
          <div key={l.id} style={{ border: '1px solid #ddd', padding: 8 }}>
            {l.name} — {l.practiceState}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Practice;
