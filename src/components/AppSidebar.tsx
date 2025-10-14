import { LayoutDashboard, TrendingUp, Users, HeartHandshake, CheckSquare, FileText, LogOut, UserCircle, Shield } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const allItems = [
  { title: "Дашборд", url: "/", icon: LayoutDashboard, roles: ["admin", "sales_manager", "care_manager", "lawyer", "arbitration_manager"] },
  { title: "Воронка продаж", url: "/sales-funnel", icon: TrendingUp, roles: ["admin", "sales_manager"] },
  { title: "Забота о клиентах", url: "/client-care", icon: HeartHandshake, roles: ["admin", "care_manager"] },
  { title: "Все клиенты", url: "/clients", icon: Users, roles: ["admin"] },
  { title: "Делопроизводство", url: "/case-work", icon: FileText, roles: ["admin", "lawyer"] },
  { title: "Задачи", url: "/tasks", icon: CheckSquare, roles: ["admin", "sales_manager", "care_manager", "lawyer", "arbitration_manager"] },
  { title: "Админ панель", url: "/admin", icon: Shield, roles: ["admin"] },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, loading } = useUserRole();

  const items = allItems.filter(item => 
    !role || item.roles.includes(role as AppRole)
  );

  if (loading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent>
          <div className="p-4 text-sidebar-foreground/70">Загрузка...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Вы вышли из системы",
      });
      navigate("/auth");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Навигация
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="space-y-2">
        <UserProfileDialog>
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <UserCircle className="h-5 w-5" />
            {open && <span className="ml-2">Профиль</span>}
          </Button>
        </UserProfileDialog>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {open && <span className="ml-2">Выйти</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
