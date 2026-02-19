const API_BASE = '/api/stos';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const stoApi = {
    getStats: async () => {
        const response = await fetch(`${API_BASE}`);
        return handleResponse(response);
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE}`);
        return handleResponse(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`);
        return handleResponse(response);
    },

    create: async (data) => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    search: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/material-search?${query}`);
        return handleResponse(response);
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },

    updateItemQuantity: async (stoId, itemId, quantity) => {
        const response = await fetch(`${API_BASE}/${stoId}/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity_mtr: quantity }),
        });
        return handleResponse(response);
    }
};
