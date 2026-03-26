// Находим путь от root до node. Формат 0/3/2, который означает root.childNodes[0].childNodes[3].childNodes[2]
export function getNodePath(node: Node, root: HTMLElement): string | null {
    const segments: number[] = [];
    let current: Node | null = node;

    while (current && current !== root) {
        const parent: Node | null = current.parentNode;

        if (!parent) {
            return null;
        }

        const children = Array.from(parent.childNodes);
        const index = children.indexOf(current as ChildNode);

        if (index === -1) {
            return null;
        }

        segments.unshift(index);
        current = parent;
    }

    if (current !== root) {
        return null;
    }

    return segments.join('/');
}

export function resolveNodePath(path: string, root: HTMLElement): Node | null {
    if (path === '') {
        return root;
    }

    const segments = path.split('/').map(Number);
    let current: Node = root;

    for (const index of segments) {
        const child = current.childNodes[index];

        if (!child) {
            return null;
        }

        current = child;
    }

    return current;
}
