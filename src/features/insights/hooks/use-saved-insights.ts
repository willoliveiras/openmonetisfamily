"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import type { SavedInsightsRecord } from "@/features/insights/queries";
import { fetchJson } from "@/shared/lib/fetch-json";
import { InsightsResponseSchema } from "@/shared/lib/schemas/insights";

const savedInsightsRecordSchema = z.object({
	insights: InsightsResponseSchema,
	modelId: z.string().min(1),
	createdAt: z.string().min(1),
});

export const savedInsightsQueryKey = (period: string) =>
	["insights", "saved", period] as const;

export function useSavedInsights(period: string) {
	return useQuery({
		queryKey: savedInsightsQueryKey(period),
		queryFn: async () => {
			const params = new URLSearchParams({ period });
			const payload = await fetchJson<SavedInsightsRecord | null>(
				`/api/insights/saved?${params.toString()}`,
			);

			return payload === null ? null : savedInsightsRecordSchema.parse(payload);
		},
		enabled: Boolean(period),
		staleTime: 60_000,
	});
}
