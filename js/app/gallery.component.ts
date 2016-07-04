import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';

export class Gallery{
    Name: string;
    Comment: string;
}

export class Photo{
    

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
    columnsNumber: number = 5;
    columns: Array<number>;
    router: Router;
    sub: any;


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
        this.http.get("/gallery/"+galleyId+"/photos").toPromise().then(res => this.photos = res.json());
        }

    showPhoto(pId){
        this.router.navigate(["/photo", pId]);
    }

    getGallery(galleryId){
    this.http.get("/gallery/"+galleryId).toPromise().then(res => {this.gallery = res.json(); console.log(this.gallery);});
    }
}


