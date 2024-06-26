/*
This is potsu the JS Library made for the www.liamisannoying.me website

This Library contains Advanced collision Detection(Seperating Axis Theorum)
And physics tool's for easy Game Development across multiple Games

-Copyright-
this program is *definitely* under hundreds of copyright restrictions

-Disclamer- 

This is very math-y so some of it is stolen from the internet and gpt (if I couldnt find it on the interweb)

From websites:
    SAT algorythem

*/

/*
shape vertices:

square = [
  { x: 0, y: 0 },
  { x: 50, y: 0 },
  { x: 50, y: 50 },
  { x: 0, y: 50 }
];

triangle = [
  { x: 25, y: 0 },
  { x: 50, y: 50 },
  { x: 0, y: 50 }
];

hexagon = [
  { x: 30, y: 0 },
  { x: 60, y: 20 },
  { x: 60, y: 50 },
  { x: 30, y: 70 },
  { x: 0, y: 50 },
  { x: 0, y: 20 }
];

octagon = [
  { x: 20, y: 0 },
  { x: 50, y: 0 },
  { x: 70, y: 20 },
  { x: 70, y: 50 },
  { x: 50, y: 70 },
  { x: 20, y: 70 },
  { x: 0, y: 50 },
  { x: 0, y: 20 }
];

pentagon = [
  { x: 25, y: 0 },
  { x: 50, y: 18 },
  { x: 42, y: 50 },
  { x: 8, y: 50 },
  { x: 0, y: 18 }
];

*/
var ctx;

function Canvas(cvs){
    ctx = cvs;
}

class GameObject {
    constructor(hitboxVertices, image, width, height, Velocity, mass, density, tag){
        this.image = image;
        this.width = width;
        this.height = height;
        this.velocity = Velocity;
        this.mass = mass;
        this.density = density;
        this.vertOrigin = hitboxVertices;
        this.vertices = this.vertOrigin;
        this.x = this.vertices[0].x;
        this.y = this.vertices[0].y;
        this.tag = tag;
        this.edges = buildEdges(this.vertices);

        //collision
        this.projectInAxis = function(x, y) {
            let min = 10000000000;
            let max = -10000000000;
            for (let i = 0; i < this.vertices.length; i++) {
                let px = this.vertices[i].x;
                let py = this.vertices[i].y;
                var projection = (px * x + py * y) / (Math.sqrt(x * x + y * y));
                if (projection > max) {
                    max = projection;
                }
                if (projection < min) {
                    min = projection;
                }
            }
            return { min, max };
        };

        this.testWith = function (otherPolygon) {
            // get all edges
            const edges = [];
            for (let i = 0; i < this.edges.length; i++) {
                edges.push(this.edges[i]);
            }
            for (let i = 0; i < otherPolygon.edges.length; i++) {
                edges.push(otherPolygon.edges[i]);
            }
            // build all axis and project
            for (let i = 0; i < edges.length; i++) {
                // get axis
                const length = Math.sqrt(edges[i].y * edges[i].y + edges[i].x * edges[i].x);
                const axis = {
                    x: -edges[i].y / length,
                    y: edges[i].x / length,
                };
                // project polygon under axis
                const { min: minA, max: maxA } = this.projectInAxis(axis.x, axis.y);
                const { min: minB, max: maxB } = otherPolygon.projectInAxis(axis.x, axis.y);
                if (intervalDistance(minA, maxA, minB, maxB) > 0) {
                    return false;
                }
            }
            return true;
        };

        this.testGroup = function(array){
            var collide = [{}];
            for(var i = 0; i < array.length; i++){
                collide.push({Object: array[i], collision: this.testWith(array[i])});
            }
            return collide;
        }

        //render
        this.renderImage = function() {
            if(ctx === null){
                console.error("No CanvasRenderingContext2D applied");
            }else{
            ctx.drawImage(this.image,this.vertices[1].x,this.vertices[1].y,this.width,this.height);
            }
        };

        this.render = function(fillColour, borderColour) {
            if (ctx === null) {
                console.error("No CanvasRenderingContext2D applied");
            } else {
                ctx.fillStyle = borderColour;
                ctx.lineWidth = 10;
                ctx.beginPath();
        
                for (var i = 0; i < this.vertices.length; i++) {
                    ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
                }
        
                ctx.closePath();
                ctx.fillStyle = fillColour;
                ctx.stroke();
                ctx.fill();
            }
        };
        
            this.clone = function (amount) {
                var clones = [];
                for (let i = 0; i < amount; i++) {
                    // Create a new instance with the same properties as the original object
                    const clone = new GameObject(
                        this.vertOrigin, // You can pass the same hitbox vertices
                        this.image,
                        this.width,
                        this.height,
                        this.velocity,
                        this.mass,
                        this.density
                    );
                    clones.push(clone);
                }
                return clones;
            }

        this.offset = function(dx, dy) {
            for (let i = 0; i < this.vertices.length; i++) {
                this.vertices[i] = {
                    x: this.vertices[i].x + dx,
                    y: this.vertices[i].y + dy,
                };
            }
        };

        this.goTo = function(x,y) {
            for (let i = 0; i < this.vertices.length; i++) {
                this.vertices[i] = {
                    x: this.vertOrigin[i].x + x,
                    y: this.vertOrigin[i].y + y
                }
            }
        }
    }
}

