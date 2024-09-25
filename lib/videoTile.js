import { Rectangle, Texture, Container, Graphics, Sprite } from '../bin/pixi.mjs';
import Matter from '../bin/matter.0.20.0.mjs.js'

export function createVideoWall(screen, videoTexture) {
    const wallProportions = {top: 0.1, scale: 0.6};
    const container = createContainer();

    // only show centerized portion keeping (1-scale)/2 gaps on the sides
    const mask = createContainerMask();
    container.mask = mask;

    // generate Physics backend
    let box = Matter.Bodies.rectangle(
        container.position.x, container.position.y,
        mask.width, mask.height); // x y w h

    const tiles = generateTiles(videoTexture);
    container.addChild(...tiles.map(tile => tile.sprite));

    function createContainer() {
        let container = new Container();
        container.pivot.x = videoTexture.width / 2;
        container.position.x = screen.width / 2;
        container.position.y = screen.height * wallProportions.top;
        container.scale = wallProportions.scale;
        return container;
    };
    function createContainerMask() {
        return new Graphics().rect(
            screen.width * (1 - wallProportions.scale)/2, 
            screen.height * wallProportions.top,
            screen.width * wallProportions.scale, 
            screen.height
        ).fill(0xffffff);
    }
    function generateTiles(videoTexture) {
        const countRow=25, countCol=25, videoTileDimensions = {
            w: Math.round(videoTexture.width / countCol),
            h: Math.round(videoTexture.height / countRow)
        };
    
        let tiles = [];
        for (let i=0;i<countRow;i++) {
            for (let j=0;j<countRow;j++) {
                const frame = new Rectangle(
                    (i * videoTileDimensions.w), 
                    (j * videoTileDimensions.h), 
                    videoTileDimensions.w, videoTileDimensions.h);
                let currTile = createVideoTile(videoTexture, frame);
                tiles.push(currTile);
            }
        }
        return tiles;
    };
    function getTileBodies() {
        return tiles.map(tile => tile.getBody());
    }

    function onTick () {
        const jsonifyXY = (({x,y})=>(JSON.stringify({x,y})));
        // console.log(`container moved from ${jsonifyXY(container.position)} to ${jsonifyXY(box.position)}`);
        container.position.copyFrom(box.position);
        container.rotation = box.angle;

        tiles.forEach(tile => tile.onTick());
    };

    function erupt() {
        container.mask = null;
        tiles.forEach(tile => tile.erupt());
    };

    return {
        box,
        container,
        tiles,
        onTick,
        getTileBodies,
        erupt
    };
}

function createVideoTile(videoTexture, frame) {

    // generate Sprite
    let currTexture = new Texture({source: videoTexture, frame: frame});
    let videoSprite = new Sprite(currTexture);
    videoSprite.label = `Tile_x${frame.x}_y${frame.y}`;
    videoSprite.position.copyFrom(frame);
    videoSprite.anchor = 0.5;
    videoSprite.pivot.x = -frame.width/2;
    videoSprite.pivot.y = -frame.height/2;

    // physics backend container (lazy loaded upon erupt)
    let box = null;

    function getBody() { 
        if (!box) {
            box = Matter.Bodies.rectangle(
                videoSprite.x, videoSprite.y,
                frame.width, frame.height); // x y w h    
        }
        return box;
    }

    function erupt() {
        box = getBody();

        let forceMagnitude = 0.1 * box.mass;
        // apply the force over a single update
        Matter.Body.applyForce(box, box.position, {
            x: (forceMagnitude + Matter.Common.random() * forceMagnitude) * Matter.Common.choose([2, -1]), 
            y: (-forceMagnitude + Matter.Common.random() * -forceMagnitude) * 2
        });
    }

    function onTick() {

        // const jsonifyXY = (({x,y})=>(JSON.stringify({x,y})));
        if (box) {
            // console.log(`container moved from ${jsonifyXY(videoSprite.position)} to ${jsonifyXY(box.position)}`);
            videoSprite.position.copyFrom(box.position);
            videoSprite.rotation = box.angle;
        }
    }

    return {
        sprite:videoSprite,
        getBody,
        erupt,
        onTick,
    };
}
