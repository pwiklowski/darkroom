import { Component, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';
import { Gallery } from './models';
import { BackendService } from './backend.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'my-app',
    templateUrl: './galleries.template.html',
    styles:[`
        .dr-centered-error{
            font-size: 30px;
            left: 50%;
            top: 50%;
            position: absolute;
            transform: translate(-50%,-50%);

        }
    `]
})

export class GalleriesComponent {

    http: Http;
    router: Router;
    galleries: Array<Gallery> = new Array<Gallery>();
    sub: any;
    columnsNumber: number = 3;
    columns: Array<number>;
    token: string;

    constructor(http: Http, router: Router, private route: ActivatedRoute,
                private backend: BackendService, private sanitizer:DomSanitizer){
        this.router = router;
        this.http = http;

        this.backend.getToken().then(token =>{
            console.log("new token is" + token);
            this.token = token;
            this.getGalleries()
        });

    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            console.log("pid" + params['photoId']);
            console.log("id" + params['id']);
        });

        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";
    }

    hideCover(c){
        if (c != this.galleries[0].Id){
            let cover = document.getElementById(c);
            cover.style.opacity = "0";
            setTimeout(()=> cover.style.visibility= "hidden", 500);
        }else{

        }
    }

    getGalleries(){
        this.backend.get("/api/galleries").then(res => {
            this.galleries = res.json();
            this.galleries.forEach(g=> {
                g.url = this.sanitizer.bypassSecurityTrustStyle("url(/api/gallery/"+g.Id+"/cover?token="+ this.backend.getQueryToken());
            });
        });
    }


}
