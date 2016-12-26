import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { AngularFire, AuthProviders } from 'angularfire2';
import {Observable} from 'rxjs/Rx';

import { Subscription } from 'rxjs/Rx';


@Injectable()
export class BackendService{
    user = {};
    superuser:boolean;
    isLogged = false;
    tokenData;

    constructor(private http: Http, public af: AngularFire){
        this.af.auth.subscribe(user => {
            if(user) {
                this.isLogged = true;
                this.user = user;
                this.get("/api/me").then((user)=>{
                    this.superuser = user.json().IsSuperuser;
                });

                this.get("/api/token").then((res) =>{
                    this.tokenData = res.json();
                });
            }
        });
    }

    getQueryToken(){
        return new Promise<string>((resolve, reject) => {
            let date = new Date();
            if((date.getTime()/1000) < this.tokenData.ValidTo){
                resolve(JSON.parse(JSON.stringify(this.tokenData.Token)));
            }else{
                this.get("/api/token").then((res) =>{
                    this.tokenData = res.json();
                    resolve(JSON.parse(JSON.stringify(this.tokenData.Token)));
                });
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
        }
    }

    getUser(){
        if (this.user.provider == AuthProviders.Google){
            return this.user.google;
        }else if (this.user.provider == AuthProviders.Facebook){
            return this.user.facebook;
        }

        return this.user;
    }

    login(){
        this.af.auth.login({
            provider: AuthProviders.Google
        });
    }
    logout(){
        this.af.auth.logout();
        this.user = {};
        this.isLogged = false;
    }
    getAuthToken(){
        return new Promise<string>((resolve, reject)=>{
            this.af.auth.subscribe(user => {
                user.auth.getToken().then((token) => {
                    resolve(token);
                });
            });
        });
    }

    get(url){
        return new Promise<Response>((resolve, reject)=>{
            this.af.auth.subscribe(user => {
                this.getAuthToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.get(url, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
            });
        });
    }

    post(url, data){
        return new Promise<Response>((resolve, reject)=>{
            this.af.auth.subscribe(user => {
                this.getAuthToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.post(url, data, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
            });
        });
    }

    delete(url){
        return new Promise<Response>((resolve, reject)=>{
            this.af.auth.subscribe(user => {
                this.getAuthToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.delete(url, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
            });
        });
    }

}