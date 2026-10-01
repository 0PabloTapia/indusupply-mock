export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(min = 400, max = 900): Promise<void> {
  return delay(min + Math.random() * (max - min));
}
