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
    <div #drawerClose id="dr-drawer-close" (click)="closeDrawer()"> </div>


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
    @ViewChild('drawerClose') drawerClose;

    public constructor(viewContainerRef:ViewContainerRef,
                       private router: Router,
                       private backend: BackendService){
        this.viewContainerRef = viewContainerRef;
        this.getGalleries();
    }
    showDrawer(){
        this.drawer.nativeElement.style.left = 0;
        this.drawerClose.nativeElement.style.opacity = "0.6";
        this.drawerClose.nativeElement.style.visibility= "visible";
    }

    closeDrawer(){
        this.drawer.nativeElement.style.left = "-400px";
        this.drawerClose.nativeElement.style.opacity = 0;
        setTimeout(()=>{
            this.drawerClose.nativeElement.style.visibility= "hidden";
        }, 200);
    }

    openGallery(galleryId){
        this.router.navigate(['/gallery', galleryId]);
        this.closeDrawer();
    }
    getGalleries(){
        this.backend.get("/api/galleries").then(res => {
            this.galleries = res.json();
        });
    }
}



