import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Gallery, Photo } from './models';
import { BackendService } from './backend.service';
import { FileUploader} from 'ng2-file-upload/ng2-file-upload';
import { MdlDialogService } from 'angular2-mdl';

@Component({
    selector: 'app',
    template:`
<div id="dr-hamburger" (click)="showDrawer()">
    <img class="dr-header-img" src="/assets/img/logo.png">
</div>
<div #drawerClose id="dr-drawer-close" (click)="closeDrawer()">
    <div #drawerCloseFill id="dr-drawer-close-fill"></div>

    <div #drawerButtons id="dr-drawer-buttons">
        <button class="dr-drawer-button" mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="logout()">
            <div class="dr-button-label">Logout</div>
            <mdl-icon>user</mdl-icon>
        </button>
        <button *ngIf="backend.isSuperuser() && getGalleryId()" class="dr-drawer-button" mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="shareGallery()">
            <div class="dr-button-label">Share gallery</div>
            <mdl-icon>share</mdl-icon>
        </button>
        <button *ngIf="backend.isSuperuser() && getGalleryId()" class="dr-drawer-button" mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="removeGallery()">
            <div class="dr-button-label">Remove gallery</div>
            <mdl-icon>delete_forever</mdl-icon>
        </button>
        <button *ngIf="backend.isSuperuser() && getGalleryId()" class="dr-drawer-button" mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="editGallery()">
            <div class="dr-button-label">Edit gallery</div>
            <mdl-icon>add_to_photos</mdl-icon>
        </button>
        <button *ngIf="backend.isSuperuser()" class="dr-drawer-button" mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="newGallery()">
            <div class="dr-button-label">Add new gallery</div>
            <mdl-icon>add</mdl-icon>
        </button>
    </div>
</div>


<div #drawer class="dr-drawer">
    <div class="dr-user-info">
        <img class="dr-user-avatar" src="{{ backend.getUser().photoURL }}"/>   {{backend.getUser().displayName}}
    </div>

    <div class="dr-drawer-title" (click)="showGalleries()">Galleries</div>

    <div *ngFor="let g of galleries" class="dr-drawer-name" (click)="openGallery(g.Id)" >
    {{ g.Name }}
    </div>
    <div *ngIf="galleries.length == 0" class="dr-drawer-name">
        No galleries 
    </div>
</div>
<mdl-dialog #shareGalleryModal [mdl-dialog-config]="{ clickOutsideToClose: true, styles:{'width': '500px'}, isModal:true, enterTransitionDuration: 400, leaveTransitionDuration: 400}" >
  Share gallery
  <div class="mdl-dialog__content">
    <mdl-list>
        <mdl-list-item mdl-ripple *ngFor="let user of users">
            <mdl-list-item-primary-content>
            <mdl-icon *ngIf="user.PhotoUrl ==''" mdl-list-item-avatar>person</mdl-icon>
            <img *ngIf="user.PhotoUrl !=''" class="dr-user-avatar-list" src="{{user.PhotoUrl }}"/> 

            <span>{{user.DisplayName}}</span>
            </mdl-list-item-primary-content>
        </mdl-list-item>
    </mdl-list>
  </div>
  <div class="mdl-dialog__actions">
    <button mdl-button mdl-button-type="raised" mdl-colored="primary" mdl-ripple>Save</button>
    <button mdl-button (click)="shareGalleryModal.close()" mdl-ripple>Cancel</button>
  </div>
</mdl-dialog>


<div #editGalleryModal class="dr-modal-container">
<div class="dr-modal">
    <div >Upload photos</div>
    <mdl-textfield #galleryName type="text" label="Gallery name" floating-label autofocus [(ngModel)]="gallery.Name" (blur)="saveGallery()"></mdl-textfield>
    <mdl-textfield #galleryComment type="text" label="Comment" floating-label autofocus [(ngModel)]="gallery.Comment" (blur)="saveGallery()"></mdl-textfield><br>
    <input type="file" ng2FileSelect [uploader]="uploader" multiple name="uploadField" /><br/>
    <div class="dr-upload">
        <div class="dr-upload-container" *ngFor="let photo of photos">
            <img src="/api/photo/{{photo.Id}}/320" class="dr-upload-photo"/>
            <button mdl-button mdl-button-type="icon"  mdl-colored="primary" (click)="removePhoto(photo.Id)">
                <mdl-icon>remove</mdl-icon>
            </button>
        </div>
        <div class="dr-upload-container" *ngFor="let item of uploader.queue">
            <img src="{{item.photoUrl}}" class="dr-upload-photo"/>
            <button mdl-button mdl-button-type="icon"  mdl-colored="primary" (click)="item.remove()">
                <mdl-icon>remove</mdl-icon>
            </button>
        </div>
    </div>
    <div class="mdl-dialog__actions">
        <button mdl-button mdl-ripple (click)="uploader.uploadAll()" [disabled]="!uploader.getNotUploadedItems().length">
           Upload all
        </button>
        <button mdl-button mdl-ripple (click)="uploader.cancelAll()" [disabled]="!uploader.isUploading">
           Cancel all
        </button>
        <button mdl-button mdl-ripple (click)="uploader.clearQueue()" [disabled]="!uploader.queue.length">
            Remove all
        </button>
        <button mdl-button (click)="getGalleries(); hide(editGalleryModal)" mdl-ripple>Close</button>
    </div>
    </div>
</div>

    
    <router-outlet ></router-outlet>
    `,

    styles:[`
    
#dr-drawer-close{
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 50;
    visibility: hidden;
    overflow: hidden;
}
#dr-drawer-close-fill{
    width: 100%;
    height: 100%;
    background-color:black;
    transition: opacity 200ms ease-in-out;
}
#dr-drawer-buttons{
    position: absolute;
    right: -300px;
    bottom: 20px;
    transition: all 200ms ease-in-out;
    display: flex;
    flex-direction: column;
}
.dr-drawer-button{
    margin: 10px 20px;
}

.dr-button-label{
    position: absolute;
    width: 150px;
    right: 70px;
    top: 0px;
    height: 36px;
    line-height: 36px;
    background-color: rgba(255,255,255, 0.5);
    margin: 10px;
    padding: 0 10px;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    text-transform:none;
}
.mdl-button--fab{
    overflow: visible;
}
.mdl-dialog__content{
    flex: 1 0 auto;
}
.dr-modal-container{
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 10000;
    visibility: hidden;
}
.dr-modal{
    top: 20px;
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    color: black;
    background-color: white;
}
.dr-user-avatar-list{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    margin-right: 20px;
}
.dr-user-avatar{
    width: 60px;
    height: 60px;
    margin: 15px;
    border-radius: 30px;
}
.dr-user-info{
    height: 70px;
    font-size: 22px;
}
    
    `]
})


