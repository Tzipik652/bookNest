import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { Card as MuiCard } from '@mui/material';
import { Button as MuiButton } from '@mui/material';
// ייבוא רכיבי MUI
import { Box, Typography, Container } from '@mui/material';

export function ContactPage() {
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['contact', 'common']);
  const isRTL = i18n.dir() === 'rtl';
  const alignment = isRTL ? 'right' : 'left';

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
      // NOTE: Using a placeholder URL/API endpoint
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


  // --- 1. מצב חוסר הרשאה (Login Required) ---
  if (!currentUser?.name || !currentUser?.email) {
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}
        dir={i18n.dir()}
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <Typography variant="h5" component="h2" color="error.main" sx={{ fontWeight: 'bold' }}>
              {t('contact:auth.login_required')}
            </Typography>
            <Typography color="text.secondary">
              {t('contact:auth.login_description')}
            </Typography>
            <Button onClick={() => navigate("/login")} className="w-full">
              {t('contact:auth.go_to_login')}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // --- 2. מצב טופס רגיל / הצלחה ---
  return (
    <Box
      sx={{ minHeight: '100vh', bgcolor: 'background.default' }}
      dir={i18n.dir()}
    >
      <Container maxWidth="lg" sx={{ px: 4, py: 4 }}>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {t('common:back')}
        </Button>

        {/* כותרת הדף */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              // רקע שקוף למחצה בצבע ירוק בבהיר, או אפור בכהה
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(22, 163, 74, 0.1)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mail className="h-8 w-8" />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
              {t('contact:title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('contact:subtitle')}
            </Typography>
          </Box>
        </Box>

        {/* טופס / הצלחה / מידע ליצירת קשר */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* Contact Form OR Success Message (2/3 col) */}
          {messageSent ? (
            // --- 3. מצב הצלחה (Success Message) ---
            <MuiCard
              className="md:col-span-2"
              sx={{
                border: '1px solid',
                borderColor: 'success.light',
                // שימוש בצבע רקע סמנטי מה-Theme
                bgcolor: 'success.lightest'
              }}
            >
              <CardContent className="pt-6">
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        bgcolor: 'success.light',
                        p: 2,
                        borderRadius: '50%',
                        color: 'success.dark'
                      }}
                    >
                      <CheckCircle2 className="h-12 w-12" />
                    </Box>
                  </Box>
                  <Typography variant="h5" component="h2" color="success.dark" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {t('contact:success.title')}
                  </Typography>
                  <Typography color="success.dark" sx={{ mb: 3, maxWidth: 'md', mx: 'auto' }}>
                    {t('contact:success.description')}
                  </Typography>
                  <MuiButton
                    onClick={() => setMessageSent(false)}
                    variant="outlined"
                    sx={{
                      borderColor: 'success.main',
                      color: 'success.main',
                      '&:hover': {
                        bgcolor: 'success.light',
                        borderColor: 'success.dark',
                      }
                    }}
                  >
                    {t('contact:success.button_another')}
                  </MuiButton>
                </Box>
              </CardContent>
            </MuiCard>
          ) : (
            // --- 4. מצב טופס רגיל ---
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
                    >
                      <Send className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                      {isSubmitting ? t('common:sending') : t('contact:form.submit_button')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contact Information (1/3 col) */}
          <div className="space-y-6">

            {/* מידע ליצירת קשר */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* דוא"ל */}
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5, textAlign: alignment }}>
                  <Box
                    // רקע עדין יותר במצב רגיל, ושומר על ניגודיות במצב כהה
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      color: 'info.main', // צבע האייקון עצמו (כחול ראשי)
                      bgcolor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)' // רקע אפור בהיר בכהה
                        : 'rgba(59, 130, 246, 0.1)', // כחול בהיר ושקוף בבהיר (כמו bg-blue-100)
                    }}
                  >
                    <Mail className="h-5 w-5" />
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h3" color="text.primary" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                      {t('common:email')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">booknestwebsite@gmail.com</Typography>
                  </Box>
                </Box>

                {/* מיקום */}
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5, textAlign: alignment }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    color: 'primary.main', 
                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(22, 163, 74, 0.1)', 
                  }}>
                    <MapPin className="h-5 w-5" />
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h3" color="text.primary" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                      {t('contact:info.location_label')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('contact:info.address_line1')}<br />
                      {t('contact:info.address_line2')}<br />
                      {t('contact:info.address_country')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* FAQ Card */}
            <Card>
              <CardContent className="pt-6">
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5, mb: 3, textAlign: alignment }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    color: 'warning.main', 
                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(245, 158, 11, 0.1)', 
                  }}>
                    <HelpCircle className="h-5 w-5" />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" color="text.primary" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                      {t('contact:faq.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('contact:faq.description')}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate('/faq')}
                >
                  <HelpCircle className="h-4 w-4" />
                  {t('contact:faq.button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Box>
  );
}