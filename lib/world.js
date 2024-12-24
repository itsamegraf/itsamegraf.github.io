import * as PIXI from '@pixi';

import {createCamera} from './camera.js'
import {createGround} from './props/ground.js'
import {createPlan} from './plan.js'
import {createRollerCoaster} from './rollercoaster/rollercoaster.js'
import {createPetitMe} from './props/petitMe.js'

export async function createWorldView(screen) {
    const worldWidth = 10000;
    const world = createContainer();
    let ground = await createGround(screen.width*2, screen);

    const plan = await createPlan(screen);
    const camera = await createCamera(plan, world, {width: screen.width, height: screen.height});
    const rc = await createRollerCoaster(plan, ground.sprite, screen);
    const petitMe = await createPetitMe(screen);
    
    petitMe.positionOnGround(ground.sprite);
    world.addChild(ground.sprite, rc.container, petitMe.sprite);

    function createContainer() {
        const world = new PIXI.Container();
        world.width = worldWidth;
        world.height = 10000;
        return world;
    }

    function addChild(child) {
        return world.addChild(child);
    }

    return {
        container: world,
        petitMe,
        ground,
        rc,
        camera,
        addChild,        
    };
}