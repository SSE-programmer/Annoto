import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PostsPageService } from '@pages/posts-page/posts-page.service';
import { PostCardComponent } from '@pages/posts-page/components/post-card/post-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconPlusComponent } from '@shared/ui/icons/icon-plus/icon-plus.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner/loading-spinner.component';

@Component({
    selector: 'an-posts-page',
    imports: [
        PostCardComponent,
        ButtonComponent,
        IconPlusComponent,
        LoadingSpinnerComponent
    ],
    providers: [PostsPageService],
    templateUrl: './posts-page.component.html',
    styleUrl: './posts-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsPageComponent {
    private readonly postsPageService = inject(PostsPageService);

    protected readonly isPostsLoadingSignal = this.postsPageService.isPostsLoadingSignal;
    protected readonly postsSignal = this.postsPageService.postsSignal;

    protected openCreatePostModal(): void {
        this.postsPageService.openCreatePostModal();
    }

    protected goToPostPage(postId: string): void {
        this.postsPageService.goToPostPage(postId);
    }
}
