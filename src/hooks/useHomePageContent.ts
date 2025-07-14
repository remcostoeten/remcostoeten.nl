import { useQuery } from "@tanstack/react-query";
import { HomePageResponseSchema, type THomePageResponse } from "@/lib/cms/types";

type TUseHomePageContentReturn = {
	data: THomePageResponse | undefined;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
};

export function useHomePageContent(): TUseHomePageContentReturn {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["home-page-content"],
		queryFn: async (): Promise<THomePageResponse> => {
			try {
				const response = await fetch("/api/cms/home");
				
				if (!response.ok) {
					const errorMessage = `CMS API error! status: ${response.status}`;
					console.error(errorMessage, { status: response.status, statusText: response.statusText });
					throw new Error(errorMessage);
				}

				const jsonData = await response.json();
				
				const validatedData = HomePageResponseSchema.safeParse(jsonData);
				
				if (!validatedData.success) {
					const errorMessage = "Invalid response format from CMS server";
					console.error(errorMessage, { errors: validatedData.error.errors, receivedData: jsonData });
					throw new Error(errorMessage);
				}

				return validatedData.data;
			} catch (fetchError) {
				if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
					const networkError = "CMS is currently unreachable. Please check your connection.";
					console.error(networkError, fetchError);
					throw new Error(networkError);
				}
				throw fetchError;
			}
		},
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: (failureCount, error) => {
			if (error.message.includes('unreachable')) {
				return failureCount < 2;
			}
			return failureCount < 1;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	return {
		data,
		isLoading,
		isError,
		error,
	};
}
