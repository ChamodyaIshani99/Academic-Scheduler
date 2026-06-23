const generateRandomTimetable = require("../utils/generateRandomTimetable");
const calculateFitness = require("../utils/fitnessCalculator");

const POPULATION_SIZE = 20;
const GENERATIONS = 30;
const MUTATION_RATE = 0.1;

const crossover = (parent1, parent2) => {
  const point = Math.floor(parent1.length / 2);
  return [...parent1.slice(0, point), ...parent2.slice(point)];
};

const mutate = (timetable, rooms, timeSlots) => {
  return timetable.map(entry => {
    if (Math.random() < MUTATION_RATE) {
      const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];

      return {
        ...entry,
        day: slot.day,
        startTime: slot.start,
        endTime: slot.end,
        roomId: room._id
      };
    }
    return entry;
  });
};

const runGeneticAlgorithm = (subjects, rooms, groups) => {
  let population = [];

  // initial population
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(generateRandomTimetable(subjects, rooms, groups));
  }

  for (let gen = 0; gen < GENERATIONS; gen++) {
    // evaluate fitness
    population.sort(
      (a, b) => calculateFitness(b) - calculateFitness(a)
    );

    // keep best 50%
    const survivors = population.slice(0, POPULATION_SIZE / 2);

    let newPopulation = [...survivors];

    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
      const parent2 = survivors[Math.floor(Math.random() * survivors.length)];

      let child = crossover(parent1, parent2);
      child = mutate(child, rooms, [
        { day: "Mon", start: "09:00", end: "11:00" },
        { day: "Tue", start: "09:00", end: "11:00" }
      ]);

      newPopulation.push(child);
    }

    population = newPopulation;
  }

  // best timetable
  population.sort(
    (a, b) => calculateFitness(b) - calculateFitness(a)
  );

  return population[0];
};

module.exports = runGeneticAlgorithm;