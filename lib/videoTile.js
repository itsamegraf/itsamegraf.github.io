import { Rectangle, Texture, Container, Graphics, Sprite } from '../bin/pixi.mjs';
import Matter from '../bin/matter.0.20.0.mjs.js'

export function createVideoWall(screen, videoTexture) {
    const container = createContainer();
    const tiles = generateTiles(videoTexture);
    container.addChild(...tiles.map(tile => tile.sprite));

    function createContainer() {
        const wallProportions = {top: 0.1, scale: 0.6};
        let container = new Container();
        container.pivot.x = videoTexture.width / 2;
        container.position.x = screen.width / 2;
        container.position.y = screen.height * wallProportions.top;
        container.scale = wallProportions.scale;

        // only show centerized portion keeping (1-scale)/2 gaps on the sides
        container.mask = new Graphics().rect(
            screen.width * (1 - wallProportions.scale)/2, 
            screen.height * wallProportions.top,
            screen.width * wallProportions.scale, 
            screen.height
        ).fill(0xffffff);
        return container;
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
    }

    function onTick () {
        tiles.forEach(tile => tile.onTick());
    };

    function getTileYPosAtIdx(idx) {
         if (idx < 0) {
            // idx is negative
            idx = tiles.length + idx;
         }
         return tiles[idx].sprite.getGlobalPosition().y;
    }

    function erupt() {
        // stop masking visible portion only
        container.mask = null;

        tiles.forEach(tile => {
            let forceMagnitude = 0.1 * tile.body.mass;
            // apply the force over a single update
            Matter.Body.applyForce(tile.body, tile.body.position, {
                x: (forceMagnitude + Matter.Common.random() * forceMagnitude) * Matter.Common.choose([2, -1]), 
                y: (-forceMagnitude + Matter.Common.random() * -forceMagnitude) * 2
            });
        })
    }

    return {
        container,
        tiles,
        onTick,
        getTileYPosAtIdx,
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

    // generate Physics backend
    const box = Matter.Bodies.rectangle(
        frame.x, frame.y,
        frame.width, frame.height); // x y w h

    function onTick() {
        videoSprite.position.copyFrom(box.position);
        videoSprite.rotation = box.angle;
    }

    return {
        body: box,
        sprite:videoSprite,
        onTick,
    };
}
