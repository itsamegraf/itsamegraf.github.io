import { Application, Assets, Rectangle, Texture, Sprite, Container } from '../bin/pixi.mjs';

(async () =>
{
    // Create a new application
    const app = new Application();
    globalThis.__PIXI_APP__ = app; // pixijs dev tools

    await setup();
    await preload();

    // set up videoWall    
    let videoWall = new Container();
    app.stage.addChild(videoWall);

    // Prepare video
    const baseVideoTexture = await Assets.load('intro');
    let baseVideoSprite = Sprite.from(baseVideoTexture);
    baseVideoSprite.scale = 0.8;
    const leftBase = (baseVideoSprite.width - app.screen.width) / 2;
    const topBase = (baseVideoSprite.height - app.screen.height) / 2

    // Prepare tiles
    const tiles = [];
    const countRow=3, countCol=3, videoTileDimensions = {
        w: Math.round(app.screen.width / countCol),
        h: Math.round(app.screen.height / countRow)
    };
    let i,j;
    for (i=0;i<countRow;i++) {
        for (j=0;j<countRow;j++) {
            // Compute dimensions
            const currTileDim = { 
                x: (i * videoTileDimensions.w),
                y: (j * videoTileDimensions.h)
            };

            const frame = new Rectangle(leftBase + currTileDim.x, topBase + currTileDim.y, videoTileDimensions.w, videoTileDimensions.h);
            let currTexture = new Texture({source: baseVideoTexture, frame: frame});
            let videoSprite = new Sprite(currTexture);
            videoSprite.position.copyFrom(currTileDim);
            tiles.push(videoSprite);

            videoWall.addChild(videoSprite);
        }
    }

    async function setup()
    {
        // Initialize the application
        await app.init({ resizeTo: window });
        document.body.appendChild(app.canvas);
    }

    async function preload()
    {
        // Load the video texture
        const assets = [
            {alias: 'intro', src: 'assets/intro-end.mp4'}
        ]
        await Assets.load(assets);
    }

})();    
