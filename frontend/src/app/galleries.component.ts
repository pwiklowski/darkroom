import { Component, ViewChild, HostListener } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';
import { Gallery } from './models';
import { BackendService } from './backend.service';
import { AngularFire, AuthProviders } from 'angularfire2';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'my-app',
    templateUrl: './galleries.template.html',
    styleUrls: ['./galleries.style.css']
})
export class GalleriesComponent {
    selectedGallery: Gallery = new Gallery();
    selectedGalleryIndex = 0;
    galleryCover;
    galleryCoverContainer;
    galleryCoverLoader;
    sub: any;
    resizeEvent;

    galleriesSub;
    error = "test";

    constructor(http: Http, router: Router, private route: ActivatedRoute,
                private backend: BackendService, private af: AngularFire, 
                private sanitizer:DomSanitizer){
    }

    ngOnInit() {
        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";
        this.galleryCover= <HTMLImageElement>document.getElementById("dr-gallery-cover");
        this.galleryCoverLoader = <HTMLImageElement>document.getElementById("dr-gallery-cover-loader");
        this.galleryCoverContainer = <HTMLImageElement>document.getElementById("dr-gallery-cover-container");

        this.galleriesSub = this.backend.galleries.subscribe((galleries) => {
            this.initGalleries();
        });
    }
    ngOnDestroy(){
        this.galleriesSub.unsubscribe();
    }

    initGalleries(){
        this.selectedGalleryIndex = 0;

        if (this.backend.getGalleries().length >0){
            this.selectedGallery = this.backend.getGalleries()[this.selectedGalleryIndex];
            this.loadPhoto(this.selectedGallery);
            this.error = undefined;
        }else{
            this.error = "No galleries found";
            this.selectedGallery = undefined;
            this.galleryCover.src = "";
            this.galleryCover.style.opacity = "0";
            this.galleryCoverLoader.style.opacity = "0";
        }
    }
    loadPhoto(gallery){
        this.galleryCover.src = "";
        this.galleryCoverLoader.style.opacity = "1";
        this.galleryCover.style.opacity = "0";

        this.backend.getQueryToken().then(token=>{
            this.galleryCover.src = "/api/gallery/"+ gallery.Id+"/cover?token="+token;
            this.galleryCover.addEventListener('load', ()=>{
                this.scalePhoto();
                this.galleryCoverLoader.style.opacity = "0";
                this.galleryCover.style.opacity = "1";
            })
        });
    }

    scalePhoto(){
        let containerAR = this.galleryCoverContainer.offsetWidth / this.galleryCoverContainer.offsetHeight;
        let coverAR = this.galleryCover.naturalWidth / this.galleryCover.naturalHeight;

        if (containerAR > coverAR ){
            this.galleryCover.style.width = this.galleryCoverContainer.offsetWidth+"px";
            this.galleryCover.style.height = "auto";
        } else {
            this.galleryCover.style.height= this.galleryCoverContainer.offsetHeight +"px";
            this.galleryCover.style.width = "auto";
        }
    }
    

    nextPhoto(){
        if (this.backend.getGalleries().length ==1) return;

        if (this.selectedGalleryIndex == (this.backend.getGalleries().length-1)) {
            this.selectedGalleryIndex = 0;
        }else{
            this.selectedGalleryIndex++;
        }
        this.selectedGallery = this.backend.getGalleries()[this.selectedGalleryIndex];
        this.loadPhoto(this.selectedGallery);

    }

    prevPhoto(){
        if (this.selectedGalleryIndex == 0) {
            this.selectedGalleryIndex = this.backend.getGalleries().length -1;
        }else{
            this.selectedGalleryIndex--;
        }
        this.selectedGallery = this.backend.getGalleries()[this.selectedGalleryIndex];
        this.loadPhoto(this.selectedGallery);
    }

    @HostListener('window:mousewheel', ['$event'])
    onScrollEvent(event: any) {
        if (this.backend.getGalleries().length > 1){
            if (event.wheelDelta  < 0){
                this.nextPhoto();
            }else{
                this.prevPhoto();
            }
            return false;
        }
    }


}
