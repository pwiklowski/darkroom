import { provideRouter, RouterConfig } from '@angular/router';
import { GalleryComponent } from './gallery.component';
import { GalleriesComponent } from './galleries.component';
import { PhotoComponent } from './photo.component';

export const routes: RouterConfig = [
    { path: '',            component: GalleriesComponent },
    { path: 'gallery/:id', component: GalleryComponent },
    { path: 'photo/:id',   component: PhotoComponent},
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes)
]
