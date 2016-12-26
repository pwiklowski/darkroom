import { Component, ViewChild, HostListener } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {Gallery, Photo } from './models.ts';
import {BackendService} from './backend.service';

@Component({
    selector: 'my-app',
    templateUrl: './gallery.template.html',

    styles:[`
#dr-gallery{
    position: absolute;
    width: 100%;
    height: 100%;
}

.dr-gallery-background-container{
    position: absolute;
    z-index:-10;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    opacity: 0.2;
    -webkit-filter: blur(20px);
    filter: blur(20px);
}
#dr-column-container{
    margin-top: 10%;
    height: 70%;
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.5);
    overflow: hidden;
}
.dr-photo-column{
    display: flex;
    flex-direction: row;
    height: 33.33%;
}
.dr-photo:hover{
    opacity: 1;
}
.dr-photo{
    opacity: 0.5; 
    transition: opacity 100ms ease-in-out;
    height: 100%;
}
.dr-photo-container{
    height: 100%;
}

#dr-scrollbar-fill{
    width: 0%;
    height: 1px;
    background: white;
}

#dr-scrollbar{
    position:absolute;
    bottom: 20px;
    width: 100%;
    background:gray;
    height:1px;
}


    
    `]

})
export class GalleryComponent {
    http: Http;
    photos;
    gallery: Gallery;
    currentPhoto: number = 0;
    columnsNumber: number = 3;
    columns: Array<number>;
    router: Router;
    sub: any;
    isPhotoDisplayed: boolean = false;
    photoId: string;

    photoWidth: number;
    photoHeight: number;
    photoTop: number;
    photoLeft: number;

    photoOffset: number;

    MARGIN: number = 50;
    PHOTO_MARGIN: number = 20;

    viewWidth: number;
    viewHeight: number;

    selectedPhoto: number = 0;

    editedGalleryId: string;

    selectedPhotoWidth: number = 1280;
    thumbnailsContainer;

    scroll;

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.gallery = new Gallery();
            let id = params['id'];
            
