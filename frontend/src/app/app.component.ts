import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Gallery } from './models';
import { BackendService } from './backend.service';
import { FileUploader} from 'ng2-file-upload/ng2-file-upload';

@Component({
    selector: 'app',
    template:`
<div id="dr-hamburger" (click)="showDrawer()">
    <img class="dr-header-img" src="/assets/img/logo.png">
</div>
<div #drawerClose id="dr-drawer-close" (click)="closeDrawer()">
    <div #drawerCloseFill id="dr-drawer-close-fill"></div>

    <div #drawerButtons id="dr-drawer-buttons">
        <button *ngIf="getGalleryId()" class="dr-drawer-button" mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="removeGallery()">
            <div class="dr-button-label">Remove gallery</div>
            <mdl-icon>delete_forever</mdl-icon>
        </button>
        <button *ngIf="getGalleryId()" class="dr-drawer-button" mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="editGallery()">
            <div class="dr-button-label">Edit gallery</div>
            <mdl-icon>add_to_photos</mdl-icon>
        </button>
        <button class="dr-drawer-button" mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="createGallery.show()">
            <div class="dr-button-label">Add new gallery</div>
            <mdl-icon>add</mdl-icon>
        </button>
    </div>
</div>


<div #drawer class="dr-drawer">
    <div class="dr-drawer-title" (click)="showGalleries()">Galleries</div>

    <div *ngFor="let g of galleries" class="dr-drawer-name" (click)="openGallery(g.Id)" >
    {{ g.Name }}
    </div>
</div>


<mdl-dialog #createGallery
            [mdl-dialog-config]="{
              clickOutsideToClose: true,
              styles:{'width': '300px', 'color': black},
              isModal:true,
              enterTransitionDuration: 400,
              leaveTransitionDuration: 400}">
    <h3 class="mdl-dialog__title">Create gallery</h3>
    <mdl-textfield #galleryName type="text" label="Gallery name" floating-label autofocus></mdl-textfield>
    <div class="mdl-dialog__actions">
        <button mdl-button (click)="addGallery(galleryName.value)" mdl-ripple>Create</button>
        <button mdl-button (click)="createGallery.close()" mdl-ripple>Cancel</button>
    </div>
</mdl-dialog>

<mdl-dialog #uploadPhotos [mdl-dialog-config]="{
              styles:{'width': '90%', 'height':'90%', 'display': 'flex'},
              isModal:true,
              openFrom: editUserButton,
              enterTransitionDuration: 400,
              leaveTransitionDuration: 400}">
        
        <div >Upload photos</div>
        <mdl-textfield #galleryName type="text" label="Gallery name" floating-label autofocus [(ngModel)]="gallery.Name" (blur)="saveGallery()"></mdl-textfield><br>
        <mdl-textfield #galleryComment type="text" label="Comment" floating-label autofocus [(ngModel)]="gallery.Comment" (blur)="saveGallery()"></mdl-textfield><br>
        <input type="file" ng2FileSelect [uploader]="uploader" multiple name="uploadField" /><br/>
        <div class="dr-upload">
            <div class="dr-upload-container" *ngFor="let photo of photos">
                <img src="/api/photo/{{photo.Id}}/320" class="dr-upload-photo"/>
                <button mdl-button mdl-button-type="icon"  mdl-colored="primary" (click)="item.remove()">
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
        <button mdl-button (click)="getGalleries(); uploadPhotos.close()" mdl-ripple>Close</button>
    </div>
</mdl-dialog>
    
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
    
    
    `]
})


export class AppComponent {
    viewContainerRef;
    galleries: Array<Gallery> = new Array<Gallery>();
    @ViewChild('drawer') drawer;
    @ViewChild('drawerClose') drawerClose;
    @ViewChild('drawerCloseFill') drawerCloseFill;

    @ViewChild('uploadPhotos') uploadPhotos;
    @ViewChild('createGallery') createGallery;
    @ViewChild('drawerButtons') drawerButtons;

    url: string;

    photos = [];
    gallery: Gallery = new Gallery();
    uploader: FileUploader = new FileUploader({url:""});

    public constructor(viewContainerRef:ViewContainerRef,
                       private router: Router,
                       private backend: BackendService){
        this.viewContainerRef = viewContainerRef;
        this.getGalleries();
        this.router.events.subscribe((event) => this.url = event.url);
    }

    getGalleryId(){
        if (this.url.indexOf("/gallery/") !== -1){
            return this.url.split("/")[2];
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

    editGallery(){
        this.uploadPhotos.show();
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

    removeGallery(){
        this.backend.delete("/api/gallery/"+this.getGalleryId()).then(res =>{
            console.log("Removed gallery " + this.getGalleryId());
            this.getGalleries();
            this.router.navigate(['/galleries']);
        });
    }
    saveGallery(){
        this.backend.post("/api/gallery/"+this.gallery.Id, this.gallery).then(res =>{


        });
    }

    addGallery(name){
        let gallery = {
            "Name": name,
            "Comment": ""
        };
        this.backend.post("/api/createGallery", gallery).then(
            res => {
                let g = res.json();
                this.createGallery.close();
                let editedGalleryId = g.Id;
                this.uploader = new FileUploader({url: '/api/gallery/'+  editedGalleryId +'/upload'});

                this.uploader.onCompleteItem = (item, response: string, status: number, headers)=>{
                    let data = JSON.parse(response);
                    item.photoUrl = "/api/photo/"+data.Id+"/320";
                }

                this.uploadPhotos.show();
            }
        );
    }
}



