import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, ArrowRight, Shield, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

export function PrivacyPolicyPage() {
  const { t } = useTranslation(["policy", "common"]);
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();
  const policy = t('privacyPolicy', { returnObjects: true }) as any;
  const sections = policy.sections;

  const renderContent = (key: string | string[]) => {
    const direction = t('common:dir');
    const alignment = direction === 'rtl' ? 'right' : 'left';

    if (Array.isArray(key)) {
      return (
        <List dense sx={{ pl: 0, pt: 0, pb: 2 }}>
          {key.map((item, index) => (
            <ListItem 
              key={index} 
              alignItems="flex-start" 
              sx={{ pl: 0, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 24, mt: '4px' }}>
                <Circle size={6} fill="currentColor" />
              </ListItemIcon>
              <ListItemText 
                dir={direction}
                primary={
                  <Typography variant="body1" color="text.primary" sx={{ textAlign: alignment }}>
                    {item}
                  </Typography>
                } 
              />
            </ListItem>
          ))}
        </List>
      );
    }

    return (
      <Typography 
        variant="body1" 
        color="text.primary" 
        paragraph 
        sx={{ 
          lineHeight: 1.8, 
          mb: 3, 
          textAlign: alignment 
        }}
      >
        {key}
      </Typography>
    );
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default', 
        color: 'text.primary', 
      }} 
      dir={t('common:dir')}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
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

        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(22, 163, 74, 0.1)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield className="h-8 w-8" />
          </Box>

          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" gutterBottom sx={{ mb: 0.5 }}>
              {policy.pageTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {policy.lastUpdated}
            </Typography>
          </Box>
        </Box>

        <Card>
          <CardContent className="pt-6 space-y-6">
            
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.introduction.title}
              </Typography>
              {renderContent(sections.introduction.p1)}
            </Box>

            {/* 2. Information We Collect */}
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.informationCollected.title}
              </Typography>
              {renderContent(sections.informationCollected.p1)}
              {renderContent(sections.informationCollected.list)}
            </Box>

            {/* 3. How We Use Your Information */}
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.howWeUse.title}
              </Typography>
              {renderContent(sections.howWeUse.p1)}
              {renderContent(sections.howWeUse.list)}
            </Box>

            {/* 4. Data Storage */}
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.dataStorage.title}
              </Typography>
              {renderContent(sections.dataStorage.p1)}
            </Box>

            {/* 5. Data Sharing */}
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.dataSharing.title}
              </Typography>
              {renderContent(sections.dataSharing.p1)}
            </Box>

            {/* 6. Your Rights */}
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.yourRights.title}
              </Typography>
              {renderContent(sections.yourRights.p1)}
              {renderContent(sections.yourRights.list)}
            </Box>

            {/* 7. Cookies and Tracking */}
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.cookies.title}
              </Typography>
              {renderContent(sections.cookies.p1)}
            </Box>

            {/* 8. Children's Privacy */}
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.childrensPrivacy.title}
              </Typography>
              {renderContent(sections.childrensPrivacy.p1)}
            </Box>

            {/* 9. Changes to This Policy */}
            <Box component="section" sx={{ pb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.changes.title}
              </Typography>
              {renderContent(sections.changes.p1)}
            </Box>

            {/* 10. Contact Information */}
            <Box component="section">
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                {sections.contact.title}
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8 }}>
                {sections.contact.p1_start}{' '}
                <Link to="/contact" style={{ textDecoration: 'none' }}>
                  <Typography 
                    component="span" 
                    color="primary" 
                    sx={{ 
                      textDecoration: 'underline',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 }
                    }}
                  >
                    {sections.contact.p1_link}
                  </Typography>
                </Link>
                {' '}{sections.contact.p1_end}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}