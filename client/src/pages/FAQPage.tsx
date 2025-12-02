import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '../components/ui/accordion';
import { ArrowLeft, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSection {
    category: string;
    questions: FAQItem[];
}
import { faqs } from '../lib/faqs';
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';
import { useAccessibilityStore } from '../store/accessibilityStore';

export function FAQPage() {
    const {darkMode, highContrast}=useAccessibilityStore();
    const isKeyboardMode = useKeyboardModeBodyClass();
    const { t, i18n } = useTranslation(['faq', 'common']);
    const faqSections = t('faq:sections', { returnObjects: true }) as FAQSection[];
    const navigate = useNavigate();
    const [isLoading] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const discoverRef = useRef<HTMLHeadingElement | null>(null);
    const isRTL = i18n.dir() === 'rtl';

    // הלוגיקה של useEffect נשארת זהה
    useEffect(() => {
        if (!isLoading) {
            if (firstLoad) {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setFirstLoad(false);
            } else if (discoverRef.current) {
                discoverRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [isLoading]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }} dir={i18n.dir()}>
            <Container maxWidth="md" sx={{ px: 4, py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        variant="ghost"
                        className="mb-4 gap-2"
                        onClick={() => navigate(-1)}
                        aria-label={t('common:back')}
                    >
                        {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                        {t('common:back')}
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(22, 163, 74, 0.1)',
                            color: 'primary.main',
                        }}>
                            <HelpCircle className="h-8 w-8" />
                        </Box>
                        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                            {t('faq:pageTitle')}
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        {t('faq:subtitle')}
                    </Typography>
                </Box>

                {/* FAQ Sections */}
                <Box sx={{ spaceY: 6 }}>
                    {Array.isArray(faqSections) && faqSections.map((section: any, idx: any) => (
                        <Card key={idx} className="mb-6">
                            <CardContent className="pt-6">
                                {/* כותרת קטגוריה - שימוש בצבע ראשי */}
                                <Typography
                                    component="h2"
                                    variant="h5"
                                    sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}
                                >
                                    {section.category}
                                </Typography>
                                <Accordion type="single" collapsible className="w-full">
                                    {section.questions.map((faq: any, faqIdx: any) => (
                                        <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                                            <AccordionContent>
                                                <Typography color="text.secondary">
                                                    {faq.answer}
                                                </Typography>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </Box>


                <Box
                    sx={{
                        mt: 4,
                        p: 3,
                        borderRadius: 2,

                        bgcolor: (theme) =>
                            highContrast
                                ? theme.palette.background.default
                                : darkMode
                                    ? '#1c3639'
                                    : '#dcfce7',

                        border: '1px solid',
                        borderColor: (theme) =>
                            highContrast
                                ? theme.palette.text.primary
                                : darkMode
                                    ? '#375a3e'
                                    : '#bbf7d0',

                        '@media (forced-colors: active)': {
                            bgcolor: 'Canvas',
                            border: '3px solid',
                            borderColor: 'Highlight',
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>

                        <Box sx={{
                            p: 1.5,
                            borderRadius: 1,
                            color: (theme) => theme.palette.mode === 'dark' ? '#34d399' : '#059669',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#104e4c' : '#a7f3d0',
                        }}>
                            <MessageCircle className="h-6 w-6" />
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                            <Typography component="h3" variant="h6" color="text.primary" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                                {t('faq:contact.title')}
                            </Typography>

                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                {t('faq:contact.text')}
                            </Typography>

                            <Button
                                onClick={() => navigate('/contact')}
                                className="hover:bg-green-700 hover:text-white transition-colors duration-200"
                                aria-label={t('faq:contact.button')}
                            >
                                {t('faq:contact.button')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}