//SCIENCE

//kpa
var PressureList = [101, 99.5, 97.7, 96.0, 94.2, 92.5, 90.8, 89.1, 87.5, 85.9, 84.3, 81.2, 78.2, 75.3, 72.4, 69.7, 57.2, 46.6, 37.6, 30.1, 23.8, 18.7, 14.5, 11.1]
//meters
var PressureAlt = [0, 152, 305, 457, 610, 762, 914, 1067, 1219, 1372, 1524, 1829, 2134, 2438, 2743, 3048, 4572, 6096, 7620, 9144, 10668, 12192, 13716, 15240]

function AirboyancyForce(volume, alt){//meters

    let airdensity = airDensity(alt);//kg/m^3

    return volume * airdensity * 9.8;//bf = V x D * G
}

function BoyantForce(volume, liquidDensity){
    return volume * liquidDensity * 9.8;
}

function IdealGasLaw(altitude,Temp){
    TempKelvin = Temp += 273.15;
    return  airDensity(altitude) / (287 * TempKelvin)
}

//(1.2−0.946)×2800
function balloonNetBouyancy(altitude,Temp){
    var volume = 2800;
    var OutsideAir = airDensity(altitude);

    var IdealGas = IdealGasLaw(altitude, Temp);
    
    return (OutsideAir - IdealGas) * volume;
}

function airDensity(alt){
    for(var i = 0; i < PressureAlt.length; i++){//finds air pressure of altitude
        if(alt => PressureAlt[i] && alt < PressureAlt[i + 1]){
            return PressureList[i];
        }
    }
}

// gameLoops And stuff
function SetLoopSpeed(functionName, interval){
    setInterval(functionName, interval);
}

//collision detection SAT

function buildEdges(vertices) {
    const edges = [];
    if (vertices.length < 3) {
        console.error("Only polygons supported.");
        return edges;
    }
    for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i];
        let b = vertices[0];
        if (i + 1 < vertices.length) {
            b = vertices[i + 1];
        }
        edges.push({
            x: (b.x - a.x),
            y: (b.y - a.y),
        });
    }
    return edges;
}

function intervalDistance(minA, maxA, minB, maxB) {
    if (minA < minB) {
        return (minB - maxA);
    }
    return (minA - maxB);
}

//custom

    function makeHitBox(){
        var a;
        var i = 0;
        window.addEventListener(mousedown, e=> {
            if(i = 0){
                var originX = e.clientX;
                var originY = e.clientY;
                a[i].x = 0;
                a[i].y = 0;
            }else{
            a[i].x = e.clientX - originX;
            a[i].y = e.clientY - originY;
            }
            i++;
        });
        window.addEventListener("keydown", (event) => {
            if(event.key == " "){
                return a;
            }
          });
    }
    