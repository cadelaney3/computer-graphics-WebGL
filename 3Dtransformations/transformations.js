"use strict";

let canvas;

/** @type {WebGLRenderingContext} */
let gl;

let program;

let rot1;
let rot2;
let rot3;
let scale1;
let tz;
let tx=0;
let ty=0;

let shapes = [];
let points = [];
let colors = [];

function xc(u, v) {
    return u * Math.cos(v * 2 * Math.PI);
}

function yc(u, v) {
    return u * Math.sin(v * 2 * Math.PI);
}

function zc(u, v) {
    return u;
}

let cube_vertices = [
	vec4( -0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5,  0.5,  0.5, 1.0 ),
	vec4(  0.5,  0.5,  0.5, 1.0 ),
	vec4(  0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5, -0.5, -0.5, 1.0 ),
	vec4( -0.5,  0.5, -0.5, 1.0 ),
	vec4(  0.5,  0.5, -0.5, 1.0 ),
	vec4(  0.5, -0.5, -0.5, 1.0 )
];

let tri_vertices = [
    vec4(0.0000, 0.0000, -1.0000, 1.0),
    vec4(0.0000, 0.9428, 0.3333, 1.0),
    vec4(-0.8165, -0.4714, 0.3333, 1.0),
    vec4(0.8165, -0.4714, 0.3333, 1.0)
];

let dodec_vertices = [
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(0.0, 0.809, 0.309, 1.0),
    vec4(0.0, -0.809, 0.309, 1.0),
    vec4(0.0, 0.809, -0.309, 1.0),
    vec4(0.0, -0.809, -0.309, 1.0),
    vec4(0.309, 0.0, 0.809, 1.0),
    vec4(-0.309, 0.0, 0.809, 1.0),
    vec4(0.309, 0.0, -0.809, 1.0),
    vec4(-0.309, 0.0, -0.809, 1.0),
    vec4(0.809, 0.309, 0.0, 1.0),
    vec4(-0.809, 0.309, 0.0, 1.0),
    vec4(0.809, -0.309, 0.0, 1.0),
    vec4(-0.809, -0.309, 0.0, 1.0)
];
		
let vertexColors = [
	vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
	vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
	vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
	vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
	vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
	vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),   // white
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.5, 0.5, 1.0),  
    vec4(0.5, 1.0, 0.5, 1.0),  
    vec4(0.5, 0.5, 1.0, 1.0),  
    vec4(1.0, 1.0, 0.5, 1.0), 
    vec4(1.0, 0.5, 1.0, 1.0), 
    vec4(0.5, 1.0, 1.0, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0), 
    vec4(0.25, 0.75, 0.75, 1.0),
    vec4(0.75, 0.25, 0.75, 1.0),
    vec4(0.75, 0.75, 0.25, 1.0)
];


let status;

// Represents a shape to be drawn to the screen, and maintains the relevant
// GPU buffers
class Shape {
    constructor() {
        if (!gl) {
            console.log("Shape constructor must be called after WebGL is initialized");
        }
        // Buffer for vertex positions
        this.vBuffer = gl.createBuffer();

        // Buffer for vertex colors
        this.cBuffer = gl.createBuffer();

        // Transformation matrix
        this.mat = mat4();

        // Number of vertices in this shape
        this.numVertices = 0;

        // What draw mode to use
        this.drawMode = gl.TRIANGLES;

        this.points = [];

        this.colors = [];
    }

    // Render the shape to the screen
    draw() {
        // TODO

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW);

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        let location = gl.getUniformLocation(program, "mat");
        gl.uniformMatrix4fv(location, false, flatten(this.mat));
		
        gl.drawArrays(this.drawMode, 0, this.numVertices);
		
	}
    // Set the positions and colors to be used for this shape.  Both positions
    // and colors should be arrays of vec4s.
    setData(positions, colors) {
        if (positions.length != colors.length) {
            console.log("Positions and colors not the same length");
        }
 
        // TODO
        this.numVertices = positions.length;
        this.points = positions;
        this.colors = colors;
    }

    // Set transformation matrix
    setMat(mat) {
        this.mat = mat;
    }
}

window.onload = function init()
{
    status = document.getElementById("status");
    rot1 = document.getElementById("rot1");
    rot2 = document.getElementById("rot2");
    rot3 = document.getElementById("rot3");
    scale1 = document.getElementById("scale1");
    tz = document.getElementById("tz");
    [rot1, rot2, rot3, scale1, tz].forEach(function(elem) {
        elem.initValue = elem.value;
        elem.addEventListener("input", render);
        elem.addEventListener("dblclick", function() {
            elem.value = elem.initValue;
            render();
        });
    });
    let addCube = document.getElementById("addCube");
    addCube.addEventListener("click", function (event) {
        console.log("new cube");
        shapes.push(cube());
       // console.log(shapes.length + " num cubes");
        render();
	});
    // TODO: probably set up buttons here
    let addTetra = document.getElementById("addTet");
    addTetra.addEventListener("click", function (event) {
        console.log("new tetra");
        shapes.push(tetra());
        render();
    });

    let addDodec = document.getElementById("addDodec");
    addDodec.addEventListener("click", function (event) {
        console.log("new dodeca");
        shapes.push(dodecahedron());
        render();
    });

    let addCone = document.getElementById("addCone");
    addCone.addEventListener("click", function (event) {
        console.log("new cone");
        shapes.push(cone());
        render();
    });

    canvas = document.getElementById( "gl-canvas" );
    canvas.addEventListener("mousedown", function(event) {
        // TODO
        let normalizedX = 2 * event.clientX / canvas.width - 1;
        let normalizedY = 1 - 2 * event.clientY / canvas.height;
    });
    canvas.addEventListener("mousemove", function(event) {
        if (event.buttons & 1 === 1) {
            // TODO
            let normalizedX = 2 * event.clientX / canvas.width - 1;
            let normalizedY = 1 - 2 * event.clientY / canvas.height;
            tx = normalizedX;
            ty = normalizedY;
            render();
        }
    });
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    render();
};

