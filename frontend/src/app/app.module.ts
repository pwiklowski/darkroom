import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';

import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';
import { Ng2BootstrapModule } from "ng2-bootstrap";
import { FileSelectDirective } from 'ng2-file-upload';
import { MdlModule } from 'angular2-mdl';

import { GalleriesComponent } from './galleries.component';
import { GalleryComponent } from './gallery.component';

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    GalleryComponent,
    GalleriesComponent,
    FileSelectDirective
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    HttpModule,
    Ng2BootstrapModule,
    MdlModule,
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) {}

  hmrOnInit(store) {
    this.appRef.tick();
  }

  hmrOnDestroy(store) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues  = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}

