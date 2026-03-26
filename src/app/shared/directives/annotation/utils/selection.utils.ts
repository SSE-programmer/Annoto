import { ANNOTATION_ATTR } from '../constants';


export function isSelectionInsideRoot(range: Range, root: HTMLElement): boolean {
    return root.contains(range.startContainer) && root.contains(range.endContainer);
}

export function selectionIntersectsAnnotation(range: Range, root: HTMLElement): boolean {
    const startAnnotations = getAnnotationIdsAtNode(range.startContainer, root);
    const endAnnotations = getAnnotationIdsAtNode(range.endContainer, root);

    const startOnly = startAnnotations.filter(id => !endAnnotations.includes(id));
    const endOnly = endAnnotations.filter(id => !startAnnotations.includes(id));

    for (const id of startOnly) {
        const span = root.querySelector(`[${ANNOTATION_ATTR}="${id}"]`);

        if (!span) {
            continue;
        }

        if (!rangeFullyContainsNode(range, span)) {
            return true;
        }
    }

    for (const id of endOnly) {
        const span = root.querySelector(`[${ANNOTATION_ATTR}="${id}"]`);

        if (!span) {
            continue;
        }

        if (!rangeFullyContainsNode(range, span)) {
            return true;
        }
    }

    return false;
}

function rangeFullyContainsNode(range: Range, node: Node): boolean {
    const nodeRange = document.createRange();

    nodeRange.selectNodeContents(node);

    return (
        range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0 &&
        range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0
    );
}

function getAnnotationIdsAtNode(node: Node, root: HTMLElement): string[] {
    const ids: string[] = [];
    let current: Node | null = node;

    while (current && current !== root) {
        if (current instanceof HTMLElement && current.hasAttribute(ANNOTATION_ATTR)) {
            ids.push(current.getAttribute(ANNOTATION_ATTR)!);
        }

        current = current.parentNode;
    }

    return ids;
}
