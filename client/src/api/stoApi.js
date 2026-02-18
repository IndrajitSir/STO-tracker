const API_BASE = '/api/stos';

export const stoApi = {
    getStats: async () => {
        // Optional: get some summary stats if available
        const response = await fetch(`${API_BASE}`);
        return response.json();
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE}`);
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`);
        return response.json();
    },

    create: async (data) => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    search: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/material-search?${query}`);
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    }
};
