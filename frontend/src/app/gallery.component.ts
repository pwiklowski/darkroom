import { Component, ViewChild, HostListener } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {Gallery, Photo } from './models.ts';
import {BackendService} from './backend.service';
import { AngularFire, AuthProviders } from 'angularfire2';

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
    height: 100%;
    overflow-y: scroll;
    display: flex;
    flex-direction: row;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
}
.dr-photo-column{
    display: flex;
    flex-direction: column;
    width: 300px;
}
.dr-photo:hover{
    opacity: 1;
}
.dr-photo{
    transition: opacity 400ms ease-in-out;
    width: 100%;
}
#dr-photo{
    max-width: 95%;
    max-height: 98%;;
    transform: translate(-50%,-50%);
    top: 50%;
    left: 50%;
    position: absolute;
    transition: opacity 500ms ease-in-out;
    opacity: 0;
}
.dr-photo-container{
    margin:  5px;
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

.dr-close-icon{
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
 
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

#dr-photo-loader{
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
}
    .dr-centered-error{
        font-size: 30px;
        left: 50%;
        top: 50%;
        position: absolute;
        transform: translate(-50%,-50%);

    }
    
    `]

})
export class GalleryComponent {
    photos = [];
    gallery: Gallery;
    currentPhoto: number = 0;
    columnsNumber: number = 5;
    columns: Array<number>;
    sub: any;
    isPhotoDisplayed: boolean = false;
    photoId: string;

    selectedPhoto: number = 0;
    editedGalleryId: string;

    galleryId;

    photoUrl;
    photo: HTMLImageElement;
    photoLoader: HTMLElement;
    photoContainer: HTMLElement;
    columnContainer: HTMLElement;

    galleriesSub;
    error;

    ngOnInit() {
        this.photo = <HTMLImageElement>document.getElementById("dr-photo");
        this.photoLoader = <HTMLElement>document.getElementById("dr-photo-loader");
        this.photoContainer = <HTMLElement>document.getElementById("dr-photo-container");
        this.columnContainer =document.getElementById("dr-column-container");
        this.onResize();
        this.sub = this.route.params.subscribe(params => {
            this.gallery = new Gallery();
            this.galleryId = params['id'];
            
            this.getPhotos(this.galleryId);
            this.getGallery(this.galleryId);

        });
        this.galleriesSub = this.backend.galleries.subscribe(galleries => {
            this.getPhotos(this.galleryId);
            this.getGallery(this.galleryId);
        });
        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";


    }
    ngOnDestroy() {
        this.sub.unsubscribe();
        this.galleriesSub.unsubscribe();
    }

    constructor(private backend: BackendService, private router: Router, private route: ActivatedRoute,
                private af: AngularFire, private sanitizer:DomSanitizer){
    }
    
    getPhotos(galleyId){
        this.backend.get("/api/gallery/"+galleyId+"/photos").then(res => {
            this.photos = res.json();
            this.photos.forEach(photo =>{
                photo.url = "assets/img/stub2.gif";
            });

            if (this.photos.length > 0){
                setTimeout(()=>this.animateThumbnails(), 200);
            }
            this.error = undefined;
        }).catch(()=>{
            console.log("error");
            this.error = "Not found";
        })
    }

    animateThumbnails(){
        let timeout = 1;
        this.backend.getQueryToken().then(token=>{
            for(let p of this.photos){
                let photoId = p.Id;
                let photo = document.getElementById("dr-p-" + photoId);
                photo.url = "";

                photo.style.opacity = "0.1" ;
                photo.addEventListener('load',()=>{
                    photo.style.opacity = "1";
                });
                setTimeout(() => {
                    p.url = "/api/photo/"+p.Id+"/320?token="+token; 
                }, timeout*100);
                timeout++;
            }
        });
    }

    showPhoto(photo, selectedPhoto){
        this.isPhotoDisplayed = true;
        this.photoContainer.style.opacity= "1";
        this.photoContainer.style.visibility = "visible";
        this.loadPhoto(selectedPhoto); 
    }

    loadPhoto(selectedPhoto){
        this.selectedPhoto = selectedPhoto;
        if (selectedPhoto >= (this.photos.length)) {
            return;
        }
        let photo = this.photos[selectedPhoto];

        this.photo.src = "";
        this.photoLoader.style.opacity = "1";
        this.photo.style.opacity = "0";

        this.backend.getQueryToken().then(token=>{
            this.photo.src = "/api/photo/"+photo.Id+"/1920?token="+token;
            this.photo.addEventListener('load', ()=>{
                this.photoLoader.style.opacity = "0";
                this.photo.style.opacity = "1";
            })
        });
    }

    nextPhoto(){
        if (this.selectedPhoto == (this.photos.length-1)) {
            return;
        }
        this.selectedPhoto++;
        this.loadPhoto(this.selectedPhoto);
    }

    prevPhoto(){
        if (this.selectedPhoto==0) {
            return;
        }
        this.selectedPhoto--;
        this.loadPhoto(this.selectedPhoto);
    }

    hidePhoto(){
        this.isPhotoDisplayed = false;
        this.photoContainer.style.opacity = "0";
        setTimeout(()=>{
            this.photoContainer.style.visibility = "hidden";
        }, 200);
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

    @HostListener('window:resize', ['$event'])
    onResize() {
        let calculatedColumnNumber = Math.floor((this.columnContainer.offsetWidth - 250)/300);
        if (calculatedColumnNumber !== this.columnsNumber){
            this.columnsNumber = Math.floor((this.columnContainer.offsetWidth - 250)/300);
            this.columns = new Array<number>();
            for(let i = 0; i < this.columnsNumber; i++){
                this.columns.push(i);
            }
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


