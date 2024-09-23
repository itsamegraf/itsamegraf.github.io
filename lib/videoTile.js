import { Rectangle, Texture, Sprite } from '../bin/pixi.mjs';
import Matter from '../bin/matter.0.20.0.mjs.js'

export function createVideoWall(container, videoTexture, parentContainer) {

    const tiles = [];
    const countRow=25, countCol=25, videoTileDimensions = {
        w: Math.round(videoTexture.width / countCol),
        h: Math.round(videoTexture.height / countRow)
    };

    let i,j;
    for (i=0;i<countRow;i++) {
        for (j=0;j<countRow;j++) {
            const frame = new Rectangle(
                (i * videoTileDimensions.w), 
                (j * videoTileDimensions.h), 
                videoTileDimensions.w, videoTileDimensions.h);
            let currTile = createVideoTile(videoTexture, frame, parentContainer);
            tiles.push(currTile);
        }
    }

    function onTick () {
        tiles.forEach(tile => tile.onTick());

    };

    function explode() {

        const middleScreen = {x:parentContainer.width/2, y:parentContainer.height};
        
        tiles.forEach(tile => {
            let forceMagnitude = 0.1 * tile.body.mass;
            // apply the force over a single update
            Matter.Body.applyForce(tile.body, tile.body.position, {
                x: (forceMagnitude + Matter.Common.random() * forceMagnitude) * Matter.Common.choose([2, -1]), 
                y: -forceMagnitude + Matter.Common.random() * -forceMagnitude
            });
        })
    }

    return {
        tiles: tiles,
        onTick,
        explode
    };
}

function createVideoTile(videoTexture, frame, parentContainer) {

    // generate Sprite
    let currTexture = new Texture({source: videoTexture, frame: frame});
    let videoSprite = new Sprite(currTexture);
    videoSprite.label = `Tile_x${frame.x}_y${frame.y}`;
    videoSprite.position.copyFrom(frame);
    videoSprite.anchor = 0.5;
    videoSprite.pivot.x = -frame.width/2;
    videoSprite.pivot.y = -frame.height/2;

    // generate Physics backend
    const box = Matter.Bodies.rectangle(
        frame.x, frame.y,
        frame.width, frame.height); // x y w h
    box.scale=0.6;

    function onTick() {
        // console.log(`${videoSprite.label} changed from (${videoSprite.position.x},${videoSprite.position.y}) to (${box.position.x},${box.position.y})`)
        videoSprite.position.copyFrom(box.position);
        videoSprite.rotation = box.angle;
    }

    return {
        body: box,
        sprite:videoSprite,
        onTick,
    };
}
