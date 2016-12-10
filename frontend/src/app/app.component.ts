import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Gallery } from './models';
import { BackendService } from './backend.service';

@Component({
    selector: 'app',
    template:`
    
    <div id="dr-hamburger" (click)="showDrawer()">
        <img class="dr-header-img" src="/assets/img/logo.png">
    </div>

    <div #drawer class="dr-drawer">
        <div class="dr-drawer-title">Galleries</div>

        <div *ngFor="let g of galleries" class="dr-drawer-name" (click)="openGallery(g.Id)" >
        {{ g.Name }}
        </div>
    </div>
    
    
    
    <router-outlet ></router-outlet>
    `,
})


export class AppComponent {
    viewContainerRef;
    galleries: Array<Gallery> = new Array<Gallery>();
    @ViewChild('drawer') drawer;

    public constructor(viewContainerRef:ViewContainerRef,
                       private router: Router,
                       private backend: BackendService){
        this.viewContainerRef = viewContainerRef;
        this.getGalleries();
    }
    showDrawer(){
        this.drawer.nativeElement.style.left = 0;
    }

    openGallery(galleryId){
        this.router.navigate(['/gallery', galleryId]);
        this.drawer.nativeElement.style.left = "-400px";
    }
    getGalleries(){
        this.backend.get("/api/galleries").then(res => {
            this.galleries = res.json();
        });
    }
}



