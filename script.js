/**
 * @fileoverview Simple 3D wireframe renderer on a 2D canvas. Defines a small
 * scene (a cube and a "B" shaped object), projects 3D vertices to 2D using a
 * simple perspective (x/z, y/z), applies rotation around the XZ plane,
 * translates along Z, and renders points and line segments to an HTML canvas.
 *
 * Typedefs
 * @typedef {Object} Vec2
 * @property {number} x - X coordinate in 2D screen space (pixels).
 * @property {number} y - Y coordinate in 2D screen space (pixels).
 *
 * @typedef {Object} Vec3
 * @property {number} x - X coordinate in 3D space (normalized).
 * @property {number} y - Y coordinate in 3D space (normalized).
 * @property {number} z - Z coordinate in 3D space (depth).
 *
 * @typedef {number[]} FaceIndices - Array of vertex indices forming a face or polyline.
 *
 * Globals / Configuration
 * @constant {string} Background - CSS color used to clear the canvas.
 * @constant {string} Foreground - CSS color used for points and lines.
 * @constant {number} FPS - Target frames per second for the render loop.
 * @constant {HTMLCanvasElement} game - Canvas element used for rendering (assumed present).
 * @constant {CanvasRenderingContext2D} ctx - 2D drawing context from the canvas.
 *
 * Scene data
 * @constant {Vec3[]} vss - Vertex list for the cube (8 vertices).
 * @constant {FaceIndices[]} fss - Face/edge index arrays for the cube (faces and edges).
 * @constant {Vec3[]} vs - Vertex list for the "B" shaped object (front and back layers).
 * @constant {FaceIndices[]} fs - Face/edge index arrays for the "B" object.
 *
 * Runtime state
 * @type {number} dz - Global Z translation applied to all vertices before projection.
 * @type {number} angle - Rotation angle (radians) applied each frame (rotates around XZ plane).
 *
 * Utility functions
 *
 * clear
 * @function clear
 * @description Fills the entire canvas with the Background color. Should be called each frame before drawing.
 *
 * point
 * @function point
 * @param {Vec2} p - Screen-space 2D point.
 * @description Draws a small square centered at the given 2D screen coordinate using the Foreground color.
 *
 * line
 * @function line
 * @param {Vec2} p1 - Screen-space start point.
 * @param {Vec2} p2 - Screen-space end point.
 * @description Draws a stroked line between two 2D screen points using the Foreground color.
 *
 * screen
 * @function screen
 * @param {Vec2} p - Normalized 2D point expected in range [-1, 1] horizontally and vertically.
 * @returns {Vec2} - Coordinates transformed to canvas pixel space. X is mapped from [-1..1] to [0..width], Y is inverted and mapped similarly to [0..height].
 * @description Converts normalized 2D coordinates into canvas pixel coordinates (centers origin and flips Y).
 *
 * project
 * @function project
 * @param {Vec3} p - 3D point in camera/object space.
 * @returns {Vec2} - 2D projected point using simple perspective projection (x/z, y/z).
 * @description Performs a basic perspective divide to map 3D coordinates to 2D normalized coordinates.
 *
 * translate_z
 * @function translate_z
 * @param {Vec3} p - 3D point to translate.
 * @param {number} dzDelta - Amount to add to the Z coordinate.
 * @returns {Vec3} - New 3D point with translated Z.
 * @description Translates a 3D point along the Z axis by dzDelta.
 *
 * rotate_xz
 * @function rotate_xz
 * @param {Vec3} p - 3D point to rotate.
 * @param {number} angleRad - Rotation angle in radians.
 * @returns {Vec3} - Rotated 3D point (rotation applied in the XZ plane; Y remains unchanged).
 * @description Rotates the input 3D point around the Y axis component using standard 2D rotation in the XZ plane.
 *
 * Main loop
 *
 * frame
 * @function frame
 * @description Per-frame update and render function. Updates rotation angle, clears the canvas, transforms/rotates/translates/project each vertex,
 *              draws points for every vertex of the "B" object, and draws line segments for each face/edge entry in fs. Schedules the next frame via setTimeout based on FPS.
 *
 * Notes
 * - The projection uses a simple x/z and y/z divide; vertices with z <= 0 or very small z may behave unexpectedly (clipping/invalid projection).
 * - Coordinates of objects are small normalized values; screen() maps (-1..1) to canvas pixel coordinates.
 * - This module assumes a global canvas variable named `game` exists and its width/height are configured prior to rendering.
 */
