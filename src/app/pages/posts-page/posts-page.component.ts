import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PostsPageService } from '@pages/posts-page/posts-page.service';
import { PostCardComponent } from '@pages/posts-page/components/post-card/post-card.component';

@Component({
    selector: 'an-posts-page',
    imports: [
        PostCardComponent
    ],
    providers: [PostsPageService],
    templateUrl: './posts-page.component.html',
    styleUrl: './posts-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsPageComponent {
    private readonly postsPageService = inject(PostsPageService);

    protected readonly postsLoadingSignal = this.postsPageService.isPostsLoadingSignal;
    protected readonly postsSignal = this.postsPageService.postsSignal;
}
