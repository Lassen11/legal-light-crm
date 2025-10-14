import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserPlus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<AppRole, string> = {
  admin: "Администратор",
  sales_manager: "Менеджер по продажам",
  care_manager: "Менеджер по заботе",
  lawyer: "Юрист",
  arbitration_manager: "Менеджер по арбитражу",
};

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, loading, isAdmin } = useUserRole();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "sales_manager" as AppRole,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав для просмотра этой страницы",
        variant: "destructive",
      });
    }
  }, [isAdmin, loading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          user_roles (role)
        `);

      if (error) throw error;

      const usersData = data.map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.user_roles?.[0]?.role || "sales_manager",
      }));

      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Не удалось создать пользователя");

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: newUser.role,
        });

      if (roleError) throw roleError;

      const { error: employeeError } = await supabase
        .from("employees")
        .insert({
          user_id: authData.user.id,
          name: newUser.fullName,
          email: newUser.email,
          position: roleLabels[newUser.role],
        });

      if (employeeError) throw employeeError;

      toast({
        title: "Успешно",
        description: "Сотрудник создан",
      });

      setNewUser({
        email: "",
        password: "",
        fullName: "",
        role: "sales_manager",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого сотрудника?")) return;

    try {
      const { error: employeeError } = await supabase
        .from("employees")
        .delete()
        .eq("user_id", userId);

      if (employeeError) throw employeeError;

      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Успешно",
        description: "Сотрудник удален",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || loadingUsers) {
    return <div className="p-8">Загрузка...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Панель администратора</h1>
        <p className="text-muted-foreground">Управление сотрудниками</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Создать сотрудника
          </CardTitle>
          <CardDescription>Добавьте нового сотрудника в систему</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">ФИО</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as AppRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Создание..." : "Создать сотрудника"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
          <CardDescription>Все зарегистрированные сотрудники</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || "—"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{roleLabels[user.role]}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
