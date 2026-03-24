import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsPageComponent } from './posts-page.component';
import { PostsHttpService } from '@shared/services/http/posts-http/posts-http.service';
import { of } from 'rxjs';
import { IPostSummary } from '@shared/services/http/posts-http/models';

describe('PostsPageComponent', () => {
    let component: PostsPageComponent;
    let fixture: ComponentFixture<PostsPageComponent>;
    const postsMock: IPostSummary[] = [
        {
            id: 'post-1',
            title: 'Post one',
            contentPreview: 'First post content',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'post-2',
            title: 'Post two',
            contentPreview: 'Second post content',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];
    const postsHttpServiceMock = {
        getPosts: () => of(postsMock),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PostsPageComponent],
            providers: [
                { provide: PostsHttpService, useValue: postsHttpServiceMock }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PostsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load posts into readonly signal', () => {
        expect(component['postsSignal']()).toEqual(postsMock);
    });

    it('should finish loading after posts fetch', () => {
        expect(component['postsLoadingSignal']()).toBe(false);
    });
});
