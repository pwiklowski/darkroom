///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import { bootstrap }    from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { HTTP_PROVIDERS } from '@angular/http';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import {provide} from 'angular2/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

bootstrap(AppComponent, [
    APP_ROUTER_PROVIDERS,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    HTTP_PROVIDERS
]);
