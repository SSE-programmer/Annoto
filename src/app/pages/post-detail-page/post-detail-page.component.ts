import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostDetailPageService } from '@pages/post-detail-page/post-detail-page.service';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner/loading-spinner.component';
import { IconBackComponent } from '@shared/ui/icons/icon-back/icon-back.component';
import { IconPencilComponent } from '@shared/ui/icons/icon-pencil/icon-pencil.component';
import { IconTrashComponent } from '@shared/ui/icons/icon-trash/icon-trash.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IPost } from '@shared/services/http/posts-http/models';

@Component({
    selector: 'an-post-detail-page',
    imports: [
        DatePipe,
        RouterLink,
        LoadingSpinnerComponent,
        IconBackComponent,
        IconPencilComponent,
        IconTrashComponent,
        ButtonComponent,
    ],
    providers: [PostDetailPageService],
    templateUrl: './post-detail-page.component.html',
    styleUrl: './post-detail-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailPageComponent {
    private readonly postDetailPageService = inject(PostDetailPageService);

    protected readonly postLoadingSignal = this.postDetailPageService.isPostLoadingSignal;
    protected readonly postSignal = this.postDetailPageService.postSignal;

    protected openEditPostModal(post: IPost): void {
        this.postDetailPageService.openEditPostModal(post);
    }

    protected openDeletePostConfirm(post: IPost): void {
        this.postDetailPageService.openDeletePostConfirm(post);
    }

    protected hasDistinctUpdatedAt(post: IPost): boolean {
        return post.updatedAt !== post.createdAt;
    }
}
