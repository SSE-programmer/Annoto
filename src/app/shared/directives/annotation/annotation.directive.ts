import {
    AfterViewInit,
    ApplicationRef,
    booleanAttribute,
    ComponentRef,
    createComponent,
    DestroyRef,
    Directive,
    ElementRef,
    EmbeddedViewRef,
    EnvironmentInjector,
    inject,
    input,
    Renderer2,
    RendererFactory2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';

import { IAnnotation } from './models/annotation.model';
import { ANNOTATION_ATTR, SELECTION_CHANGE_DELAY, TOOLTIP_HIDE_DELAY, TOOLTIP_SHOW_DELAY } from './constants';
import { isSelectionInsideRoot, selectionIntersectsAnnotation } from './utils/selection.utils';
import { computeFloatingPosition } from './utils/position.utils';
import {
    captureAnnotationFromCharOffsets,
    clearAnnotationSpans,
    rangeToCharOffsets,
    renderAnnotations
} from './utils/annotation-renderer';

import { AnnotationContextMenuComponent } from './components/annotation-context-menu/annotation-context-menu.component';
import {
    ANNOTATION_MODAL_NAME,
    AnnotationCreateModalComponent,
    IAnnotationModalData,
} from './components/annotation-create-modal/annotation-create-modal.component';
import { AnnotationTooltipComponent } from './components/annotation-tooltip/annotation-tooltip.component';

import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';
import {
    ConfirmDialogModalComponent,
    IConfirmDialogData,
} from '@shared/components/confirm-dialog-modal/confirm-dialog-modal.component';
import { MODAL_WIDTH_MD } from '@shared/constants/modal-config';


@Directive({
    selector: '[anAnnotation]',
    standalone: true,
})
export class AnnotationDirective implements AfterViewInit {
    public readonly annotationKey = input.required<string>();
    public readonly readonly = input(false, { transform: booleanAttribute });

    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly rendererFactory = inject(RendererFactory2);
    private readonly document = inject(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);
    private readonly appRef = inject(ApplicationRef);
    private readonly envInjector = inject(EnvironmentInjector);
    private readonly dynamicModalService = inject(DynamicModalService);

    private _rootRenderer!: Renderer2;

    private _annotations: IAnnotation[] = [];

    private _menuRef: ComponentRef<AnnotationContextMenuComponent> | null = null;
    private _menuContainer: HTMLElement | null = null;

    private _savedRange: Range | null = null;

    private _tooltipRef: ComponentRef<AnnotationTooltipComponent> | null = null;
    private _tooltipContainer: HTMLElement | null = null;
    private _tooltipShowTimer: ReturnType<typeof setTimeout> | null = null;
    private _tooltipHideTimer: ReturnType<typeof setTimeout> | null = null;

    private _tooltipTarget: HTMLElement | null = null;

    private _selectionChangeTimer: ReturnType<typeof setTimeout> | null = null;
    private _suppressSelectionChange = false;

    private get _root(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    public ngAfterViewInit() {
        this._init();
    }

    private _init(): void {
        this._rootRenderer = this.rendererFactory.createRenderer(null, null);
        this._loadAnnotations();
        this._renderAll();
        this._bindEvents();
    }

    private _loadAnnotations(): void {
        try {
            const raw = localStorage.getItem(this.annotationKey());

            this._annotations = raw ? JSON.parse(raw) : [];
        } catch {
            this._annotations = [];
        }
    }

    private _saveAnnotations(): void {
        localStorage.setItem(this.annotationKey(), JSON.stringify(this._annotations));
    }

    private _renderAll(): void {
        renderAnnotations(this._annotations, this._root);
    }

    private _bindEvents(): void {
        fromEvent<MouseEvent>(this._root, 'mouseup')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(e => this._onMouseUp(e));

        fromEvent<TouchEvent>(this._root, 'touchend')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(e => {
                const target = e.target as HTMLElement;
                const annotationSpan = target?.closest?.(`[${ ANNOTATION_ATTR }]`) as HTMLElement | null;

                if (annotationSpan) {
                    this._onAnnotationTap(annotationSpan);
                } else {
                    setTimeout(() => this._onMouseUp(null), 10);
                }
            });

        fromEvent<MouseEvent>(this._root, 'mouseover')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(e => this._onAnnotationHover(e));

        fromEvent<MouseEvent>(this._root, 'mouseout')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(e => this._onAnnotationLeave(e));

        merge(
            fromEvent(this.document, 'mousedown'),
            fromEvent(this.document, 'touchstart'),
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(e => this._onDocumentClick(e as MouseEvent | TouchEvent));

        fromEvent<KeyboardEvent>(this.document, 'keydown')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(e => {
                if (e.key === 'Escape') {
                    this._destroyMenu();
                    this._destroyTooltip();
                }
            });

        fromEvent(this.document, 'selectionchange')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this._onSelectionChange());

        fromEvent(this.document, 'scroll', { capture: true })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this._destroyMenu());

        this.destroyRef.onDestroy(() => {
            this._destroyMenu();
            this._destroyTooltip();

            if (this._selectionChangeTimer !== null) {
                clearTimeout(this._selectionChangeTimer);
            }
        });
    }

    private _onMouseUp(event: MouseEvent | null): void {
        this._tryShowMenuForSelection();
        this._suppressNextSelectionChange();
    }

    private _onSelectionChange(): void {
        if (this._suppressSelectionChange) {
            return;
        }

        if (this._selectionChangeTimer !== null) {
            clearTimeout(this._selectionChangeTimer);
        }

        this._selectionChangeTimer = setTimeout(() => {
            this._selectionChangeTimer = null;
            this._tryShowMenuForSelection();
        }, SELECTION_CHANGE_DELAY);
    }

    private _suppressNextSelectionChange(): void {
        this._suppressSelectionChange = true;

        if (this._selectionChangeTimer !== null) {
            clearTimeout(this._selectionChangeTimer);
            this._selectionChangeTimer = null;
        }

        setTimeout(() => {
            this._suppressSelectionChange = false;
        }, SELECTION_CHANGE_DELAY + 100);
    }

    private _tryShowMenuForSelection(): void {
        if (this.readonly()) {
            return;
        }

        const selection = this.document.defaultView?.getSelection();

        if (!selection || selection.isCollapsed || !selection.rangeCount) {
            return;
        }

        const range = selection.getRangeAt(0);

        if (!isSelectionInsideRoot(range, this._root)) {
            return;
        }

        if (selectionIntersectsAnnotation(range, this._root)) {
            return;
        }

        this._savedRange = range.cloneRange();
        this._showMenu(range);
    }

    private _showMenu(range: Range): void {
        this._destroyMenu();

        const rect = range.getBoundingClientRect();

        if (!rect.width && !rect.height) {
            return;
        }

        this._menuRef = createComponent(AnnotationContextMenuComponent, {
            environmentInjector: this.envInjector,
        });

        this._menuRef.instance.addAnnotation.subscribe(() => {
            this._openCreateModal();
        });

        this.appRef.attachView(this._menuRef.hostView);

        const domElement = (this._menuRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;

        this._menuContainer = this._rootRenderer.createElement('div') as HTMLElement;
        this._rootRenderer.setStyle(this._menuContainer, 'position', 'fixed');
        this._rootRenderer.setStyle(this._menuContainer, 'z-index', '10000');
        this._rootRenderer.setStyle(this._menuContainer, 'pointer-events', 'none');
        this._rootRenderer.appendChild(this._menuContainer, domElement);
        this._rootRenderer.appendChild(this.document.body, this._menuContainer);

        requestAnimationFrame(() => {
            if (!this._menuContainer) {
                return;
            }

            const menuRect = this._menuContainer.getBoundingClientRect();
            const pos = computeFloatingPosition(rect, menuRect.width, menuRect.height);

            this._rootRenderer.setStyle(this._menuContainer, 'top', `${ pos.top }px`);
            this._rootRenderer.setStyle(this._menuContainer, 'left', `${ pos.left }px`);
        });
    }

    private _destroyMenu(): void {
        if (this._menuRef) {
            this.appRef.detachView(this._menuRef.hostView);
            this._menuRef.destroy();
            this._menuRef = null;
        }

        if (this._menuContainer) {
            this._menuContainer.remove();
            this._menuContainer = null;
        }
    }

    private _openCreateModal(): void {
        this._destroyMenu();

        const range = this._savedRange;

        if (!range) {
            return;
        }

        this.dynamicModalService.open<IAnnotationModalData>(
            AnnotationCreateModalComponent,
            {
                modalName: ANNOTATION_MODAL_NAME,
                width: MODAL_WIDTH_MD,
                data: {
                    mode: 'create',
                    onSave: (color: string, text: string) => this._createAnnotation(range, color, text),
                },
            },
        );
    }

    private _openEditModal(id: string): void {
        this._destroyTooltip();

        const annotation = this._annotations.find(a => a.id === id);
        if (!annotation) return;

        this.dynamicModalService.open<IAnnotationModalData>(
            AnnotationCreateModalComponent,
            {
                modalName: ANNOTATION_MODAL_NAME,
                width: MODAL_WIDTH_MD,
                data: {
                    mode: 'edit',
                    initialColor: annotation.color,
                    initialText: annotation.text,
                    onSave: (color: string, text: string) => this._editAnnotation(id, color, text),
                },
            },
        );
    }

    private _editAnnotation(id: string, color: string, text: string): void {
        const annotation = this._annotations.find(a => a.id === id);

        if (!annotation) {
            return;
        }

        annotation.color = color;
        annotation.text = text;
        this._saveAnnotations();

        clearAnnotationSpans(this._root);
        this._renderAll();
    }

    private _createAnnotation(range: Range, color: string, text: string): void {
        const charOffsets = rangeToCharOffsets(range, this._root);

        if (!charOffsets) {
            return;
        }

        clearAnnotationSpans(this._root);

        const id = crypto.randomUUID();
        const annotation = captureAnnotationFromCharOffsets(
            charOffsets.start, charOffsets.end, this._root, id, text, color,
        );

        if (!annotation) {
            return;
        }

        this._annotations.push(annotation);
        this._saveAnnotations();
        this._renderAll();

        this.document.defaultView?.getSelection()?.removeAllRanges();
        this._savedRange = null;
    }

    private _onAnnotationHover(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        const annotationSpan = target.closest?.(`[${ ANNOTATION_ATTR }]`) as HTMLElement | null;

        if (!annotationSpan) {
            return;
        }

        if (this._tooltipTarget === annotationSpan) {
            this._cancelTooltipHide();

            return;
        }

        this._cancelTooltipShow();
        this._cancelTooltipHide();

        this._tooltipShowTimer = setTimeout(() => {
            this._showTooltip(annotationSpan);
        }, TOOLTIP_SHOW_DELAY);
    }

    private _onAnnotationLeave(event: MouseEvent): void {
        const related = event.relatedTarget as HTMLElement | null;

        if (related && this._tooltipContainer?.contains(related)) {
            return;
        }

        if (related && related.closest?.(`[${ ANNOTATION_ATTR }]`)) {
            return;
        }

        this._cancelTooltipShow();
        this._scheduleTooltipHide();
    }

    private _showTooltip(annotationSpan: HTMLElement): void {
        const ids = this._collectAnnotationIds(annotationSpan);
        const annotations = this._annotations.filter(a => ids.includes(a.id));

        if (!annotations.length) {
            return;
        }

        this._destroyTooltip();
        this._tooltipTarget = annotationSpan;

        this._tooltipRef = createComponent(AnnotationTooltipComponent, {
            environmentInjector: this.envInjector,
        });

        this._tooltipRef.setInput('annotations', annotations);
        this._tooltipRef.setInput('readonly', this.readonly());

        this._tooltipRef.instance.editAnnotation.subscribe((id: string) => {
            this._openEditModal(id);
        });

        this._tooltipRef.instance.deleteAnnotation.subscribe((id: string) => {
            this._confirmDeleteAnnotation(id);
        });

        this.appRef.attachView(this._tooltipRef.hostView);

        const domElement = (this._tooltipRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;

        this._tooltipContainer = this._rootRenderer.createElement('div') as HTMLElement;
        this._rootRenderer.setStyle(this._tooltipContainer, 'position', 'fixed');
        this._rootRenderer.setStyle(this._tooltipContainer, 'z-index', '10001');
        this._rootRenderer.setStyle(this._tooltipContainer, 'pointer-events', 'none');
        this._rootRenderer.appendChild(this._tooltipContainer, domElement);
        this._rootRenderer.appendChild(this.document.body, this._tooltipContainer);

        const onTooltipEnter = this._rootRenderer.listen(this._tooltipContainer, 'mouseenter', () => {
            this._cancelTooltipHide();
        });

        const onTooltipLeave = this._rootRenderer.listen(this._tooltipContainer, 'mouseleave', () => {
            this._scheduleTooltipHide();
        });

        this._tooltipRef.onDestroy(() => {
            onTooltipEnter();
            onTooltipLeave();
        });

        requestAnimationFrame(() => {
            if (!this._tooltipContainer) {
                return;
            }

            const targetRect = annotationSpan.getBoundingClientRect();
            const tooltipRect = this._tooltipContainer.getBoundingClientRect();
            const pos = computeFloatingPosition(targetRect, tooltipRect.width, tooltipRect.height);

            this._rootRenderer.setStyle(this._tooltipContainer, 'top', `${ pos.top }px`);
            this._rootRenderer.setStyle(this._tooltipContainer, 'left', `${ pos.left }px`);
            this._rootRenderer.setStyle(domElement, 'max-height', `${ pos.maxHeight }px`);
        });
    }

    private _destroyTooltip(): void {
        this._cancelTooltipShow();
        this._cancelTooltipHide();

        if (this._tooltipRef) {
            this.appRef.detachView(this._tooltipRef.hostView);
            this._tooltipRef.destroy();
            this._tooltipRef = null;
        }

        if (this._tooltipContainer) {
            this._tooltipContainer.remove();
            this._tooltipContainer = null;
        }

        this._tooltipTarget = null;
    }

    private _cancelTooltipShow(): void {
        if (this._tooltipShowTimer !== null) {
            clearTimeout(this._tooltipShowTimer);
            this._tooltipShowTimer = null;
        }
    }

    private _cancelTooltipHide(): void {
        if (this._tooltipHideTimer !== null) {
            clearTimeout(this._tooltipHideTimer);
            this._tooltipHideTimer = null;
        }
    }

    private _scheduleTooltipHide(): void {
        this._cancelTooltipHide();
        this._tooltipHideTimer = setTimeout(() => this._destroyTooltip(), TOOLTIP_HIDE_DELAY);
    }

    private _collectAnnotationIds(element: HTMLElement): string[] {
        const ids: string[] = [];
        let current: HTMLElement | null = element;

        while (current && this._root.contains(current)) {
            if (current.hasAttribute(ANNOTATION_ATTR)) {
                ids.push(current.getAttribute(ANNOTATION_ATTR)!);
            }
            current = current.parentElement;
        }

        return ids;
    }

    private _confirmDeleteAnnotation(id: string): void {
        this._destroyTooltip();

        this.dynamicModalService.open<IConfirmDialogData>(
            ConfirmDialogModalComponent,
            {
                modalName: ConfirmDialogModalComponent.name,
                width: MODAL_WIDTH_MD,
                data: {
                    message: 'Удалить аннотацию?',
                    confirmLabel: 'Удалить',
                    cancelLabel: 'Отмена',
                    onConfirm: () => {
                        this._deleteAnnotation(id);
                        this.dynamicModalService.closeModal(ConfirmDialogModalComponent.name, true);
                    },
                },
            },
        );
    }

    private _deleteAnnotation(id: string): void {
        this._annotations = this._annotations.filter(a => a.id !== id);
        this._saveAnnotations();
        this._destroyTooltip();

        clearAnnotationSpans(this._root);
        this._renderAll();
    }


    private _onAnnotationTap(annotationSpan: HTMLElement): void {
        this._cancelTooltipShow();
        this._cancelTooltipHide();
        this._destroyTooltip();
        this._showTooltip(annotationSpan);
    }

    private _onDocumentClick(event: MouseEvent | TouchEvent): void {
        const target = event.target as HTMLElement;

        if (this._menuContainer?.contains(target)) {
            return;
        }

        if (this._tooltipContainer?.contains(target)) {
            return;
        }

        this._destroyMenu();

        if (!target.closest?.(`[${ ANNOTATION_ATTR }]`)) {
            this._destroyTooltip();
        }
    }
}
