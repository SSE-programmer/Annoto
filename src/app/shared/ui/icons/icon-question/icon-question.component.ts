import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'an-icon-question',
    standalone: true,
    imports: [],
    templateUrl: './icon-question.component.html',
    styleUrl: './icon-question.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconQuestionComponent {}
