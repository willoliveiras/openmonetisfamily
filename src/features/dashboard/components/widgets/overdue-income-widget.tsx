import type { OverdueIncomeData } from "@/features/dashboard/overview/overdue-income-queries";
import { OverdueIncomeWidgetView } from "../overdue-income/overdue-income-widget-view";

type OverdueIncomeWidgetProps = {
	data: OverdueIncomeData;
};

export function OverdueIncomeWidget({ data }: OverdueIncomeWidgetProps) {
	return <OverdueIncomeWidgetView data={data} />;
}
