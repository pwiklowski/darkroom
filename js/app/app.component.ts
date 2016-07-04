import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
    selector: 'my-app',
    template:`
  <nav>
      <a [routerLink]="['/gallery/5779650ba14e5e048a6425dc']">Gallery1</a>
      <a [routerLink]="['/gallery/5778e9d5a14e5e5625c010f9']">Gallery2</a>
      <a [routerLink]="['/photo/5778e9d57e46650d9a0965fa']">photo</a>
      <a [routerLink]="['/photo/5778e9d57e46650d9a0965fb']">photo</a>
  </nav>
  <router-outlet></router-outlet>
  ` ,
  directives: [ROUTER_DIRECTIVES]
   
})


export class AppComponent {

}



