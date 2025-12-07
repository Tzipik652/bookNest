import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../store/useUserStore";
import { getAllUsers } from "../services/userService";
import { getFavoritesCount } from "../services/favoriteService";
import { getDashboardStats } from "../services/adminService"; 
import { StatsCards } from "../components/adminDashboard/StatsCards";
import { AdminBooksTable } from "../components/adminDashboard/AdminBooksTable";
import { UserList } from "../components/adminDashboard/UserList";
import { RecentComments } from "../components/adminDashboard/RecentComments";
import { useTranslation } from "react-i18next";
import { Box, Typography, Container } from '@mui/material';

export function AdminDashboardPage() {
  const { t } = useTranslation(["adminDashboard", "common"]);
  const adminTexts = t('dashboard', { returnObjects: true }) as any;

  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    booksCount: 0,
    usersCount: 0,
    commentsCount: 0,
    favoritesCount: 0,
    reactionsCount: 0,
    recentBooksCount: 0 
  });

  const [users, setUsers] = useState<User[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (currentUser?.role !== "admin") {
      toast.error(adminTexts.unauthorizedError);
      navigate("/home");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [statsData, allUsers, favoritesCount] =
        await Promise.all([
          getDashboardStats(), 
          getAllUsers(),      
          getFavoritesCount(),
        ]);

      setUsers(allUsers);
      
      setStats({
        booksCount: statsData.booksCount || 0,
        usersCount: statsData.usersCount || 0,
        commentsCount: statsData.commentsCount || 0,
        reactionsCount: statsData.reactionsCount || 0, 
        recentBooksCount: statsData.recentBooksCount || 0, 
        favoritesCount: favoritesCount || 0,
      });

    } catch (error) {
      console.error(error);
      toast.error(adminTexts.loadDataFailed);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser?.role || currentUser.role !== "admin") {
    return null;
  }

  return (
    <Box 
      sx={{ minHeight: '100vh', bgcolor: 'background.default' }} 
      dir={t('common:dir')}
    >
      <Container maxWidth="xl" sx={{ px: 4, py: 4 }}>
        
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(22, 163, 74, 0.1)',
              color: 'primary.main',
            }}
          >
            <Shield className="h-8 w-8" />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
              {adminTexts.pageTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {adminTexts.pageSubtitle}
            </Typography>
          </Box>
        </Box>

        {/* Stats Section */}
        <Typography variant="h5" component="h2" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
          {adminTexts.overviewTitle}
        </Typography>

        <StatsCards
          translationKeys={adminTexts.stats}
        />

        {/* Books Management Section */}
        <Typography variant="h5" component="h2" fontWeight="bold" color="text.primary" sx={{ mt: 5, mb: 2 }}>
          {adminTexts.booksMgtTitle}
        </Typography>
        
        <AdminBooksTable/> 

        {/* Users Management Section */}
        <Typography variant="h5" component="h2" fontWeight="bold" color="text.primary" sx={{ mt: 5, mb: 2 }} id="users-list-section">
          {adminTexts.usersTitle}
        </Typography>
        <UserList
          currentUser={currentUser}
        />

        {/* Recent Comments Section */}
        <Typography variant="h5" component="h2" fontWeight="bold" color="text.primary" sx={{ mt: 5, mb: 2 }}>
          {adminTexts.recentActivityTitle}
        </Typography>
        
        <RecentComments/>

      </Container>
    </Box>
  );
}