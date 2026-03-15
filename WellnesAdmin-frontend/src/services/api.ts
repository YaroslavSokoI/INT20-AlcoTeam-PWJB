import { FlowNode, FlowEdge, FlowNodeData, NodeType, AnswerOption } from '@/types';

const API_BASE = '/admin/api/admin';

// Reusable fetch wrapper for throwing standard errors
async function fetchAdmin<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `API Error: ${res.status} ${res.statusText}`);
    }
    // 204 No Content has no body
    if (res.status === 204) {
        return {} as T;
    }
    return res.json();
}

/**
 * ──────────────────────────────────────────────────────────────────
 * BACKEND DTO TYPES
 * ──────────────────────────────────────────────────────────────────
 */
export interface BackendNode {
    id: string;
    type: string;
    title: string;
    description?: string;
    question_type?: string;
    options?: Array<{ value: string; label: string; icon?: string }>;
    attribute_key?: string;
    cta_text?: string;
    translations?: Record<string, Record<string, unknown>>;
    pos_x: number;
    pos_y: number;
    is_start: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface BackendEdge {
    id: string;
    source_node_id: string;
    target_node_id: string;
    label?: string;
    conditions?: any; // The complex condition object from BE
    priority: number;
    source_handle?: string | null;
    target_handle?: string | null;
    created_at?: string;
}

export interface BackendOffer {
    id: string;
    type: 'offer';
    title: string;
    description?: string;
    attribute_key?: string;  // slug
    cta_text?: string;
    digital_plan?: string;
    physical_kit?: string;
    why_text?: string;
    offer_conditions?: any;
    offer_priority?: number;
    pos_x?: number;
    pos_y?: number;
    created_at?: string;
}

export interface BackendAdmin {
    id: string;
    login: string;
    role: string;
    status: 'active' | 'suspended';
    created_at: string;
    last_login?: string;
}

/**
 * ──────────────────────────────────────────────────────────────────
 * TRANSFORMERS (BE <-> Frontend React Flow Graph representation)
 * ──────────────────────────────────────────────────────────────────
 */

// We map BackendNode to React Flow's FlowNode. The Admin Backend currently only stores
// question and info formally, but the UI has conditional, delay, offer, result. 
// For now, we adapt BE nodes with UI fallbacks based on type/metadata.
export function mapBackendNodeToFrontend(beNode: BackendNode): FlowNode {
    let uiType: NodeType = beNode.type as NodeType;
    if (!['question', 'info', 'offer', 'conditional'].includes(uiType)) {
        uiType = 'info';
    }

    return {
        id: beNode.id,
        type: uiType,
        position: { x: beNode.pos_x || 0, y: beNode.pos_y || 0 },
        data: {
            label: beNode.title,
            nodeType: uiType,
            questionText: beNode.title,
            content: beNode.description || '',
            answerType: beNode.question_type === 'multi_choice' ? 'multi' : beNode.question_type === 'text_input' ? 'input' : 'single',
            options: (beNode.options || []).map((o, idx) => ({ id: `opt-${idx}`, value: o.value, label: o.label, icon: o.icon })),
            attribute_key: beNode.attribute_key,
            is_start: beNode.is_start,
            offerTitle: beNode.title,
            offerDescription: beNode.description || '',
            ctaText: beNode.cta_text || '',
            translations: beNode.translations || {},
        },
    };
}

export function mapBackendEdgeToFrontend(beEdge: BackendEdge): FlowEdge {
    return {
        id: beEdge.id,
        source: beEdge.source_node_id,
        target: beEdge.target_node_id,
        sourceHandle: beEdge.source_handle ?? null,
        targetHandle: beEdge.target_handle ?? null,
        data: {
            label: beEdge.label || '',
            condition: beEdge.conditions ? JSON.stringify(beEdge.conditions) : '',
            priority: String(beEdge.priority ?? 0),
        },
    };
}

/**
 * ──────────────────────────────────────────────────────────────────
 * API SERVICES
 * ──────────────────────────────────────────────────────────────────
 */

export const apiService = {
    // Graph (DAG)
    async getGraph() {
        const data = await fetchAdmin<{ nodes: BackendNode[]; edges: BackendEdge[] }>('/graph');
        const nodes = data.nodes.map(n => {
            const node = mapBackendNodeToFrontend(n);
            return node;
        });
        return {
            nodes,
            edges: data.edges.map(e => mapBackendEdgeToFrontend(e)),
        };
    },

    // Nodes
    async getNodes() {
        const nodes = await fetchAdmin<BackendNode[]>('/nodes');
        return nodes.map(mapBackendNodeToFrontend);
    },

    async createNode(data: Partial<BackendNode>) {
        return fetchAdmin<BackendNode>('/nodes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateNode(id: string, data: Partial<BackendNode>) {
        return fetchAdmin<BackendNode>(`/nodes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteNode(id: string) {
        return fetchAdmin<void>(`/nodes/${id}`, { method: 'DELETE' });
    },

    // Edges
    async createEdge(data: Partial<BackendEdge>) {
        return fetchAdmin<BackendEdge>('/edges', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateEdge(id: string, data: Partial<BackendEdge>) {
        return fetchAdmin<BackendEdge>(`/edges/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteEdge(id: string) {
        return fetchAdmin<void>(`/edges/${id}`, { method: 'DELETE' });
    },

    // Offers
    async getOffers() {
        return fetchAdmin<BackendOffer[]>('/offers');
    },

    async createOffer(data: Partial<BackendOffer>) {
        return fetchAdmin<BackendOffer>('/offers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateOffer(id: string, data: Partial<BackendOffer>) {
        return fetchAdmin<BackendOffer>(`/offers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteOffer(id: string) {
        return fetchAdmin<void>(`/offers/${id}`, { method: 'DELETE' });
    },

    // Admins
    async getAdmins() {
        return fetchAdmin<BackendAdmin[]>('/admins');
    },

    async createAdmin(data: { login: string; password?: string }) {
        return fetchAdmin<BackendAdmin>('/admins', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateAdmin(id: string, data: { login?: string; password?: string }) {
        return fetchAdmin<BackendAdmin>(`/admins/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteAdmin(id: string) {
        return fetchAdmin<void>(`/admins/${id}`, { method: 'DELETE' });
    },

    async toggleAdminStatus(id: string) {
        return fetchAdmin<BackendAdmin>(`/admins/${id}/toggle-status`, { method: 'PATCH' });
    },

    async login(data: { login: string; password?: string }) {
        return fetchAdmin<BackendAdmin>('/admins/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async publish() {
        return fetchAdmin<{ success: boolean }>('/publish', { method: 'POST' });
    },

    // Analytics
    async getAnalyticsStats(range: string = '30D') {
        return fetchAdmin<AnalyticsStats>(`/analytics/stats?range=${range}`);
    },

    async getOfferStats() {
        return fetchAdmin<{ totalUsers: number; completedUsers: number; acceptedPlans: number }>('/analytics/offer-stats');
    },
};

export interface DropoffItem {
    step: number;
    title: string;
    attributeKey: string | null;
    type: string;
    count: number;
}

export interface ChartItem {
    label: string;
    count: number;
}

export interface AnalyticsStats {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    topGoals: ChartItem[];
    weeklyTrend: { week: string; rate: number }[];
    dropoffs: DropoffItem[];
    devices: ChartItem[];
    sources: ChartItem[];
    languages: ChartItem[];
    ageRange: ChartItem[];
    avgCompletionMin: number | null;
}
