import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';

export class Gallery{
    Name: string;
    Comment: string;
}

@Component({
    selector: 'my-app',
    template: 'nic'
})

export class GalleriesComponent {
    http: Http;
    router: Router;

    constructor(http: Http, router: Router){
        this.router = router;
        this.http = http;
    }

    getGalleries(){
        this.http.get("/galleries").toPromise().then(res => console.log(res.json()));
    }
}
