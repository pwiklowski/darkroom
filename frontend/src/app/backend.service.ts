import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { AngularFire, AuthProviders } from 'angularfire2';
import {Observable} from 'rxjs/Rx';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';


@Injectable()
export class BackendService{
    user;
    superuser:boolean;
    isLogged = false;
    tokenData;

    constructor(private http: Http, public af: AngularFire, private router: Router){
        this.af.auth.subscribe(user => {
            if(user) {
                this.isLogged = true;
                this.user = user;
                this.get("/api/me").then((user)=>{
                    this.superuser = user.json().IsSuperuser;
                });
            }
        });
    }

    getQueryToken(){
        return new Promise<string>((resolve, reject) => {
            let date = new Date();
            if(this.tokenData !== undefined && (date.getTime()/1000) < this.tokenData.ValidTo){
                resolve(JSON.parse(JSON.stringify(this.tokenData.Token)));
            }else{
                if (this.isUserLogged()){
                    this.get("/api/token").then((res) =>{
                        this.tokenData = res.json();
                        resolve(JSON.parse(JSON.stringify(this.tokenData.Token)));
                    });
                }else{
                    resolve(null);
                }

            }
        });
    }

    refreshToken(){
        this.get("/api/token").then((res) =>{
            this.tokenData = res.json();
        });
    }

    isSuperuser(){
        return this.superuser;
    }
    isUserLogged(){
        return this.isLogged;
    }
    getUserData(user){
        if (user.provider == AuthProviders.Google){
            return user.google;
        }else if (user.provider == AuthProviders.Facebook){
            return user.facebook;
        }else if (user.provider == AuthProviders.Twitter){
            return user.twitter;
        }
    }

    getUser(){
        if (this.user)
            return this.getUserData(this.user);
        else
            return undefined;
    }

    login(authProvider){
        return this.af.auth.login({
            provider: authProvider
        });
    }
    logout(){
        this.router.navigate(["/"]);
        this.af.auth.logout();
        this.user = undefined;
        this.isLogged = false;
        this.superuser = false;
    }
    getAuthToken(){
        return new Promise<string>((resolve, reject)=>{
            console.log(this.user);
            if (this.user){
                this.user.auth.getToken().then((token) => {
                    resolve(token);
                });
            }else{
                resolve(null);
            }
        });
    }

    get(url){
        return new Promise<Response>((resolve, reject)=>{
                this.getAuthToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.get(url, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
        });
    }

    post(url, data){
        return new Promise<Response>((resolve, reject)=>{
                this.getAuthToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.post(url, data, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
        });
    }

    delete(url){
        return new Promise<Response>((resolve, reject)=>{
                this.getAuthToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.delete(url, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
        });
    }

}