import { Component, Input, ViewChild } from '@angular/core';
import { BackendService } from './backend.service';



@Component({
    selector: 'thumbnail',
    template:`<div class="dr-thumbnail-container">
                <img #photo class="dr-thumbnail" src="assets/img/stub2.gif" (mouseover)="showVotes(true)" (mouseout)="showVotes(false)">
              </div>`,
    styles: [`
    .dr-thumbnail-container{
      overflow: hidden;
      position: relative;
    }

    .dr-thumbnail{
      opacity: 0.1;
      width: 100%;
      cursor: zoom-in;
      transition: opacity 1000ms ease-in-out;
      transition: all 200ms ease-in-out;
    }
    .dr-thumbnail:hover{
      transform: scale(1.1);

      -webkit-filter: blur(2px);
      -moz-filter: blur(2px);
      -o-filter: blur(2px);
      -ms-filter: blur(2px);
      filter: blur(2px);
    }

    `]
})
export class ThumbnailComponent{
  @Input('pid') photoId: string;
  @Input('index') index: number;
  @ViewChild('photo') photo;
  @ViewChild('photoContainer') photoContainer;


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