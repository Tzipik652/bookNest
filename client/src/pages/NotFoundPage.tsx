import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, BookOpen } from 'lucide-react';
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

export function NotFoundPage() {
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center px-4">
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
        <h2 className="mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for seems to have wandered off into the literary void. 
          Let's get you back to exploring our book collection.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
        </div>

        {/* Additional Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          If you believe this is an error, please check the URL or contact support.
        </p>
      </div>
    </div>
  );
}