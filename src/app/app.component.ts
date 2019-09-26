import { Component, APP_INITIALIZER, OnInit } from '@angular/core';
import { Application } from 'src/core/application/application';

import { Game } from 'src/learnonpengl/2_Textures';
import { Canvas } from 'src/core/application/canvas';

@Component({
    selector: 'app-root',
    templateUrl: './template.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    constructor() {
    }

    public ngOnInit(): void {

        let c = document.createElement('canvas');
        let canvas = new Canvas(c);

        /*
        let game = new Game();
        Application.init(game);
        Application.run();
        */
    }
}