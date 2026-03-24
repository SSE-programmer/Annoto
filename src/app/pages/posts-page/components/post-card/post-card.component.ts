import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    input,
    output,
    signal,
    viewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { IPostSummary } from '@shared/services/http/posts-http/models';

@Component({
    selector: 'an-post-card',
    imports: [DatePipe],
    templateUrl: './post-card.component.html',
    styleUrl: './post-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent implements AfterViewInit {
    public readonly post = input.required<IPostSummary>();
    public readonly onClick = output<PointerEvent>();

    private readonly _isHeightOverflow = signal(false);
    public readonly isHeightOverflow = this._isHeightOverflow.asReadonly();

    private readonly articleCardRef = viewChild.required<ElementRef<HTMLElement>>('articleCard');

    public ngAfterViewInit() {
        this.updateOverflowStatus();
    }

    private updateOverflowStatus() {
        const element = this.articleCardRef().nativeElement;
        const isHeightOverflow = element ? (element.offsetHeight < element.scrollHeight) : false;

        this._isHeightOverflow.set(isHeightOverflow);
    }
}
