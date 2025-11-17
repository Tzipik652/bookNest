import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="mb-1">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: November 17, 2025</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <section>
              <h2 className="mb-3">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to BookNest. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we handle your personal data when you use our book 
                management platform.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Account information (name, email address)</li>
                <li>Books you upload or add to the platform</li>
                <li>Your favorite books and reading preferences</li>
                <li>Comments and reactions you make on books</li>
                <li>Usage data and interactions with the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide and maintain our service</li>
                <li>Generate personalized AI recommendations</li>
                <li>Enable you to share and discover books</li>
                <li>Improve and optimize our platform</li>
                <li>Communicate with you about updates and features</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3">Data Storage</h2>
              <p className="text-gray-700 leading-relaxed">
                Currently, BookNest operates as a frontend-only application with data stored locally in your browser's 
                localStorage. This means your data is stored on your device and is not transmitted to our servers. 
                Please note that clearing your browser data will remove all your BookNest information.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties. Your data 
                remains private and is only used to provide you with the BookNest service.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3">Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                BookNest uses localStorage to maintain your session and store your preferences. We do not use 
                third-party tracking cookies or analytics tools.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                BookNest is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our privacy policy from time to time. We will notify you of any changes by posting 
                the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this privacy policy, please contact us at{' '}
                <a href="/contact" className="text-blue-600 hover:underline">
                  our contact page
                </a>
                .
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
