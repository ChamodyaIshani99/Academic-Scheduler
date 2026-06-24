// services/geneticScheduler.js
const generateConflictFree = require("../utils/conflictFreeGenerator");
const generateTimeSlots = require("../utils/timeSlotGenerator");
const isOverlapping = require("../utils/timeValidator");
const calculateFitness = require("../utils/fitnessCalculator");

// ===== CONFIGURATION =====
const POPULATION_SIZE = 50;
const GENERATIONS = 100;
const MUTATION_RATE = 0.15;          // base rate (will be adapted)
const ELITE_COUNT = 2;
const TOURNAMENT_SIZE = 3;
const DIVERSITY_THRESHOLD = 0.3;     // if below, refresh 10% of pop

// ===== TIME SLOTS =====
const timeSlots = generateTimeSlots(); // Mon–Fri, 8–18, 2‑hour blocks

// ===== SELECTION (Tournament) =====
const tournamentSelect = (population, fitnesses) => {
  let bestIdx = -1;
  let bestFitness = -Infinity;
  for (let i = 0; i < TOURNAMENT_SIZE; i++) {
    const idx = Math.floor(Math.random() * population.length);
    if (fitnesses[idx] > bestFitness) {
      bestFitness = fitnesses[idx];
      bestIdx = idx;
    }
  }
  return population[bestIdx];
};

// ===== CROSSOVER (Two‑point) =====
const crossover = (parent1, parent2) => {
  const length = parent1.length;
  const point1 = Math.floor(length * 0.3);
  const point2 = Math.floor(length * 0.7);
  // Child: first segment from parent1, middle from parent2, last from parent1
  return [
    ...parent1.slice(0, point1),
    ...parent2.slice(point1, point2),
    ...parent1.slice(point2)
  ];
};

// ===== MUTATION (Adaptive + Swap) =====
const mutate = (timetable, rooms, generation, maxGenerations) => {
  // Adaptive rate: starts high, decreases linearly
  const adaptiveRate = MUTATION_RATE * (1 - generation / maxGenerations) + 0.05;
  const mutated = [...timetable];

  // 30% chance to perform a swap mutation (if at least 2 entries)
  if (mutated.length > 1 && Math.random() < 0.3) {
    const idx1 = Math.floor(Math.random() * mutated.length);
    let idx2 = Math.floor(Math.random() * mutated.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * mutated.length);
    // Swap day/start/end between two entries
    const tmpDay = mutated[idx1].day;
    const tmpStart = mutated[idx1].startTime;
    const tmpEnd = mutated[idx1].endTime;
    mutated[idx1].day = mutated[idx2].day;
    mutated[idx1].startTime = mutated[idx2].startTime;
    mutated[idx1].endTime = mutated[idx2].endTime;
    mutated[idx2].day = tmpDay;
    mutated[idx2].startTime = tmpStart;
    mutated[idx2].endTime = tmpEnd;
  }

  // Standard time/room mutation
  for (let i = 0; i < mutated.length; i++) {
    if (Math.random() < adaptiveRate) {
      const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      mutated[i] = {
        ...mutated[i],
        day: slot.day,
        startTime: slot.start,
        endTime: slot.end,
        roomId: room._id,
        room: room
      };
    }
  }
  return mutated;
};

// ===== REPAIR OPERATOR =====
const repair = (timetable, rooms) => {
  const fixed = [...timetable];
  const placed = [];

  for (let i = 0; i < fixed.length; i++) {
    let entry = fixed[i];
    let conflict = true;
    let attempts = 0;
    const maxAttempts = 200;

    while (conflict && attempts < maxAttempts) {
      conflict = false;
      for (let p of placed) {
        if (p.day !== entry.day) continue;
        if (isOverlapping(entry.startTime, entry.endTime, p.startTime, p.endTime)) {
          if (
            p.groupId.toString() === entry.groupId.toString() ||
            p.lecturerId.toString() === entry.lecturerId.toString() ||
            p.roomId.toString() === entry.roomId.toString()
          ) {
            conflict = true;
            break;
          }
        }
      }

      if (conflict) {
        const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        entry = {
          ...entry,
          day: slot.day,
          startTime: slot.start,
          endTime: slot.end,
          roomId: room._id,
          room: room
        };
        attempts++;
      }
    }

    placed.push(entry);
    fixed[i] = entry;
  }

  return fixed;
};

// ===== DIVERSITY CALCULATION =====
const calculateDiversity = (population) => {
  const allSlotKeys = new Set();
  for (let ind of population) {
    for (let entry of ind) {
      allSlotKeys.add(`${entry.day}_${entry.startTime}_${entry.endTime}`);
    }
  }
  const totalEntries = population.reduce((sum, ind) => sum + ind.length, 0);
  return totalEntries > 0 ? allSlotKeys.size / totalEntries : 0;
};

// ===== MAIN ALGORITHM =====
const runGeneticAlgorithm = (subjects, rooms, groups) => {
  // 1. Initial population (conflict‑free)
  let population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(generateConflictFree(subjects, rooms, groups, timeSlots));
  }

  // 2. Evolution loop
  for (let gen = 0; gen < GENERATIONS; gen++) {
    // Compute fitness for all individuals
    const fitnesses = population.map(ind => calculateFitness(ind));

    // Sort by fitness (descending)
    const indexed = population.map((ind, idx) => ({ ind, fitness: fitnesses[idx] }));
    indexed.sort((a, b) => b.fitness - a.fitness);
    const sortedPopulation = indexed.map(item => item.ind);

    // Elitism: keep the best individuals
    const elites = sortedPopulation.slice(0, ELITE_COUNT);
    const newPopulation = [...elites];

    // Fill the rest with crossover + mutation + repair
    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = tournamentSelect(sortedPopulation, fitnesses);
      const parent2 = tournamentSelect(sortedPopulation, fitnesses);

      let child = crossover(parent1, parent2);
      child = mutate(child, rooms, gen, GENERATIONS);
      child = repair(child, rooms);

      newPopulation.push(child);
    }

    // Diversity boost: if diversity is too low, replace 10% with fresh individuals
    const diversity = calculateDiversity(newPopulation);
    if (diversity < DIVERSITY_THRESHOLD) {
      const replaceCount = Math.floor(POPULATION_SIZE * 0.1);
      for (let i = 0; i < replaceCount; i++) {
        const idx = Math.floor(Math.random() * newPopulation.length);
        newPopulation[idx] = generateConflictFree(subjects, rooms, groups, timeSlots);
      }
    }

    population = newPopulation;
  }

  // 3. Return the best individual from the final population
  const finalFitnesses = population.map(ind => calculateFitness(ind));
  const bestIdx = finalFitnesses.indexOf(Math.max(...finalFitnesses));
  return population[bestIdx];
};

module.exports = runGeneticAlgorithm;