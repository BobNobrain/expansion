export type Point2D = {
    readonly x: number;
    readonly y: number;
};

export namespace Point2D {
    export function dot(p1: Point2D, p2: Point2D): number {
        return p1.x * p2.x + p1.y * p2.y;
    }

    export function len({ x, y }: Point2D): number {
        return Math.sqrt(x * x + y * y);
    }
    export function len2({ x, y }: Point2D): number {
        return x * x + y * y;
    }

    export function normz(p: Point2D): Point2D {
        const l = len(p);
        return {
            x: p.x / l,
            y: p.y / l,
        };
    }

    export function angle(from: Point2D, to: Point2D): number {
        const cos = dot(from, to) / (len(from) * len(to));
        const arccos = Math.acos(cos);
        const crossZ = from.x * to.y - from.y * to.x;
        return crossZ > 0 ? arccos : -arccos;
    }

    export function diff(a: Point2D, b: Point2D): Point2D {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
        };
    }

    export function avg(ps: Point2D[]): Point2D {
        let x = 0;
        let y = 0;
        for (const p of ps) {
            x += p.x;
            y += p.y;
        }
        x /= ps.length;
        y /= ps.length;
        return { x, y };
    }
}
