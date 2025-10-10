import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { ExternalLink, Mail, Phone, MapPin, CreditCard, Home, User } from "lucide-react";

type Client = Database["public"]["Tables"]["clients"]["Row"];

interface ClientDetailDialogProps {
  clientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  "Новый": "bg-blue-500",
  "Активный": "bg-purple-500",
  "В суде": "bg-amber-500",
  "Завершен": "bg-accent",
};

export default function ClientDetailDialog({
  clientId,
  open,
  onOpenChange,
}: ClientDetailDialogProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (clientId && open) {
      fetchClient();
    }
  }, [clientId, open]);

  const fetchClient = async () => {
    if (!clientId) return;
    
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error: any) {
      console.error("Error fetching client:", error);
      setClient(null);
      const message = error?.code === "PGRST116" ? "Клиент не найден" : "Не удалось загрузить данные клиента";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullDetails = () => {
    if (client) {
      navigate(`/clients/${client.id}`);
      onOpenChange(false);
    }
  };

  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                {loading ? "Загрузка..." : client?.name}
              </DialogTitle>
              {client && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={`${statusColors[client.status]} text-white border-0`}
                  >
                    {client.status}
                  </Badge>
                  <Badge variant="outline">{client.stage}</Badge>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFullDetails}
              className="ml-4"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Полная карточка
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Загрузка данных клиента...
          </div>
        ) : client ? (
          <div className="space-y-6 py-4">
            {/* Контактная информация */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Контактная информация
              </h3>
              <div className="grid gap-3 pl-7">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Телефон:</span>
                  <span className="font-medium">{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{client.email}</span>
                </div>
                {client.city && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Город:</span>
                    <span className="font-medium">{client.city}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Информация о долге */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Информация о долге
              </h3>
              <div className="grid gap-3 pl-7">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground min-w-[140px]">Сумма долга:</span>
                  <span className="font-medium">
                    {client.debt_amount.toLocaleString()} ₽
                  </span>
                </div>
                {client.creditor_name && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground min-w-[140px]">Кредитор:</span>
                    <span className="font-medium">{client.creditor_name}</span>
                  </div>
                )}
                {client.overdue_payments && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground min-w-[140px]">Просрочки:</span>
                    <span className="font-medium">{client.overdue_payments}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground min-w-[140px]">Мин. платежи:</span>
                  <Badge variant={client.minimum_payments_made ? "default" : "secondary"}>
                    {client.minimum_payments_made ? "Да" : "Нет"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Имущество */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Home className="h-5 w-5" />
                Имущество
              </h3>
              <div className="grid gap-3 pl-7">
                {client.property_value !== null && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground min-w-[200px]">Стоимость имущества:</span>
                    <span className="font-medium">
                      {client.property_value.toLocaleString()} ₽
                    </span>
                  </div>
                )}
                {client.spouse_property_value !== null && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground min-w-[200px]">
                      Имущество супруга:
                    </span>
                    <span className="font-medium">
                      {client.spouse_property_value.toLocaleString()} ₽
                    </span>
                  </div>
                )}
                {client.marital_status && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground min-w-[200px]">
                      Семейное положение:
                    </span>
                    <span className="font-medium">{client.marital_status}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Финансовая информация */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Финансовая информация</h3>
              <div className="grid grid-cols-2 gap-3 pl-7">
                {client.official_income !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground block mb-1">Официальный доход:</span>
                    <span className="font-medium">
                      {client.official_income.toLocaleString()} ₽
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground block mb-1">Получает пособия:</span>
                  <Badge variant={client.receives_benefits ? "default" : "secondary"}>
                    {client.receives_benefits ? "Да" : "Нет"}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground block mb-1">Банковские вклады:</span>
                  <Badge variant={client.has_bank_deposits ? "default" : "secondary"}>
                    {client.has_bank_deposits ? "Да" : "Нет"}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground block mb-1">ИП/Директор:</span>
                  <Badge variant={client.is_ceo_or_ip ? "default" : "secondary"}>
                    {client.is_ceo_or_ip ? "Да" : "Нет"}
                  </Badge>
                </div>
              </div>
            </div>

            {client.comments && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Комментарии</h3>
                  <p className="text-sm text-muted-foreground pl-7">{client.comments}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{errorMsg ?? "Клиент не найден или отсутствует в базе."}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
