
 // Matter.js module aliases
 var Engine = Matter.Engine,
   World = Matter.World,
   Body = Matter.Body,
   Bodies = Matter.Bodies,
   Composites = Matter.Composites,
   Composite = Matter.Composite,
   Constraint = Matter.Constraint,
   engine;

function createVideoBox(videoElem, parentElem, xOff, yOff, width, height) {
    
    var parentPos = parentElem.getBoundingClientRect();
    var canvasId = `tile_x${xOff}_y${yOff}`;

    var canvas = document.querySelector(`canvas#${canvasId}`);
    if (canvas === null) {
        var canvas = document.createElement("canvas");
        canvas.id = canvasId;
        canvas.style.margin="10px";
        // canvas.className = "videoTile";
        parentElem.appendChild(canvas);
    }

    return {
        body: Matter.Bodies.rectangle(parentPos.x + xOff, parentPos.y + yOff, 
                                      width, height),
        elem: canvas,
        render() {
            // const {x, y} = this.body.position;
            // this.elem.style.top = `${y - 36}px`;
            // this.elem.style.left = `${x - 64}px`;

            ctx = this.elem.getContext("2d");
            ctx.drawImage(videoElem, xOff, yOff, width, height, 0, 0, canvas.width, canvas.height);
      }
    }
};


video.addEventListener("loadeddata", (event) => {
    ///window.requestAnimationFrame(() => {
        const row=3, column=3, 
        swidth = canvasContainer.offsetWidth,
        sheight = canvasContainer.offsetHeight,
        newWidth = Math.round(swidth / column),
        newHeight = Math.round(sheight / row);
    
        var tiles = [];
        for (i=0;i<3;i++) {
            for (j=0;j<3;j++) {
                var topOff = (i * newHeight), leftOff = (j * newWidth);
                tiles.push(createVideoBox(video, canvasContainer, leftOff, topOff, newWidth, newHeight));
            }
        }
    
        const trackGround = Matter.Bodies.rectangle(
            0, sheight-200, //, 
            swidth, 200, {isStatic: true}
        );    
    
        //mouseConstraint
        const objs = [trackGround].concat(...tiles.map(tile => tile.body)); 
    
        (function() {

            var canvas = document.getElementById('canvasContainer');
            var width = window.innerWidth,
                height = window.innerHeight;
    
            canvas.width = width;
            canvas.height = height;
    
            engine = Engine.create({
                render: {
                    element: document.body,
                    // canvas: canvas,
                    options: {
                        width: width,
                        height: height
                    }
                }
            });
    
            // add object composites into the engine.world
            Matter.Composite.add(engine.world, objs);
            
            // create runner
            var runner = Matter.Runner.create();
            Matter.Runner.run(runner, engine);
    
        })();

        (function rerender() {
            tiles.forEach(tile => tile.render());
            Matter.Engine.update(engine, 12);
            requestAnimationFrame(rerender);
        })();
        
//});
});
//  Let them fall to the ground (DOLATER - swap with rollercoaster Track)
// Expose track and mini-me
