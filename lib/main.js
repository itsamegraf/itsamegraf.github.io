import Matter from '@matter-js';
import * as PIXI from '@pixi';
import { gsap } from '@gsap';
import { PixiPlugin } from '@gsap-pixi';
import { MotionPathPlugin } from '@gsap-motion-path';
import { EasePack } from "@gsap-ease";
gsap.registerPlugin(PixiPlugin, MotionPathPlugin, EasePack);
PixiPlugin.registerPIXI(PIXI);

import {createVideoWall} from './videoTile.js'
import {createGround} from './ground.js'
import {createRollerCoaster} from './rollercoaster.js'
import {createPetitMe} from './petitMe.js'

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
    const rc = await createRollerCoaster(ground.sprite, app.screen);
    world.addChild(rc.container);

    const petitMe = await createPetitMe(app.screen);
    petitMe.sprite.visible=false; // initialy hidden
    petitMe.positionOnGround(ground.sprite);
    world.addChild(petitMe.sprite);

    const baseVideoTexture = await PIXI.Assets.load({
        src: 'intro', 
        data: {
            preload: true, 
            autoPlay: false, // fix
        }});

    // set up videoWall
    const videoWall = createVideoWall(app.screen, baseVideoTexture);
    world.addChild(videoWall.container);

    // add bodies to Matter engine
    Matter.Composite.add(engine.world, videoWall.box);
    await scene0();

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
                petitMe.sprite.visible=true;

                // swap physics between box and tiles
                Matter.Composite.remove(engine.world, videoWall.box);
                Matter.Composite.add(engine.world, videoWall.getTileBodies());
                videoWall.erupt();

                // remove updater
                setTimeout(() => {
                    videoWall.container.removeFromParent();
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
            // move cart container into initial pos
            .to(rc.container, {
                    pixi: { x: 0 },
                    duration: 1
                }) // animation in parallel
            .to(rc.cart.container, {
                pixi: { x: 15 },
                duration: 2,
                ease: 'slow',
            }, '<+25%')
            // Then, reparent petitMe into RC cart container
            .call(() => petitMe.reparentTo(rc.cart.container), [], '<+25%')
            // and make him jump into
            petitMe.jumpIntoPoint(timeline, 
                {x: rc.cart.sprite.width * 0.6, 
                 y: -(0.9 * rc.cart.sprite.height)})   
    }

})();    
