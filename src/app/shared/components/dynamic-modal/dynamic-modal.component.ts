import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    DestroyRef,
    ElementRef,
    HostListener,
    inject,
    Injector,
    OnDestroy,
    OnInit,
    Renderer2,
    signal,
    Type,
    viewChild,
    ViewContainerRef,
} from '@angular/core';
import { debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicModalService } from './dynamic-modal.service';
import { DynamicModalConfig } from './dynamic-modal-config';

const RESIZE_EVENT_DEBOUNCE = 500;

@Component({
    selector: 'an-dynamic-modal',
    standalone: true,
    imports: [],
    templateUrl: './dynamic-modal.component.html',
    styleUrl: './dynamic-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicModalComponent implements OnInit, AfterViewInit, OnDestroy {
    public readonly config = inject(DynamicModalConfig);
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);

    public childComponentType: Type<unknown> | null = null;
    public componentRef: ComponentRef<unknown> | null = null;

    private readonly _widthSignal = signal<string | undefined>(undefined);
    public readonly widthSignal = this._widthSignal.asReadonly();
    private readonly _heightSignal = signal<string>('auto');
    public readonly heightSignal = this._heightSignal.asReadonly();

    private readonly _insertionViewRefSignal = viewChild.required('insertionViewRef', { read: ViewContainerRef });
    private readonly _dynamicModalSignal = viewChild.required<ElementRef>('dynamicModal');
    private readonly _bodySignal = viewChild.required<ElementRef>('body');

    @HostListener('document:keydown.escape')
    public onKeydownHandler() {
        this.closeModal();
    }

    private readonly _resizeSubscription = fromEvent(this.document.defaultView ?? window, 'resize')
        .pipe(
            debounceTime(RESIZE_EVENT_DEBOUNCE),
            takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
            this._calculateAndUpdateSizes();
        });

    public ngOnInit(): void {
        this._calculateAndUpdateSizes();
    }

    public ngAfterViewInit(): void {
        if (!this.childComponentType) {
            throw new Error('Child component type must be defined');
        }

        requestAnimationFrame(() => {
            this.renderer.addClass(this._dynamicModalSignal().nativeElement, 'transition');
        });

        this._loadChildComponent(this.childComponentType);
    }

    public closeModal(): void {
        this.dynamicModalService.closeModal(this.config.modalName);
    }

    public ngOnDestroy(): void {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    private _loadChildComponent(componentType: Type<unknown>): void {
        const viewContainerRef = this._insertionViewRefSignal();

        viewContainerRef.clear();
        this.componentRef = viewContainerRef.createComponent(componentType as Type<object>, { injector: this.injector });
    }

    private _calculateAndUpdateSizes(): void {
        let width = this.config.width;
        let height = this.config.height;

        if (this.config.mediaQueries?.length) {
            const mediaQueries = this.config.mediaQueries;
            const matchMedia = this.document.defaultView?.matchMedia.bind(this.document.defaultView);

            mediaQueries.forEach(mediaQuery => {
                const isMatch = matchMedia?.(mediaQuery.query).matches ?? false;

                if (isMatch) {
                    width = mediaQuery.width;
                    height = mediaQuery.height;
                }
            });
        }

        this._widthSignal.set(width);
        this._heightSignal.set(height ?? 'auto');
    }
}
