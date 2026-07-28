// ─────────────────────────────────────────────────────────────────────────────
// hooks/useApiCall.ts — Custom Hook for API State Management
// ─────────────────────────────────────────────────────────────────────────────
//
// PURPOSE:
//   Encapsulate the repetitive pattern of:
//     setLoading(true) → call API → setData(response) → setLoading(false)
//                                 → catch error → setError(message)
//
//   Every single page in this dashboard calls an API and needs the same state:
//   loading, data, error, statusCode. Rather than repeating this in every
//   component, we extract it into a reusable hook.
//
// HOW REACT HOOKS WORK (for interviewers):
//   - Hooks are functions that let you "hook into" React state from a function
//   - useState creates reactive state that triggers re-render on change
//   - useCallback memoizes the execute function to prevent infinite re-renders
//   - The hook returns { state, execute, reset } — everything a component needs
//
// USAGE EXAMPLE:
//   const { state, execute } = useApiCall<AuthUser>();
//
//   // Trigger API call:
//   await execute(() => api.post("/api/auth/login", { email, password }));
//
//   // Access state:
//   if (state.loading) return <Spinner />
//   if (state.error) return <Error message={state.error} />
//   return <Success data={state.data} />
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback } from "react";
import { AxiosResponse, AxiosError } from "axios";
import { ApiState, ApiResponse } from "@/lib/types";

// The execute function accepts any function that returns an Axios Promise
type ApiFn<T> = () => Promise<AxiosResponse<ApiResponse<T>>>;

interface UseApiCallReturn<T> {
    state: ApiState<T>;
    execute: (fn: ApiFn<T>) => Promise<void>;
    reset: () => void;
}

const initialState = <T>(): ApiState<T> => ({
    loading: false,
    data: null,
    error: null,
    statusCode: null,
    timestamp: null,
});

export function useApiCall<T = unknown>(): UseApiCallReturn<T> {
    const [state, setState] = useState<ApiState<T>>(initialState<T>());

    // useCallback prevents re-creating this function on every render
    const execute = useCallback(async (fn: ApiFn<T>) => {
        // 1. Reset any previous state and start loading
        setState({
            loading: true,
            data: null,
            error: null,
            statusCode: null,
            timestamp: null,
        });

        try {
            // 2. Execute the API function (passed in by the component)
            const response = await fn();

            // 3. On success, store response data and HTTP status
            setState({
                loading: false,
                data: response.data,
                error: null,
                statusCode: response.status,
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            // 4. Axios wraps HTTP errors — extract the response if available
            const axiosError = err as AxiosError<ApiResponse<T>>;

            setState({
                loading: false,
                data: axiosError.response?.data || null,
                error:
                    axiosError.response?.data?.message ||
                    axiosError.message ||
                    "An unexpected error occurred",
                statusCode: axiosError.response?.status || null,
                timestamp: new Date().toISOString(),
            });
        }
    }, []);
    // reset clears state back to initial (useful after logout, etc.)
    const reset = useCallback(() => {
        setState(initialState<T>());
    }, []);

    return { state, execute, reset };
}
