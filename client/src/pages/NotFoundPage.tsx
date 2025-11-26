import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center px-4" dir={t('dir')}>
      <div className="text-center max-w-2xl">
        {/* Large 404 */}
        <div className="mb-8">
          <h1 className="text-9xl text-green-600 opacity-20">404</h1>
        </div>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white p-6 rounded-full shadow-lg">
            <BookOpen className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Message */}
        <h2 className="mb-4">{t('notFound.title')}</h2>
        <p className="text-xl text-gray-600 mb-8">
          {t('notFound.mainMessage')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
           {t('notFound.backButton')}
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-5 w-5" />
            {t('notFound.homeButton')}
          </Button>
        </div>

        {/* Additional Help Text */}
        <p className="text-sm text-gray-500 mt-8">
         {t('notFound.footerMessage')}
        </p>
      </div>
    </div>
  );
}