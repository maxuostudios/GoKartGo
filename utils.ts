import { ItemType } from "./globals";

export function getColor(id: number) {
    switch (id) {
        case 0:
            return { r: 0, g: 115, b: 254 };
            break;
        case 1:
            return { r: 255, g: 0, b: 29 };
            break;
        case 2:
            return { r: 0, g: 209, b: 45 };
            break;
        case 3:
            return { r: 255, g: 150, b: 0 };
            break;
        case 4:
            return { r: 213, g: 0, b: 221 };
            break;
        default:
            break;
    }
}

export function randomItem(arr: ItemType[]): ItemType {
    const index = Math.floor(Math.random() * arr.length)
    return arr[index] as ItemType
}

export function randomInt(n: number): number;
export function randomInt(n: number, k: number): number[];
export function randomInt(n: number, k?: number): number | number[] {
    if (k === undefined) {
        return Math.floor(Math.random() * n);
    }

    if (k > n) {
        throw new Error("k cannot be greater than n");
    }

    const arr = Array.from({ length: n }, (_, i) => i);

    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.slice(0, k);
}

export function getRankingName(ranking: number) {
    if (ranking === 1) return "1st";
    else if (ranking === 2) return "2nd";
    else if (ranking === 3) return "3rd";
    else return ranking + "th";
}

export function prob(weights: number[]): number {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;

    for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return i;
    }

    return weights.length - 1;
}

export class Circle {
    type = "circle" as const;
    constructor(public x: number, public y: number, public radius: number) { }
}

export class Rect {
    type = "rect" as const;
    constructor(public x: number, public y: number, public width: number, public height: number) { }
}

export type ObjShape = Rect | Circle;

export function isColliding(objA: ObjShape, objB: ObjShape): boolean {
    // Rect vs Rect
    if (objA.type === "rect" && objB.type === "rect") {
        return (
            objA.x < objB.x + objB.width &&
            objA.x + objA.width > objB.x &&
            objA.y < objB.y + objB.height &&
            objA.y + objA.height > objB.y
        );
    }

    // Circle vs Circle
    if (objA.type === "circle" && objB.type === "circle") {
        const dx = objA.x - objB.x;
        const dy = objA.y - objB.y;
        return dx * dx + dy * dy <= (objA.radius + objB.radius) ** 2;
    }

    // Rect vs Circle (or Circle vs Rect)
    let rect: Rect, circle: Circle;
    if (objA.type === "rect" && objB.type === "circle") {
        rect = objA;
        circle = objB;
    } else {
        rect = objB as Rect;
        circle = objA as Circle;
    }

    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return dx * dx + dy * dy <= circle.radius * circle.radius;
}

export function msToTimeString(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = seconds.toString().padStart(2, "0");
    return `${minutes}:${paddedSeconds}`;
}