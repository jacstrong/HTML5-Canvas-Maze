import CollisionBody from '../engine/objects/collisionBody'

const spriteWidth = 32;

export default function makeWall (x, y, state, ss) {
  let collisionObjects = []
  switch (state) {
    case 'WN':
      collisionObjects.push({ // W
        collisionCenter: {x: 4, y: 16},
        collisionDim: {x: 8, y: 32},
      })
    case 'N':
      collisionObjects.push({ //N
        collisionCenter: {x: 16, y: 3},
        collisionDim: {x: 32, y: 6},
      })
      break;
    case 'NONE':
      collisionObjects.push({ //N
        collisionCenter: {x: 4, y: 3},
        collisionDim: {x: 8, y: 6},
      })
      break;
    case 'W':
      collisionObjects.push({ // W
        collisionCenter: {x: 4, y: 16},
        collisionDim: {x: 8, y: 32},
      })
      break;
    default:
      break;
  }

  return new CollisionBody({
  image: ss,
  pos: { x: x, y: y },
  width: spriteWidth + 0.2,
  height: spriteWidth + 0.2,
  rotation: 0,
  callback: () => {
    console.log('image loaded')
  },
  collisionObjects: collisionObjects,
  randomState: true,
  ss: {
    WN: [
      {
        x: 0,
        y: 112,
        width: 16,
        height: 16
      },
      {
        x: 16,
        y: 112,
        width: 16,
        height: 16
      },
    ],
    NONE: [
      {
        x: 48,
        y: 160,
        width: 16,
        height: 16
      },
    ],
    N: [
      {
        x: 0,
        y: 96,
        width: 16,
        height: 16
      },
      {
        x: 16,
        y: 96,
        width: 16,
        height: 16
      },
      {
        x: 32,
        y: 96,
        width: 16,
        height: 16
      },
      {
        x: 48,
        y: 96,
        width: 16,
        height: 16
      },
      // { // bones -- appear too often
      //   x: 32,
      //   y: 144,
      //   width: 16,
      //   height: 16
      // },
    ],
    W: [
      {
        x: 0,
        y: 128,
        width: 16,
        height: 16
      },
      {
        x: 16,
        y: 128,
        width: 16,
        height: 16
      },
      {
        x: 32,
        y: 128,
        width: 16,
        height: 16
      },
      {
        x: 48,
        y: 128,
        width: 16,
        height: 16
      },
    ],
    entrance: [
      {
        x: 0,
        y: 160,
        width: 16,
        height: 16
      }
    ],
    exit: [
      {
        x: 16,
        y: 160,
        width: 16,
        height: 16
      }
    ]
  },
  state: state
  });
}
