import { Component, ViewChild, HostListener } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';

import {Gallery, Photo } from './models.ts';

@Component({
    selector: 'my-app',
    templateUrl: './gallery.template.html',

    styles:[`
#dr-gallery{
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
.dr-column-container{
    margin-top: 10%;
    height: 70%;
    display: flex;
    flex-direction: column;
    background-color: rgba(119, 119, 119, 0.09);
}
.dr-photo-column{
    display: flex;
    flex-direction: row;
    height: 33.33%;
}
.dr-photo{
    opacity: 0.8; 
    transition: opacity 100ms ease-in-out;
    height: 100%;
}
.dr-photo-container{
    height: 100%;
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

    ngOnInit() {
        console.log("Gallery component");
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

    constructor(http: Http, router: Router, private route: ActivatedRoute){
        this.router = router;
        this.columns = new Array<number>();
        for(let i = 0; i < this.columnsNumber; i++){
            this.columns.push(i);
        }

        this.http = http;
    }
    
    getPhotos(galleyId){
        this.http.get("/api/gallery/"+galleyId+"/photos").toPromise().then(res => {
                this.photos = res.json();
                this.initGallery();
                setTimeout(this.animatePhotos, 200, this.photos);
            }
        );
    }

    initGallery(){
        console.log("initGallery" + this.photos);
        let container = document.getElementById("body");
        this.viewWidth = container.offsetWidth;
        this.viewHeight = container.offsetHeight;
        console.log("body " + this.viewWidth + " " + this.viewHeight);
        let p = document.getElementById("dr-photo-slider");
        
        let firstPhoto = this.photos[0];
        
        let w = firstPhoto.Width * (p.offsetHeight/ firstPhoto.Height);

        this.photoOffset = Math.round((this.viewWidth - w)/2);
        console.log("photoOffset" + this.photoOffset);

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
        console.log(photo);
        let photoElement = <HTMLImageElement>document.getElementById("dr-big-p-" + photo.Id);
        let loaderElement = <HTMLImageElement>document.getElementById("dr-loader-p-" + photo.Id);

        console.log(photoElement.src);

        if(photoElement.src == ""){
            var _this = this;
            photoElement.addEventListener('load', function(){
                loaderElement.style.opacity = "0.0";
                _this.loadPhoto(selectedPhoto+1);
            });
            photoElement.src = "/api/photo/"+photo.Id+"/1920";
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
        this.http.get("/api/gallery/"+galleryId).toPromise().then(res => {this.gallery = res.json(); console.log(this.gallery);});
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
        }
    }
}


