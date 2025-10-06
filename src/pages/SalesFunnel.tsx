import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const funnelStages = [
  {
    name: "Лиды",
    count: 45,
    clients: [
      { name: "Антонов Сергей", phone: "+7 (999) 123-45-67", source: "Сайт" },
      { name: "Белова Ольга", phone: "+7 (999) 234-56-78", source: "Реклама" },
      { name: "Васильев Игорь", phone: "+7 (999) 345-67-89", source: "Рекомендация" },
    ],
    color: "bg-blue-500",
  },
  {
    name: "Консультация",
    count: 28,
    clients: [
      { name: "Григорьев Павел", phone: "+7 (999) 456-78-90", source: "Сайт" },
      { name: "Дмитриева Анна", phone: "+7 (999) 567-89-01", source: "Звонок" },
    ],
    color: "bg-cyan-500",
  },
  {
    name: "Предложение",
    count: 18,
    clients: [
      { name: "Егоров Максим", phone: "+7 (999) 678-90-12", source: "Реклама" },
      { name: "Федорова Мария", phone: "+7 (999) 789-01-23", source: "Сайт" },
    ],
    color: "bg-indigo-500",
  },
  {
    name: "Договор",
    count: 12,
    clients: [
      { name: "Зайцев Артем", phone: "+7 (999) 890-12-34", source: "Рекомендация" },
    ],
    color: "bg-purple-500",
  },
  {
    name: "Клиент",
    count: 89,
    clients: [
      { name: "Иванов Петр", phone: "+7 (999) 901-23-45", source: "Сайт" },
      { name: "Козлова Елена", phone: "+7 (999) 012-34-56", source: "Реклама" },
    ],
    color: "bg-accent",
  },
];

export default function SalesFunnel() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Воронка продаж</h2>
        <p className="text-muted-foreground mt-1">Отслеживайте путь клиента от лида до заключения договора</p>
      </div>

      <div className="grid gap-4">
        {funnelStages.map((stage, index) => (
          <Card key={stage.name} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                  <CardTitle className="text-lg">{stage.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-base font-semibold">
                  {stage.count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stage.clients.map((client, clientIndex) => (
                  <div
                    key={clientIndex}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate("/clients")}
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                    <Badge variant="outline">{client.source}</Badge>
                  </div>
                ))}
                {stage.count > stage.clients.length && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    +{stage.count - stage.clients.length} ещё
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
