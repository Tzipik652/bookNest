import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TermsOfServicePage() {
  const { t } = useTranslation(["terms", "common"]);
  const navigate = useNavigate();
  const tos = t('termsOfService', { returnObjects: true }) as any;
  const sections = tos.sections;
  const renderContent = (key: string | string[]) => {
    if (Array.isArray(key)) {
      return (
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          {key.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-gray-700 leading-relaxed">{key}</p>;
  };
  return (
    <div className="min-h-screen bg-gray-50" dir={t('common:dir')}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          {t('common:dir') === 'rtl' ? <ArrowRight className="h-4 w-4" /> : null}
          {t('common:dir') === 'ltr' ? <ArrowLeft className="h-4 w-4" /> : null}
          {t('common:back')}
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="mb-1">{tos.pageTitle}</h1>
            <p className="text-gray-600">{tos.lastUpdated}</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* 1. Agreement to Terms */}
            <section>
              <h2 className="mb-3">{sections.agreement.title}</h2>
              {renderContent(sections.agreement.p1)}
            </section>

            {/* 2. Description of Service */}
            <section>
              <h2 className="mb-3">{sections.description.title}</h2>
              {renderContent(sections.description.p1)}
            </section>

            {/* 3. User Accounts */}
            <section>
              <h2 className="mb-3">{sections.accounts.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {sections.accounts.p1}
              </p>
              {renderContent(sections.accounts.list)}
            </section>

            {/* 4. User Content */}
            <section>
              <h2 className="mb-3">{sections.userContent.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {sections.userContent.p1}
              </p>
              {renderContent(sections.userContent.list)}
            </section>

            {/* 5. Intellectual Property */}
            <section>
              <h2 className="mb-3">{sections.ip.title}</h2>
              {renderContent(sections.ip.p1)}
            </section>

            {/* 6. Prohibited Activities */}
            <section>
              <h2 className="mb-3">{sections.prohibited.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {sections.prohibited.p1}
              </p>
              {renderContent(sections.prohibited.list)}
            </section>

            {/* 7. AI-Generated Content */}
            <section>
              <h2 className="mb-3">{sections.aiContent.title}</h2>
              {renderContent(sections.aiContent.p1)}
            </section>

            {/* 8. Community Guidelines */}
            <section>
              <h2 className="mb-3">{sections.community.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {sections.community.p1}
              </p>
              {renderContent(sections.community.list)}
            </section>

            {/* 9. Disclaimer of Warranties */}
            <section>
              <h2 className="mb-3">{sections.disclaimer.title}</h2>
              {renderContent(sections.disclaimer.p1)}
            </section>

            {/* 10. Limitation of Liability */}
            <section>
              <h2 className="mb-3">{sections.limitation.title}</h2>
              {renderContent(sections.limitation.p1)}
            </section>

            {/* 11. Termination */}
            <section>
              <h2 className="mb-3">{sections.termination.title}</h2>
              {renderContent(sections.termination.p1)}
            </section>

            {/* 12. Changes to Terms */}
            <section>
              <h2 className="mb-3">{sections.changes.title}</h2>
              {renderContent(sections.changes.p1)}
            </section>

            {/* 13. Contact Information */}
            <section>
              <h2 className="mb-3">{sections.contact.title}</h2>
              <p className="text-gray-700 leading-relaxed">
                {sections.contact.p1_start}{' '}
                <Link to="/contact" className="text-green-600 hover:underline">
                  {/* שימוש במפתח הקישור הכללי מתוך common.json */}
                  {sections.contact.p1_link}
                </Link>
                {sections.contact.p1_end}
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
