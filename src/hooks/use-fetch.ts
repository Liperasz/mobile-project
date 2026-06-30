import { useState, useEffect, useCallback } from 'react';

type UseFetchState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

type UseFetchReturn<T> = UseFetchState<T> & {
    refetch: () => Promise<void>;
};

// hook genérico para chamadas assíncronas de API
export function useFetch<T>(
    fetchFunction: () => Promise<T>,
    dependencies: unknown[] = []
): UseFetchReturn<T> {
    const [state, setState] = useState<UseFetchState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async (): Promise<void> => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const result = await fetchFunction();
            setState({ data: result, loading: false, error: null });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setState({ data: null, loading: false, error: errorMessage });
        }
    }, dependencies);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        ...state,
        refetch: fetchData,
    };
}
