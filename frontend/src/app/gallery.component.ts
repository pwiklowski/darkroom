import { Input, Component, ViewChild, HostListener, ChangeDetectorRef, OnChanges,NgZone } from '@angular/core';
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
    styleUrls:['./gallery.style.css']
})
export class GalleryComponent{
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

    error;

    ngOnInit() {
        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";
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
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    constructor(private backend: BackendService, private router: Router, private route: ActivatedRoute,
                private af: AngularFire, private sanitizer:DomSanitizer){
    }
    
    getPhotos(galleyId){
        this.backend.get("/api/gallery/"+galleyId+"/photos").then(res => {
            this.photos = res.json();

            if (this.photos.length > 0){
                this.error = undefined;
            }else{
                this.error = "No photos";
            }
        }).catch(()=>{
            console.log("error");
            this.error = "Not found";
        })
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
            if (this.columnsNumber <1) this.columnsNumber = 1;
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


