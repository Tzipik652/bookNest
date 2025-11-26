import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '../components/ui/accordion';
import { ArrowLeft, HelpCircle, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

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

export function FAQPage() {
    const isKeyboardMode = useKeyboardModeBodyClass();
    const { t } = useTranslation(['faq', 'common']);
    const faqSections = t('faq:sections', { returnObjects: true }) as FAQSection[];
    const navigate = useNavigate();
    const [isLoading] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const discoverRef = useRef<HTMLHeadingElement | null>(null);

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
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        className="mb-4 gap-2"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('common:back')}
                    </Button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <HelpCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1>{t('faq:pageTitle')}</h1>
                    </div>
                    <p className="text-gray-600">
                        {t('faq:subtitle')}
                    </p>
                </div>

                {/* FAQ Sections */}
                <div className="space-y-6">
                    {Array.isArray(faqSections) && faqSections.map((section: any, idx: any) => (
                        <Card key={idx}>
                            <CardContent className="pt-6">
                                <h2 className="mb-4 text-green-600">{section.category}</h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {section.questions.map((faq: any, faqIdx: any) => (
                                        <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                                            <AccordionContent className="text-gray-700">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Still Need Help */}
                <Card className="mt-8 bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <MessageCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-2">{t('faq:contact.title')}</h3>
                                <p className="text-gray-700 mb-4">
                                    {t('faq:contact.text')}
                                </p>
                                <Button onClick={() => navigate('/contact')}>
                                    {t('faq:contact.button')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
