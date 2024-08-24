export interface IInverseKinematics {
  target_x: number;
  target_y: number;
  target_z: number;
  target_z2: number;
  h0: number;
  h1: number;
  h2: number;
  h3: number;
  alpha1: number;
  alpha2: number;
  beta1: number;
  // not used in calculations so not calculated:
  // beta2: number;
  gamma1: number;
  gamma2: number;
  lambda: number;
  j0: number;
  j1: number;
  j2: number;
  j3: number;
}
export const CalculateInverseKinematics = (
  l1: number,
  l2: number,
  l3: number,
  target: {
    x: number;
    y: number;
    z: number;
  }
): IInverseKinematics => {
  const x = target.x;
  const y = target.y;
  const z = target.z;

  let j0 = 0;
  let j1 = 0;
  let j2 = 0;
  let j3 = 0;

  const target_x = x;
  const target_y = y;
  const target_z = z;
  const target_z2 = z + l3;

  j0 = Math.atan2(target_y, target_x);

  const h0 = Math.sqrt(target_x * target_x + target_y * target_y);

  const h1 = Math.sqrt(h0 * h0 + target_z2 * target_z2); // triangle to joint 3


  // gamma is the angle from the x-axis to to the point in the x-z plane
  const gamma1 = Math.atan2(target_z2, h0);

  // law of cosines
  // a and b are sides of the triangle
  // c is the hypotenuse
  // C is the angle opposite of side
  // sq(c) = sq(a) + sq(b) - 2*a*b*cos(C)
  // sq(c) + 2*a*bcos(C) = sq(a) + sq(c)
  // 2*a*b*cos(C) = sq(a) + sq(b) - sq(c)
  // cos(C) = ( sq(a) + sq(b) - sq(c) ) / 2*a*b
  // C = acos( ( sq(a) + sq(b) - sq(c) ) / 2*a*b )
  // alpha is the angle from the arm 1 to the point
  // sq(c)  = sq(a)          + sq(b)  - 2*a*b*cos(C)
  // sq(l2) = sq(hypontenus) + sq(l1) - 2*hypontenus*l1*cos(alpha)
  // alpha = acos( ( sq(hypontenus) + sq(l1) - sq(l2) ) / 2*hypontenus*l1 )
  const alpha1 = Math.acos((h1 * h1 + l1 * l1 - l2 * l2) / (2 * h1 * l1));

  // beta is the angle between the two arm segments
  // sq(c)          = sq(a)  + sq(b)  - 2*a*b*cos(C)
  // sq(hypontenus) = sq(l1) + sq(l2) - 2*l1*l2*cos(beta)
  // beta = = acos( ( sq(l1) + sq(l2) - sq(hypontenus) ) / 2*l1*l2 )
  const beta1 = Math.acos((l2 * l2 + l1 * l1 - h1 * h1) / (2 * l1 * l2));

  j1 = gamma1 + alpha1;
  j2 = Math.PI - beta1;

  const gamma2 = Math.atan2(target_z, h0);
  const alpha2 = j1 - gamma2;
  const h2 = Math.sqrt(h0 * h0 + target_z * target_z); // triangle to extruder tip
  const h3 = Math.sqrt(l1 * l1 + h2 * h2 - 2 * l1 * h2 * Math.cos(alpha2));
  const lambda = Math.acos((l2 * l2 + l3 * l3 - h3 * h3) / (2 * l2 * l3));

  j3 = Math.PI - lambda;

  return {
    target_x,
    target_y,
    target_z,
    target_z2,
    h0,
    h1,
    h2,
    h3,
    alpha1,
    alpha2,
    beta1,
    gamma1,
    gamma2,
    lambda,
    j0,
    j1,
    j2,
    j3,
  };
};
