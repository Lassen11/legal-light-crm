import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const clients = [
  {
    id: 1,
    name: "Иванов Петр Сергеевич",
    phone: "+7 (999) 123-45-67",
    email: "ivanov@mail.ru",
    status: "В суде",
    stage: "Судебные заседания",
    startDate: "15.01.2024",
    debt: "₽850,000",
  },
  {
    id: 2,
    name: "Петрова Анна Ивановна",
    phone: "+7 (999) 234-56-78",
    email: "petrova@gmail.com",
    status: "Активный",
    stage: "Подготовка заявления",
    startDate: "22.02.2024",
    debt: "₽1,200,000",
  },
  {
    id: 3,
    name: "Сидоров Михаил Андреевич",
    phone: "+7 (999) 345-67-89",
    email: "sidorov@yandex.ru",
    status: "Завершен",
    stage: "Завершено",
    startDate: "10.09.2023",
    debt: "₽650,000",
  },
  {
    id: 4,
    name: "Козлова Елена Владимировна",
    phone: "+7 (999) 456-78-90",
    email: "kozlova@mail.ru",
    status: "Новый",
    stage: "Сбор документов",
    startDate: "05.03.2024",
    debt: "₽920,000",
  },
  {
    id: 5,
    name: "Морозов Дмитрий Петрович",
    phone: "+7 (999) 567-89-01",
    email: "morozov@gmail.com",
    status: "Активный",
    stage: "Реализация имущества",
    startDate: "18.11.2023",
    debt: "₽1,450,000",
  },
];

const statusColors: Record<string, string> = {
  "Новый": "bg-blue-500",
  "Активный": "bg-purple-500",
  "В суде": "bg-amber-500",
  "Завершен": "bg-accent",
};

export default function Clients() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Все клиенты</h2>
          <p className="text-muted-foreground mt-1">Полный список клиентов и их текущий статус</p>
        </div>
        <Button>Добавить клиента</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск по имени, телефону или email..." className="pl-10" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
              {clients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
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
                    {client.startDate}
                  </TableCell>
                  <TableCell className="text-right font-medium">{client.debt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Показано 5 из 247 клиентов</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Предыдущая</Button>
          <Button variant="outline" size="sm">Следующая</Button>
        </div>
      </div>
    </div>
  );
}
