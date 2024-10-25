import Matter from '@matter-js';
import * as PIXI from '@pixi';
import { gsap } from '@gsap';
import { PixiPlugin } from '@gsap-pixi';
import { MotionPathPlugin } from '@gsap-motion-path';
import { EasePack } from "@gsap-ease";
gsap.registerPlugin(PixiPlugin, MotionPathPlugin, EasePack);
PixiPlugin.registerPIXI(PIXI);

import {createVideoWall} from './videoTile.js'
import {createWorldView} from './world.js'

(async () =>
{
    
    // Create a new application
    const app = new PIXI.Application();
    await app.init({ transparent: true, resizeTo: window });
    app.renderer.background.color = 0xd2d3d7;
    globalThis.__PIXI_APP__ = app; // pixijs dev tools
    let engine = Matter.Engine.create(app.screen);

    // Initialize the application
    document.body.appendChild(app.canvas);
    await preload();

    const world = await createWorldView(app.screen);
    app.stage.addChild(world.container);

    await scene1();

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
        world.petitMe.sprite.visible=false; // initialy hidden

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

        const sleep = ms => new Promise(r => setTimeout(r, ms));
        await sleep(1700);

        engine.gravity.y = 3;
        const videoWallErupt = (delta) => {
                // reveal petitMe
                world.petitMe.sprite.visible=true;

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
                videoWall.container.position.y + videoWall.container.height > world.ground.sprite.position.y) {

                didTriggerErupt = true;
                app.ticker.addOnce(videoWallErupt);
            }
        };
        app.ticker.add(videoWallUpdate);
    }

    async function scene1(delta) {

        let timeline = gsap.timeline();
        timeline
            // move cart container into initial pos
            .to(world.rc.container, {
                    pixi: { x: 0 },
                    duration: 1
                }) // animation in parallel
            .to(world.rc.cart.container, {
                pixi: { x: 15 },
                duration: 0.1,//2,
                ease: 'slow',
            }, '<+25%')
            // // Then, reparent petitMe into RC cart container
            // .call(() => world.petitMe.reparentTo(world.rc.cart.container), [], '<+25%')
            // // and make him jump into
            world.petitMe.jumpIntoPoint(timeline, 
                {x: world.rc.cart.sprite.width * 0.6, 
                 y: -(0.9 * world.rc.cart.sprite.height)});

        // timeline.to(world.container, {
        //     pixi: {pivotX: 1000},
        //     duration: 2
        // });

        let count = 0;
        const moveCart = (delta) => {
            // TODO: utilise delta - delta * (1000 / 60)
            count += 1;
            world.rc.attachCartToTrack(Math.floor(count / 20) % 6);
        }
        app.ticker.add(moveCart);

        // world.rc.attachCartToTrack(6);
        world.rc.addDebugLines();
    }

})();    
