import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import ClientDetailDialog from "@/components/ClientDetailDialog";

export default function ClientCare() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Воронка заботы будет отображаться после добавления клиентов
          </p>
        </CardContent>
      </Card>

      <ClientDetailDialog
        clientId={selectedClientId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
