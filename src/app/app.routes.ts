import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@pages/posts-page/posts-page.component')
            .then(m => m.PostsPageComponent),
    },
    {
        path: '**',
        loadComponent: () => import('@pages/posts-page/posts-page.component')
            .then(m => m.PostsPageComponent),
    }
];
