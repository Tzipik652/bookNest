import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
// ייבוא רכיבי MUI ו-Hooks
import { Box, Typography, Skeleton, useTheme, alpha } from '@mui/material';
import { useAccessibilityStore } from "../../store/accessibilityStore";

interface StatTranslationKeys {
  totalBooks: string;
  totalUsers: string;
  totalComments: string;
  totalFavorites: string;
  engagementTitle: string;
  reactionsText: string;
  avgReactions: string;
  reactionsPerComment: string;
  activityTitle: string;
  recentText: string;
  ofTotalBooksRecent: string;
}

// Custom hook for smooth animated numbers (נשאר ללא שינוי)
function useAnimatedNumber(
  targetValue: number,
  duration: number = 2000,
  isLoading: boolean = false
) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const lastTargetRef = useRef(targetValue);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * Math.max(targetValue, 10)));
    }, 100);
    return () => clearInterval(interval);
  }, [isLoading, targetValue]);

  useEffect(() => {
    if (isLoading) return;
    lastTargetRef.current = targetValue;
    startTimeRef.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.round(targetValue * eased);
      setDisplayValue((prev) => (prev !== newValue ? newValue : prev));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [targetValue, duration, isLoading]);

  return { value: displayValue, ref: elementRef };
}

interface StatsCardsProps {
  favoritesCount: number;
  totalBooksCount: number;
  totalUsersCount: number;
  commentsCount: number;
  reactionsCount: number;
  recentUploads: number;
  isLoading?: boolean;
  isReactionsLoading?: boolean;
  translationKeys: StatTranslationKeys;
}

// Skeleton מותאם ל-MUI Theme
function StatCardSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 3,
        boxShadow: 1,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="30%" height={40} />
      </Box>
      <Skeleton variant="rounded" width={48} height={48} />
    </Box>
  );
}

