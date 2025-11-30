import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

export function PrivacyPolicyPage() {
  const { t } = useTranslation(["policy", "common"]);
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();
const policy = t('privacyPolicy', { returnObjects: true }) as any;
  const sections = policy.sections;
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
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="mb-1">{policy.pageTitle}</h1>
            <p className="text-gray-600">{policy.lastUpdated}</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <section>
              <h2 className="mb-3">{sections.introduction.title}</h2>
              <p className="text-gray-700 leading-relaxed">
                {renderContent(sections.introduction.p1)}
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="mb-3">{sections.informationCollected.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {sections.informationCollected.p1}
              </p>
              {renderContent(sections.informationCollected.list)}
            </section>

            {/* 3. How We Use Your Information */}
            <section>
              <h2 className="mb-3">{sections.howWeUse.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {sections.howWeUse.p1}
              </p>
              {renderContent(sections.howWeUse.list)}
            </section>

{/* 4. Data Storage */}
            {/* 4. Data Storage */}
            <section>
              <h2 className="mb-3">{sections.dataStorage.title}</h2>
              {renderContent(sections.dataStorage.p1)}
            </section>

            {/* 5. Data Sharing */}
            <section>
              <h2 className="mb-3">{sections.dataSharing.title}</h2>
              {renderContent(sections.dataSharing.p1)}
            </section>

            {/* 6. Your Rights */}
            <section>
              <h2 className="mb-3">{sections.yourRights.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {sections.yourRights.p1}
              </p>
              {renderContent(sections.yourRights.list)}
            </section>

            {/* 7. Cookies and Tracking */}
            <section>
              <h2 className="mb-3">{sections.cookies.title}</h2>
              {renderContent(sections.cookies.p1)}
            </section>

            {/* 8. Children's Privacy */}
            <section>
              <h2 className="mb-3">{sections.childrensPrivacy.title}</h2>
              {renderContent(sections.childrensPrivacy.p1)}
            </section>

            {/* 9. Changes to This Policy */}
            <section>
              <h2 className="mb-3">{sections.changes.title}</h2>
              {renderContent(sections.changes.p1)}
            </section>

            <section>
              <h2 className="mb-3">{sections.contact.title}</h2>
              <p className="text-gray-700 leading-relaxed">
                {sections.contact.p1_start}{' '}
                <a href="/contact" className="text-green-600 hover:underline">
                  {sections.contact.p1_link}
                </a>{' '}
                {sections.contact.p1_end}
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
