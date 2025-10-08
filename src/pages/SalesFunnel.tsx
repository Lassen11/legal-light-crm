import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import ClientDetailDialog from "@/components/ClientDetailDialog";

const funnelStages = [
  {
    name: "Лиды",
    count: 45,
    clients: [
      { id: "1", name: "Антонов Сергей", phone: "+7 (999) 123-45-67", source: "Сайт" },
      { id: "2", name: "Белова Ольга", phone: "+7 (999) 234-56-78", source: "Реклама" },
      { id: "3", name: "Васильев Игорь", phone: "+7 (999) 345-67-89", source: "Рекомендация" },
    ],
    color: "bg-blue-500",
  },
  {
    name: "Консультация",
    count: 28,
    clients: [
      { id: "4", name: "Григорьев Павел", phone: "+7 (999) 456-78-90", source: "Сайт" },
      { id: "5", name: "Дмитриева Анна", phone: "+7 (999) 567-89-01", source: "Звонок" },
    ],
    color: "bg-cyan-500",
  },
  {
    name: "Предложение",
    count: 18,
    clients: [
      { id: "6", name: "Егоров Максим", phone: "+7 (999) 678-90-12", source: "Реклама" },
      { id: "7", name: "Федорова Мария", phone: "+7 (999) 789-01-23", source: "Сайт" },
    ],
    color: "bg-indigo-500",
  },
  {
    name: "Договор",
    count: 12,
    clients: [
      { id: "8", name: "Зайцев Артем", phone: "+7 (999) 890-12-34", source: "Рекомендация" },
    ],
    color: "bg-purple-500",
  },
  {
    name: "Клиент",
    count: 89,
    clients: [
      { id: "9", name: "Иванов Петр", phone: "+7 (999) 901-23-45", source: "Сайт" },
      { id: "10", name: "Козлова Елена", phone: "+7 (999) 012-34-56", source: "Реклама" },
    ],
    color: "bg-accent",
  },
];

export default function SalesFunnel() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const filteredStages = selectedStage
    ? funnelStages.filter((stage) => stage.name === selectedStage)
    : funnelStages;

  const getFilteredClients = (stage: typeof funnelStages[0]) => {
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
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Воронка продаж</h2>
        <p className="text-muted-foreground mt-1">Отслеживайте путь клиента от лида до заключения договора</p>
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
        {funnelStages.map((stage, index) => (
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
        {filteredStages.map((stage, index) => {
          const clients = getFilteredClients(stage);
          if (clients.length === 0 && searchQuery) return null;
          
          return (
            <Card key={stage.name} className="transition-all hover:shadow-lg animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <CardTitle className="text-lg">{stage.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-base font-semibold">
                    {clients.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.map((client, clientIndex) => (
                    <div
                      key={clientIndex}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all cursor-pointer animate-fade-in hover-scale"
                      onClick={() => handleClientClick(client.id)}
                      style={{ animationDelay: `${index * 0.1 + clientIndex * 0.05}s` }}
                    >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                    <Badge variant="outline">{client.source}</Badge>
                  </div>
                ))}
                {!searchQuery && stage.count > clients.length && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    +{stage.count - clients.length} ещё
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
