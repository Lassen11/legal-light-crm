import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

const careStages = [
  {
    name: "Сбор документов",
    count: 15,
    color: "bg-amber-500",
    progress: 30,
    clients: [
      { name: "Лебедев Андрей", status: "Документы получены: 60%", daysInStage: 5 },
      { name: "Медведева Ирина", status: "Документы получены: 40%", daysInStage: 8 },
    ],
  },
  {
    name: "Подготовка заявления",
    count: 12,
    color: "bg-blue-500",
    progress: 45,
    clients: [
      { name: "Новиков Олег", status: "Заявление готово на 80%", daysInStage: 3 },
      { name: "Орлова Светлана", status: "Заявление готово на 50%", daysInStage: 6 },
    ],
  },
  {
    name: "Подано в суд",
    count: 28,
    color: "bg-indigo-500",
    progress: 60,
    clients: [
      { name: "Павлов Виктор", status: "Ожидание заседания", daysInStage: 12 },
      { name: "Романова Татьяна", status: "Первое заседание назначено", daysInStage: 18 },
    ],
  },
  {
    name: "Судебные заседания",
    count: 22,
    color: "bg-purple-500",
    progress: 75,
    clients: [
      { name: "Соколов Евгений", status: "Проведено 2 заседания", daysInStage: 25 },
      { name: "Титова Юлия", status: "Проведено 3 заседания", daysInStage: 35 },
    ],
  },
  {
    name: "Реализация имущества",
    count: 18,
    color: "bg-pink-500",
    progress: 85,
    clients: [
      { name: "Ушаков Владимир", status: "Оценка завершена", daysInStage: 40 },
    ],
  },
  {
    name: "Завершено",
    count: 156,
    color: "bg-accent",
    progress: 100,
    clients: [
      { name: "Фролов Дмитрий", status: "Процедура завершена", daysInStage: 180 },
      { name: "Чернова Наталья", status: "Процедура завершена", daysInStage: 165 },
    ],
  },
];

export default function ClientCare() {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStages = selectedStage
    ? careStages.filter((stage) => stage.name === selectedStage)
    : careStages;

  const getFilteredClients = (stage: typeof careStages[0]) => {
    if (!searchQuery) return stage.clients;
    return stage.clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
                    onClick={() => navigate("/clients")}
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
    </div>
  );
}