function square(a, b, c, d) {
    let indices = [a, b, c, a, c, d];
    for (let i = 0; i < indices.length; ++i) {
        points.push(cube_vertices[indices[i]]);
        colors.push(vertexColors[a]);
    }
}

function triangle(a, b, c, color) {
    points.push(tri_vertices[a]);
    colors.push(vertexColors[color]);
    points.push(tri_vertices[b]);
    colors.push(vertexColors[color]);
    points.push(tri_vertices[c]);
    colors.push(vertexColors[color]);
}

function pentagon(a, b, c, d, e, color) {
    let indices = [e, b, d, c, d, b, a, e, b];
    for (let i = 0; i < indices.length; ++i) {
        points.push(dodec_vertices[indices[i]]);
        colors.push(vertexColors[color]);
    }
}

function dodecahedron() {
    points = [];
    colors = [];
    let newShape = new Shape();
    pentagon(3, 18, 6, 11, 9, 4);
    pentagon(2, 9, 11, 7, 19, 1);
    pentagon(15, 7, 11, 6, 14, 0);
    pentagon(10, 4, 14, 15, 5, 5);
    pentagon(16, 4, 14, 6, 18, 2);
    pentagon(12, 0, 16, 18, 3, 6);
    pentagon(13, 12, 3, 9, 2, 11);
    pentagon(13, 1, 17, 19, 2, 10);
    pentagon(17, 5, 15, 7, 19, 9);
    pentagon(0, 16, 4, 10, 8, 8);
    pentagon(12, 0, 8, 1, 13, 12);
    pentagon(1, 8, 10, 5, 17, 3);
    newShape.setData(points, colors);
    return newShape;
}

function tetra() {
    points = [];
    colors = [];
    let newShape = new Shape();
    triangle(0, 2, 1, 0);
    triangle(0, 2, 3, 1);
    triangle(0, 1, 3, 2);
    triangle(1, 2, 3, 3);
    newShape.setData(points, colors);
    return newShape;
}

function cube() {
    points = [];
    colors = [];
    let newShape = new Shape();
    square(1, 0, 3, 2);
    square(2, 3, 7, 6);
	 square(3, 0, 4, 7);
    square(6, 5, 1, 2);
    square(4, 5, 6, 7);
    square(5, 4, 0, 1);
    newShape.setData(points, colors);
    return newShape;
}

function cone() {
    points = [];
    colors = [];
    let newShape = new Shape();
    const NUM_DIVS = 10;
    for (let u = 0; u < NUM_DIVS; u++) {
        for (let v = 0; v < NUM_DIVS; v++) {
            let uf = u / NUM_DIVS;
            let vf = v / NUM_DIVS;
            let upf = (u + 1) / NUM_DIVS;
            let vpf = (v + 1) / NUM_DIVS;
            points.push(vec4(xc(uf, vf), yc(uf, vf), zc(uf, vf)));
            points.push(vec4(xc(upf, vf), yc(upf, vf), zc(upf, vf)));
            points.push(vec4(xc(upf, vpf), yc(upf, vpf), zc(upf, vpf)));

            points.push(vec4(xc(uf, vf), yc(uf, vf), zc(uf, vf)));
            points.push(vec4(xc(upf, vpf), yc(upf, vpf), zc(upf, vpf)));
            points.push(vec4(xc(uf, vpf), yc(uf, vpf), zc(uf, vpf)));
            for (let i = 0; i < 6; i++) {
                if ((u + v) % 2 == 0) {
                    colors.push(vec4(1, 0, 0, 1));
                } else {
                    colors.push(vec4(0, 0, 1, 1));
                }
            }
        }
    }
    newShape.setData(points, colors);
    return newShape;
}

function render()
{
    status.innerHTML = "Angles: " + (+rot1.value).toFixed()
        + ", " + (+rot2.value).toFixed()
        + ", " + (+rot3.value).toFixed()
        + ". Scale: " + (+scale1.value).toFixed(2)
        + ". Translation: " + (+tz.value).toFixed(2);
    
    let r1 = rotateX(rot1.value);
    let r2 = rotateY(rot2.value);
    let r3 = rotateZ(rot3.value);
    let s1 = scalem(scale1.value, scale1.value, scale1.value);
    let t1 = translate(tx, ty, tz.value);


    let mat = mult(mult(mult(mult(t1, s1), r3), r2), r1);

    // TODO: set mat correctly
    
    let location = gl.getUniformLocation(program, "mat");
    gl.uniformMatrix4fv(location, false, flatten(mat));
	
    //console.log(mat);
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (let i=0; i<shapes.length; i++) {
        if (i === shapes.length - 1) {
            shapes[i].setMat(mat);
        }
        shapes[i].draw();
    }
}
