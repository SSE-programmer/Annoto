import { IAnnotation } from '../models/annotation.model';
import { resolveNodePath, getNodePath } from './dom-path.utils';
import { ANNOTATION_ATTR, ANNOTATION_CLASS } from '../constants';


export function renderAnnotations(annotations: IAnnotation[], root: HTMLElement): void {
    clearAnnotationSpans(root);

    const resolved = annotations
        .map(annotation => {
            const startNode = resolveNodePath(annotation.startPath, root);
            const endNode = resolveNodePath(annotation.endPath, root);

            if (!startNode || !endNode) {
                return null;
            }

            const startChar = nodeOffsetToCharOffset(startNode, annotation.startOffset, root);
            const endChar = nodeOffsetToCharOffset(endNode, annotation.endOffset, root);

            if (startChar === -1 || endChar === -1 || startChar >= endChar) {
                return null;
            }

            return { annotation, startChar, endChar };
        })
        .filter((item)=> item !== null);

    resolved.sort((a, b) =>
        a.startChar - b.startChar || (b.endChar - b.startChar) - (a.endChar - a.startChar),
    );

    for (const { annotation, startChar, endChar } of resolved) {
        const startPos = charOffsetToNodeOffset(startChar, root);
        const endPos = charOffsetToNodeOffset(endChar, root);

        if (!startPos || !endPos) {
            continue;
        }

        try {
            const range = document.createRange();

            range.setStart(startPos.node, startPos.offset);
            range.setEnd(endPos.node, endPos.offset);
            wrapRangeWithAnnotation(range, annotation);
        } catch {
            // Невалидные границы Range — пропускаем и не отрисовываем
        }
    }
}

export function clearAnnotationSpans(root: HTMLElement): void {
    const spans = root.querySelectorAll(`[${ANNOTATION_ATTR}]`);

    for (let i = spans.length - 1; i >= 0; i--) {
        const span = spans[i] as HTMLElement;
        const parent = span.parentNode;

        if (!parent) {
            continue;
        }

        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }

        parent.removeChild(span);
    }

    root.normalize();
}

function wrapRangeWithAnnotation(range: Range, annotation: IAnnotation): void {
    const textNodes = getTextNodesInRange(range);

    for (const textNode of textNodes) {
        const parent = textNode.parentNode;

        if (!parent) {
            continue;
        }

        let start = 0;
        let end = textNode.textContent?.length ?? 0;

        if (textNode === range.startContainer) {
            start = range.startOffset;
        }

        if (textNode === range.endContainer) {
            end = range.endOffset;
        }

        if (start === end) {
            continue;
        }

        const span = document.createElement('span');

        span.setAttribute(ANNOTATION_ATTR, annotation.id);
        span.classList.add(ANNOTATION_CLASS);
        span.style.backgroundColor = hexToRgba(annotation.color, 0.2);
        span.style.borderBottom = `2px solid ${annotation.color}`;

        if (start === 0 && end === (textNode.textContent?.length ?? 0)) {
            parent.replaceChild(span, textNode);
            span.appendChild(textNode);
        } else {
            const before = textNode.textContent!.substring(0, start);
            const middle = textNode.textContent!.substring(start, end);
            const after = textNode.textContent!.substring(end);

            const fragment = document.createDocumentFragment();

            if (before) {
                fragment.appendChild(document.createTextNode(before));
            }

            span.appendChild(document.createTextNode(middle));
            fragment.appendChild(span);

            if (after) {
                fragment.appendChild(document.createTextNode(after));
            }

            parent.replaceChild(fragment, textNode);
        }
    }
}

function getTextNodesInRange(range: Range): Text[] {
    const ancestor = range.commonAncestorContainer;

    if (ancestor.nodeType === Node.TEXT_NODE) {
        return [ancestor as Text];
    }

    const nodes: Text[] = [];
    const walker = document.createTreeWalker(ancestor, NodeFilter.SHOW_TEXT);

    let node = walker.nextNode();

    while (node) {
        if (range.intersectsNode(node)) {
            nodes.push(node as Text);
        }

        node = walker.nextNode();
    }

    return nodes;
}

function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace('#', '');

    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rangeToCharOffsets(range: Range, root: HTMLElement): { start: number; end: number } | null {
    const start = nodeOffsetToCharOffset(range.startContainer, range.startOffset, root);
    const end = nodeOffsetToCharOffset(range.endContainer, range.endOffset, root);

    if (start === -1 || end === -1) {
        return null;
    }

    return { start, end };
}

export function captureAnnotationFromCharOffsets(
    startChar: number,
    endChar: number,
    root: HTMLElement,
    id: string,
    text: string,
    color: string,
): IAnnotation | null {
    const startPos = charOffsetToNodeOffset(startChar, root);
    const endPos = charOffsetToNodeOffset(endChar, root);

    if (!startPos || !endPos) {
        return null;
    }

    const startPath = getNodePath(startPos.node, root);
    const endPath = getNodePath(endPos.node, root);

    if (startPath === null || endPath === null) {
        return null;
    }

    return {
        id,
        text,
        color,
        startPath,
        startOffset: startPos.offset,
        endPath,
        endOffset: endPos.offset,
    };
}

function nodeOffsetToCharOffset(node: Node, offset: number, root: HTMLElement): number {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let count = 0;
    let current = walker.nextNode();

    while (current) {
        if (current === node) {
            return count + offset;
        }

        count += current.textContent?.length ?? 0;
        current = walker.nextNode();
    }

    return -1;
}

function charOffsetToNodeOffset(charOffset: number, root: HTMLElement): { node: Text; offset: number } | null {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let count = 0;
    let current = walker.nextNode() as Text | null;

    while (current) {
        const len = current.textContent?.length ?? 0;

        if (count + len >= charOffset) {
            return { node: current, offset: charOffset - count };
        }

        count += len;
        current = walker.nextNode() as Text | null;
    }

    return null;
}
