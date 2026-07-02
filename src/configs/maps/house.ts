import Character from "../../modules/Character";
import GameObject from "../../modules/GameObject";
import {
  getGridPosition,
  getGridCoord,
  createLinearWall,
} from "../../utils/grid";
import miniMeAnimations from "../sprites/miniMe";

export const house = {
  lowerImageSrc: "../images/backgrounds/generic.png",
  upperImageSrc: "../images/backgrounds/generic-upper.png",
  gameObjects: {
    miniMe: new Character({
      x: getGridPosition(9),
      y: getGridPosition(11),
      isPlayer: true,
      hasShadow: true,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/characters/sprite-vasco.png",
          width: 16,
          height: 32,
          imageWidth: 16,
          imageHeight: 32,
          animations: miniMeAnimations,
        },
        shadow: {
          src: "../images/characters/shadow.png",
          width: 32,
          height: 32,
        },
      },
    }),
    mirror: new GameObject({
      x: getGridPosition(7),
      y: getGridPosition(0),
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/aniamted_haunted_mirror.png",
          width: 16,
          height: 32,
          imageWidth: 16,
          imageHeight: 32,
        },
      },
      interactions: [
        {
          events: [
            {
              type: "interactionBox",
              title: "About Me",
              textLines: [
                "My name is Yan Myo Aung and I'm a Full-Stack Developer from Myanmar.",
                "I have over two years of professional experience building modern web applications. Currently working as a Frontend Developer at PassionGeek, I specialize in React, Next.js, and TypeScript, and I'm equally passionate about backend engineering with NestJS and PostgreSQL.",
              ],
            },
            {
              type: "interactionBox",
              title: "About Me",
              textLines: [
                "I studied Computer Science at Greenwich University (NCC Education Program) in Myanmar through KMD College",
                "I consider myself a curious, dedicated, and adaptable person",
                "I love building personal projects, exploring new technologies and LLMs, and continuously learning to become a better person at not only my work but also in my personal life",
              ],
            },
          ],
        },
      ],
      interactionIcon: {
        far: "../images/objects/interaction.png",
      },
    }),
    // shelf: new GameObject({
    //     x: getGridPosition(9),
    //     y: getGridPosition(0),
    //     hasShadow: false,
    //     width: getGridPosition(2),
    //     height: getGridPosition(2),
    //     sprite: {
    //         object: {
    //             src: '../images/objects/shelf.png',
    //             width: getGridPosition(3),
    //             height: getGridPosition(3),
    //         },
    //     },
    // }),
    table: new GameObject({
      x: getGridPosition(5),
      y: getGridPosition(1),
      hasShadow: false,
      width: getGridPosition(2),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/table.png",
          width: getGridPosition(2),
          height: getGridPosition(2),
        },
      },
    }),
    couch: new GameObject({
      x: getGridPosition(8),
      y: getGridPosition(4),
      hasShadow: false,
      width: getGridPosition(3),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/couch.png",
          width: getGridPosition(3),
          height: getGridPosition(2),
        },
      },
    }),
  },
  limits: {
    xMin: getGridPosition(9),
    yMin: getGridPosition(5),
    xMax: getGridPosition(6),
    yMax: getGridPosition(9),
  },
  actionSpaces: {
    [getGridCoord(0, 4)]: [
      {
        events: [{ type: "changeMap", map: "room" }],
      },
    ],
    [getGridCoord(0, 5)]: [
      {
        events: [{ type: "changeMap", map: "room" }],
      },
    ],
    [getGridCoord(9, 11)]: [
      {
        events: [{ type: "changeMap", map: "outside" }],
      },
    ],
  },
  walls: {
    [getGridCoord(-1, 4)]: true,
  },
};

createLinearWall({ coord: "x", x: 0, y: 0, n: 20, map: house });
createLinearWall({ coord: "y", x: 0, y: 0, n: 11, map: house });
createLinearWall({ coord: "x", x: 1, y: 6, n: 3, map: house });
createLinearWall({ coord: "x", x: 5, y: 8, n: 4, map: house });
createLinearWall({ coord: "x", x: 10, y: 8, n: 4, map: house });
createLinearWall({ coord: "y", x: 4, y: 1, n: 3, map: house });
createLinearWall({ coord: "x", x: 0, y: 3, n: 4, map: house });
createLinearWall({ coord: "y", x: 4, y: 6, n: 6, map: house });
createLinearWall({ coord: "y", x: 14, y: 1, n: 11, map: house });
createLinearWall({ coord: "x", x: 5, y: 12, n: 10, map: house });
