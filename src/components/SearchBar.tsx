import { Paper, ScrollArea, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLineupsStore } from '../store/lineups';

const MAX_RESULTS = 8;

const matchesLineup = (q: string, l: any) => {
    const lower = q.toLowerCase();
    if (l.name?.toLowerCase().includes(lower)) return true;
    if (l.map?.toLowerCase().includes(lower)) return true;
    if (l.site?.toLowerCase().includes(lower)) return true;
    if (l.utilityType?.toLowerCase().includes(lower)) return true;
    if (l.tags && l.tags.some((t: string) => t.toLowerCase().includes(lower))) return true;
    return false;
};

const SearchBar: React.FC = () => {
    const navigate = useNavigate();
    const lineups = useLineupsStore((s) => s.lineups);
    const [query, setQuery] = React.useState('');
    const [debounced] = useDebouncedValue(query, 120);
    const [open, setOpen] = React.useState(false);

    const results = React.useMemo(() => {
        const q = debounced.trim();
        if (!q) return [];
        return lineups.filter((l) => matchesLineup(q, l)).slice(0, MAX_RESULTS);
    }, [lineups, debounced]);

    React.useEffect(() => {
        setOpen(Boolean(debounced));
    }, [debounced]);

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: 720 }}>
            <TextInput
                placeholder="Search lineups by name, map, site, tag..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpen(Boolean(query))}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        setQuery('');
                        setOpen(false);
                    }
                }}
                size="sm"
            />

            {open && results.length > 0 && (
                <Paper shadow="sm" style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 40 }}>
                    <ScrollArea style={{ maxHeight: 300 }}>
                        {results.map((r) => (
                            <div
                                onClick={() => {
                                    navigate(`/lineups/${r.id}`);
                                    setQuery('');
                                    setOpen(false);
                                }}
                                style={{ padding: 10, borderBottom: '1px solid #eee', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text fw={600}>{r.name}</Text>
                                    <Text c="dimmed">{r.map}</Text>
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>{r.site} • {r.utilityType} {r.favorite ? '★' : ''}</div>
                            </div>
                        ))}
                    </ScrollArea>
                </Paper>
            )}
        </div>
    );
};

export default SearchBar;
