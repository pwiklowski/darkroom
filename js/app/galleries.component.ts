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

        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";
        setTimeout(this.animate, 20);
        setTimeout(this.animateCovers, 2000);

        
    }

    animate(){
        let header = document.getElementById("dr-header");
        header.style.transform = "translateY(100px)";

        let gh = document.getElementById("dr-header-gh");
        gh.style.transform = "translateX(-100px)";
    }

    animateCovers(){
        var myElements  = document.querySelectorAll(".dr-gallery-name");
        for (var i = 0; i < myElements.length; i++) {
            setTimeout(function(x, e){
                e.style.opacity = "0.0" ;
            }, i*100, i, <HTMLElement>myElements[i]);
        }
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
