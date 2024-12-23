import { gsap } from '@gsap-core';
import { PixiPlugin } from '@gsap-pixi';
import { MotionPathPlugin } from '@gsap-motion-path';
import { EasePack } from "@gsap-ease";
gsap.registerPlugin(PixiPlugin, MotionPathPlugin, EasePack);

export {gsap, PixiPlugin, MotionPathPlugin};