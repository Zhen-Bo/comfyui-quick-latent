import { app } from "../../scripts/app.js";

// Integer-only key filter adopted from the Resolution-Master reference.
const NAVIGATION_AND_EDIT_KEYS = [
    "Backspace", "Delete", "Tab", "Escape", "Enter",
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End",
];

function graphBoxToClientPosition(node, box) {
    // VERIFIED against ComfyUI frontend 1.32.9 DragAndScale/adjustMouseEvent:
    // ds.scale is already CSS px per graph unit, so there is NO devicePixelRatio term.
    const graphToCssScale = app.canvas.ds.scale;
    const canvasRect = app.canvas.canvas.getBoundingClientRect();
    const [viewportOffsetX, viewportOffsetY] = app.canvas.ds.offset;
    return {
        left: canvasRect.left + (node.pos[0] + box.left + viewportOffsetX) * graphToCssScale,
        top: canvasRect.top + (node.pos[1] + box.top + viewportOffsetY) * graphToCssScale,
        graphToCssScale,
    };
}

/**
 * Opens an integer editor over `box` (node-local graph units).
 * Enter, blur and wheel commit the value clamped to [min, max]; Esc cancels.
 */
export function openNumberInput({ node, box, value, min, max, onCommit }) {
    if (node._openNumberInput) return;

    const { left: inputLeft, top: inputTop, graphToCssScale } = graphBoxToClientPosition(node, box);

    // Build the element with createElement + property/style assignment ONLY.
    // Never innerHTML with an interpolated value (ASVS V5 / threat T-05-01).
    const input = document.createElement("input");
    node._openNumberInput = input;
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
        node._openNumberInput = null;
    };
    const commit = () => {
        // Idempotent: Enter removes the element which fires blur -> a second
        // commit; guard so it fires exactly once (RESEARCH Pitfall 1).
        if (done) return;
        done = true;
        const inputText = input.value.trim();
        const isWholeNumber = /^\d+$/.test(inputText);
        const typedOrPriorValue = isWholeNumber ? Number(inputText) : value;
        const clampedValue = Math.max(min, Math.min(max, typedOrPriorValue));
        cleanup();
        onCommit(clampedValue);
    };
    const cancel = () => {
        if (done) return;
        done = true;
        cleanup();
    };
    // Wheel-zoom does NOT blur the input, so a floating input would drift away
    // from its box; commit on wheel to close it first (RESEARCH Pitfall 3).
    const onWheel = () => commit();

    input.addEventListener("keydown", (e) => {
        e.stopPropagation();                         // defense-in-depth vs third-party global shortcuts
        if (e.key === "Enter") { commit(); return; }
        if (e.key === "Escape") { cancel(); return; }
        if (NAVIGATION_AND_EDIT_KEYS.includes(e.key) || e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) e.preventDefault();
    });
    input.addEventListener("blur", commit);          // outside/canvas click blurs (LiteGraph focuses canvas)
    window.addEventListener("wheel", onWheel, true);
}
