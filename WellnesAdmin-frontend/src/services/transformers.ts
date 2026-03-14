import { FlowNode, FlowEdge, FlowNodeData, NodeType } from '@/types';
import { BackendNode, BackendEdge } from '@/services/api';

export function mapFrontendNodeToBackend(node: FlowNode): Partial<BackendNode> {
    const isQuestion = node.type === 'question';
    const isOffer = node.type === 'offer';
    return {
        type: node.type,
        title: node.data.label,
        description: isOffer
            ? (node.data.offerDescription as string) || ''
            : (node.data.content as string) || '',
        question_type: isQuestion
            ? (node.data.answerType === 'multi' ? 'multi_choice'
                : node.data.answerType === 'input' ? 'text_input'
                    : 'single_choice')
            : undefined,
        options: isQuestion && node.data.options
            ? node.data.options.map(o => ({ value: o.value, label: o.label }))
            : undefined,
        attribute_key: (node.data.attribute_key as string) || undefined,
        cta_text: isOffer ? ((node.data.ctaText as string) || undefined) : undefined,
        pos_x: Math.round(node.position.x),
        pos_y: Math.round(node.position.y),
        is_start: !!node.data.is_start,
    };
}

export function mapFrontendEdgeToBackend(edge: FlowEdge): Partial<BackendEdge> {
    let conditions = null;
    if (edge.data?.condition) {
        try {
            conditions = JSON.parse(edge.data.condition);
        } catch (e) {
            // ignore
        }
    }
    return {
        source_node_id: edge.source,
        target_node_id: edge.target,
        label: edge.label || '',
        conditions,
        priority: parseInt(((edge.data as any)?.priority as string) || '0', 10),
        source_handle: edge.sourceHandle ?? null,
        target_handle: edge.targetHandle ?? null,
    };
}
