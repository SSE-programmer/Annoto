import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { PostsHttpService } from '@shared/services/http/posts-http/posts-http.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize, tap } from 'rxjs';

@Injectable()
export class PostsPageService {
    private readonly postsHttpService = inject(PostsHttpService);
    private readonly destroyRef = inject(DestroyRef);

    private readonly _isPostsLoadingSignal = signal(true);
    public readonly isPostsLoadingSignal = this._isPostsLoadingSignal.asReadonly();

    private readonly _posts$ = this.postsHttpService.getPosts().pipe(
            finalize(() => this._isPostsLoadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
    );
    public readonly postsSignal = toSignal(this._posts$, { initialValue: [] })
}
