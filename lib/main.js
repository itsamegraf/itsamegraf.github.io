import Matter from '../bin/matter.0.20.0.mjs.js'
import { Application, Assets, Container } from '../bin/pixi.mjs';
import {createVideoWall} from './videoTile.js'
import {createGround} from './ground.js'

(async () =>
{
    
    // Create a new application
    const app = new Application();
    await app.init({ transparent: true, resizeTo: window });
    globalThis.__PIXI_APP__ = app; // pixijs dev tools
    let engine = Matter.Engine.create(app.screen);

    await setup();
    await preload();

    // add ground
    let ground = await createGround(app.screen);
    app.stage.addChild(ground.sprite);

    const baseVideoTexture = await Assets.load({
        src: 'intro', 
        data: {
            preload: true, 
            autoPlay: false, // fix
        }});

    // set up videoWall
    let videoContainer = new Container();
    const wallProportions = {top: 0.1, scale: 0.6};
    videoContainer.scale=wallProportions.scale;
    // videoContainer.scale.y=wallProportions.scale;

    videoContainer.position.x = app.screen.width * (1-wallProportions.scale)/2;
    videoContainer.position.y = app.screen.height * wallProportions.top;
    app.stage.addChild(videoContainer);

    // Prepare video
    const videoWall = createVideoWall(videoContainer, baseVideoTexture, videoContainer);
    videoContainer.addChild(...videoWall.tiles.map(tile => tile.sprite));
    
    // const mouseConstraint = Matter.MouseConstraint.create(
    //     engine, {element: app.screen}
    //   );

    const mouseConstraint = Matter.MouseConstraint.create(
        engine, {element: document.body}
      );

    // add bodies to Matter engine
    Matter.Composite.add(engine.world, videoWall.tiles.map(tile => tile.body));
    await loadCompleted();

    async function setup()
    {
        // Initialize the application
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

    async function loadCompleted()
    {
        setTimeout(() => {
            engine.gravity.y = 2;
            app.ticker.add((delta) =>{
                videoWall.onTick();
                Matter.Engine.update(engine);
            });
            
            setTimeout(() => {
                videoWall.explode()
            }, 400);

        }, 1650);

        Matter.Events.on(ground.body, "collisionStart", () => {
            console.log('collision');
        })
    }

})();    
