import {
    ChangeDetectionStrategy,
    Component,
    output,
} from '@angular/core';


@Component({
    selector: 'an-annotation-context-menu',
    standalone: true,
    templateUrl: './annotation-context-menu.component.html',
    styleUrl: './annotation-context-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationContextMenuComponent {
    public readonly addAnnotation = output<void>();
}
