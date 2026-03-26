import { env } from '../config/env.js';

const randomIndexByWeight = (weights) => {
  const total = weights.reduce((sum, w) => sum + w, 0);
  const threshold = Math.random() * total;
  let current = 0;
  for (let i = 0; i < weights.length; i += 1) {
    current += weights[i];
    if (current >= threshold) return i;
  }
  return weights.length - 1;
};

export const pickWinner = ({ scores, mode }) => {
  if (!scores.length) {
    throw new Error('No eligible scores found for draw.');
  }

  if (mode === 'random') {
    return scores[Math.floor(Math.random() * scores.length)];
  }

  const normalized = scores.map((entry) => ({
    ...entry,
    weight: Math.max(1, Number(entry.score) ** env.weightedDrawPower)
  }));
  const index = randomIndexByWeight(normalized.map((entry) => entry.weight));
  return normalized[index];
};

export const currentDrawMonth = () => new Date().toISOString().slice(0, 7);
