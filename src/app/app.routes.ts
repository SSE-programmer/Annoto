import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@pages/posts-page/posts-page.component')
            .then(m => m.PostsPageComponent),
    },
    {
        path: 'post/:id',
        loadComponent: () => import('@pages/post-detail-page/post-detail-page.component')
            .then(m => m.PostDetailPageComponent),
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
    },
];
