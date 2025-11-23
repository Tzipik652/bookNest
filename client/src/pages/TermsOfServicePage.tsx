import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

export function TermsOfServicePage() {
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
          <div className="bg-green-100 p-3 rounded-lg">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="mb-1">Terms of Service</h1>
            <p className="text-gray-600">Last updated: November 17, 2025</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <section>
              <h2 className="mb-3">Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using BookNest, you agree to be bound by these Terms of Service and all applicable
                laws and regulations. If you do not agree with any of these terms, you are prohibited from using
                this service.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                BookNest is a web-based book management platform that allows users to discover, manage, and get
                AI-powered recommendations for books. Users can create accounts, upload book information, manage
                personal libraries, add favorites, and interact with the community through comments and reactions.
              </p>
            </section>

            <section>
              <h2 className="mb-3">User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                When you create an account with us, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Not create multiple accounts or share accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3">User Content</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                When uploading books, comments, or other content, you agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>You own or have the right to share the content</li>
                <li>Your content does not infringe on intellectual property rights</li>
                <li>Your content does not violate any laws or regulations</li>
                <li>You will not upload malicious, offensive, or inappropriate content</li>
                <li>BookNest reserves the right to remove any content at our discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3">Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The BookNest platform, including its design, features, and functionality, is owned by BookNest and
                is protected by copyright and other intellectual property laws. You may not reproduce, distribute,
                modify, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Use the service for any illegal purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to the platform</li>
                <li>Upload viruses, malware, or malicious code</li>
                <li>Spam or send unsolicited messages</li>
                <li>Scrape or copy content without permission</li>
                <li>Impersonate other users or entities</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3">AI-Generated Content</h2>
              <p className="text-gray-700 leading-relaxed">
                BookNest uses AI to generate book summaries and recommendations. While we strive for accuracy,
                AI-generated content may contain errors or inaccuracies. This content is provided for informational
                purposes only and should not be considered professional advice.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Community Guidelines</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                When interacting with other users through comments and reactions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Be respectful and courteous to all users</li>
                <li>Keep discussions relevant to books and literature</li>
                <li>Do not post spam, advertisements, or promotional content</li>
                <li>Respect diverse opinions and perspectives</li>
                <li>Report inappropriate content to book owners or administrators</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3">Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                BookNest is provided "as is" without warranties of any kind, either express or implied. We do not
                guarantee that the service will be uninterrupted, secure, or error-free. Your use of the service
                is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, BookNest shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend your account and access to the service at our sole
                discretion, without notice, for conduct that we believe violates these Terms of Service or is
                harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes
                by updating the "Last updated" date. Your continued use of BookNest after changes constitutes
                acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <Link to="/contact" className="text-green-600 hover:underline">
                  our contact page
                </Link>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
