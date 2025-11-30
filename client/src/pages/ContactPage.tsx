import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Mail, Send, HelpCircle, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '../store/useUserStore';
import { useTranslation } from 'react-i18next';
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

export function ContactPage() {
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['contact', 'common']);
  const isRTL = i18n.dir() === 'rtl';
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const { user: currentUser } = useUserStore();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.subject || !formData.message) {
      toast.error(t('contact:toasts.fill_all'));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: currentUser?.name,
          email: currentUser?.email,
          subject: formData.subject,
          message: formData.message
        })
      });

      if (!res.ok) throw new Error();

      toast.success(t('contact:toasts.success'));
      setMessageSent(true);
      setFormData({ subject: "", message: "" });

    } catch (err) {
      toast.error(t('contact:toasts.error'));
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  if (!currentUser?.name || !currentUser?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-red-600">{t('contact:auth.login_required')}</h2>
            <p className="text-gray-600">
              {t('contact:auth.login_description')}
            </p>
            <Button onClick={() => navigate("/login")} className="w-full" aria-label={t('contact:auth.go_to_login')}>
              {t('contact:auth.go_to_login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
         <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
          aria-label={t('common:back')}
        >
          {t('common:dir') === 'rtl' ? <ArrowRight className="h-4 w-4" /> : null}
          {t('common:dir') === 'ltr' ? <ArrowLeft className="h-4 w-4" /> : null}
          {t('common:back')}
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="mb-1">{t('contact:title')}</h1>
            <p className="text-gray-600">{t('contact:subtitle')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Form */}
          {messageSent ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h2 className="mb-3 text-green-800">{t('contact:success.title')}</h2>
                  <p className="text-green-700 mb-6 max-w-md mx-auto">
                    {t('contact:success.description')}
                  </p>
                  <Button
                    onClick={() => setMessageSent(false)}
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-100"
                    aria-label={t('contact:success.button_another')}
                  >
                    {t('contact:success.button_another')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact:form.subject_label')}</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder={t('contact:form.subject_placeholder')}
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact:form.message_label')}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder={t('contact:form.message_placeholder')}
                        className="min-h-[200px]"
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isSubmitting}
                      aria-label={isSubmitting ? t('common:sending') : t('contact:form.submit_button')}
                    >
                      <Send className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                      {isSubmitting ? t('common:sending') : t('contact:form.submit_button')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">{t('common:email')}</h3>
                    <p className="text-sm text-gray-600">booknestwebsite@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">{t('contact:info.location_label')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('contact:info.address_line1')}<br />
                      {t('contact:info.address_line2')}<br />
                      {t('contact:info.address_country')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1">{t('contact:faq.title')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('contact:faq.description')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate('/faq')}
                  aria-label={t('contact:faq.button')}
                >
                  <HelpCircle className="h-4 w-4" />
                  {t('contact:faq.button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}