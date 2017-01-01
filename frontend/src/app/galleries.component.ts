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
    styles:[`
        #dr-gallery-cover{
            transform: translate(-50%,-50%);
            top: 50%;
            left: 50%;
            position: absolute;
            transition: opacity 500ms ease-in-out;
            opacity: 0;
        }
        .dr-centered-error{
            font-size: 30px;
            left: 50%;
            top: 50%;
            position: absolute;
            transform: translate(-50%,-50%);

        }
        .dr-left-icon{
            position: absolute;
            top: 50%;
            left: 10px;  
            cursor: pointer;
        }
        .dr-right-icon{
            position: absolute;
            top: 50%;
            right: 10px;
            cursor: pointer;
        }
        #dr-gallery-cover-loader{
            z-index: 1000;
            position: absolute;
            width: 50%;
            height: 50%;
            transform: translate(50%,50%);
            background-image: url(/assets/img/stub2.gif);
            pointer-events: none;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 60%;
            transition: opacity 500ms ease-in-out;
        }
        #dr-gallery-cover-container{
            width: 100%;
            height: 100%;
            background-size: cover;
            background-repeat: no-repeat;
            background-position: 50% 50%;
        }
        .dr-gallery-indicator{
            font-size: 14px;
        }
        #dr-gallery-indicator{
            z-index: 100;
            position: absolute;
            left: 50%;
            top: 10px;
            transform: translateX(-50%);
        }
    `]
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
        }else{
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
