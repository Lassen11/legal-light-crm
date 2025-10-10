import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import ClientDetailDialog from "@/components/ClientDetailDialog";

const careStages = [
  {
    name: "Сбор документов",
    count: 15,
    color: "bg-amber-500",
    progress: 30,
    clients: [
      { id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d", name: "Лебедев Андрей", status: "Документы получены: 60%", daysInStage: 5 },
      { id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e", name: "Медведева Ирина", status: "Документы получены: 40%", daysInStage: 8 },
    ],
  },
  {
    name: "Подготовка заявления",
    count: 12,
    color: "bg-blue-500",
    progress: 45,
    clients: [
      { id: "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f", name: "Новиков Олег", status: "Заявление готово на 80%", daysInStage: 3 },
      { id: "d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a", name: "Орлова Светлана", status: "Заявление готово на 50%", daysInStage: 6 },
    ],
  },
  {
    name: "Подано в суд",
    count: 28,
    color: "bg-indigo-500",
    progress: 60,
    clients: [
      { id: "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b", name: "Павлов Виктор", status: "Ожидание заседания", daysInStage: 12 },
      { id: "f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c", name: "Романова Татьяна", status: "Первое заседание назначено", daysInStage: 18 },
    ],
  },
  {
    name: "Судебные заседания",
    count: 22,
    color: "bg-purple-500",
    progress: 75,
    clients: [
      { id: "a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d", name: "Соколов Евгений", status: "Проведено 2 заседания", daysInStage: 25 },
      { id: "b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e", name: "Титова Юлия", status: "Проведено 3 заседания", daysInStage: 35 },
    ],
  },
  {
    name: "Реализация имущества",
    count: 18,
    color: "bg-pink-500",
    progress: 85,
    clients: [
      { id: "c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f", name: "Ушаков Владимир", status: "Оценка завершена", daysInStage: 40 },
    ],
  },
  {
    name: "Завершено",
    count: 156,
    color: "bg-accent",
    progress: 100,
    clients: [
      { id: "d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a", name: "Фролов Дмитрий", status: "Процедура завершена", daysInStage: 180 },
      { id: "e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b", name: "Чернова Наталья", status: "Процедура завершена", daysInStage: 165 },
    ],
  },
];

export default function ClientCare() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredStages = selectedStage
    ? careStages.filter((stage) => stage.name === selectedStage)
    : careStages;

  const getFilteredClients = (stage: typeof careStages[0]) => {
    if (!searchQuery) return stage.clients;
    return stage.clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setDialogOpen(true);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Воронка заботы о клиентах</h2>
        <p className="text-muted-foreground mt-1">Отслеживайте все этапы процедуры банкротства</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по клиентам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedStage === null ? "default" : "outline"}
          onClick={() => setSelectedStage(null)}
          className="animate-scale-in"
        >
          Все стадии
        </Button>
        {careStages.map((stage, index) => (
          <Button
            key={stage.name}
            variant={selectedStage === stage.name ? "default" : "outline"}
            onClick={() => setSelectedStage(stage.name)}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`h-2 w-2 rounded-full ${stage.color} mr-2`} />
            {stage.name} ({stage.count})
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredStages.map((stage, stageIndex) => {
          const clients = getFilteredClients(stage);
          if (clients.length === 0 && searchQuery) return null;
          
          return (
            <Card key={stage.name} className="transition-all hover:shadow-lg animate-scale-in" style={{ animationDelay: `${stageIndex * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <CardTitle className="text-lg">{stage.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-base font-semibold">
                    {clients.length}
                  </Badge>
                </div>
                <Progress value={stage.progress} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.map((client, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all cursor-pointer animate-fade-in hover-scale"
                      onClick={() => handleClientClick(client.id)}
                      style={{ animationDelay: `${stageIndex * 0.1 + index * 0.05}s` }}
                    >
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.status}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {client.daysInStage} дн.
                    </Badge>
                  </div>
                ))}
                {!searchQuery && stage.count > clients.length && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    +{stage.count - clients.length} клиентов
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>

      <ClientDetailDialog
        clientId={selectedClientId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
