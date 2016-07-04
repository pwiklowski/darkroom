import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';

export class Photo{
    

}

@Component({
    selector: 'my-app',
    template:`
<div class="dr-gallery">
    <div class="dr-title">{{photo.Name}}</div>
    <div class="dr-comment">{{photo.Id}}</div>
    <img class="dr-photo b-lazy" src="photo/{{photoId}}/1920">
</div>`
    
})
export class PhotoComponent {
    http: Http;
    router: Router;
    photo: Photo;
    sub: any;
    photoId: string;

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            let id = params['id'];
            console.log("photo id " + id);
            this.photoId = id;
            this.getPhoto(id);
        });
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    
    getPhoto(photoId){
        this.http.get("/photo/"+photoId+"/info").toPromise().then(res => this.photo = res.json());
    }

    constructor(http: Http, router: Router, private route: ActivatedRoute){
        this.router = router;
        this.http = http;
        this.photo = new Photo();
    }

}
