import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import ClientDetailDialog from "@/components/ClientDetailDialog";

type Client = Database["public"]["Tables"]["clients"]["Row"];

const caseStages = [
  { value: "Сбор документов", label: "Сбор документов", color: "bg-blue-500" },
  { value: "Подготовка заявления", label: "Подготовка заявления", color: "bg-cyan-500" },
  { value: "Подано в суд", label: "Подано в суд", color: "bg-indigo-500" },
  { value: "Судебные заседания", label: "Судебные заседания", color: "bg-purple-500" },
  { value: "Реализация имущества", label: "Реализация имущества", color: "bg-pink-500" },
  { value: "Завершено", label: "Завершено", color: "bg-accent" },
];

export default function CaseWork() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, selectedStage, searchQuery]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

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

  const filterClients = () => {
    let filtered = clients;

    if (selectedStage !== "all") {
      filtered = filtered.filter((client) => client.stage === selectedStage);
    }

    if (searchQuery) {
      filtered = filtered.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  };

  const handleStageUpdate = async (clientId: string, newStage: string) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({ stage: newStage })
        .eq("id", clientId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Стадия делопроизводства обновлена",
      });

      fetchClients();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить стадию",
        variant: "destructive",
      });
    }
  };

  const getStageColor = (stage: string) => {
    const stageConfig = caseStages.find((s) => s.value === stage);
    return stageConfig?.color || "bg-gray-500";
  };

  const getClientsByStage = (stage: string) => {
    return clients.filter((client) => client.stage === stage);
  };

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setClientDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Делопроизводство
          </h2>
          <p className="text-muted-foreground mt-1">
            Управление делами банкротства физических лиц
          </p>
        </div>
        <Button onClick={() => navigate("/clients")} className="hover-scale">
          <Plus className="h-4 w-4 mr-2" />
          Добавить клиента
        </Button>
      </div>

      {/* Фильтры */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Поиск по имени</Label>
              <Input
                placeholder="Введите имя клиента..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label>Стадия</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все стадии</SelectItem>
                  {caseStages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика по стадиям */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {caseStages.map((stage, index) => (
          <Card
            key={stage.value}
            className="cursor-pointer hover:shadow-lg transition-all hover-scale animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedStage(stage.value)}
          >
            <CardContent className="p-4 text-center">
              <div className={`h-3 w-3 rounded-full ${stage.color} mx-auto mb-2`} />
              <p className="text-sm font-medium mb-1">{stage.label}</p>
              <Badge variant="secondary" className="text-lg font-bold">
                {getClientsByStage(stage.value).length}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Список клиентов */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle>
            Клиенты{" "}
            <Badge variant="secondary" className="ml-2">
              {filteredClients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredClients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Клиенты не найдены
              </p>
            ) : (
              filteredClients.map((client, index) => (
                <Card
                  key={client.id}
                  className="p-4 hover:shadow-md transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleClientClick(client.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <Badge
                          className={`${getStageColor(client.stage)} text-white border-0`}
                        >
                          {client.stage}
                        </Badge>
                        <Badge variant="outline">{client.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Телефон:</span> {client.phone}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {client.email}
                        </div>
                        <div>
                          <span className="font-medium">Сумма долга:</span>{" "}
                          {client.debt_amount.toLocaleString()} ₽
                        </div>
                      </div>
                      {client.comments && (
                        <p className="text-sm text-muted-foreground italic">
                          {client.comments}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="hover-scale">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Изменить стадию</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Новая стадия</Label>
                              <Select
                                defaultValue={client.stage}
                                onValueChange={(value) =>
                                  handleStageUpdate(client.id, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {caseStages.map((stage) => (
                                    <SelectItem key={stage.value} value={stage.value}>
                                      {stage.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="hover-scale"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ClientDetailDialog
        clientId={selectedClientId}
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
      />
    </div>
  );
}
