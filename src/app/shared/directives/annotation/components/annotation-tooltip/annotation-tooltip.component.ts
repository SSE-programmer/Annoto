import { booleanAttribute, ChangeDetectionStrategy, Component, input, output, } from '@angular/core';
import { IAnnotation } from '../../models/annotation.model';


@Component({
    selector: 'an-annotation-tooltip',
    standalone: true,
    templateUrl: './annotation-tooltip.component.html',
    styleUrl: './annotation-tooltip.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationTooltipComponent {
    public readonly annotations = input.required<IAnnotation[]>();
    public readonly readonly = input(false, { transform: booleanAttribute });

    public readonly editAnnotation = output<string>();
    public readonly deleteAnnotation = output<string>();
}
