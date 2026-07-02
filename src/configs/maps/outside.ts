import Character from "../../modules/Character";
import GameObject from "../../modules/GameObject";
import {
  getGridPosition,
  getGridCoord,
  createLinearWall,
} from "../../utils/grid";
import miniMeAnimations from "../sprites/miniMe";
import carAnimations from "../sprites/car";
import billboard from "../sprites/billboard";
import fountain from "../sprites/fountain";
import globe from "../sprites/globe";
import techskillsBillboard from "../sprites/techskillsBillboard";
import { addActions } from "../../utils/actions";
import * as interactions from "../interactions/index";
import bugAnimations from "../sprites/bug";

export const outside = {
  lowerImageSrc: "../images/backgrounds/exterior.png",
  gameObjects: {
    miniMe: new Character({
      x: getGridPosition(41), //x: getGridPosition(10),
      y: getGridPosition(24), //y: getGridPosition(10),
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
          imageWidth: 64,
          imageHeight: 64,
        },
      },
      isHidden: true,
    }),
    car: new Character({
      x: getGridPosition(7), //x: getGridPosition(10),
      y: getGridPosition(24), //y: getGridPosition(10),
      isPlayer: false,
      hasShadow: true,
      width: getGridPosition(1),
      height: getGridPosition(2),
      sprite: {
        object: {
          src: "../images/characters/car.png",
          width: getGridPosition(4),
          height: getGridPosition(3),
          animations: carAnimations,
        },
      },
      isCameraView: true,
      speedMultiplier: 2,
    }),
    bug: new Character({
      x: getGridPosition(55), //x: getGridPosition(10),
      y: getGridPosition(20), //y: getGridPosition(10),
      isPlayer: false,
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/bug.png",
          width: getGridPosition(1),
          height: getGridPosition(1),
          animations: bugAnimations,
        },
      },
      isHidden: true,
    }),
    house: new GameObject({
      x: getGridPosition(64),
      y: getGridPosition(3),
      hasShadow: false,
      width: getGridPosition(4),
      height: getGridPosition(4),
      sprite: {
        object: {
          src: "../images/objects/house.png",
          width: getGridPosition(4),
          height: getGridPosition(5),
          imageWidth: 128,
          imageHeight: 160,
        },
      },
      door: {
        offsetX: getGridPosition(2),
        offsetY: getGridPosition(3),
        src: "../images/doors/door-house.png",
        width: getGridPosition(1),
        height: getGridPosition(2),
      },
    }),
    // TECH SKILLS Building
    techSkillsMuseum: new GameObject({
      x: getGridPosition(44),
      y: getGridPosition(12),
      hasShadow: false,
      width: getGridPosition(8),
      height: getGridPosition(5),
      sprite: {
        object: {
          src: "../images/objects/museum2.png",
          width: getGridPosition(8),
          height: getGridPosition(6),
        },
      },
      door: {
        offsetX: getGridPosition(0),
        offsetY: getGridPosition(4),
        src: "../images/doors/door-techskills.png",
        width: getGridPosition(3),
        height: getGridPosition(2),
      },
    }),
    techskillsBillboard: new GameObject({
      x: getGridPosition(45.8),
      y: getGridPosition(12.5),
      hasShadow: false,
      width: getGridPosition(5),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/techskills-billboard.png",
          width: getGridPosition(5),
          height: getGridPosition(3),
          animations: techskillsBillboard,
        },
      },
    }),
    signEduExp: new GameObject({
      x: getGridPosition(44),
      y: getGridPosition(20),
      hasShadow: false,
      width: getGridPosition(3),
      height: getGridPosition(2),
      sprite: {
        object: {
          src: "../images/objects/sign-outside.png",
          width: getGridPosition(3),
          height: getGridPosition(3),
        },
      },
    }),
    // Education Building
    college: new GameObject({
      x: getGridPosition(43),
      y: getGridPosition(-1),
      hasShadow: false,
      width: getGridPosition(12),
      height: getGridPosition(9),
      sprite: {
        object: {
          src: "../images/objects/college.png",
          width: getGridPosition(13),
          height: getGridPosition(13),
          imageWidth: getGridPosition(13),
          imageHeight: getGridPosition(13),
        },
      },
    }),
    signCollege: new GameObject({
      x: getGridPosition(45.5),
      y: getGridPosition(4),
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/sign-college.png",
          width: getGridPosition(8),
          height: getGridPosition(3),
        },
      },
    }),
    professor: new Character({
      x: getGridPosition(49),
      y: getGridPosition(8),
      isPlayer: false,
      hasShadow: true,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/characters/professor.png",
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
          imageWidth: 64,
          imageHeight: 64,
        },
      },
      interactions: [
        {
          events: [
            {
              type: "message",
              text: `Professor: Hi Yan Myo Aung, you're back! I kept your Computer Science Degree around. Let me see...`,
            },
            {
              type: "message",
              text: `Professor: There you go!`,
            },
            {
              type: "interactionBox",
              title:
                "Computer Science Degree — NCC Education, Greenwich University",
              textLines: [
                `- Software Engineering`,
                `- Data Structures & Algorithms`,
                `- Database Systems`,
                `- Object-Oriented Programming`,
                `- Web Development`,
              ],
            },
          ],
        },
      ],
      interactionIcon: {
        far: "../images/objects/interaction.png",
      },
    }),
    //PROFESSIONAL EXPERIENCE BUILDINGS
    passionGeekBillboard: new GameObject({
      x: getGridPosition(33.5),
      y: getGridPosition(17.5),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/passiongeek-billboard.png",
          width: getGridPosition(5),
          height: getGridPosition(1.5),
          imageWidth: 73,
          imageHeight: 23,
        },
      },
    }),
    passionGeek: new GameObject({
      x: getGridPosition(33),
      y: getGridPosition(13),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(6),
      collisionOffset: {
        width: 0,
        height: getGridPosition(1),
      },
      sprite: {
        object: {
          src: "../images/objects/arkadium.png",
          width: getGridPosition(6),
          height: getGridPosition(9),
        },
      },
    }),
    passionGeekInfo: new GameObject({
      x: getGridPosition(39),
      y: getGridPosition(19),
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/information.png",
          width: 16,
          height: 32,
        },
      },
      interactionIcon: {
        far: "../images/objects/interaction.png",
      },
      interactions: [
        {
          events: [
            {
              type: "interactionBox",
              title: "PassionGeek (Feb 2026 - Present)",
              textLines: [
                `PassionGeek is a software company focused on building modern digital solutions and applications.`,
                `As a Frontend Developer at PassionGeek, I develop modern web applications using React, Next.js, and TypeScript while collaborating closely with backend engineers and designers.`,
              ],
            },
            {
              type: "interactionBox",
              title: "PassionGeek (Feb 2026 - Present)",
              textLines: [
                `My focus is on building responsive user interfaces, integrating APIs, improving application performance, and delivering production-ready features that drive value for the business.`,
              ],
            },
          ],
        },
      ],
    }),
    gNextBillboard: new GameObject({
      x: getGridPosition(25.5),
      y: getGridPosition(15.5),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/gnext-billboard.png",
          width: getGridPosition(5),
          height: getGridPosition(1.5),
          imageWidth: 73,
          imageHeight: 23,
        },
      },
    }),
    gNext: new GameObject({
      x: getGridPosition(25),
      y: getGridPosition(11),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(8),
      collisionOffset: {
        width: 0,
        height: getGridPosition(1),
      },
      sprite: {
        object: {
          src: "../images/objects/emma.png",
          width: 96,
          height: 176,
        },
      },
      door: {
        offsetX: getGridPosition(2),
        offsetY: getGridPosition(8.5),
        width: getGridPosition(2),
        height: getGridPosition(2),
        src: "../images/doors/door-building.png",
      },
    }),
    gNextInfo: new GameObject({
      x: getGridPosition(31),
      y: getGridPosition(19),
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/information.png",
          width: 16,
          height: 32,
        },
      },
      interactionIcon: {
        far: "../images/objects/interaction.png",
      },
      interactions: [
        {
          events: [
            {
              type: "interactionBox",
              title: "G-Next (May 2024 - Jan 2026)",
              textLines: [
                `G-Next is a Japanese software company that develops modern web applications and digital solutions for clients across various industries.`,
                `As a React / Next.js Developer at G-Next, I developed and maintained frontend applications using React and Next.js, delivering high-quality user interfaces for clients.`,
              ],
            },
            {
              type: "interactionBox",
              title: "G-Next (May 2024 - Jan 2026)",
              textLines: [
                `In addition to frontend development, I occasionally contributed to backend services using NestJS, giving me valuable experience working across the full stack and collaborating with cross-functional teams.`,
              ],
            },
          ],
        },
      ],
    }),
    hostMyanmarBillboard: new GameObject({
      x: getGridPosition(17.5),
      y: getGridPosition(15.5),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/hostmyanmar-billboard.png",
          width: getGridPosition(5),
          height: getGridPosition(1.5),
          imageWidth: 73,
          imageHeight: 23,
        },
      },
    }),
    hostMyanmar: new GameObject({
      x: getGridPosition(17),
      y: getGridPosition(11),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(8),
      collisionOffset: {
        width: 0,
        height: getGridPosition(1),
      },
      sprite: {
        object: {
          src: "../images/objects/farfetch.png",
          width: 96,
          height: 176,
        },
      },
      door: {
        offsetX: getGridPosition(2),
        offsetY: getGridPosition(8.5),
        width: getGridPosition(2),
        height: getGridPosition(2),
        src: "../images/doors/door-building.png",
      },
    }),
    hostMyanmarInfo: new GameObject({
      x: getGridPosition(23),
      y: getGridPosition(19),
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/information.png",
          width: 16,
          height: 32,
        },
      },
      interactionIcon: {
        far: "../images/objects/interaction.png",
      },
      interactions: [
        {
          events: [
            {
              type: "interactionBox",
              title: "Host Myanmar (Sep 2023 - Apr 2024)",
              textLines: [
                `Host Myanmar is a technology company providing web development and digital services for businesses in Myanmar.`,
                `As a Junior Developer at Host Myanmar, I was fully responsible for maintaining and developting new modules for the HR system project using Laravel, and also contributed to Livewire projects occassionally.`,
              ],
            },
            {
              type: "interactionBox",
              title: "Host Myanmar (Sep 2023 - Apr 2024)",
              textLines: [
                `My role involved debugging, implementing new functionality, and strengthening my foundation in web application development while delivering real-world solutions for clients.`,
              ],
            },
          ],
        },
      ],
    }),
    coffeeShop: new GameObject({
      x: getGridPosition(19),
      y: getGridPosition(1),
      hasShadow: false,
      width: getGridPosition(5),
      height: getGridPosition(8),
      sprite: {
        object: {
          src: "../images/objects/coffee.png",
          width: getGridPosition(5),
          height: getGridPosition(9),
        },
      },
    }),
    iceCreamShop: new GameObject({
      x: getGridPosition(1),
      y: getGridPosition(3),
      hasShadow: false,
      width: getGridPosition(7),
      height: getGridPosition(3),
      collisionOffset: {
        width: 0,
        height: getGridPosition(1),
      },
      sprite: {
        object: {
          src: "../images/objects/ice-cream.png",
          width: getGridPosition(7),
          height: getGridPosition(5),
        },
      },
    }),
    pizzaShop: new GameObject({
      x: getGridPosition(10),
      y: getGridPosition(2),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(5),
      sprite: {
        object: {
          src: "../images/objects/pizza.png",
          width: getGridPosition(6),
          height: getGridPosition(6),
        },
      },
    }),
    // SOFT SKILLS BUILDING
    softSkills: new GameObject({
      x: getGridPosition(27),
      y: getGridPosition(0),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(9),
      sprite: {
        object: {
          src: "../images/objects/soft-skills.png",
          width: 96,
          height: 160,
        },
      },
      door: {
        offsetX: getGridPosition(0),
        offsetY: getGridPosition(8),
        src: "../images/doors/door-softskills.png",
        width: getGridPosition(3),
        height: getGridPosition(2),
      },
    }),
    // SOCIAL BILLBOARDS
    socialBillboard: new GameObject({
      x: getGridPosition(35),
      y: getGridPosition(3),
      hasShadow: false,
      width: getGridPosition(5),
      height: getGridPosition(5),
      sprite: {
        object: {
          src: "../images/objects/billboard-social.png",
          width: getGridPosition(5),
          height: getGridPosition(6),
          animations: billboard,
        },
      },
      interactions: [
        {
          events: [
            {
              type: "message",
              text: `https://github.com/YanMyoAungg`,
              isLink: true,
            },
            {
              type: "message",
              text: `https://www.linkedin.com/in/yan-myo-aung-3111b830a/`,
              isLink: true,
            },
          ],
        },
      ],
    }),
    awardsBillboard: new GameObject({
      x: getGridPosition(56),
      y: getGridPosition(12),
      hasShadow: false,
      width: getGridPosition(5),
      height: getGridPosition(4),
      sprite: {
        object: {
          src: "../images/objects/billboard-awards.png",
          width: getGridPosition(5),
          height: getGridPosition(6),
          animations: billboard,
        },
      },
      collisionOffset: {
        width: 0,
        height: getGridPosition(1),
      },
      interactionIcon: {
        far: "../images/objects/interaction.png",
      },
      interactions: [
        {
          events: [
            {
              type: "interactionBox",
              title: "Projects & Achievements",
              textLines: [
                `Multi-tenant LMS: Designed and developed a SaaS learning platform with tenant isolation, authentication, role-based access control, and a scalable backend using NestJS and PostgreSQL.`,
              ],
            },
            {
              type: "interactionBox",
              title: "Projects & Achievements",
              textLines: [
                `Telegram Reminder Bot: Built a Telegram bot that allows users to save links and receive scheduled reminders with configurable daily, weekly, or monthly notification frequencies.`,
              ],
            },
            {
              type: "interactionBox",
              title: "Projects & Achievements",
              textLines: [
                `Claude Code Any Model: Created an open-source starter repository that simplifies configuring Claude Code to work with custom AI models through LiteLLM Proxy.`,
              ],
            },
          ],
        },
      ],
    }),
    campervan: new GameObject({
      x: getGridPosition(58),
      y: getGridPosition(19),
      hasShadow: false,
      width: getGridPosition(6),
      height: getGridPosition(1),
      collisionOffset: {
        height: getGridPosition(1),
        width: 0,
      },
      sprite: {
        object: {
          src: "../images/objects/campervan.png",
          width: getGridPosition(6),
          height: getGridPosition(4),
        },
      },
      interactions: [
        {
          events: [
            {
              type: "message",
              text: "I enjoy building personal projects, exploring AI and LLMs, and continuously learning about system design and cloud technologies",
            },
          ],
        },
      ],
    }),
    thinkGlobe: new GameObject({
      x: getGridPosition(61),
      y: getGridPosition(19),
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/interfaces/globe.png",
          width: getGridPosition(1),
          height: getGridPosition(2),
          animations: globe,
        },
      },
    }),
    //TREES
    fountain: new GameObject({
      x: getGridPosition(50),
      y: getGridPosition(20.5),
      hasShadow: false,
      width: getGridPosition(2),
      height: getGridPosition(2),
      sprite: {
        object: {
          src: "../images/objects/fountain.png",
          width: getGridPosition(2),
          height: getGridPosition(3),
          animations: fountain,
        },
      },
    }),
    bench: new GameObject({
      x: getGridPosition(50),
      y: getGridPosition(19),
      hasShadow: false,
      width: getGridPosition(2),
      height: getGridPosition(1),
      sprite: {
        object: {
          src: "../images/objects/bench-down.png",
          width: getGridPosition(2),
          height: getGridPosition(2),
        },
      },
      type: "bench",
      interactions: interactions.bench,
    }),
    benchLeft: new GameObject({
      x: getGridPosition(53),
      y: getGridPosition(20),
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(2),
      sprite: {
        object: {
          src: "../images/objects/bench-left.png",
          width: getGridPosition(1),
          height: getGridPosition(3),
        },
      },
      type: "bench",
      interactions: interactions.bench,
    }),
    benchRight: new GameObject({
      x: getGridPosition(48),
      y: getGridPosition(20),
      hasShadow: false,
      width: getGridPosition(1),
      height: getGridPosition(2),
      sprite: {
        object: {
          src: "../images/objects/bench-right.png",
          width: getGridPosition(1),
          height: getGridPosition(3),
        },
      },
      type: "bench",
      interactions: interactions.bench,
    }),

    beer: new GameObject({
      x: getGridPosition(67),
      y: getGridPosition(14),
      hasShadow: false,
      width: getGridPosition(3),
      height: getGridPosition(2),
      sprite: {
        object: {
          src: "../images/objects/beer.png",
          width: getGridPosition(3),
          height: getGridPosition(4),
        },
      },
      interactions: [
        {
          events: [
            {
              type: "message",
              text: `You grab a cold beer and take a refreshing sip!`,
            },
            {
              type: "beer",
              who: "miniMe",
            },
          ],
        },
      ],
      collisionOffset: {
        width: 0,
        height: getGridPosition(1),
      },
    }),
  },
  walls: {
    // [getGridCoord(42,25)]: true,
    // [getGridCoord(70,17)]: true,
    // [getGridCoord(70,18)]: true
  },
  limits: {
    xMin: getGridPosition(11),
    yMin: getGridPosition(6.5),
    xMax: getGridPosition(59),
    yMax: getGridPosition(20),
  },
  actionSpaces: {
    // Interactions for coffe
    [getGridCoord(21, 9)]: interactions.coffee,
    // Interactions for pizza
    [getGridCoord(11, 7)]: interactions.pizza,
    // Interactions for iceCream
    [getGridCoord(3, 7)]: interactions.iceCream,
    [getGridCoord(55, 20)]: [
      {
        triggerOnce: true,
        events: [
          { type: "message", text: `A wild bug appeared!!` },
          { type: "show", who: "bug", direction: "down" },
          { type: "walk", who: "bug", direction: "up" },
          { type: "walk", who: "bug", direction: "up" },
          { type: "walk", who: "bug", direction: "up" },
          { type: "walk", who: "bug", direction: "up" },
          { type: "walk", who: "bug", direction: "up" },
          { type: "walk", who: "bug", direction: "up" },
          { type: "hide", who: "bug" },
          { type: "message", text: `That's one less for the QA Team!` },
        ],
      },
    ],
    [getGridCoord(66, 6)]: [
      {
        events: [{ type: "changeMap", map: "house" }],
      },
    ],
    [getGridCoord(69, 17)]: [
      {
        events: [{ type: "changeMap", map: "basket" }],
      },
    ],
    [getGridCoord(69, 18)]: [
      {
        events: [{ type: "changeMap", map: "basket" }],
      },
    ],
    [getGridCoord(41, 0)]: [
      {
        events: [{ type: "changeMap", map: "beach" }],
      },
    ],
    [getGridCoord(42, 0)]: [
      {
        events: [{ type: "changeMap", map: "beach" }],
      },
    ],
    [getGridCoord(28, 8)]: [
      {
        events: [{ type: "changeMap", map: "softSkills" }],
      },
    ],
    [getGridCoord(28, 19)]: [
      {
        events: [
          {
            type: "message",
            text: `I'm not allowed to enter the building since I don't work here anymore`,
          },
          { type: "walk", who: "miniMe", direction: "down" },
        ],
      },
    ],
    [getGridCoord(27, 19)]: [
      {
        events: [
          {
            type: "message",
            text: `I'm not allowed to enter the building since I don't work here anymore`,
          },
          { type: "walk", who: "miniMe", direction: "down" },
        ],
      },
    ],
    [getGridCoord(19, 19)]: [
      {
        events: [
          {
            type: "message",
            text: `I'm not allowed to enter the building since I don't work here anymore`,
          },
          { type: "walk", who: "miniMe", direction: "down" },
        ],
      },
    ],
    [getGridCoord(20, 19)]: [
      {
        events: [
          {
            type: "message",
            text: `I'm not allowed to enter the building since I don't work here anymore`,
          },
          { type: "walk", who: "miniMe", direction: "down" },
        ],
      },
    ],
    // [getGridCoord(35,19)]: [
    //     {
    //         events: [
    //             { type: 'changeMap', map: 'farfetch'},
    //         ]
    //     }
    // ],
    // [getGridCoord(36,19)]: [
    //     {
    //         events: [
    //             { type: 'changeMap', map: 'farfetch'},
    //         ]
    //     }
    // ],
    [getGridCoord(45, 16)]: [
      {
        events: [{ type: "changeMap", map: "techskills" }],
      },
    ],
  },
  initialInteractions: [
    ...addActions({ type: "walk", who: "car", direction: "right" }, 17),
    { type: "idle", who: "car", direction: "down", time: 200 },
    { type: "changeCameraView", who: "miniMe" },
    { type: "show", who: "miniMe", direction: "down" },
    { type: "walk", who: "miniMe", direction: "up" },
    { type: "walk", who: "miniMe", direction: "up" },
    { type: "walk", who: "miniMe", direction: "up" },
    { type: "walk", who: "miniMe", direction: "up" },
    { type: "walk", who: "miniMe", direction: "up" },
    { type: "idle", who: "miniMe", direction: "down", time: 200 },
    {
      type: "message",
      text: "Hello! 👋 Welcome to my Portfolio",
      showNote: true,
    },
    {
      type: "message",
      text: `My name is Yan Myo Aung and I'm a Full-Stack Developer from Myanmar`,
    },
    {
      type: "message",
      text: (isMobile: boolean) => {
        return `Feel free to explore the rooms! Use the ${
          isMobile ? "joystick" : "arrows"
        } to walk around and press ${
          isMobile ? "A" : "spacebar"
        } to interact with objects.`;
      },
    },
  ],
};

createLinearWall({ coord: "x", x: 0, y: 3, n: 41, map: outside });
createLinearWall({ coord: "x", x: 43, y: 3, n: 30, map: outside });
createLinearWall({ coord: "y", x: 62, y: 3, n: 6, map: outside });
createLinearWall({ coord: "y", x: 40, y: -1, n: 4, map: outside });
createLinearWall({ coord: "x", x: 62, y: 8, n: 3, map: outside });
createLinearWall({ coord: "x", x: 67, y: 8, n: 3, map: outside });
createLinearWall({ coord: "y", x: 0, y: 0, n: 28, map: outside });
createLinearWall({ coord: "y", x: 69, y: 0, n: 28, map: outside });
createLinearWall({ coord: "x", x: 0, y: 25, n: 70, map: outside });
createLinearWall({ coord: "x", x: 40, y: -1, n: 4, map: outside });
createLinearWall({ coord: "y", x: 70, y: 17, n: 2, map: outside });
