import { Component, APP_INITIALIZER, OnInit } from '@angular/core';
import { Application } from 'src/core/application/application';

import { Game } from 'src/learnonpengl/4_Movement';
import { Canvas } from 'src/core/application/canvas';
import { SpriteGeometry } from 'src/core/scene/spriteGeometry';

@Component({
    selector: 'app-root',
    templateUrl: './template.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    constructor() {
    }

    public ngOnInit(): void {

        // let c = document.createElement('canvas');
        // let canvas = new Canvas(c);
        // let geometry = new SpriteGeometry(canvas.context, 'sprite');
        // geometry.initialize();
        // console.log('geometry', geometry);

        let game = new Game();
        Application.init(game);
        Application.printDetails();
        Application.run();
    }
}