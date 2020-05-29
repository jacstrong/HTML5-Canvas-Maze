import CollisionBody from '../engine/objects/collisionBody'

const spriteWidth = 32;

export default function makeS (x, y, ss) {
  return new CollisionBody({
  image: ss,
  pos: { x: x, y: y },
  width: spriteWidth,
  height: spriteWidth / 4,
  rotation: 0,
  callback: () => {
    console.log('image loaded')
  },
  collisionObjects: [
    {
      collisionCenter: { x: 16, y: 4},
      collisionDim: { x: 32, y: 8},
    }
  ],
  randomState: true,
  ss: {
    S: [
      {
        x: 0,
        y: 96,
        width: 16,
        height: 3
      },
    ],
  },
  state: 'S'
  });
}