import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AppRole = "sales_manager" | "care_manager" | "lawyer" | "arbitration_manager";

const roleLabels: Record<AppRole, string> = {
  sales_manager: "Менеджер по продажам",
  care_manager: "Менеджер отдела заботы",
  lawyer: "Юрист",
  arbitration_manager: "Арбитражный управляющий",
};

const signupSchema = z.object({
  email: z.string().trim()
    .email("Неверный формат email")
    .max(255, "Email слишком длинный"),
  password: z.string()
    .min(8, "Минимум 8 символов")
    .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква")
    .regex(/[a-z]/, "Нужна хотя бы одна строчная буква")
    .regex(/[0-9]/, "Нужна хотя бы одна цифра"),
  fullName: z.string().trim()
    .min(2, "Имя слишком короткое")
    .max(100, "Имя слишком длинное")
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, "Недопустимые символы в имени"),
  role: z.enum(["sales_manager", "care_manager", "lawyer", "arbitration_manager"])
});

const loginSchema = z.object({
  email: z.string().trim().email("Неверный формат email"),
  password: z.string().min(1, "Пароль обязателен")
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("sales_manager");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        const errors = validation.error.errors.map(e => e.message).join(", ");
        toast({
          title: "Ошибка валидации",
          description: errors,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) throw error;

      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = signupSchema.safeParse({ email, password, fullName, role });
      if (!validation.success) {
        const errors = validation.error.errors.map(e => e.message).join(", ");
        toast({
          title: "Ошибка валидации",
          description: errors,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validation.data.fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert role for the new user
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: validation.data.role,
          });

        if (roleError) {
          toast({
            title: "Внимание",
            description: "Пользователь создан, но роль не была назначена",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Регистрация успешна",
        description: "Вы успешно зарегистрированы и можете войти",
      });
      
      setIsLogin(true);
    } catch (error: any) {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Вход" : "Регистрация"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Войдите в систему управления клиентами"
              : "Создайте новый аккаунт"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Полное имя</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Иван Иванов"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
                  <SelectTrigger id="role">
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
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
            >
              {isLogin
                ? "Нет аккаунта? Зарегистрируйтесь"
                : "Уже есть аккаунт? Войдите"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
