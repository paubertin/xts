import { Component, APP_INITIALIZER } from '@angular/core';
import { Application } from 'src/core/application/application';

@Component({
    selector: 'app-root',
    templateUrl: './template.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    title = 'game';
    constructor() {
        Application.init();
        Application.run();
    }
}
