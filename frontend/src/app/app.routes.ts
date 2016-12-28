import { Routes, RouterModule } from '@angular/router';
import { GalleriesComponent } from './galleries.component';
import { GalleryComponent } from './gallery.component';
import { LoginComponent } from './login.component';

export const ROUTES: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'gallery/:id', component: GalleryComponent },
    { path: 'galleries',   component: GalleriesComponent },
    { path: '**',          component: LoginComponent }

];