export function shuffle<T>(items: T[], rng: () => number) {
  for (let end = items.length - 1; end > 0; end--) {
    const index = Math.floor(rng() * (end + 1))
    ;[items[end], items[index]] = [items[index], items[end]]
  }
  return items
}