console.log(game);
const Background = "#101010";
const Foreground = "#50FF50";
game.width = 600;
game.height = 600;
const FPS = 30;
const ctx = game.getContext("2d");


clear = () => {
  ctx.fillStyle = Background;
  ctx.fillRect(0, 0, game.width, game.height);
};


point = ({ x, y }) => {
  const s = 10;
  ctx.fillStyle = Foreground;
  ctx.fillRect(x - s / 2, y - s / 2, s, s);
};


line = (p1, p2) => {
    ctx.strokeStyle = Foreground;
ctx.beginPath();
ctx.moveTo(p1.x, p1.y);
ctx.lineTo(p2.x, p2.y);
ctx.stroke();
}

screen = (p) => {
  return {
    x: game.width / 2 + (p.x * game.width) / 2, // original formula before simplification
    // it can be simplified to ((p.x + 1) / 2) * w -- by moving the coordinates from (-1 .. 1) to (0 .. 2) and then scaling it down by half
    y: (1 - (p.y + 1) / 2) * game.height,
  };
};

project = ({ x, y, z }) => {
  return {
    x: x / z,
    y: y / z,
  };
};

translate_z = ({ x, y, z }, dz) => {
  return { x, y, z: z + dz };
};

rotate_xz = ({x, y, z}, angle)=>{
 const c = Math.cos(angle);
 const s = Math.sin(angle)
 
 return {
    x: x*c - z*s,
    y,
    z: x*s + z*c
 }
}
// Cube coordinates
const vss = [
  { x: -0.25, y:  0.25, z: 0.25 },
  { x:  0.25, y:  0.25, z: 0.25 },
  { x:  0.25, y: -0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },

  { x: -0.25, y:  0.25, z: -0.25 },
  { x:  0.25, y:  0.25, z: -0.25 },
  { x:  0.25, y: -0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
  
];

const fss = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
]

// B coordinates
const vs = [
  { x: -0.125, y:  0.25, z: 0.1 },
  { x:  0.125, y:  0.25, z: 0.1 },
  { x:  0.125, y:  0.09, z: 0.1 },
  { x:  0, y:  0, z: 0.1 },
  { x:  0.125, y: -0.09, z: 0.1 },
  { x:  0.125, y: -0.25, z: 0.1 },
  { x: -0.125, y: -0.25, z: 0.1 },

 { x: -0.125, y:  0.25, z: -0.05 },
  { x:  0.125, y:  0.25, z: -0.05 },
  { x:  0.125, y:  0.09, z: -0.05 },
  { x:  0, y:  0, z: -0.05 },
  { x:  0.125, y: -0.09, z: -0.05 },
  { x:  0.125, y: -0.25, z: -0.05 },
  { x: -0.125, y: -0.25, z: -0.05 },
  
];
const fs = [
    [0, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [0, 7],
    [1, 8],
    [2, 9],
    [3, 10],
    [4, 11],
    [5, 12],
    [6, 13]
]


let dz = 1;
let angle = 0;
frame = () => {
  const dt = 1 / FPS;
//   dz += 1 * dt;
  angle += Math.PI * dt /6;
  clear();

  for (v of vs) {
    point(screen(project(translate_z(rotate_xz(v, angle), dz))));
  }

  for(f of fs){
    for(let i = 0; i < f.length; ++i){
        const a = vs[f[i]];
        const b = vs[f[(i+1) % f.length]];
        line(
         screen(project(translate_z(rotate_xz(a, angle), dz))),
         screen(project(translate_z(rotate_xz(b, angle), dz)))
        );
    }
  }

  
  setTimeout(frame, 1000 / FPS);
};
setTimeout(frame, 1000 / FPS);
