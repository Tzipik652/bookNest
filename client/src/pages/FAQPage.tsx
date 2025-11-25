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
import { faqs } from '../lib/faqs';

export function FAQPage() {
    const navigate = useNavigate();

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
                        Back
                    </Button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <HelpCircle className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1>Frequently Asked Questions</h1>
                    </div>
                    <p className="text-gray-600">
                        Find answers to common questions about BookNest
                    </p>
                </div>

                {/* FAQ Sections */}
                <div className="space-y-6">
                    {faqs.map((section:any, idx:any) => (
                        <Card key={idx}>
                            <CardContent className="pt-6">
                                <h2 className="mb-4 text-blue-600">{section.category}</h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {section.questions.map((faq:any, faqIdx:any) => (
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
                <Card className="mt-8 bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <MessageCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-2">Still have questions?</h3>
                                <p className="text-gray-700 mb-4">
                                    If you couldn't find the answer you're looking for, our support team is here to help.
                                </p>
                                <Button onClick={() => navigate('/contact')}>
                                    Contact Support
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
