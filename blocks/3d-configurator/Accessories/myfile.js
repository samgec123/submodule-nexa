// myfile.js

// Constants for gravity on Earth and Moon (in m/s^2)
const GRAVITY_EARTH = 9.81;
const GRAVITY_MOON = 1.62;

// Function to calculate the time it takes for a ball to drop from a certain height
function calculateDropTime(height, gravity) {
  return Math.sqrt((2 * height) / gravity);
}

// Function to simulate the drop of a ball
function simulateDrop(height, gravity, surface) {
  const time = calculateDropTime(height, gravity);
  console.log(
    `The ball takes ${time.toFixed(
      2
    )} seconds to drop from ${height} meters on ${surface}.`
  );
}

// Example usage
const height = 10; // height in meters
simulateDrop(height, GRAVITY_EARTH, "Earth");
simulateDrop(height, GRAVITY_MOON, "Moon");
