import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { heShortcutType } from '../types/i18n';

interface Shortcut {
    key: string;
    descriptionKey: keyof heShortcutType;
    categoryKey: keyof heShortcutType;
}

const rawShortcuts: Omit<Shortcut, 'description'>[] = [
    { key: '/', descriptionKey: 'descriptionFocusSearch', categoryKey: 'categoryNavigation' },
    { key: 'Ctrl + K', descriptionKey: 'descriptionFocusSearchAlt', categoryKey: 'categoryNavigation' },
    { key: 'C', descriptionKey: 'descriptionOpenCategory', categoryKey: 'categoryNavigation' },
    { key: 'ESC', descriptionKey: 'descriptionClearClose', categoryKey: 'categoryNavigation' },
    { key: '↑ ↓ ← →', descriptionKey: 'descriptionNavigateBooks', categoryKey: 'categoryGridNavigation' },
    { key: 'Enter', descriptionKey: 'descriptionOpenBook', categoryKey: 'categoryGridNavigation' },
    { key: 'Space', descriptionKey: 'descriptionOpenBookSpace', categoryKey: 'categoryGridNavigation' },
    { key: 'Home', descriptionKey: 'descriptionGoToFirst', categoryKey: 'categoryGridNavigation' },
    { key: 'End', descriptionKey: 'descriptionGoToLast', categoryKey: 'categoryGridNavigation' },
    { key: 'Ctrl + N', descriptionKey: 'descriptionNextPage', categoryKey: 'categoryPagination' },
    { key: 'Ctrl + P', descriptionKey: 'descriptionPreviousPage', categoryKey: 'categoryPagination' },
    { key: '?', descriptionKey: 'descriptionShowHelp', categoryKey: 'categoryHelp' },
];

export function KeyboardShortcutsHelp() {
    const { t } = useTranslation(['keyboardShortcutsHelp', 'common']);
    const commonDir = t('common:dir') as 'rtl' | 'ltr';
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

const groupedShortcuts = rawShortcuts.reduce((acc, shortcut) => {
    const translatedCategoryName = t(shortcut.categoryKey); 
        if (!acc[translatedCategoryName]) {
        acc[translatedCategoryName] = [];
    }
    acc[translatedCategoryName].push(shortcut);
    return acc;
}, {} as Record<string, Omit<Shortcut, 'description'>[]>);

    return (
        <>
            {/* כפתור קבוע בפינה */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: commonDir === 'ltr' ? 20 : 'auto',
                    left: commonDir === 'rtl' ? 20 : 'auto',
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
                            {t('dialogTitle')}
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
                                                {t(shortcut.descriptionKey)}
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
                            {t('closeHint', { components: { strong: <strong /> } })}
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}