import { Environment } from './Environment';

export function findPath(
  env: Environment,
  start: { x: number, y: number },
  goal: { x: number, y: number },
  gridCols: number,
  gridRows: number
): { x: number, y: number }[] | null {
  const key = (x: number, y: number) => `${x},${y}`;
  const open: { x: number, y: number }[] = [start];
  const cameFrom = new Map<string, { x: number, y: number } | null>();
  const gScore = new Map<string, number>();
  gScore.set(key(start.x, start.y), 0);

  const h = (a: { x: number, y: number }, b: { x: number, y: number }) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  while (open.length > 0) {
    let currentIdx = 0;
    let current = open[0];
    let lowestF = (gScore.get(key(current.x, current.y)) ?? Infinity) + h(current, goal);
    for (let i = 1; i < open.length; i++) {
      const node = open[i];
      const f = (gScore.get(key(node.x, node.y)) ?? Infinity) + h(node, goal);
      if (f < lowestF) {
        currentIdx = i;
        current = node;
        lowestF = f;
      }
    }
    open.splice(currentIdx, 1);

    if (current.x === goal.x && current.y === goal.y) {
      const path: { x: number, y: number }[] = [];
      let currKey = key(current.x, current.y);
      while (cameFrom.has(currKey)) {
        path.unshift(current);
        const prev = cameFrom.get(currKey);
        if (!prev) break;
        current = prev;
        currKey = key(current.x, current.y);
      }
      return path;
    }

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = current.x + dx;
        const ny = current.y + dy;
        if (
          nx >= 0 && nx < gridCols &&
          ny >= 0 && ny < gridRows &&
          !env.isBlocked(nx, ny)
        ) {
          const neighborKey = key(nx, ny);
          const tentativeG = (gScore.get(key(current.x, current.y)) ?? Infinity) + 1;
          if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
            cameFrom.set(neighborKey, { x: current.x, y: current.y });
            gScore.set(neighborKey, tentativeG);
            if (!open.some(n => n.x === nx && n.y === ny)) {
              open.push({ x: nx, y: ny });
            }
          }
        }
      }
    }
  }
  return null;
}
