import { Routes, RouterModule } from '@angular/router';
import { GalleriesComponent } from './galleries.component';
import { GalleryComponent } from './gallery.component';
import { LoginComponent } from './login.component';

export const ROUTES: Routes = [
    { path: 'gallery/:id', component: GalleryComponent },
    { path: '**',   component: GalleriesComponent },

];