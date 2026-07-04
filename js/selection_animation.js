function easeOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3);
}

function findOptionIndex(options, value) {
    return options.findIndex((option) => option.value === value);
}

function browserNow() {
    return performance.now();
}

function browserRequestAnimationFrame(callback) {
    if (typeof requestAnimationFrame !== "function") return null;
    return requestAnimationFrame(callback);
}

export class SelectionAnimationController {
    constructor({
        durationMs,
        now = browserNow,
        requestFrame = browserRequestAnimationFrame,
        onFrame = () => {},
    }) {
        this.durationMs = durationMs;
        this.now = now;
        this.requestFrame = requestFrame;
        this.onFrame = onFrame;
        this.frameRequestId = null;
        this.animations = {};
    }

    position(name) {
        const animation = this.animations[name];
        if (!animation) return null;

        const elapsedMs = this.now() - animation.startedAt;
        const progress = Math.min(1, elapsedMs / animation.durationMs);
        if (progress >= 1) {
            delete this.animations[name];
            return null;
        }

        const easedProgress = easeOutCubic(progress);
        return animation.fromIndex + (animation.toIndex - animation.fromIndex) * easedProgress;
    }

    start(name, options, fromValue, toValue) {
        const toIndex = findOptionIndex(options, toValue);
        if (toIndex < 0) return;

        const currentPosition = this.position(name);
        const fromIndex = currentPosition ?? findOptionIndex(options, fromValue);
        if (fromIndex < 0 || fromIndex === toIndex) return;

        this.animations[name] = {
            fromIndex,
            toIndex,
            startedAt: this.now(),
            durationMs: this.durationMs,
        };
        this.requestNextFrame();
    }

    requestNextFrame() {
        if (this.frameRequestId !== null) return;
        this.frameRequestId = this.requestFrame(() => this.step());
    }

    step() {
        this.frameRequestId = null;
        const timestamp = this.now();

        for (const [name, animation] of Object.entries(this.animations)) {
            if (timestamp - animation.startedAt >= animation.durationMs) {
                delete this.animations[name];
            }
        }

        this.onFrame();
        if (Object.keys(this.animations).length > 0) {
            this.requestNextFrame();
        }
    }
}
