import { IEdge, INode } from "../types/types";

function getOrderedUniqueNodes(edges: IEdge[]): string[] {
    if (edges.length === 0) return [];

    const targetNodes = new Set(edges.map(edge => edge.target));
    const sourceToEdge = new Map(edges.map(edge => [edge.source, edge]));
  
    const startNode = edges.find(edge => !targetNodes.has(edge.source))?.source;

    if (!startNode) {
        const allNodes = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)]);
        return Array.from(allNodes);
    }

    const result: string[] = [startNode];
    let current = startNode;
  
    while (sourceToEdge.has(current)) {
        current = sourceToEdge.get(current)!.target;
        if (result.includes(current)) break;
        result.push(current);
    }

    return result;
}

export const parseDocumentContent = (content: string) => {
    try {
        const contentObj = JSON.parse(content);

        const edges = contentObj.edges as IEdge[];
        const nodes = contentObj.nodes as INode[];

        if (!edges) {
            throw new Error(`Process edges are required!`);
        }

        if (!nodes) {
            throw new Error(`Process edges are required!`);
        }

        const executeOrder = getOrderedUniqueNodes(edges);

        if (!executeOrder.length) {
            throw new Error(`Process ordering error...`)
        }

        let result = [] as INode[]

        for (let node of executeOrder) {
            const nodeObj = nodes.find(n => n.id == node);
            if (nodeObj) {
                result.push(nodeObj);
            }
        }

        return result
    } catch (e) {
        console.log(e);
        return [];
    }
}