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