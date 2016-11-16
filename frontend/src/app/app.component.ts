import { Component, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';

@Component({
    selector: 'app',
    template:`
    <router-outlet></router-outlet> ` ,
   
})


export class AppComponent {
    viewContainerRef;
    public constructor(viewContainerRef:ViewContainerRef) {
        // You need this small hack in order to catch application root view container ref
        this.viewContainerRef = viewContainerRef;
    }
}



