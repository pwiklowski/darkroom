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
    <button id="dr-create-gallery-button" #editUserButton mdl-button mdl-button-type="fab" mdl-colored="primary" mdl-ripple (click)="createGallery.show()">
        <mdl-icon>add</mdl-icon>
    </button>
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
        
        <h3 class="mdl-dialog__title">Upload photos</h3>
        <input type="file" ng2FileSelect [uploader]="uploader" multiple name="uploadField" /><br/>
        <div class="dr-upload">
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
}
#dr-drawer-close-fill{
    width: 100%;
    height: 100%;
    background-color:black;
    transition: opacity 200ms ease-in-out;
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
    uploader: FileUploader = new FileUploader({url:""});

    public constructor(viewContainerRef:ViewContainerRef,
                       private router: Router,
                       private backend: BackendService){
        this.viewContainerRef = viewContainerRef;
        this.getGalleries();
    }
    showDrawer(){
        this.drawer.nativeElement.style.left = 0;
        this.drawerCloseFill.nativeElement.style.opacity = "0.6";
        this.drawerClose.nativeElement.style.visibility= "visible";
    }

    closeDrawer(){
        this.drawer.nativeElement.style.left = "-400px";
        this.drawerCloseFill.nativeElement.style.opacity = 0;
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



