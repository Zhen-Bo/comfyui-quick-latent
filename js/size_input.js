import { app } from "../../scripts/app.js";

// Integer-only key filter, adopted from the Resolution-Master reference.
// Nav/edit keys are allowed through; ".", ",", "e"/"E", "+", "-" and any
// non-digit are blocked so only whole numbers can be typed.
const ALLOW_KEYS = [
    "Backspace", "Delete", "Tab", "Escape", "Enter",
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End",
];
const BLOCK_KEYS = [".", ",", "e", "E", "+", "-"];

/**
 * Open a transient inline <input> over an on-canvas Size box (D-07).
 *
 * Lifecycle: create -> position (verified transform) -> focus (deferred) ->
 * integer-filter keys -> commit idempotently (Enter / blur / wheel) -> destroy.
 * Esc cancels (reverts to the prior value). Only one editor exists at a time.
 *
 * @param {object}   opts
 * @param {object}   opts.node      the QuickLatent node instance
 * @param {object}   opts.box       registered box region { left, top, width, height } in node-local graph units
 * @param {number}   opts.value     current value shown/selected when the editor opens
 * @param {number}   opts.min       lower clamp bound (mirrors backend, 512)
 * @param {number}   opts.max       upper clamp bound (mirrors backend, 4096)
 * @param {(value:number)=>void} opts.onCommit  called once with the clamped integer on commit
 */
export function openNumberInput({ node, box, value, min, max, onCommit }) {
    // Re-entrancy guard: only one editor at a time (RESEARCH Pitfall 6).
    if (node._sizeInput) return;

    // Coordinate transform — node-local (box.left, box.top) -> viewport client px.
    // VERIFIED against ComfyUI frontend 1.32.9 DragAndScale/adjustMouseEvent:
    // ds.scale is already CSS px per graph unit, so there is NO devicePixelRatio term.
    const graphToCssScale = app.canvas.ds.scale;
    const canvasRect = app.canvas.canvas.getBoundingClientRect();
    const [viewportOffsetX, viewportOffsetY] = app.canvas.ds.offset;
    const inputLeft = canvasRect.left + (node.pos[0] + box.left + viewportOffsetX) * graphToCssScale;
    const inputTop = canvasRect.top + (node.pos[1] + box.top + viewportOffsetY) * graphToCssScale;

    // Build the element with createElement + property/style assignment ONLY.
    // Never innerHTML with an interpolated value (ASVS V5 / threat T-05-01).
    const input = document.createElement("input");
    node._sizeInput = input;
    input.type = "text";
    input.inputMode = "numeric";
    input.value = String(value);
    Object.assign(input.style, {
        position: "fixed",
        left: `${inputLeft}px`,
        top: `${inputTop}px`,
        width: `${box.width * graphToCssScale}px`,
        height: `${box.height * graphToCssScale}px`,
        fontSize: `${12 * graphToCssScale}px`,
        boxSizing: "border-box",
        textAlign: "center",
        padding: "0",
        margin: "0",
        fontFamily: "monospace",
        fontWeight: "bold",
        color: "#e8e8f0",
        background: "#252538",
        border: "1px solid #7c5cbf",
        borderRadius: `${4 * graphToCssScale}px`,
        zIndex: "10000",
        outline: "none",
    });
    document.body.appendChild(input);

    // Defer focus one tick: LiteGraph calls this.canvas.focus() synchronously on
    // pointerdown, so focusing now would immediately lose focus (RESEARCH Pitfall 2).
    setTimeout(() => { input.focus(); input.select(); }, 0);

    let done = false;
    const cleanup = () => {
        window.removeEventListener("wheel", onWheel, true);
        input.remove();
        node._sizeInput = null;
    };
    const commit = () => {
        // Idempotent: Enter removes the element which fires blur -> a second
        // commit; guard so it fires exactly once (RESEARCH Pitfall 1).
        if (done) return;
        done = true;
        const inputText = input.value.trim();
        let committedValue = /^\d+$/.test(inputText) ? Number(inputText) : value; // blank/garbage -> revert to prior value
        committedValue = Math.max(min, Math.min(max, committedValue));         // clamp [512,4096] (mirror backend, D-04)
        cleanup();
        onCommit(committedValue);
    };
    const cancel = () => {
        if (done) return;
        done = true;
        cleanup();                                   // Esc -> discard, keep prior value
    };
    // Wheel-zoom does NOT blur the input, so a floating input would drift away
    // from its box; commit on wheel to close it first (RESEARCH Pitfall 3).
    const onWheel = () => commit();

    input.addEventListener("keydown", (e) => {
        e.stopPropagation();                         // defense-in-depth vs third-party global shortcuts
        if (e.key === "Enter") { commit(); return; }
        if (e.key === "Escape") { cancel(); return; }
        if (ALLOW_KEYS.includes(e.key) || e.ctrlKey || e.metaKey) return;
        if (BLOCK_KEYS.includes(e.key) || !/^\d$/.test(e.key)) e.preventDefault();
    });
    input.addEventListener("blur", commit);          // outside/canvas click blurs (LiteGraph focuses canvas)
    window.addEventListener("wheel", onWheel, true);
}
