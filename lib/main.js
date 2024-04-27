import { Application, Assets, Rectangle, Texture, Sprite, Container } from '../bin/pixi.mjs';

(async () =>
{
    // Create a new application
    const app = new Application();
    globalThis.__PIXI_APP__ = app; // pixijs dev tools

    // Initialize the application
    await app.init({ resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);


    // Load the video texture
    const baseVideoTexture = await Assets.load('assets/intro-end.mp4');
    const videoWall = new Container();
    app.stage.addChild(videoWall);

    // Overall video should take 80% of the screen width, and keep 16/9 aspect ratio
    const videoBaseWidth = app.screen.width * 0.8;
    let videoDimensions = {
        w: videoBaseWidth,
        h: (9/16) * videoBaseWidth
    }, videoBasePos = {
        x: (app.screen.width - videoDimensions.w) / 2,
        y: (app.screen.height - videoDimensions.h) / 2,
    }
    videoWall.position.copyFrom(videoBasePos);
    
    const countRow=3, countCol=3, videoTileDimensions = {
        w: Math.round(videoDimensions.w / countCol),
        h: Math.round(videoDimensions.h / countRow)
    };

    const tiles = [];
    let i,j;
    for (i=0;i<countRow;i++) {
        for (j=0;j<countRow;j++) {
            // Compute dimensions
            const currTileDim = { 
                x: (i * videoTileDimensions.w),
                y: (j * videoTileDimensions.h)
              };

            const frame = new Rectangle(currTileDim.x, currTileDim.y, videoTileDimensions.w, videoTileDimensions.h);
            let currTexture = new Texture({source: baseVideoTexture, frame: frame});
            let videoSprite = new Sprite(currTexture);
            videoSprite.position.copyFrom(currTileDim);
            tiles.push(videoSprite);

            videoWall.addChild(videoSprite);
        }
    }

    // const videoResource = new VideoResource(video);  //<video id='video'>
    // videoResource.updateFPS = 30 // set video to render at 30FPS to avoid performance issues
    // const video = document.getElementById('video');
    // let texture = PIXI.Texture.from(video);
    
    // add a one time tap event to play and pause the video 
    // to meet the requirement about "explicitly play media by user gesture"
    const onTouchEnd = (event) => {
        document.removeEventListener(event.type, onTouchEnd);
        
        // videoSprite.anchor.set(0.5);
        // videoSprite.angle = 90;

        // app.stage.addChild(videoSprite);
    };
    document.addEventListener('touchend', onTouchEnd);
})();    