export class AppComponent {
    viewContainerRef;
    galleries: Array<Gallery> = new Array<Gallery>();
    @ViewChild('drawer') drawer;
    @ViewChild('drawerClose') drawerClose;
    @ViewChild('drawerCloseFill') drawerCloseFill;

    @ViewChild('editGalleryModal') editGalleryModal;
    @ViewChild('createGallery') createGallery;
    @ViewChild('drawerButtons') drawerButtons;

    @ViewChild('shareGalleryModal') shareGalleryModal;

    url: string = "";

    photos = [];
    gallery: Gallery = new Gallery();
    uploader: FileUploader = new FileUploader({url:""});

    users: [];

    public constructor(viewContainerRef:ViewContainerRef,
                       private router: Router,
                       private backend: BackendService,
                       private dialogService: MdlDialogService){
        this.viewContainerRef = viewContainerRef;
        this.getGalleries();
        this.router.events.subscribe((event) => this.url = event.url);

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
        this.drawerButtons.nativeElement.style.right = "0px"

    }

    closeDrawer(){
        this.drawer.nativeElement.style.left = "-400px";
        this.drawerCloseFill.nativeElement.style.opacity = 0;
        this.drawerButtons.nativeElement.style.right = "-300px"
        setTimeout(()=>{
            this.drawerClose.nativeElement.style.visibility= "hidden";
        }, 200);
    }
    showGalleries(){
        this.router.navigate(['/galleries']);
        this.closeDrawer();
    }

    openGallery(galleryId){
        this.router.navigate(['/gallery', galleryId]);
        this.closeDrawer();
    }
    getGalleries(){
        this.backend.get("/api/galleries").then(res => {
            this.galleries = res.json();
        });
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
        });
        this.backend.get("/api/gallery/"+this.getGalleryId()).then(res => {
            this.gallery = res.json();
        });

        this.uploader = new FileUploader({url: '/api/gallery/'+ this.getGalleryId() +'/upload'});

        this.uploader.onCompleteItem = (item, response: string, status: number, headers)=>{
            let data = JSON.parse(response);
            item.photoUrl = "/api/photo/"+data.Id+"/320";
        }
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
                    console.log("Removed gallery " + this.getGalleryId());
                    this.getGalleries();
                    this.router.navigate(['/galleries']);
                });
            },
            (err: any) => {

            }
        );
    }
    saveGallery(){
        this.backend.post("/api/gallery/"+this.gallery.Id, this.gallery).then(res =>{


        });
    }

    shareGallery(){
        this.backend.get("/api/users").then(res => {
            console.log(res.json());
            this.users = res.json();
        });

        this.backend.get("/api/gallery/"+this.getGalleryId()).then(res => {
            this.gallery = res.json();
            this.shareGalleryModal.show();
        });


    }

    newGallery(){
        this.show(this.editGalleryModal.nativeElement);

        this.gallery.Name = "Name";
        this.gallery.Comment = "Comment";
        let gallery = {
            "Name": this.gallery.Name,
            "Comment": this.gallery.Comment
        };
        this.backend.post("/api/createGallery", gallery).then(res => {
            this.gallery = res.json();
            this.uploader = new FileUploader({url: '/api/gallery/'+  this.gallery.Id +'/upload'});

            this.uploader.onCompleteItem = (item, response: string, status: number, headers)=>{
                let data = JSON.parse(response);
                item.photoUrl = "/api/photo/"+data.Id+"/320";
            }

            this.show(this.editGalleryModal.nativeElement);
         });
    }

    logout(){
        this.backend.logout();
        this.router.navigate(['/']);
    }
}



