import { Curve, NumberKeyframe } from 'curves';
import { Easing } from 'eaz';

export const curvePresets = {
  fadeOut: new Curve([
    new NumberKeyframe(0, 1),
    new NumberKeyframe(0.7, 0.75),
    new NumberKeyframe(1, 0),
  ]),
  fadeOutLinear: new Curve([
    new NumberKeyframe(0, 1, Easing.linear),
    new NumberKeyframe(0.7, 0.75, Easing.linear),
    new NumberKeyframe(1, 0, Easing.linear),
  ]),
  fadeInOut: new Curve([
    new NumberKeyframe(0, 0),
    new NumberKeyframe(0.2, 1),
    new NumberKeyframe(0.75, 0.85),
    new NumberKeyframe(1, 0),
  ]),
  grow: new Curve([
    new NumberKeyframe(0, 0.35, Easing.linear),
    new NumberKeyframe(1, 1.8, Easing.linear),
  ]),
  shrink: new Curve([
    new NumberKeyframe(0, 1.3),
    new NumberKeyframe(1, 0.2),
  ]),
};
