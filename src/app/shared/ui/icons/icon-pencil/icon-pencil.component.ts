import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'an-icon-pencil',
    standalone: true,
    imports: [],
    templateUrl: './icon-pencil.component.html',
    styleUrl: './icon-pencil.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPencilComponent {}
