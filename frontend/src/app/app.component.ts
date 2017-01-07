import { Component, ViewChild, ViewContainerRef,HostListener } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Gallery, Photo } from './models';
import { BackendService } from './backend.service';
import { FileUploader} from 'ng2-file-upload/ng2-file-upload';
import { MdlDialogService } from 'angular2-mdl';
import { AngularFire, AuthProviders } from 'angularfire2';

declare var VERSION: any;

@Component({
    selector: 'app',
    templateUrl: './app.template.html',
    styleUrls: ['./app.style.css'],
})
export class AppComponent {
    viewContainerRef;
    @ViewChild('drawer') drawer;
    @ViewChild('drawerClose') drawerClose;
    @ViewChild('drawerCloseFill') drawerCloseFill;

    @ViewChild('editGalleryModal') editGalleryModal;
    @ViewChild('createGallery') createGallery;
    @ViewChild('drawerButtons') drawerButtons;

    @ViewChild('shareGalleryModal') shareGalleryModal;

    @ViewChild('loginModal') loginModal;

    url: string = "";

    photos = [];
    gallery: Gallery = new Gallery();
    uploader: FileUploader = new FileUploader({url:""});

    users = [];

    isDrawerVisible: boolean = false;

    public constructor(viewContainerRef:ViewContainerRef,
                       private router: Router,
                       private backend: BackendService,
                       private dialogService: MdlDialogService,
                       private af: AngularFire){

        this.viewContainerRef = viewContainerRef;
        this.router.events.subscribe((event) =>{
            console.log(event.url);
            console.log("is logged " + this.backend.isUserLogged());
            this.url = event.url;
        });
    }

    getVersion(){
        return VERSION;
    }


    getGalleryId(){
        if (this.url.indexOf("/gallery/") !== -1){
            return this.url.split("/")[2];
        }else if (this.gallery.Id !== undefined){
            return this.gallery.Id;
        }
        return undefined;
    }

    showDrawer(){
        this.drawer.nativeElement.style.left = 0;
        this.drawerCloseFill.nativeElement.style.opacity = "0.6";
        this.drawerClose.nativeElement.style.visibility= "visible";
        this.drawerButtons.nativeElement.style.right = "0px";
        this.isDrawerVisible = true;

    }

    closeDrawer(){
        this.drawer.nativeElement.style.left = "-400px";
        this.drawerCloseFill.nativeElement.style.opacity = 0;
        this.drawerButtons.nativeElement.style.right = "-300px"
        setTimeout(()=>{
            this.drawerClose.nativeElement.style.visibility= "hidden";
        }, 200);
        this.isDrawerVisible = false;
    }
    showGalleries(){
        this.router.navigate(['/galleries']);
        this.closeDrawer();
    }

    openGallery(galleryId){
        this.router.navigate(['/gallery', galleryId]);
        this.closeDrawer();
    }

    show(el){
        el.style.visibility= "visible";
    }

    hide(el){
        console.log(el);
        el.style.visibility = "hidden";
    }

    editGallery(){
        this.show(this.editGalleryModal.nativeElement);
        this.backend.get("/api/gallery/"+this.getGalleryId()+"/photos").then(res => {
            this.photos = res.json();
            this.backend.getQueryToken().then(queryToken=>{
                this.photos.forEach(photo=>{
                    photo.url = "/api/photo/"+photo.Id+"/320?token="+queryToken;
                });
            });
        });
        this.backend.get("/api/gallery/"+this.getGalleryId()).then(res => {
            this.gallery = res.json();
        });

        this.backend.getAuthToken().then(token=>{
            this.uploader = new FileUploader({url: '/api/gallery/'+ this.getGalleryId() +'/upload', authToken: token });
                this.uploader.onCompleteItem = (item, response: string, status: number, headers)=>{
                    this.backend.getQueryToken().then(queryToken=>{
                        let data = JSON.parse(response);
                        item.url = "/api/photo/"+data.Id+"/320?token="+queryToken;
                    });
                }
        });
    }

    removePhoto(photoId){
        let r = this.dialogService.confirm('Are you sure ?', 'No', 'Yes');
        r.subscribe(()=>{
                this.backend.delete("/api/photo/"+photoId).then(res =>{
                    for(let i=0; this.photos.length; i++){
                        if (this.photos[i].Id === photoId){
                            this.photos.splice(i,1);
                            break;
                        }
                    }
                });
            },
            (err: any) => {

            }
        );


    }

    removeGallery(){
        let r = this.dialogService.confirm('Are you sure ?', 'No', 'Yes');
        r.subscribe(()=>{
                this.backend.delete("/api/gallery/"+this.getGalleryId()).then(res =>{
                    this.backend.refreshGalleries();
                    this.router.navigate(['/galleries']);
                });
            },
            (err: any) => {

            }
        );
    }
    saveGallery(modal){
        this.backend.post("/api/gallery/"+this.gallery.Id, this.gallery).then(res =>{
            if (modal !== undefined){
                modal.close();
            }
        });
    }

    isSharedToUser(userID){
        return this.gallery.UsersIDs.indexOf(userID) !== -1
    }

    shareGallery(){
        this.backend.get("/api/users").then(res => {
            this.users = res.json();
        });

        this.backend.get("/api/gallery/"+this.getGalleryId()).then(res => {
            this.gallery = res.json();
            this.shareGalleryModal.show();
        });
    }

    toggleSharing(userID){
        let index = this.gallery.UsersIDs.indexOf(userID);
        if (index !== -1){
            this.gallery.UsersIDs.splice(index, 1);
        }else{
            this.gallery.UsersIDs.push(userID);
        }
    }

    newGallery(){
        this.gallery.Name = "Name";
        this.gallery.Comment = "Comment";
        let gallery = {
            "Name": this.gallery.Name,
            "Comment": this.gallery.Comment,
            "UsersIDs": []
        };
        this.backend.post("/api/createGallery", gallery).then(res => {
            this.gallery = res.json();

            this.backend.getAuthToken().then(token=>{
                this.uploader = new FileUploader({url: '/api/gallery/'+  this.gallery.Id +'/upload',
                                                  authToken: token });

                    this.uploader.onCompleteItem = (item, response: string, status: number, headers)=>{
                        this.backend.getQueryToken().then(queryToken=>{
                            if (status === 200){
                                let data = JSON.parse(response);
                                item.url = "/api/photo/"+data.Id+"/320?token="+queryToken;
                            }
                        });
                    }

                this.show(this.editGalleryModal.nativeElement);
            });

         });
    }

    @HostListener('window:keydown', ['$event'])
    onKeyEvent(event: any) {
        console.log(event);
        if (event.keyCode == 192){
            if (this.isDrawerVisible)
                this.closeDrawer();
            else
                this.showDrawer();

        }
    }

    handleLogin(userData){
        if(userData) {
            let u = {
                DisplayName: userData.displayName,
                PhotoUrl: userData.photoURL
            };
            this.backend.post("/api/me", u).then();
            
            this.loginModal.close();
            this.closeDrawer();
        }
    }

    loginGoogle() {
        this.backend.login(AuthProviders.Google).then(user=>{
            this.handleLogin(user.auth);
        });
    }
    loginTwitter() {
        this.backend.login(AuthProviders.Twitter).then(user=>{
            this.handleLogin(user.auth);
        });
    }
    loginFacebook() {
        this.backend.login(AuthProviders.Facebook).then(user=>{
            this.handleLogin(user.auth);
        });
    }
    
    logout() {
        this.backend.logout();
    }


}



