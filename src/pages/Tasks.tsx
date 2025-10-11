import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogClose,
 } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type Employee = Database["public"]["Tables"]["employees"]["Row"];
type ClientOption = Pick<Client, "id" | "name">;
type EmployeeOption = Pick<Employee, "id" | "name" | "position">;

const statusConfig = {
  todo: { label: "К выполнению", color: "bg-blue-500" },
  in_progress: { label: "В процессе", color: "bg-yellow-500" },
  done: { label: "Завершено", color: "bg-green-500" },
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    status: "todo" | "in_progress" | "done";
    due_date: string;
    client_id: string;
    employee_id: string;
  }>({
    title: "",
    description: "",
    status: "todo",
    due_date: "",
    client_id: "",
    employee_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
    fetchClients();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить клиентов",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, position")
        .order("name");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сотрудников",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async () => {
    try {
      const { error } = await supabase.from("tasks").insert([
        {
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          due_date: newTask.due_date || null,
          client_id: newTask.client_id || null,
          employee_id: newTask.employee_id || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Задача создана",
      });

      
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        due_date: "",
        client_id: "",
        employee_id: "",
      });
      fetchTasks();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать задачу",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус задачи",
        variant: "destructive",
      });
    }
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "Без клиента";
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Неизвестный клиент";
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return "Не назначен";
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Неизвестный сотрудник";
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) =>
        task.due_date &&
        format(new Date(task.due_date), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd")
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Задачи компании
          </h2>
          <p className="text-muted-foreground mt-1">
            Управляйте задачами с помощью Kanban доски и календаря
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="h-4 w-4 mr-2" />
              Создать задачу
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новая задача</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Название задачи</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newTask.description || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="client">Клиент</Label>
                <Select
                  value={newTask.client_id ?? "no-client"}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, client_id: value === "no-client" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-client">Без клиента</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employee">Сотрудник</Label>
                <Select
                  value={newTask.employee_id ?? "no-employee"}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, employee_id: value === "no-employee" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сотрудника" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-employee">Не назначен</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="due_date">Срок выполнения</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, status: value as "todo" | "in_progress" | "done" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={handleCreateTask} className="w-full">
                Создать задачу
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanban Board */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold">Kanban доска</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Card key={status}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${config.color}`} />
                    <CardTitle className="text-lg">{config.label}</CardTitle>
                    <Badge variant="secondary">
                      {tasks.filter((t) => t.status === status).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <Card
                        key={task.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-medium text-sm mb-2">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {getClientName(task.client_id)}
                            </span>
                            {task.due_date && (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {format(new Date(task.due_date), "dd.MM.yyyy")}
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground">
                            Сотрудник: {getEmployeeName(task.employee_id)}
                          </div>
                        </div>
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            handleUpdateTaskStatus(task.id, value)
                          }
                        >
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, cfg]) => (
                              <SelectItem key={key} value={key}>
                                {cfg.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Календарь задач</h3>
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ru}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Задачи на {format(selectedDate, "dd MMMM yyyy", { locale: ru })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Нет задач на эту дату
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-muted/50 space-y-2"
                      >
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {getClientName(task.client_id)}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`${
                              statusConfig[task.status as keyof typeof statusConfig]
                                .color
                            } text-white border-0`}
                          >
                            {
                              statusConfig[task.status as keyof typeof statusConfig]
                                .label
                            }
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