            this.getPhotos(id);
            this.getGallery(id);

        });
        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    constructor(http: Http, private backend: BackendService, router: Router, private route: ActivatedRoute, private sanitizer:DomSanitizer){
        this.router = router;
        this.columns = new Array<number>();
        for(let i = 0; i < this.columnsNumber; i++){
            this.columns.push(i);
        }

        this.http = http;
    }
    
    getPhotos(galleyId){
        this.backend.get("/api/gallery/"+galleyId+"/photos").then(res => {
                this.photos = res.json();
                this.backend.getQueryToken().then(token=>{
                    this.photos.forEach(photo =>{
                        photo.url = "/api/photo/"+photo.Id+"/320?token="+token; 
                    });
                });

                if (this.photos.length > 0){
                    this.initGallery();
                    setTimeout(this.animatePhotos, 200, this.photos);
                }
            }
        );
    }

    initGallery(){
        this.thumbnailsContainer = document.getElementById("dr-column-container");
        this.scroll = document.getElementById("dr-scrollbar-fill");
        let container = document.getElementById("body");
        this.viewWidth = container.offsetWidth;
        this.viewHeight = container.offsetHeight;
        let p = document.getElementById("dr-photo-slider");
        
        let firstPhoto = this.photos[0];
        
        let w = firstPhoto.Width * (p.offsetHeight/ firstPhoto.Height);

        this.photoOffset = Math.round((this.viewWidth - w)/2);

        p.style.transform = "translate(" +this.photoOffset + "px)";
        setTimeout(this.initSlider, 200, this.photos);
    }

    initSlider(photos){
        let slider = document.getElementById("dr-photo-slider");
        for(let p of photos){
            let photoId = p.Id;
            let photo = document.getElementById("dr-big-p-" + photoId);
            let loader = document.getElementById("dr-loader-p-" + photoId);


            let w = p.Width * (slider.offsetHeight/p.Height);
            photo.style.width = w + "px";
            loader.style.width = w + "px";

        }
    }

    animatePhotos(photos){
        let timeout = 0;
        for(let p of photos){
            let photoId = p.Id;
            let photo = document.getElementById("dr-p-" + photoId);

            setTimeout(function(e){
                e.style.opacity = "1.0" ;
            }, timeout*100, <HTMLElement>photo);
            timeout++;
        }
    }

    showPhoto(photo, selectedPhoto){
        this.isPhotoDisplayed = true;

        let p = document.getElementById("dr-photo-slider-container");
        let slider = document.getElementById("dr-photo-slider");
        let firstPhoto = this.photos[0];

        let w = firstPhoto.Width * (slider.offsetHeight/ firstPhoto.Height);
        let photoOffset = Math.round((this.viewWidth - w)/2);
        
        for (let i=0; i < selectedPhoto; i++){
            photoOffset -= this.getPhotoWidth(i)/2 + this.getPhotoWidth(i+1)/2 + this.PHOTO_MARGIN;
        }

        this.selectedPhoto = selectedPhoto;
        this.photoOffset = photoOffset;
        slider.style.transform = "translate(" +this.photoOffset + "px)";

        p.style.top = "0%";

        this.loadPhoto(selectedPhoto); 
    }

    loadPhoto(selectedPhoto){
        if (selectedPhoto >= (this.photos.length)) {
            return;
        }

        let photo = this.photos[selectedPhoto];
        let photoElement = <HTMLImageElement>document.getElementById("dr-big-p-" + photo.Id);
        let loaderElement = <HTMLImageElement>document.getElementById("dr-loader-p-" + photo.Id);

        if(photoElement.src == ""){
            var _this = this;
            photoElement.addEventListener('load', function(){
                loaderElement.style.opacity = "0.0";
                _this.loadPhoto(selectedPhoto+1);
            });
            this.backend.getQueryToken().then(token=>{
                photoElement.src = "/api/photo/"+photo.Id+"/1920?token="+token;
            });
        }
    }


    getPhotoWidth(id){
        let p = document.getElementById("dr-photo-slider");
        return this.photos[id].Width * (p.offsetHeight/ this.photos[id].Height);
    }

    nextPhoto(){
        if (this.selectedPhoto == (this.photos.length-1)) {
            return;
        }
        
        let p = document.getElementById("dr-photo-slider");
        this.photoOffset -= this.getPhotoWidth(this.selectedPhoto)/2 + this.getPhotoWidth(this.selectedPhoto+1)/2 + this.PHOTO_MARGIN;
        this.selectedPhoto++;
        p.style.transform = "translate(" +this.photoOffset + "px)";

        this.loadPhoto(this.selectedPhoto);
    }

    prevPhoto(){
        if (this.selectedPhoto==0) {
            return;
        }

        let p = document.getElementById("dr-photo-slider");
        this.photoOffset += this.getPhotoWidth(this.selectedPhoto)/2 + this.getPhotoWidth(this.selectedPhoto-1)/2 + this.PHOTO_MARGIN;
        this.selectedPhoto--;
        p.style.transform = "translate(" +this.photoOffset + "px)";
        this.loadPhoto(this.selectedPhoto);
    }

    hidePhoto(){
        this.isPhotoDisplayed = false;
        let p = document.getElementById("dr-photo-slider-container");
        p.style.top = "100%";
    }

    getGallery(galleryId){
        this.backend.get("/api/gallery/"+galleryId).then(res => {
            this.gallery = res.json(); 
            this.backend.getQueryToken().then(token=>{
                this.gallery.coverUrl =  this.sanitizer.bypassSecurityTrustStyle("url(/api/gallery/"+res.json().Id+"/cover?token="+ token+")");
            });
        });
    }


    @HostListener('window:keydown', ['$event'])
    onKeyEvent(event: any) {
        if (event.keyIdentifier == "Right"){
            this.nextPhoto();
        }else if (event.keyIdentifier == "Left"){
            this.prevPhoto();
        }
    }

    @HostListener('window:mousewheel', ['$event'])
    onScrollEvent(event: any) {
        if (this.isPhotoDisplayed){
            if (event.wheelDelta  < 0){
                this.nextPhoto();
            }else{
                this.prevPhoto();
            }
            return false;
        }else{
            if (event.wheelDelta  < 0){
                this.thumbnailsContainer.scrollLeft+=100;
            }else{
                this.thumbnailsContainer.scrollLeft-=100;
            }
            this.scroll.style.width = (100*this.thumbnailsContainer.scrollLeft)/(this.thumbnailsContainer.scrollWidth-this.thumbnailsContainer.offsetWidth) + "%";
        }
    }
}


