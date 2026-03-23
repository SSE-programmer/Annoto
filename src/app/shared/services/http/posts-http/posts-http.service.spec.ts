import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { PostsHttpService } from './posts-http.service';
import { IPost } from './models';

describe('PostsHttpService', () => {
    let service: PostsHttpService;
    const storage: Record<string, string> = {};
    const STORAGE_POSTS_KEY = 'posts:collection';

    beforeEach(() => {
        Object.keys(storage).forEach(key => delete storage[key]);

        vi.spyOn(Math, 'random').mockReturnValue(0);
        const localStorageMock = {
            getItem: (key: string) => storage[key] ?? null,
            setItem: (key: string, value: string) => {
                storage[key] = value;
            },
            removeItem: (key: string) => {
                delete storage[key];
            },
            clear: () => {
                Object.keys(storage).forEach(key => delete storage[key]);
            },
            key: (index: number) => Object.keys(storage)[index] ?? null,
            get length() {
                return Object.keys(storage).length;
            },
        } satisfies Storage;

        Object.defineProperty(globalThis, 'localStorage', {
            value: localStorageMock,
            configurable: true,
        });

        TestBed.configureTestingModule({});
        service = TestBed.inject(PostsHttpService);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns empty array when storage is empty', async () => {
        const posts = await firstValueFrom(service.getPosts());

        expect(posts).toEqual([]);
    });

    it('creates post with trimmed fields and persists it', async () => {
        const createdPost = await firstValueFrom(service.createPost({
            title: '  New title  ',
            content: '  New content  ',
        }));

        expect(createdPost.id).toBeTruthy();
        expect(createdPost.title).toBe('New title');
        expect(createdPost.content).toBe('New content');
        expect(createdPost.createdAt).toBeTruthy();
        expect(createdPost.updatedAt).toBeTruthy();

        const posts = await firstValueFrom(service.getPosts());
        expect(posts).toHaveLength(1);
        expect(posts[0].title).toBe('New title');
    });

    it('returns post by id when it exists', async () => {
        const seededPost: IPost = {
            id: 'post-1',
            title: 'Seed title',
            content: 'Seed content',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        storage[STORAGE_POSTS_KEY] = JSON.stringify([seededPost]);

        const post = await firstValueFrom(service.getPostById('post-1'));

        expect(post).toEqual(seededPost);
    });

    it('throws when post by id is missing', async () => {
        await expect(firstValueFrom(service.getPostById('missing-id')))
            .rejects
            .toThrow('was not found');
    });

    it('updates post fields and refreshes updatedAt', async () => {
        const seededPost: IPost = {
            id: 'post-1',
            title: 'Initial title',
            content: 'Initial content',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        storage[STORAGE_POSTS_KEY] = JSON.stringify([seededPost]);

        const updatedPost = await firstValueFrom(service.updatePost('post-1', {
            id: 'post-1',
            title: '  Updated title  ',
            content: '  Updated content  ',
        }));

        expect(updatedPost.title).toBe('Updated title');
        expect(updatedPost.content).toBe('Updated content');
        expect(updatedPost.createdAt).toBe('2026-01-01T10:00:00.000Z');
        expect(updatedPost.updatedAt).not.toBe('2026-01-01T10:00:00.000Z');
    });

    it('deletes post by id', async () => {
        const firstPost: IPost = {
            id: 'post-1',
            title: 'One',
            content: 'First',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        const secondPost: IPost = {
            id: 'post-2',
            title: 'Two',
            content: 'Second',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        storage[STORAGE_POSTS_KEY] = JSON.stringify([firstPost, secondPost]);

        await firstValueFrom(service.deletePost('post-1'));

        const posts = await firstValueFrom(service.getPosts());
        expect(posts).toEqual([secondPost]);
    });

    it('returns empty list for invalid storage payload', async () => {
        storage[STORAGE_POSTS_KEY] = '{invalid-json';

        const posts = await firstValueFrom(service.getPosts());

        expect(posts).toEqual([]);
    });

    it('filters out invalid post records from storage array', async () => {
        storage[STORAGE_POSTS_KEY] = JSON.stringify([
            {
                id: 'post-1',
                title: 'Valid',
                content: 'Record',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            },
            {
                id: 'post-2',
                title: 'Broken',
            }
        ]);

        const posts = await firstValueFrom(service.getPosts());

        expect(posts).toHaveLength(1);
        expect(posts[0].id).toBe('post-1');
    });
});
