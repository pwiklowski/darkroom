import { Component, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { FileSelectDirective } from 'ng2-file-upload';
import { BackendService } from './backend.service';
import { AngularFire } from 'angularfire2';
import { Router } from '@angular/router';

@Component({
    selector: 'app',
    template:`
    <div class="dr-login" *ngIf="!backend.isUserLogged()">
        <button mdl-button mdl-button-type="raised" mdl-colored="primary"  (click)="login()">
        Use My Google Account
        </button>
    </div>`
    ,
   
})


export class LoginComponent {
    public constructor(private backend: BackendService,  public af: AngularFire, private router: Router) {
        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";

        this.af.auth.subscribe(user => {
            if(user) {
                let userData = backend.getUserData(user);
                console.log(userData);
                let u = {
                    DisplayName: userData.displayName,
                    PhotoUrl: userData.photoURL
                };
                
                this.backend.post("/api/me", u).then();

                this.router.navigate(['/galleries']);
            }
        })
    }

    login() {
        this.backend.login();
    }
    
    logout() {
        this.backend.logout();
    }
}



