import { Component, HostListener } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';

export class Gallery{
    Name: string;
    Comment: string;
}

export class Photo{
    Width: number;
    Height: number;

}

@Component({
    selector: 'my-app',
    templateUrl: './static/gallery.template.html'
})

export class GalleryComponent {
    http: Http;
    photos;
    gallery: Gallery;
    currentPhoto: number = 0;
    columnsNumber: number = 4;
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

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.gallery = new Gallery();
            let id = params['id'];
            this.getPhotos(id);
            this.getGallery(id);
        });
        
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
        this.http.get("/gallery/"+galleyId+"/photos").toPromise().then(res => {
                this.photos = res.json();
                this.initGallery();
            }
        );
    }



    initGallery(){
        console.log("initGallery");
        let container = document.getElementById("body");
        this.viewWidth = container.offsetWidth;
        this.viewHeight = container.offsetHeight;
        console.log("body " + this.viewWidth + " " + this.viewHeight);
        let p = document.getElementById("dr-photo-slider");
        
        let firstPhoto = this.photos[0];
        console.log(p);
        
        let w = firstPhoto.Width * (p.offsetHeight/ firstPhoto.Height);
        console.log("firstPhoto" + w);

        this.photoOffset = Math.round((this.viewWidth - w)/2);
        console.log("photoOffset" + this.photoOffset);

        p.style.left = this.photoOffset + "px";
    }

    showPhoto(photo, selectedPhoto){
        console.log(photo + " " +  selectedPhoto);
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
        slider.style.left = photoOffset + "px";

        p.style.top = "0%";
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
        p.style.left = this.photoOffset + "px";
    }

    prevPhoto(){
        if (this.selectedPhoto==0) {
            return;
        }
        let p = document.getElementById("dr-photo-slider");
        this.photoOffset += this.getPhotoWidth(this.selectedPhoto)/2 + this.getPhotoWidth(this.selectedPhoto-1)/2 + this.PHOTO_MARGIN;
        this.selectedPhoto--;
        p.style.left = this.photoOffset + "px";
    }

    hidePhoto(){
        console.log("hidePhoto");
        let p = document.getElementById("dr-photo-slider-container");
        p.style.top = "100%";
    }


    getGallery(galleryId){
        this.http.get("/gallery/"+galleryId).toPromise().then(res => {this.gallery = res.json(); console.log(this.gallery);});
    }

    @HostListener('window:keydown', ['$event'])
    onKeyEvent(event: any) {
        if (event.keyIdentifier == "Right"){
            this.nextPhoto();
        }else if (event.keyIdentifier == "Left"){
            this.prevPhoto();
        }
    }

    @HostListener('window:scroll', ['$event'])
    onScrollEvent(event: any) {
        console.log(event);
        if (event.keyIdentifier == "Right"){
            console.log("right");
            this.nextPhoto();
        }else if (event.keyIdentifier == "Left"){
            console.log("left");
            this.prevPhoto();
        }
    }
}


