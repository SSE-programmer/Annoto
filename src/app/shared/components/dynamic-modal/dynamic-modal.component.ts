import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    DestroyRef,
    ElementRef,
    HostListener,
    inject,
    Injector,
    OnDestroy,
    OnInit,
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
    private readonly cd = inject(ChangeDetectorRef);
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);

    public childComponentType: Type<any> | null = null;
    public componentRef: ComponentRef<any> | null = null;

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

    private readonly _resizeSubscription = fromEvent(window, 'resize')
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
            this._dynamicModalSignal().nativeElement.classList.add('transition');
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

    private _loadChildComponent(componentType: Type<any>): void {
        const viewContainerRef = this._insertionViewRefSignal();

        viewContainerRef.clear();
        this.componentRef = viewContainerRef.createComponent(componentType, { injector: this.injector });
    }

    private _calculateAndUpdateSizes(): void {
        let width = this.config.width;
        let height = this.config.height;

        if (this.config.mediaQueries?.length) {
            const mediaQueries = this.config.mediaQueries;

            mediaQueries.forEach(mediaQuery => {
                const isMatch = window.matchMedia(mediaQuery.query).matches;

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
