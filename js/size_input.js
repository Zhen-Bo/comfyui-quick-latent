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
 * @param {object}   opts.box       registered box region { x, y, w, h } in node-local graph units
 * @param {number[]} opts.localPos  node-local click position (click-anchored fallback input)
 * @param {object}   opts.event     the originating pointer event (click-anchored fallback input)
 * @param {number}   opts.value     current value shown/selected when the editor opens
 * @param {number}   opts.min       lower clamp bound (mirrors backend, 512)
 * @param {number}   opts.max       upper clamp bound (mirrors backend, 4096)
 * @param {(v:number)=>void} opts.onCommit  called once with the clamped integer on commit
 */
export function openSizeInput({ node, box, localPos, event, value, min, max, onCommit }) {
    // Re-entrancy guard: only one editor at a time (RESEARCH Pitfall 6).
    if (node._sizeInput) return;

    // Coordinate transform — node-local (box.x, box.y) -> viewport client px.
    // VERIFIED against ComfyUI frontend 1.32.9 DragAndScale/adjustMouseEvent:
    // ds.scale is already CSS px per graph unit, so there is NO devicePixelRatio term.
    // HINT_INSET (node-local px) is applied to BOTH sides so the input stays
    // centred on the box — its centre matches the drawn value's centre, so the
    // number does not shift when editing — while the left strip keeps the faint
    // W/H hint (drawn by drawSize at box.x+6) visible.
    const HINT_INSET = 19;
    const s = app.canvas.ds.scale;
    const rect = app.canvas.canvas.getBoundingClientRect();
    const [ox, oy] = app.canvas.ds.offset;
    const left = rect.left + (node.pos[0] + box.x + HINT_INSET + ox) * s;
    const top = rect.top + (node.pos[1] + box.y + oy) * s;

    // Build the element with createElement + property/style assignment ONLY.
    // Never innerHTML with an interpolated value (ASVS V5 / threat T-05-01).
    const input = document.createElement("input");
    node._sizeInput = input;
    input.type = "text";
    input.inputMode = "numeric";
    input.value = String(value);
    Object.assign(input.style, {
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `${(box.w - HINT_INSET * 2) * s}px`,
        height: `${box.h * s}px`,
        fontSize: `${12 * s}px`,
        boxSizing: "border-box",
        textAlign: "center",
        padding: "0",
        margin: "0",
        fontFamily: "monospace",
        fontWeight: "bold",
        color: "#e8e8f0",
        background: "#252538",
        border: "1px solid #7c5cbf",
        borderRadius: `${4 * s}px`,
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
        let v = parseInt(input.value, 10);
        if (Number.isNaN(v)) v = value;              // blank/garbage -> revert to prior value
        v = Math.max(min, Math.min(max, v));         // clamp [512,4096] (mirror backend, D-04)
        cleanup();
        onCommit(v);
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
