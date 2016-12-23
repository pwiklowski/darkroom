import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { AngularFire, AuthProviders } from 'angularfire2';


@Injectable()
export class BackendService{
    user = {};
    isLogged = false;

    constructor(private http: Http, public af: AngularFire){
        this.af.auth.subscribe(user => {
            if(user) {
                this.isLogged = true;
                this.user = user;
            }
        });
    }
    isUserLogged(){
        return this.isLogged;
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

    getToken(){
        return new Promise<string>((resolve, reject)=>{
            this.af.auth.subscribe(user => {
                user.auth.getToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.get("/api/token", {headers: h}).toPromise().then((res) =>{
                        resolve(res.json().Token);
                    }).catch(err => reject(err));
                });
            });
        });
    }


    get(url){
        return new Promise<Response>((resolve, reject)=>{
            this.af.auth.subscribe(user => {
                user.auth.getToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.get(url, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
            });
        });
    }

    post(url, data){
        return new Promise<Response>((resolve, reject)=>{
            this.af.auth.subscribe(user => {
                user.auth.getToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.post(url, data, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
            });
        });
    }

    delete(url){
        return new Promise<Response>((resolve, reject)=>{
            this.af.auth.subscribe(user => {
                user.auth.getToken().then((token) => {
                    let h = new Headers({ 'Authorization': token });
                    return this.http.delete(url, {headers: h}).toPromise().then(res => resolve(res)).catch(err => reject(err));
                });
            });
        });
    }

}