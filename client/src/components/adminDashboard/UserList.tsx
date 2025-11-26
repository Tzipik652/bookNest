import { useState, useEffect } from "react";
import { Avatar, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { deleteUser, updateUser } from "../../services/userService";
import { User } from "../../types";
import { Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserListProps {
  users: User[];
  currentUser?: User | null;
  isLoading?: boolean;
}

export function UserList({ users, currentUser, isLoading }: UserListProps) {
  const { t } = useTranslation(["adminDashboard", "common"]); // טעינת Namespaces
  const userListTexts = t('dashboard.userList', { returnObjects: true }) as any;
  const commonDir = t('common:dir') as 'rtl' | 'ltr';
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [usersState, setUsers] = useState<User[]>(users);
  const [userEditFormData, setUserEditFormData] = useState({
    name: "",
    email: "",
    isAdmin: false,
  });

  useEffect(() => {
    setUsers(users);
  }, [users]);

  const handleEditClick = (user: User) => {
    setEditingUserId(user._id);
    setUserEditFormData({
      name: user.name,
      email: user.email,
      isAdmin: user.role === "admin",
    });
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
      setUsers((prev) =>
        prev.filter((u) => u._id !== deleteUserId)
      );
      toast.success(userListTexts.deleteSuccess);
      setDeleteUserId(null);
    } catch (err) {
      toast.error(userListTexts.deleteFailed);
    }
  };

  return (
    <div
      id="users-list-section"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 w-full bg-gray-200 rounded-xl animate-pulse"
          />
        ))
        : usersState.map((user) => {
          const isEditing = editingUserId === user._id;
          return (
            <div
              key={user._id}
              className="border rounded-lg p-3 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Header: Avatar + Name + Role + Actions */}
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    src={user.profile_picture || undefined}
                    sx={{ width: 48, height: 48 }}
                  >
                    {!user.profile_picture &&
                      user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    {isEditing ? (
                      <input
                        value={userEditFormData.name}
                        onChange={(e) =>
                          setUserEditFormData({
                            ...userEditFormData,
                            name: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <h3 className="font-medium text-sm truncate">
                        {user.name}
                      </h3>
                    )}
                    {isEditing ? (
                      <input
                        value={userEditFormData.email}
                        onChange={(e) =>
                          setUserEditFormData({
                            ...userEditFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Role */}
                  {isEditing ? (
                    <button
                      onClick={() =>
                        setUserEditFormData({
                          ...userEditFormData,
                          isAdmin: !userEditFormData.isAdmin,
                        })
                      }
                      className={`px-3 py-1 rounded text-white text-xs ${userEditFormData.isAdmin
                          ? "bg-purple-600"
                          : "bg-gray-400"
                        }`}
                    >
                      {userEditFormData.isAdmin ? userListTexts.roleAdmin : userListTexts.roleUser}
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                      {user.role === "admin" ? userListTexts.roleAdmin : userListTexts.roleUser}
                    </span>
                  )}

                  {/* Actions */}
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={() => handleSave(user._id)}>
                        {t('common:save')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        {t('common:cancel')}
                      </Button>
                    </>
                  ) : (
                    <div>
                      <Button size="sm" onClick={() => handleEditClick(user)}>
                        <Edit className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      {currentUser?._id !== user._id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => setDeleteUserId(user._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Delete confirmation Dialog */}
              <Dialog
                open={!!deleteUserId}
                onClose={() => setDeleteUserId(null)}
                PaperProps={{ style: { direction: commonDir } }}
              >
               <DialogTitle>{userListTexts.deleteTitle}</DialogTitle>
                    <DialogContent>
                      {userListTexts.deleteConfirm}
                    </DialogContent>
                    <DialogActions>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteUserId(null)}
                  >
                    {t('common:cancel')}
                  </Button>
                  <Button
                    size="sm"
                    className="text-red-600"
                    onClick={handleDelete}
                  >
                    {t('common:delete')}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          );
        })}
    </div>
  );
}
