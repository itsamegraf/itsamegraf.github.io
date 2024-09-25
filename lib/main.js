import Matter from '../bin/matter.0.20.0.mjs.js'
import { Application, Assets, Sprite, Graphics, Container } from '../bin/pixi.mjs';
import {createVideoWall} from './videoTile.js'
import {createGround} from './ground.js'

(async () =>
{
    
    // Create a new application
    const app = new Application();
    await app.init({ transparent: true, resizeTo: window });
    app.renderer.background.color = 0xd2d3d7;
    globalThis.__PIXI_APP__ = app; // pixijs dev tools
    let engine = Matter.Engine.create(app.screen);

    await setup();
    await preload();

    // add ground
    let ground = await createGround(app.screen);
    app.stage.addChild(ground.sprite);

    const petitMeTexture = await Assets.load('assets/petit_graf.png');
    let petitMeSprite = Sprite.from(petitMeTexture);
    petitMeSprite.visible=false;
    petitMeSprite.scale = 0.7;
    petitMeSprite.pivot.x = petitMeTexture.width / 2;
    petitMeSprite.position.x = app.screen.width / 2;
    petitMeSprite.position.y = ground.sprite.position.y - petitMeSprite.height + 20;
    app.stage.addChild(petitMeSprite);

    const baseVideoTexture = await Assets.load({
        src: 'intro', 
        data: {
            preload: true, 
            autoPlay: false, // fix
        }});

    // set up videoWall
    const videoWall = createVideoWall(app.screen, baseVideoTexture);
    app.stage.addChild(videoWall.container);

    // add bodies to Matter engine
    Matter.Composite.add(engine.world, videoWall.box);
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
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        await sleep(1650);

        engine.gravity.y = 3;
        const videoWallErupt = (delta) => {
                // reveal petitMe
                petitMeSprite.visible=true;

                // swap physics between box and tiles
                Matter.Composite.remove(engine.world, videoWall.box);
                Matter.Composite.add(engine.world, videoWall.getTileBodies());
                videoWall.erupt();

                // remove updater
                setTimeout(() => {
                    app.stage.removeChild(videoWall.container);
                    app.ticker.remove(videoWallUpdate);
                }, 5000);
        }
        
        let didTriggerErupt = false;
        const petitMeBottomY = petitMeSprite.getGlobalPosition().y + petitMeSprite.height;
        const videoWallUpdate = (delta) => {
            // TODO: utilise delta - delta * (1000 / 60)
            Matter.Engine.update(engine);
            videoWall.onTick();

            // once videoWall.bottom.y exceeds petitMeSprite.bottom.y
            if (!didTriggerErupt &&
                videoWall.container.position.y + videoWall.container.height > petitMeBottomY) {
                    
                didTriggerErupt = true;
                app.ticker.addOnce(videoWallErupt);
            }
        };
        app.ticker.add(videoWallUpdate);
        
    }

})();    
