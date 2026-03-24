import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'an-icon-trash',
    standalone: true,
    imports: [],
    templateUrl: './icon-trash.component.html',
    styleUrl: './icon-trash.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconTrashComponent {}
