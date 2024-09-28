import Matter from '../bin/matter.0.20.0.mjs.js'
import * as PIXI from '../bin/pixi.mjs';
import {createVideoWall} from './videoTile.js'
import {createGround} from './ground.js'
import { gsap } from "../bin/gsap/gsap-core.js";
import { PixiPlugin } from "../bin/gsap/PixiPlugin.js";
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

(async () =>
{
    
    // Create a new application
    const app = new PIXI.Application();
    await app.init({ transparent: true, resizeTo: window });
    app.renderer.background.color = 0xd2d3d7;
    globalThis.__PIXI_APP__ = app; // pixijs dev tools
    let engine = Matter.Engine.create(app.screen);

    await setup();
    await preload();

    const world = new PIXI.Container();
    world.width = 10000;
    world.height = 10000;
    world.pivot.x = 0;
    world.pivot.y = world.height / 2;
    app.stage.addChild(world);

    // add ground
    let ground = await createGround(app.screen);
    world.addChild(ground.sprite);

    // add RC
    const rcContainer = new PIXI.Container();
    rcContainer.position.x = app.screen.width - 100; // just after screen x
    rcContainer.position.y = 0;
    world.addChild(rcContainer);

    // add RC track
    const rcTrackTexture = await PIXI.Assets.load('assets/rollercoaster_track.png');
    const rcTrackSprite = new PIXI.TilingSprite({
        texture: rcTrackTexture, width: world.width
    });
    rcTrackSprite.position.x = 0; // just after screen x
    rcTrackSprite.position.y = ground.sprite.position.y - 10 - rcTrackSprite.height;
    rcContainer.addChild(rcTrackSprite);

    // add RC Coaster
    const rcCartTexture = await PIXI.Assets.load('assets/rc_cart.png');
    const rcCartSprite = PIXI.Sprite.from(rcCartTexture);
    rcCartSprite.scale = 0.7;
    rcCartSprite.anchor.y = 1;
    rcCartSprite.pivot.y = -33;
    rcCartSprite.position.x = 20; // just after screen x
    rcCartSprite.position.y = rcTrackSprite.position.y;
    rcContainer.addChild(rcCartSprite);

    const petitMeTexture = await PIXI.Assets.load('assets/petit_graf.png');
    let petitMeSprite = PIXI.Sprite.from(petitMeTexture);
    // petitMeSprite.visible=false;
    petitMeSprite.scale = 0.7;
    petitMeSprite.anchor.x = 0.5;
    petitMeSprite.position.x = app.screen.width / 2;
    petitMeSprite.position.y = ground.sprite.position.y - petitMeSprite.height + 20;
    world.addChild(petitMeSprite);

    // const baseVideoTexture = await PIXI.Assets.load({
    //     src: 'intro', 
    //     data: {
    //         preload: true, 
    //         autoPlay: false, // fix
    //     }});

    // set up videoWall
    // const videoWall = createVideoWall(app.screen, baseVideoTexture);
    // world.addChild(videoWall.container);

    // add bodies to Matter engine
    // Matter.Composite.add(engine.world, videoWall.box);
    // await scene0();

    app.ticker.addOnce(scene1);

    async function setup()
    {
        // Initialize the application
        document.body.appendChild(app.canvas);
    }

    async function preload()
    {
        // Load the video texture
        const assets = [
            {alias: 'intro', src: 'assets/intro-end_light.mp4'}
        ]
        await PIXI.Assets.load(assets);
    }

    async function scene0()
    {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        await sleep(1700);

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

                // next scene
                app.ticker.addOnce(scene1);
        }
        
        let didTriggerErupt = false;
        const videoWallUpdate = (delta) => {
            // TODO: utilise delta - delta * (1000 / 60)
            Matter.Engine.update(engine);
            videoWall.onTick();

            // once videoWall.bottom.y "hits the ground"
            if (!didTriggerErupt && 
                videoWall.container.position.y + videoWall.container.height > ground.sprite.position.y) {

                didTriggerErupt = true;
                app.ticker.addOnce(videoWallErupt);
            }
        };
        app.ticker.add(videoWallUpdate);
    }

    function scene1(delta) {
        
        let timeline = gsap.timeline();

        timeline
        .to(rcContainer, {
            pixi: { x: app.screen.width/2 },
            duration: 1
        }).then(() => {
            let petitMeGlobalPosition = rcContainer.toLocal(petitMeSprite.parent);
            petitMeSprite.removeFromParent();
            rcContainer.addChild(petitMeSprite);
            timeline.fromTo(petitMeSprite, 
                {pixi: { x: petitMeSprite.getGlobalPosition().x, y: petitMeSprite.getGlobalPosition().y }},
                {pixi: { x: rcCartSprite.position.x, y: rcCartSprite.position.y },
                duration: 0.2,});
        });


        // gsap.to(rcContainer, {
        //     pixi: { x:  },
        //     duration: 1,
        // });
    }

})();    
