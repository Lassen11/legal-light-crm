import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

const statusColors: Record<string, string> = {
  "Новый": "bg-blue-500",
  "Активный": "bg-purple-500",
  "В суде": "bg-amber-500",
  "Завершен": "bg-accent",
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClient();
      fetchClientTasks();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные клиента",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить задачи",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!client) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name: client.name,
          phone: client.phone,
          email: client.email,
          city: client.city,
          debt_amount: client.debt_amount,
          creditor_name: client.creditor_name,
          overdue_payments: client.overdue_payments,
          minimum_payments_made: client.minimum_payments_made,
          property_value: client.property_value,
          marital_status: client.marital_status,
          spouse_property_value: client.spouse_property_value,
          purchase_sales_3years: client.purchase_sales_3years,
          spouse_purchase_sales_3years: client.spouse_purchase_sales_3years,
          receives_benefits: client.receives_benefits,
          official_income: client.official_income,
          has_criminal_record: client.has_criminal_record,
          is_ceo_or_ip: client.is_ceo_or_ip,
          has_bank_deposits: client.has_bank_deposits,
          is_inheriting: client.is_inheriting,
          has_registered_organization: client.has_registered_organization,
          status: client.status,
          stage: client.stage,
          comments: client.comments,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Успешно сохранено",
        description: "Данные клиента обновлены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
      fetchClientTasks();
      toast({
        title: "Успешно",
        description: "Статус задачи обновлен",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Клиент не найден</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {client.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className={`${statusColors[client.status]} text-white border-0`}
              >
                {client.status}
              </Badge>
              <span className="text-muted-foreground">• {client.stage}</span>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">ФИО</Label>
              <Input
                id="name"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                value={client.city || ""}
                onChange={(e) => setClient({ ...client, city: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Debt Information */}
        <Card>
          <CardHeader>
            <CardTitle>Информация о долге</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="debt_amount">Сумма долга (₽)</Label>
              <Input
                id="debt_amount"
                type="number"
                value={client.debt_amount}
                onChange={(e) =>
                  setClient({ ...client, debt_amount: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="creditor_name">Наименование кредитора</Label>
              <Input
                id="creditor_name"
                value={client.creditor_name || ""}
                onChange={(e) =>
                  setClient({ ...client, creditor_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="overdue_payments">Просрочки</Label>
              <Textarea
                id="overdue_payments"
                value={client.overdue_payments || ""}
                onChange={(e) =>
                  setClient({ ...client, overdue_payments: e.target.value })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="minimum_payments_made">
                Вносились ли по 3 минимальных платежа
              </Label>
              <Switch
                id="minimum_payments_made"
                checked={client.minimum_payments_made || false}
                onCheckedChange={(checked) =>
                  setClient({ ...client, minimum_payments_made: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle>Имущество</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="property_value">
                Имущество - рыночная стоимость (₽)
              </Label>
              <Input
                id="property_value"
                type="number"
                value={client.property_value || ""}
                onChange={(e) =>
                  setClient({
                    ...client,
                    property_value: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="spouse_property_value">
                Имущество супруга - рыночная стоимость (₽)
              </Label>
              <Input
                id="spouse_property_value"
                type="number"
                value={client.spouse_property_value || ""}
                onChange={(e) =>
                  setClient({
                    ...client,
                    spouse_property_value: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="purchase_sales_3years">
                Сделки купли-продажи за последние 3 года
              </Label>
              <Textarea
                id="purchase_sales_3years"
                value={client.purchase_sales_3years || ""}
                onChange={(e) =>
                  setClient({ ...client, purchase_sales_3years: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="spouse_purchase_sales_3years">
                Сделки купли-продажи супруга за последние 3 года
              </Label>
              <Textarea
                id="spouse_purchase_sales_3years"
                value={client.spouse_purchase_sales_3years || ""}
                onChange={(e) =>
                  setClient({
                    ...client,
                    spouse_purchase_sales_3years: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Личная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="marital_status">Семейное положение/дети</Label>
              <Input
                id="marital_status"
                value={client.marital_status || ""}
                onChange={(e) =>
                  setClient({ ...client, marital_status: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="official_income">Официальный доход (₽)</Label>
              <Input
                id="official_income"
                type="number"
                value={client.official_income || ""}
                onChange={(e) =>
                  setClient({
                    ...client,
                    official_income: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="receives_benefits">
                Получает ли пособия, алименты
              </Label>
              <Switch
                id="receives_benefits"
                checked={client.receives_benefits || false}
                onCheckedChange={(checked) =>
                  setClient({ ...client, receives_benefits: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="has_criminal_record">
                Наличие судимости (ст.159)
              </Label>
              <Switch
                id="has_criminal_record"
                checked={client.has_criminal_record || false}
                onCheckedChange={(checked) =>
                  setClient({ ...client, has_criminal_record: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Бизнес и финансы</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_ceo_or_ip">
                Является ли генеральным директором ООО/ИП
              </Label>
              <Switch
                id="is_ceo_or_ip"
                checked={client.is_ceo_or_ip || false}
                onCheckedChange={(checked) =>
                  setClient({ ...client, is_ceo_or_ip: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="has_bank_deposits">
                Есть ли на счетах/вкладах денежные средства
              </Label>
              <Switch
                id="has_bank_deposits"
                checked={client.has_bank_deposits || false}
                onCheckedChange={(checked) =>
                  setClient({ ...client, has_bank_deposits: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_inheriting">Не вступает ли в наследство</Label>
              <Switch
                id="is_inheriting"
                checked={client.is_inheriting || false}
                onCheckedChange={(checked) =>
                  setClient({ ...client, is_inheriting: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="has_registered_organization">
                Проверка ИНН - есть ли оформленная организация
              </Label>
              <Switch
                id="has_registered_organization"
                checked={client.has_registered_organization || false}
                onCheckedChange={(checked) =>
                  setClient({ ...client, has_registered_organization: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Комментарии сотрудника</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Добавьте заметки о работе с клиентом..."
              value={client.comments || ""}
              onChange={(e) => setClient({ ...client, comments: e.target.value })}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Задачи по клиенту</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/tasks")}
              >
                Управление задачами
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Нет задач по этому клиенту
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border bg-card space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>
                      {task.status === "done" && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            task.status === "todo"
                              ? "bg-blue-500 text-white"
                              : task.status === "in_progress"
                              ? "bg-yellow-500 text-white"
                              : "bg-green-500 text-white"
                          }
                        >
                          {task.status === "todo"
                            ? "К выполнению"
                            : task.status === "in_progress"
                            ? "В процессе"
                            : "Завершено"}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">
                            до {format(new Date(task.due_date), "dd.MM.yyyy", { locale: ru })}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {task.status !== "done" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateTaskStatus(
                                task.id,
                                task.status === "todo" ? "in_progress" : "done"
                              )
                            }
                          >
                            {task.status === "todo"
                              ? "Начать"
                              : "Завершить"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
