import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { Box, Typography, Chip } from '@mui/material';

interface Shortcut {
    key: string;
    description: string;
    category: string;
}

const shortcuts: Shortcut[] = [
    { key: '/', description: 'Focus search', category: 'Navigation' },
    { key: 'Ctrl + K', description: 'Focus search (alternative)', category: 'Navigation' },
    { key: 'C', description: 'Open category selector', category: 'Navigation' },
    { key: 'ESC', description: 'Clear search / Close dialogs', category: 'Navigation' },
    { key: '↑ ↓ ← →', description: 'Navigate between books', category: 'Grid Navigation' },
    { key: 'Enter', description: 'Open selected book', category: 'Grid Navigation' },
    { key: 'Space', description: 'Open selected book', category: 'Grid Navigation' },
    { key: 'Home', description: 'Go to first book', category: 'Grid Navigation' },
    { key: 'End', description: 'Go to last book', category: 'Grid Navigation' },
    { key: 'Ctrl + N', description: 'Next page', category: 'Pagination' },
    { key: 'Ctrl + P', description: 'Previous page', category: 'Pagination' },
    { key: '?', description: 'Show this help dialog', category: 'Help' },
];

export function KeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setIsOpen(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, Shortcut[]>);

    return (
        <>
            {/* כפתור קבוע בפינה */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                }}
            >
                <Chip
                    icon={<Keyboard size={16} />}
                    label="?"
                    onClick={() => setIsOpen(true)}
                    sx={{
                        cursor: 'pointer',
                        bgcolor: '#16A34A',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        padding: '10px',
                        '&:hover': {
                            bgcolor: '#15803D',
                        },
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                />
            </Box>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl bg-white max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Keyboard className="h-6 w-6 text-green-600" />
                            Keyboard Shortcuts
                        </DialogTitle>
                    </DialogHeader>

                    <Box sx={{ mt: 2 }}>
                        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                            <Box key={category} sx={{ mb: 3 }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: '#16A34A',
                                        mb: 1,
                                        borderBottom: '2px solid #16A34A',
                                        pb: 0.5,
                                    }}
                                >
                                    {category}
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {categoryShortcuts.map((shortcut, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '8px 12px',
                                                bgcolor: '#f9fafb',
                                                borderRadius: 1,
                                                '&:hover': {
                                                    bgcolor: '#f3f4f6',
                                                },
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {shortcut.description}
                                            </Typography>
                                            <Chip
                                                label={shortcut.key}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    fontFamily: 'monospace',
                                                    fontWeight: 'bold',
                                                    minWidth: '80px',
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            mt: 3,
                            pt: 2,
                            borderTop: '1px solid #e5e7eb',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            Press <strong>ESC</strong> to close this dialog
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}