import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { emulateHttpDelay } from '@shared/operators/emulate-http-delay.operator';
import { ICreatePostDto, IPost, IUpdatePostDto } from './models';


const STORAGE_POSTS_KEY = 'posts:collection';

@Injectable({ providedIn: 'root' })
export class PostsHttpService {
    public getPosts(): Observable<IPost[]> {
        return of(this._readPostsFromStorage()).pipe(emulateHttpDelay());
    }

    public getPostById(postId: string): Observable<IPost> {
        const post = this._readPostsFromStorage().find(item => item.id === postId);

        if (!post) {
            return throwError(() => new Error(`Post with id "${ postId }" was not found`)).pipe(emulateHttpDelay());
        }

        return of(post).pipe(emulateHttpDelay());
    }

    public createPost(dto: ICreatePostDto): Observable<IPost> {
        const now = new Date().toISOString();
        const posts = this._readPostsFromStorage();
        const newPost: IPost = {
            id: this._generateId(),
            title: dto.title.trim(),
            content: dto.content.trim(),
            createdAt: now,
            updatedAt: now,
        };

        posts.push(newPost);
        this._writePostsToStorage(posts);

        return of(newPost).pipe(emulateHttpDelay());
    }

    public updatePost(postId: string, dto: IUpdatePostDto): Observable<IPost> {
        const posts = this._readPostsFromStorage();
        const postIndex = posts.findIndex(item => item.id === postId);

        if (postIndex === -1) {
            return throwError(() => new Error(`Post with id "${ postId }" was not found`)).pipe(emulateHttpDelay());
        }

        const currentPost = posts[postIndex];
        const updatedPost: IPost = {
            ...currentPost,
            title: dto.title !== undefined ? dto.title.trim() : currentPost.title,
            content: dto.content !== undefined ? dto.content.trim() : currentPost.content,
            updatedAt: new Date().toISOString(),
        };

        posts[postIndex] = updatedPost;
        this._writePostsToStorage(posts);

        return of(updatedPost).pipe(emulateHttpDelay());
    }

    public deletePost(postId: string): Observable<void> {
        const posts = this._readPostsFromStorage();
        const filteredPosts = posts.filter(item => item.id !== postId);

        if (filteredPosts.length === posts.length) {
            return throwError(() => new Error(`Post with id "${ postId }" was not found`)).pipe(emulateHttpDelay());
        }

        this._writePostsToStorage(filteredPosts);

        return of(void 0).pipe(emulateHttpDelay());
    }

    private _readPostsFromStorage(): IPost[] {
        const serializedPosts = localStorage.getItem(STORAGE_POSTS_KEY);

        if (!serializedPosts) {
            return [];
        }

        try {
            const parsed = JSON.parse(serializedPosts) as unknown;

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed.filter(this._isPostRecord);
        } catch {
            return [];
        }
    }

    private _writePostsToStorage(posts: IPost[]): void {
        localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    }

    private _generateId(): string {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return crypto.randomUUID();
        }

        return `${ Date.now() }-${ Math.random().toString(16).slice(2) }`;
    }

    private _isPostRecord(value: unknown): value is IPost {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const post = value as Partial<IPost>;

        return typeof post.id === 'string'
            && typeof post.title === 'string'
            && typeof post.content === 'string'
            && typeof post.createdAt === 'string'
            && typeof post.updatedAt === 'string';
    }
}
