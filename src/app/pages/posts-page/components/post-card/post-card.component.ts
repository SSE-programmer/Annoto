import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IPost } from '@shared/services/http/posts-http/models';

@Component({
  selector: 'an-post-card',
  imports: [],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent {
    public readonly post = input.required<IPost>();
}
