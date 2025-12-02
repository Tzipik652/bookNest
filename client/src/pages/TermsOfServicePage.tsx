import { Link, useNavigate } from 'react-router-dom';
// ייבוא רכיבי MUI לטיפול ב-Theme ובנגישות
import { Box, Typography, Container, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, ArrowRight, FileText, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

// 

export function TermsOfServicePage() {
  const { t } = useTranslation(["terms", "common"]);
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();
  const tos = t('termsOfService', { returnObjects: true }) as any;
  const sections = tos.sections;


  const renderContent = (key: string | string[]) => {
    if (Array.isArray(key)) {
      return (
        <List dense sx={{ pl: 0, pt: 0, pb: 2 }}>
          {key.map((item, index) => (
            <ListItem
              key={index}
              alignItems="flex-start"
              sx={{ pl: 0, py: 0.5 }}
              dir={t('common:dir')}
            >
              <ListItemIcon sx={{ minWidth: 24, mt: '4px' }}>
                <Circle size={6} fill="currentColor" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" color="text.primary" sx={{
                    textAlign: t('common:dir') === 'rtl' ? 'right' : 'left'
                  }}>
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
        sx={{ lineHeight: 1.8, mb: 3 }} 
        dir={t('common:dir')}
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
            <FileText className="h-8 w-8" />
          </Box>

          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" gutterBottom sx={{ mb: 0.5 }}>
              {tos.pageTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tos.lastUpdated}
            </Typography>
          </Box>
        </Box>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {Object.values(sections).map((section: any, index: number) => (
              <Box component="section" key={index} sx={{ pb: 2, pt: index === 0 ? 0 : 2 }}>
                <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                  {section.title}
                </Typography>

                {section.p1 && renderContent(section.p1)}
                {section.p2 && renderContent(section.p2)}
                {section.list && renderContent(section.list)}

                {section.p1_start && (
                  <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8 }}>
                    {section.p1_start}{' '}
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
                        {section.p1_link}
                      </Typography>
                    </Link>
                    {' '}{section.p1_end}
                  </Typography>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

