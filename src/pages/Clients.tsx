import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Filter, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];

const statusColors: Record<string, string> = {
  "Новый": "bg-blue-500",
  "Активный": "bg-purple-500",
  "В суде": "bg-amber-500",
  "Завершен": "bg-accent",
};

export default function Clients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    debt_amount: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const search = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ru-RU");
  };

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.phone || !newClient.email || !newClient.debt_amount) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("clients").insert([
        {
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email,
          debt_amount: parseFloat(newClient.debt_amount),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Клиент добавлен",
      });

      setIsDialogOpen(false);
      setNewClient({ name: "", phone: "", email: "", debt_amount: "" });
      fetchClients();
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить клиента",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Все клиенты</h2>
          <p className="text-muted-foreground mt-1">Полный список клиентов и их текущий статус</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Добавить клиента
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Новый клиент</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client_name">ФИО *</Label>
                <Input
                  id="client_name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <Label htmlFor="client_phone">Телефон *</Label>
                <Input
                  id="client_phone"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div>
                <Label htmlFor="client_email">Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  placeholder="example@mail.ru"
                />
              </div>
              <div>
                <Label htmlFor="client_debt">Сумма долга (₽) *</Label>
                <Input
                  id="client_debt"
                  type="number"
                  value={newClient.debt_amount}
                  onChange={(e) =>
                    setNewClient({ ...newClient, debt_amount: e.target.value })
                  }
                  placeholder="500000"
                />
              </div>
              <Button onClick={handleCreateClient} className="w-full">
                Создать клиента
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="animate-scale-in">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, телефону или email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="hover-scale">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Этап</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата начала</TableHead>
                  <TableHead className="text-right">Сумма долга</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, index) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50 transition-all animate-fade-in"
                    onClick={() => navigate(`/clients/${client.id}`)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{client.phone}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{client.stage}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[client.status]} text-white border-0`}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(client.start_date)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(client.debt_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Показано {filteredClients.length} клиентов</p>
      </div>
    </div>
  );
}
