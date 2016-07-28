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
    templateUrl: './static/galleries.template.html',
    directives: []
})

export class GalleriesComponent {
    http: Http;
    router: Router;
    galleries: Array<Gallery> = new Array<Gallery>();
    sub: any;
    columnsNumber: number = 3;
    columns: Array<number>;

    constructor(http: Http, router: Router, private route: ActivatedRoute){
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
    }
    getGalleries(){
        this.http.get("/galleries").toPromise().then(res => {
            console.log(res.json());
            this.galleries = res.json();
        });
    }

    toggleSideBar(){
        console.log("toggleSideBar");
    }

}
