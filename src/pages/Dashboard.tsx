import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, CheckCircle2, Clock, DollarSign, FileText } from "lucide-react";

const metrics = [
  {
    title: "Всего клиентов",
    value: "247",
    change: "+12% за месяц",
    icon: Users,
    gradient: "from-primary to-primary/80",
  },
  {
    title: "Активных дел",
    value: "89",
    change: "+8 за неделю",
    icon: FileText,
    gradient: "from-accent to-accent/80",
  },
  {
    title: "Завершено успешно",
    value: "156",
    change: "+23 за месяц",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    title: "В ожидании решения",
    value: "32",
    change: "Средний срок: 45 дней",
    icon: Clock,
    gradient: "from-amber-500 to-amber-600",
  },
  {
    title: "Выручка за месяц",
    value: "₽2.4M",
    change: "+18% к прошлому месяцу",
    icon: DollarSign,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Конверсия продаж",
    value: "68%",
    change: "+5% за квартал",
    icon: TrendingUp,
    gradient: "from-purple-500 to-purple-600",
  },
];

const recentActivity = [
  { client: "Иванов Петр Сергеевич", action: "Подано заявление в суд", time: "2 часа назад" },
  { client: "Петрова Анна Ивановна", action: "Назначено первое заседание", time: "4 часа назад" },
  { client: "Сидоров Михаил Андреевич", action: "Завершена реализация имущества", time: "6 часов назад" },
  { client: "Козлова Елена Владимировна", action: "Новый клиент - консультация", time: "1 день назад" },
  { client: "Морозов Дмитрий Петрович", action: "Получено решение суда", time: "1 день назад" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Обзор</h2>
        <p className="text-muted-foreground mt-1">Основные показатели вашей CRM системы</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.client}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
