import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import { Actor, Vector, Input, Timer } from "excalibur";
import { Resources, ResourceLoader } from "./resources.js";
import { capturePose } from './handControllerAI.js';

export class Player extends Actor {
    constructor() {
        super();
        this.graphics.use(Resources.Fish.toSprite());
        this.pos = new Vector(20, 200);
        this.vel = new Vector(0, 0)
    }

    async onPreUpdate() {
      let movement = await this.getLabel()
      console.log("this is the movement")
      console.log(movement)

      let xspeed = 0;
      let yspeed = 0;

      if (movement == "up") {
        yspeed = -40;
      }

      if (movement == "down") {
        yspeed = 40
      }

      if (movement == "run-down-left") {
        xspeed = -40
        yspeed = 40
      }

      if (movement == "run-down-right") {
        xspeed = 40
        yspeed = 40
      }

      if (movement == "run-up-left") {
        xspeed = -40
        yspeed = -40
      }

      if (movement == "run-left") {
        xspeed = -40
      }

      if (movement == "run-up-right") {
        xspeed = 40
        yspeed = -40
      }

      if (movement == "run-right") {
        xspeed = 40
      }
      this.vel = new Vector(xspeed, yspeed);
    }

    async getLabel() {
      let label = await capturePose();
      // console.log("label")
      // console.log(label)
      return label
    }
}