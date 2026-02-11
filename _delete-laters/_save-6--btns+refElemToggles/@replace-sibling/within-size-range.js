import { clientState } from '../client.state.js';
import { validateSwapPairs, validateWithinSizeRanges } from '../validate.js';

// --- INITIALIZATION: Build swap state in clientState for withinSizeRange ---
export function initializeWithinSizeRangeSwaps() {
    validateSwapPairs();
    validateWithinSizeRanges();

    document.querySelectorAll('[replacesibling][withinSizeRange]').forEach(replacer => {
        const refAttr = replacer.getAttribute('replacesibling');
        const refelem = document.querySelector(`[refelem="${refAttr}"]`);
        
        if (refelem) {
            // Parse the range "2-4" into min and max
            const rangeStr = replacer.getAttribute('withinSizeRange');
            const [minSize, maxSize] = rangeStr.split('-').map(Number);

            // Store swap data in clientState with insertion point info
            clientState.update(`withinSizeRange_${refAttr}`, {
                replacer,
                refelem,
                minSize,
                maxSize,
                parent: refelem.parentNode,
                nextSibling: refelem.nextSibling,
                refAttr,
                type: 'withinSizeRange'
            });

            // Remove replacer from DOM - we'll add it back when needed
            replacer.remove();
        }
    });
}

export function performWithinSizeRangeSwap(active) {
    Object.values(clientState.result).forEach(item => {
        // Filter to only withinSizeRange items
        if (item.type !== 'withinSizeRange') return;
        
        const { replacer, refelem, minSize, maxSize, parent, nextSibling } = item;
        
        // Determine which element should be visible
        // Show replacer within the specified range (inclusive)
        const shouldShowReplacer = active.pos >= minSize && active.pos <= maxSize;
        const elementToShow = shouldShowReplacer ? replacer : refelem;
        const elementToHide = shouldShowReplacer ? refelem : replacer;

        // Remove hidden element
        if (elementToHide.parentNode) {
            elementToHide.remove();
        }

        // Insert visible element if not already in DOM
        if (!elementToShow.parentNode) {
            parent.insertBefore(elementToShow, nextSibling);
        }
    });
}
