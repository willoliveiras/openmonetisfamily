import { RiArrowRightDownLine } from "@remixicon/react";
import type { OverdueIncomeData } from "@/features/dashboard/overview/overdue-income-queries";
import MoneyValues from "@/shared/components/money-values";
import { WidgetEmptyState } from "@/shared/components/widget-empty-state";
import { formatDate } from "@/shared/utils/date";

type OverdueIncomeWidgetViewProps = {
	data: OverdueIncomeData;
};

export function OverdueIncomeWidgetView({
	data,
}: OverdueIncomeWidgetViewProps) {
	if (data.count === 0) {
		return (
			<WidgetEmptyState
				icon={<RiArrowRightDownLine className="size-6 text-muted-foreground" />}
				title="Nenhuma receita em atraso"
				description="Todas as receitas estão em dia ou ainda não possuem vencimento passado."
			/>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between rounded-lg bg-destructive/10 px-3 py-2.5">
				<span className="text-sm font-medium text-destructive">
					{data.count === 1
						? "1 receita em atraso"
						: `${data.count} receitas em atraso`}
				</span>
				<MoneyValues
					className="text-base font-semibold text-destructive"
					amount={data.totalAmount}
				/>
			</div>

			<div className="flex flex-col">
				{data.transactions.map((transaction) => (
					<div
						key={transaction.id}
						className="flex items-center justify-between py-1.5"
					>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-foreground">
								{transaction.name}
							</p>
							<p className="text-xs text-muted-foreground">
								Venc. {formatDate(transaction.dueDate)}
							</p>
						</div>
						<MoneyValues
							className="shrink-0 font-medium"
							amount={transaction.amount}
						/>
					</div>
				))}
				{data.count > data.transactions.length && (
					<p className="mt-1 text-center text-xs text-muted-foreground">
						+{data.count - data.transactions.length} receita(s) não exibida(s)
					</p>
				)}
			</div>
		</div>
	);
}