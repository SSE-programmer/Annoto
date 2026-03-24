import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'an-icon-plus',
    standalone: true,
    imports: [],
    templateUrl: './icon-plus.component.html',
    styleUrl: './icon-plus.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconPlusComponent {
}
