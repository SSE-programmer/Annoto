import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    input,
    output,
    TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner/loading-spinner.component';

@Component({
    selector: 'an-button',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
    public readonly label = input('');
    public readonly ariaLabel = input<string | null>(null);
    public readonly disabled = input(false, { transform: booleanAttribute });
    public readonly loading = input(false, { transform: booleanAttribute });
    public readonly loadingPosition = input<'left' | 'right'>('right');
    public readonly outlined = input(false, { transform: booleanAttribute });
    public readonly dashed = input(false, { transform: booleanAttribute });
    public readonly type = input<'button' | 'submit' | 'reset'>('button');
    public readonly severity = input<'primary' | 'secondary'>('primary');
    public readonly size = input<'small' | 'normal'>('normal');

    public readonly onClick = output<Event>();
    public readonly onFocus = output<Event>();
    public readonly onBlur = output<Event>();

    public readonly iconLeftTemplate = contentChild<TemplateRef<any>>('iconLeft');
    public readonly iconRightTemplate = contentChild<TemplateRef<any>>('iconRight');
    public readonly loadingIndicatorTemplate = contentChild<TemplateRef<any>>('loadingIndicator');

    get classes() {
        return `
          an-button
          an-button-${ this.severity() }
          an-button-${ this.size() }
          ${ this.loading() ? 'an-button-loading' : '' }
          ${ this.outlined() ? 'an-button-outlined' : '' }
          ${ this.dashed() ? 'an-button-dashed' : '' }
    `
    }

    public handleClick(event: MouseEvent) {
        if (this.disabled() || this.loading()) {
            return;
        }

        this.onClick.emit(event);
    }
}
