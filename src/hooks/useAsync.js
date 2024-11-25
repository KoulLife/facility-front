import React, { useReducer, useEffect, useCallback } from 'react';

const initialState = {
    loading: false,
    data: null,
    error: null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                loading: true,
                data: null,
                error: null,
            };
        case 'SUCCESS':
            // console.log('API data:', action.response); // API 응답 확인
            return {
                loading: false,
                data: action.response.data,
                error: null,
            };
        case 'ERROR':
            return {
                loading: false,
                data: null,
                error: action.error,
            };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

//custom hook (useReducer)
export const useAsync = (callback, deps=[], skip=false) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const fetchData = useCallback(async () => {
        dispatch({ type: 'LOADING' });
        try {
            const response = await callback();
            dispatch({ type: 'SUCCESS', response });
        } catch (e) {
            dispatch({ type: 'ERROR', error: e });
        }
    }, [callback, ...deps]);

    useEffect(() => {
        if (skip) return;
        fetchData();
    }, [fetchData]);

    return [state, fetchData];
};
