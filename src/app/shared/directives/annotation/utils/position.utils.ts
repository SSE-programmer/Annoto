const VIEWPORT_PADDING = 8;
const GAP = 6;

export interface IFloatingPosition {
    top: number;
    left: number;
    maxHeight: number;
}

export function computeFloatingPosition(targetRect: DOMRect, floatingContainerWidth: number, tooltipHeight: number): IFloatingPosition {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const spaceBelow = viewportH - targetRect.bottom - VIEWPORT_PADDING - GAP;
    const spaceAbove = targetRect.top - VIEWPORT_PADDING - GAP;
    const fullHeight = viewportH - VIEWPORT_PADDING * 2;

    let top: number;
    let maxHeight: number;

    if (tooltipHeight <= spaceBelow) {
        top = targetRect.bottom + GAP;
        maxHeight = spaceBelow;
    } else if (tooltipHeight <= spaceAbove) {
        top = targetRect.top - tooltipHeight - GAP;
        maxHeight = spaceAbove;
    } else {
        const center = (targetRect.top + targetRect.bottom) / 2;

        maxHeight = Math.min(tooltipHeight, fullHeight);
        top = center - maxHeight / 2;
        top = Math.max(VIEWPORT_PADDING, Math.min(top, viewportH - maxHeight - VIEWPORT_PADDING));
    }

    const left = Math.max(VIEWPORT_PADDING, Math.min(
        targetRect.left + targetRect.width / 2 - floatingContainerWidth / 2,
        viewportW - floatingContainerWidth - VIEWPORT_PADDING,
    ));

    return { top, left, maxHeight };
}
