import { provideRouter, RouterConfig } from '@angular/router';
import { GalleryComponent } from './gallery.component';
import { GalleriesComponent } from './galleries.component';

export const routes: RouterConfig = [
    { path: '',            component: GalleriesComponent },
    { path: 'gallery/:id', component: GalleryComponent },
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes)
]
