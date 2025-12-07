import { useState, useEffect, useRef } from "react";
import { Avatar, Dialog, DialogActions, DialogContent, DialogTitle, useTheme, alpha, Box, Pagination } from "@mui/material";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { deleteUser, getPaginatedUsers, updateUser } from "../../services/userService";
import { User } from "../../types";
import { Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAccessibilityStore } from "../../store/accessibilityStore";

interface UserListProps {
  currentUser?: User | null;
}

export function UserList({ currentUser }: UserListProps) {
  const { t } = useTranslation(["adminDashboard", "common"]);
  const userListTexts = t('dashboard.userList', { returnObjects: true }) as Record<string, string>;
  const commonDir = t('common:dir') as 'rtl' | 'ltr';
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const prevPageRef = useRef(page);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const theme = useTheme();
  const { highContrast } = useAccessibilityStore();

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [usersState, setUsers] = useState<User[]>([]);
  const [userEditFormData, setUserEditFormData] = useState({
    name: "",
    email: "",
    isAdmin: false,
  });
  const fetchUsersData = async () => {
    setIsLoading(true);
    try {
      const data = await getPaginatedUsers({ page, limit: ITEMS_PER_PAGE });

      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);

    } catch (error) {
      console.error(error);
      toast.error(t("common:errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
    if (prevPageRef.current !== page) {
      setTimeout(() => {
        document.getElementById("users-list-section")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      prevPageRef.current = page;
    }
  }, [page]);

  const handleEditClick = (user: User) => {
    setEditingUserId(user._id);
    setUserEditFormData({
      name: user.name,
      email: user.email,
      isAdmin: user.role === "admin",
    });
  };
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  const handleCancel = () => setEditingUserId(null);

  const handleSave = async (userId: string) => {
    const user = usersState.find((u) => u._id === userId);
    if (!user) return;

    try {
      await updateUser({
        ...user,
        name: userEditFormData.name,
        email: userEditFormData.email,
        role: userEditFormData.isAdmin ? "admin" : "user",
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? {
              ...u,
              name: userEditFormData.name,
              email: userEditFormData.email,
              role: userEditFormData.isAdmin ? "admin" : "user",
            }
            : u
        )
      );
      toast.success(userListTexts.editSuccess);
      setEditingUserId(null);
    } catch (err) {
      toast.error(userListTexts.editFailed);
    }
  };
  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser(deleteUserId);
      setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
      toast.success(userListTexts.deleteSuccess);
      setDeleteUserId(null);
    } catch (err) {
      toast.error(userListTexts.deleteFailed);
    }
  };


  const cardBorderColor = highContrast ? theme.palette.text.primary : theme.palette.divider;
  const hoverShadow = highContrast ? `0 0 10px ${theme.palette.text.primary}` : theme.shadows[4];

  const primaryTextStyle = { color: theme.palette.text.primary };

  const secondaryTextStyle = highContrast
    ? { color: theme.palette.text.primary }
    : { color: theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.text.secondary };

  const userRoleChipStyle = {
    backgroundColor: highContrast
      ? 'transparent'
      : alpha(theme.palette.text.secondary, theme.palette.mode === 'dark' ? 0.15 : 0.05),
    color: highContrast
      ? theme.palette.text.primary
      : theme.palette.text.secondary,
    border: highContrast
      ? `1px solid ${theme.palette.text.primary}`
      : `1px solid ${theme.palette.divider}`,
  };

  const adminRoleChipStyle = {
    backgroundColor: highContrast
      ? theme.palette.background.default
      : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
    color: highContrast
      ? theme.palette.text.primary
      : theme.palette.primary.main,
    border: highContrast
      ? `1px solid ${theme.palette.text.primary}`
      : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  };

  const roleButtonBg = userEditFormData.isAdmin
    ? theme.palette.primary.main
    : theme.palette.mode === 'light'
      ? theme.palette.grey[500]
      : theme.palette.text.secondary;

  const inputStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${alpha(theme.palette.success.main, 0.5)}`,
      borderColor: theme.palette.success.main,
    }
  };

  const getActionButtonStyle = (colorKey: 'primary' | 'success' | 'error') => {
    const mainColor = theme.palette[colorKey].main;
    const iconColor = highContrast ? theme.palette.text.primary : mainColor;

    return {
      color: iconColor,
      '&:hover': {
        color: iconColor,
        backgroundColor: highContrast
          ? alpha(theme.palette.text.primary, 0.15)
          : alpha(mainColor, 0.1),
      }
    };
  };

  const editButtonStyle = getActionButtonStyle('success');
  const deleteButtonStyle = getActionButtonStyle('error');

  const skeletonBgColor = highContrast
    ? theme.palette.text.secondary
    : theme.palette.mode === 'dark'
      ? theme.palette.grey[800]
      : theme.palette.grey[300];


  return (
    <div className="flex flex-col gap-6" >
      <div

        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {isLoading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div
              key={i}
              style={{ backgroundColor: skeletonBgColor }}
              className="h-20 w-full rounded-xl animate-pulse"
            />
          ))
          : usersState.map((user) => {
            const isEditing = editingUserId === user._id;
            const roleChipStyle = user.role === "admin" ? adminRoleChipStyle : userRoleChipStyle;

            return (
              <div
                key={user._id}
                className="border rounded-lg p-3 flex flex-col"
                style={{ borderColor: cardBorderColor, transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onMouseEnter={(e) => { if (!highContrast) e.currentTarget.style.boxShadow = hoverShadow; }}
                onMouseLeave={(e) => { if (!highContrast) e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar
                      src={user.profile_picture || undefined}
                      sx={{ width: 48, height: 48, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}
                    >
                      {!user.profile_picture && user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      {isEditing ? (
                        <input
                          value={userEditFormData.name}
                          onChange={(e) => setUserEditFormData({ ...userEditFormData, name: e.target.value })}
                          style={inputStyle}
                          className="w-full rounded px-2 py-1 text-sm focus:outline-none focus:ring-2"
                        />
                      ) : (
                        <h3 className="font-medium text-sm truncate" style={primaryTextStyle}>
                          {user.name}
                        </h3>
                      )}
                      {isEditing ? (
                        <input
                          value={userEditFormData.email}
                          onChange={(e) => setUserEditFormData({ ...userEditFormData, email: e.target.value })}
                          style={inputStyle}
                          className="w-full rounded px-2 py-1 text-xs focus:outline-none focus:ring-2"
                        />
                      ) : (
                        <p className="text-xs truncate" style={secondaryTextStyle}>
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <button
                        onClick={() => setUserEditFormData({ ...userEditFormData, isAdmin: !userEditFormData.isAdmin })}
                        style={{ backgroundColor: roleButtonBg, color: theme.palette.primary.contrastText }}
                        className={`px-3 py-1 rounded text-xs`}
                      >
                        {userEditFormData.isAdmin ? userListTexts.roleAdmin : userListTexts.roleUser}
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0" style={roleChipStyle}>
                        {user.role === "admin" ? userListTexts.roleAdmin : userListTexts.roleUser}
                      </span>
                    )}

                    {isEditing ? (
                      <>
                        <Button size="sm" onClick={() => handleSave(user._id)} style={{ backgroundColor: theme.palette.success.main, color: theme.palette.success.contrastText }}>
                          {t('common:save')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} style={{ borderColor: theme.palette.divider, color: theme.palette.text.secondary, backgroundColor: theme.palette.background.paper }}>
                          {t('common:cancel')}
                        </Button>
                      </>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditClick(user)} style={editButtonStyle}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {currentUser?._id !== user._id && (
                          <Button size="sm" variant="ghost" onClick={() => setDeleteUserId(user._id)} style={deleteButtonStyle}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Dialog
                  open={deleteUserId === user._id}
                  onClose={() => setDeleteUserId(null)}
                  PaperProps={{ style: { direction: commonDir, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary } }}
                >
                  <DialogTitle style={primaryTextStyle}>{userListTexts.deleteTitle}</DialogTitle>
                  <DialogContent style={secondaryTextStyle}>{userListTexts.deleteConfirm}</DialogContent>
                  <DialogActions>
                    <Button variant="outline" onClick={() => setDeleteUserId(null)} style={{ borderColor: theme.palette.divider, color: theme.palette.text.secondary }}>
                      {t('common:cancel')}
                    </Button>
                    <Button size="sm" onClick={handleDelete} style={{ backgroundColor: theme.palette.error.main, color: theme.palette.error.contrastText }}>
                      {t('common:delete')}
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            );
          })}
      </div>

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2} mb={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            shape="rounded"
            showFirstButton
            showLastButton
            disabled={isLoading}
            dir="ltr"
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.palette.text.primary
              }
            }}
          />
        </Box>
      )}
    </div>
  );
}