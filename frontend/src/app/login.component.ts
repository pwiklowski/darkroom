import { Component, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { FileSelectDirective } from 'ng2-file-upload';
import { BackendService } from './backend.service';
import { AngularFire, AuthProviders } from 'angularfire2';
import { Router } from '@angular/router';

@Component({
    selector: 'app',
    template:`
    <div class="dr-login" *ngIf="!backend.isUserLogged()">
        <div class="dr-login-buttons">
            <button mdl-button mdl-button-type="raised" mdl-colored="primary"  (click)="loginGoogle()">
                Use My Google Account
            </button>
            <button mdl-button mdl-button-type="raised" mdl-colored="primary"  (click)="loginFacebook()">
                Use My Facebook Account
            </button>
            <button mdl-button mdl-button-type="raised" mdl-colored="primary"  (click)="loginTwitter()">
                Use My Twitter Account
            </button>
        </div>
    </div>`
    ,
    styles: [`
    
    .dr-login{
        position: absolute;
        width: 100%;
        height: 100%;
        background-color:black;
        z-index: 100;
    }
    .dr-login-buttons{
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        position: absolute;
    }

    `]
   
})


export class LoginComponent {
    authSub;

    constructor(private backend: BackendService,  public af: AngularFire, private router: Router) {
        let loader = document.getElementById("dr-loader");
        loader.style.opacity = "0";

    }

    handleLogin(user){
        if(user) {
            let userData = this.backend.getUserData(user);
            console.log(userData);
            let u = {
                DisplayName: userData.displayName,
                PhotoUrl: userData.photoURL
            };
            
            this.backend.post("/api/me", u).then();
            
            console.log("redirect to galleries");
            this.router.navigate(['/galleries']);
        }
    }

    loginGoogle() {
        this.backend.login(AuthProviders.Google).then(user=>{
            this.handleLogin(user);
        });
    }
    loginTwitter() {
        this.backend.login(AuthProviders.Twitter).then(user=>{
            this.handleLogin(user);
        });
    }
    loginFacebook() {
        this.backend.login(AuthProviders.Facebook).then(user=>{
            this.handleLogin(user);
        });
    }
    
    logout() {
        this.backend.logout();
    }
}



