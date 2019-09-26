export namespace ArithmeticOps {
    export function opPlus(a: number, b: number): number {
        return a + b;
    }

    export function opMinus(a: number, b: number): number {
        return a - b;
    }

    export function opMult(a: number, b: number): number {
        return a * b;
    }

    export function opDiv(a: number, b: number): number {
        return a / b;
    }
}

declare type ArithOp = (a: number, b: number) => number;

export function execute(order: number, lhs: ArrayLike<number>, rhs: ArrayLike<number> | number, op: ArithOp): number | void {
    if (typeof rhs === 'number') {
        (lhs as any)[order] = op(lhs[order], rhs);
        // lhs.set(order, op(lhs[order], rhs));
    }
    else {
        (lhs as any)[order] = op(lhs[order], rhs[order]);
        // lhs.set(order, op(lhs[order], rhs[order]));
    }
    if (order > 0) {
        return <number>execute(order - 1, lhs, rhs, op);
    }
}