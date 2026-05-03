"use client";

import { RiCalendarCheckLine, RiLoader4Line } from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	installmentAnticipationsQueryKey,
	useInstallmentAnticipations,
} from "@/features/transactions/hooks/use-installment-anticipations";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/shared/components/ui/empty";
import { useControlledState } from "@/shared/hooks/use-controlled-state";
import { AnticipationCard } from "../../shared/anticipation-card";

interface AnticipationHistoryDialogProps {
	trigger?: React.ReactNode;
	seriesId: string;
	lancamentoName: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onViewLancamento?: (transactionId: string) => void;
}

export function AnticipationHistoryDialog({
	trigger,
	seriesId,
	lancamentoName,
	open,
	onOpenChange,
	onViewLancamento,
}: AnticipationHistoryDialogProps) {
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useControlledState(
		open,
		false,
		onOpenChange,
	);
	const {
		data: anticipations = [],
		isLoading,
		isError,
		refetch,
	} = useInstallmentAnticipations(seriesId, dialogOpen);

	const handleCanceled = () => {
		void queryClient.invalidateQueries({
			queryKey: installmentAnticipationsQueryKey(seriesId),
		});
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="max-w-3xl px-6 py-5 sm:px-8 sm:py-6">
				<DialogHeader>
					<DialogTitle>Histórico de Antecipações</DialogTitle>
					<DialogDescription>{lancamentoName}</DialogDescription>
				</DialogHeader>

				<div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
					{isLoading ? (
						<div className="flex items-center justify-center rounded-lg border border-dashed p-12">
							<RiLoader4Line className="size-6 animate-spin text-muted-foreground" />
							<span className="ml-2 text-sm text-muted-foreground">
								Carregando histórico...
							</span>
						</div>
					) : isError ? (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<RiCalendarCheckLine className="size-6 text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>Não foi possível carregar</EmptyTitle>
								<EmptyDescription>
									O histórico de antecipações não pôde ser carregado agora.
								</EmptyDescription>
							</EmptyHeader>
							<Button
								type="button"
								variant="outline"
								className="mx-auto"
								onClick={() => void refetch()}
							>
								Tentar novamente
							</Button>
						</Empty>
					) : anticipations.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<RiCalendarCheckLine className="size-6 text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>Nenhuma antecipação registrada</EmptyTitle>
								<EmptyDescription>
									As antecipações realizadas para esta compra parcelada
									aparecerão aqui.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						anticipations.map((anticipation) => (
							<AnticipationCard
								key={anticipation.id}
								anticipation={anticipation}
								onViewLancamento={onViewLancamento}
								onCanceled={handleCanceled}
							/>
						))
					)}
				</div>

				{!isLoading && anticipations.length > 0 && (
					<div className="border-t pt-4 text-center text-sm text-muted-foreground">
						{anticipations.length}{" "}
						{anticipations.length === 1
							? "antecipação encontrada"
							: "antecipações encontradas"}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