export function StatsCards({
  favoritesCount,
  totalBooksCount,
  totalUsersCount,
  commentsCount,
  reactionsCount,
  recentUploads,
  translationKeys,
  isLoading = false,
  isReactionsLoading = false,
}: StatsCardsProps) {
  const theme = useTheme();
  const { highContrast } = useAccessibilityStore();
  
  const booksAnim = useAnimatedNumber(totalBooksCount, 2000);
  const usersAnim = useAnimatedNumber(totalUsersCount, 2200);
  const commentsAnim = useAnimatedNumber(commentsCount, 2400);
  const favoritesAnim = useAnimatedNumber(favoritesCount, 2600);
  const reactionsAnim = useAnimatedNumber(reactionsCount, 2800, isReactionsLoading);
  const recentAnim = useAnimatedNumber(recentUploads, 2000);

  const handleCardClick = (scrollTo?: string) => {
    if (scrollTo) {
      const element = document.getElementById(scrollTo);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // פונקציית עזר להגדרת צבעים דינמיים לכרטיסים
  const getCardStyles = (colorType: 'success' | 'info' | 'secondary' | 'error' | 'warning') => {
    const mainColor = theme.palette[colorType].main;
    const isDark = theme.palette.mode === 'dark';

    return {
      // רקע הכרטיס
      bg: highContrast 
          ? theme.palette.background.default 
          : isDark 
            ? alpha(mainColor, 0.1) // כהה: רקע שקוף בצבע
            : theme.palette.background.paper, // בהיר: לבן
      
      // רקע האייקון
      iconBg: highContrast 
              ? theme.palette.background.paper 
              : alpha(mainColor, isDark ? 0.2 : 0.1),
      
      // צבע האייקון
      iconColor: highContrast ? theme.palette.text.primary : mainColor,
      
      // גבול (בעיקר לניגודיות גבוהה)
      border: highContrast ? `2px solid ${theme.palette.text.primary}` : `1px solid ${alpha(mainColor, 0.2)}`,
      
      // Gradient עדין למצב בהיר בלבד
      gradient: !isDark && !highContrast 
        ? `linear-gradient(135deg, ${alpha(mainColor, 0.05)} 0%, ${alpha(mainColor, 0.01)} 100%)` 
        : 'none'
    };
  };

  const stats = [
    {
      id: "books",
      title: translationKeys.totalBooks,
      animation: booksAnim,
      icon: <BookOpen className="h-6 w-6" />,
      themeColor: 'success' as const,
      scrollTo: "total-books-section",
    },
    {
      id: "users",
      title: translationKeys.totalUsers,
      animation: usersAnim,
      icon: <Users className="h-6 w-6" />,
      themeColor: 'info' as const,
      scrollTo: "users-list-section",
    },
    {
      id: "comments",
      title: translationKeys.totalComments,
      animation: commentsAnim,
      icon: <MessageSquare className="h-6 w-6" />,
      themeColor: 'secondary' as const,
      scrollTo: "total-comments-section",
    },
    {
      id: "favorites",
      title: translationKeys.totalFavorites,
      animation: favoritesAnim,
      icon: <Heart className="h-6 w-6" />,
      themeColor: 'error' as const,
    },
  ];

  const averageReactionsPerComment =
    commentsAnim.value > 0
      ? (reactionsAnim.value / commentsAnim.value).toFixed(1)
      : "0.0";

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </Box>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Top stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        {stats.map((item, index) => {
           const styles = getCardStyles(item.themeColor);
           
           return (
            <Box
              key={item.id}
              ref={item.animation.ref}
              onClick={() => handleCardClick(item.scrollTo)}
              className="group transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer relative overflow-hidden"
              sx={{
                bgcolor: styles.bg,
                background: styles.gradient,
                border: styles.border,
                borderRadius: 3,
                p: 3,
                boxShadow: theme.shadows[1],
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Sparkle effect */}
              <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-[pulse-glow_2s_ease-in-out_infinite]" />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h4" color="text.primary" fontWeight="bold">
                    {item.animation.value.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box
                  className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                  sx={{
                    bgcolor: styles.iconBg,
                    color: styles.iconColor,
                    p: 1.5,
                    borderRadius: 3,
                    boxShadow: theme.shadows[1]
                  }}
                >
                  {item.icon}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Secondary stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        
        {/* Engagement Card */}
        <Box
          ref={reactionsAnim.ref}
          onClick={() => handleCardClick("total-comments-section")}
          className="group transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer relative overflow-hidden"
          sx={{
            ...getCardStyles('warning'), // שימוש בכתום
            borderRadius: 3,
            p: 3,
            boxShadow: theme.shadows[1],
          }}
        >
          <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-[pulse-glow_2s_ease-in-out_infinite]" />
          </Box>

          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {translationKeys.engagementTitle}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h4" color="text.primary" fontWeight="bold">
                        {reactionsAnim.value.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {translationKeys.reactionsText}
                    </Typography>
                </Box>
              </Box>
              
              <Box
                className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                sx={{
                  bgcolor: highContrast ? 'background.paper' : alpha(theme.palette.warning.main, 0.1),
                  color: highContrast ? 'text.primary' : 'warning.main',
                  p: 1.5,
                  borderRadius: 3,
                }}
              >
                <TrendingUp className="h-6 w-6" />
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, height: 8, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 4, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: 'warning.main',
                    borderRadius: 4,
                    transition: 'width 1s ease-in-out',
                    width: `${Math.min((parseFloat(averageReactionsPerComment) / 10) * 100, 100)}%`
                  }}
                />
              </Box>
              <Typography variant="body2" fontWeight="bold" color="text.primary">
                {averageReactionsPerComment} {translationKeys.avgReactions}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {translationKeys.reactionsPerComment}
            </Typography>
          </Box>
        </Box>

        {/* Recent uploads Card */}
        <Box
          ref={recentAnim.ref}
          onClick={() => handleCardClick("total-books-section")}
          className="group transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer relative overflow-hidden"
          sx={{
            ...getCardStyles('info'), // שימוש בכחול/אינדיגו
            borderRadius: 3,
            p: 3,
            boxShadow: theme.shadows[1],
          }}
        >
          <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-[pulse-glow_2s_ease-in-out_infinite]" />
          </Box>

          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {translationKeys.activityTitle}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h4" color="text.primary" fontWeight="bold">
                        {recentAnim.value.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {translationKeys.recentText}
                    </Typography>
                </Box>
              </Box>
              
              <Box
                className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                sx={{
                  bgcolor: highContrast ? 'background.paper' : alpha(theme.palette.info.main, 0.1),
                  color: highContrast ? 'text.primary' : 'info.main',
                  p: 1.5,
                  borderRadius: 3,
                }}
              >
                <AlertCircle className="h-6 w-6" />
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, height: 8, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 4, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: 'info.main',
                    borderRadius: 4,
                    transition: 'width 1s ease-in-out',
                    width: `${Math.min((recentAnim.value / Math.max(booksAnim.value, 1)) * 100, 100)}%`
                  }}
                />
              </Box>
              <Typography variant="body2" fontWeight="bold" color="text.primary">
                 {booksAnim.value > 0
                  ? Math.round((recentAnim.value / booksAnim.value) * 100)
                  : 0}
                %
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {translationKeys.ofTotalBooksRecent}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}