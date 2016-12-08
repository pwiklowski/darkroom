import { Component, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';
import { Gallery } from './models';
import { BackendService } from './backend.service';
import { FileUploader} from 'ng2-file-upload/ng2-file-upload';

@Component({
    selector: 'my-app',
    templateUrl: './galleries.template.html',
})

export class GalleriesComponent {
    @ViewChild('uploadPhotos') uploadPhotos;
    @ViewChild('createGallery') createGallery;
    uploader: FileUploader = new FileUploader({url:""});

    http: Http;
    router: Router;
    galleries: Array<Gallery> = new Array<Gallery>();
    sub: any;
    columnsNumber: number = 3;
    columns: Array<number>;

    constructor(http: Http, router: Router, private route: ActivatedRoute, private backend: BackendService){
        this.router = router;
        this.http = http;

        this.getGalleries()

        this.columns = new Array<number>();
        for(let i = 0; i < this.columnsNumber; i++){
            this.columns.push(i);
        }
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            console.log("pid" + params['photoId']);
            console.log("id" + params['id']);
        });

        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";
        setTimeout(this.animate, 20);

        
    }

    animate(){
        let header = document.getElementById("dr-header");
        header.style.transform = "translateY(100px)";

        let gh = document.getElementById("dr-header-gh");
        gh.style.transform = "translateX(-100px)";
    }

    animateCovers(galleries){
        let timeout = 0;
        console.log(galleries);
        for(let g of galleries){
            let galleryId = g.Id;
            let galleryNameCover = document.getElementById("dr-gn-" + galleryId);

            setTimeout(function(e){
                e.style.opacity = "0.0" ;
            }, timeout*100, <HTMLElement>galleryNameCover);
            timeout++;
        }
    }

    getGalleries(){
        this.backend.get("/api/galleries").then(res => {
            console.log(res.json());
            this.galleries = res.json();
            setTimeout(this.animateCovers, 2000, this.galleries);
        });
    }

    addGallery(name){
        let gallery = {
            "Name": name,
            "Comment": ""
        };
        this.backend.post("/api/createGallery", gallery).then(
            res => {
                let g = res.json();
                this.createGallery.close();
                let editedGalleryId = g.Id;
                this.uploader = new FileUploader({url: '/api/gallery/'+  editedGalleryId +'/upload'});
                this.uploadPhotos.show();
            }
        );
    }
}
