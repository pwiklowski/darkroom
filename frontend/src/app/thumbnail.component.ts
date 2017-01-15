import { Component, Input, ViewChild } from '@angular/core';
import { BackendService } from './backend.service';



@Component({
    selector: 'thumbnail',
    template:` <img #photo class="dr-photo" src="assets/img/stub2.gif">`,
    styles: [`
    .dr-photo {
      opacity: 0.1;
      transition: opacity 1000ms ease-in-out;
      width: 100%;
    }
    `]
})
export class ThumbnailComponent{
  @Input('pid') photoId: string;
  @Input('index') index: number;
  @ViewChild('photo') photo;


  constructor(private backend: BackendService){
  }
  ngOnInit(){
    this.backend.getQueryToken().then(token=>{
      this.photo.nativeElement.addEventListener('load',()=>{
      });
      setTimeout(() => {
        this.photo.nativeElement.src = "/api/photo/"+this.photoId+"/320?token="+token; 
        this.photo.nativeElement.style.opacity = "1";
      }, this.index*100);
    });
  }
}