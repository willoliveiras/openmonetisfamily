"use client";

import { useEffect, useState } from "react";
import { RiAlertFill, RiMoneyDollarCircleFill, RiCalendar2Fill } from "@remixicon/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import MoneyValues from "@/shared/components/money-values";

interface OverdueIncome {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string | null;
}

export function OverdueIncomes() {
  const [overdue, setOverdue] = useState<OverdueIncome[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverdue() {
      try {
        const response = await fetch("/api/transactions/overdue-incomes");
        if (!response.ok) throw new Error("Erro ao carregar");
        const data = await response.json();
        setOverdue(data);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOverdue();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receitas Atrasadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (overdue.length === 0) {
    return null;
  }

  const totalAmount = overdue.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiAlertFill className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-700">Receitas Atrasadas</CardTitle>
          </div>
          <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-md">
            {overdue.length} pendente(s)
          </span>
        </div>
        <CardDescription>
          Total atrasado: <MoneyValues value={totalAmount} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {overdue.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between p-3 rounded-lg border border-red-100 hover:bg-red-50/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{income.description}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <RiCalendar2Fill className="h-3 w-3" />
                    Venceu: {new Date(income.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                  {income.category && (
                    <span>{income.category}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">
                  <MoneyValues value={income.amount} />
                </p>
                <a
                  href={`/transactions/${income.id}`}
                  className="text-xs text-red-600 hover:text-red-800 inline-block mt-1"
                >
                  Registrar pagamento →
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}