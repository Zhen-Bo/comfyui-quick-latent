import { test } from "vitest";
import assert from "node:assert/strict";

import { SelectionAnimationController } from "../js/selection_animation.js";

test("selection animation reports eased positions until the duration ends", () => {
    let currentTime = 0;
    let queuedFrame = null;
    let redrawCount = 0;
    const controller = new SelectionAnimationController({
        durationMs: 100,
        now: () => currentTime,
        requestFrame: (callback) => {
            queuedFrame = callback;
            return 1;
        },
        onFrame: () => {
            redrawCount += 1;
        },
    });

    const options = [{ value: "1:1" }, { value: "2:3" }];
    controller.start("ratio", options, "1:1", "2:3");

    currentTime = 50;
    const midwayPosition = controller.position("ratio");
    assert.equal(midwayPosition > 0 && midwayPosition < 1, true);

    currentTime = 100;
    queuedFrame();
    assert.equal(controller.position("ratio"), null);
    assert.equal(redrawCount, 1);
});
