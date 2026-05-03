import { and, asc, eq, isNotNull, isNull, lt, or } from "drizzle-orm";
import { transactions } from "@/db/schema";
import { excludeAutoInvoiceEntries } from "@/features/dashboard/transaction-filters";
import { db } from "@/shared/lib/db";
import { getAdminPayerId } from "@/shared/lib/payers/get-admin-id";
import { getBusinessDateString } from "@/shared/utils/date";
import { safeToNumber } from "@/shared/utils/number";

const TRANSACTION_TYPE_INCOME = "Receita";

export type OverdueIncomeTransaction = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  period: string;
};

export type OverdueIncomeData = {
  totalAmount: number;
  count: number;
  transactions: OverdueIncomeTransaction[];
};

const EMPTY_DATA: OverdueIncomeData = {
  totalAmount: 0,
  count: 0,
  transactions: [],
};

export async function fetchOverdueIncomeData(
  userId: string,
): Promise<OverdueIncomeData> {
  const adminPayerId = await getAdminPayerId(userId);
  if (!adminPayerId) return EMPTY_DATA;

  const today = getBusinessDateString();

  const rows = await db
    .select({
      id: transactions.id,
      name: transactions.name,
      amount: transactions.amount,
      dueDate: transactions.dueDate,
      period: transactions.period,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.payerId, adminPayerId),
        eq(transactions.transactionType, TRANSACTION_TYPE_INCOME),
        or(isNull(transactions.isSettled), eq(transactions.isSettled, false)),
        isNotNull(transactions.dueDate),
        lt(transactions.dueDate, new Date(today)),
        excludeAutoInvoiceEntries(),  // ← filtro via helper compartilhado
      ),
    )
    .orderBy(asc(transactions.dueDate), asc(transactions.name));

  if (rows.length === 0) return EMPTY_DATA;

  let totalAmount = 0;
  const overdueTransactions: OverdueIncomeTransaction[] = [];

  for (const row of rows) {
    const amount = safeToNumber(row.amount);
    totalAmount += amount;

    if (overdueTransactions.length < 10) {
      overdueTransactions.push({
        id: row.id,
        name: row.name,
        amount,
        dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : today,
        period: row.period,
      });
    }
  }

  return {
    totalAmount,
    count: rows.length,
    transactions: overdueTransactions,
  };
}