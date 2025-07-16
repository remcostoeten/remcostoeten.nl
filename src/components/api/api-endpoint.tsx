"use client";

import { useCallback, useEffect, useState } from "react";
import { FadeIn } from "../ui/fade-in";
import { Spinner } from "../ui/spinner";

type TProps<T = unknown> = {
	endpointUrl: string;
	refreshInterval?: number;
	render?: (data: T) => React.ReactNode;
};

type TAPIState<T = unknown> = {
	data: T | null;
	loading: boolean;
	error: string | null;
};

export function APIEndpoint<T = unknown>({
	endpointUrl,
	refreshInterval,
	render,
}: TProps<T>) {
	const [state, setState] = useState<TAPIState<T>>({
		data: null,
		loading: true,
		error: null,
	});

	const fetchData = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			const response = await fetch(endpointUrl);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			setState({
				data,
				loading: false,
				error: null,
			});
		} catch (error) {
			setState({
				data: null,
				loading: false,
				error: error instanceof Error ? error.message : "An error occurred",
			});
		}
	}, [endpointUrl]);

	// Fetch on mount
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Set up interval refresh if specified
	useEffect(() => {
		if (!refreshInterval) return;

		const interval = setInterval(fetchData, refreshInterval);
		return () => clearInterval(interval);
	}, [fetchData, refreshInterval]);

	// Render loading state
	if (state.loading) {
		return (
			<FadeIn>
				<Spinner />
			</FadeIn>
		);
	}

	// Render error state
	if (state.error) {
		return (
			<FadeIn>
				<div className="text-base text-foreground leading-relaxed">
					Error: {state.error}
				</div>
			</FadeIn>
		);
	}

	// Render with custom render function if provided
	if (render) {
		return (
			<FadeIn>
				<div className="text-base text-foreground leading-relaxed">
					{render(state.data)}
				</div>
			</FadeIn>
		);
	}

	// Fallback to JSON pretty print
	return (
		<FadeIn>
			<pre className="text-base text-foreground leading-relaxed">
				{JSON.stringify(state.data, null, 2)}
			</pre>
		</FadeIn>
	);
}
