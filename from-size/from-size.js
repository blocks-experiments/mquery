import { clientState } from '../client.state.js';
import { validateSwapPairs } from '../validate.js';

// --- INITIALIZATION: Build swap state in clientState for fromsize ---
export function initializeFromSizeSwaps() {
    validateSwapPairs();

    document.querySelectorAll('[replacesibling][fromsize]').forEach(replacer => {
        const refAttr = replacer.getAttribute('replacesibling');
        const refelem = document.querySelector(`[refelem="${refAttr}"]`);
        
        if (refelem) {
            // Store swap data in clientState with insertion point info
            clientState.update(`fromsize_${refAttr}`, {
                replacer,
                refelem,
                fromSize: parseInt(replacer.getAttribute('fromsize')),
                parent: refelem.parentNode,
                nextSibling: refelem.nextSibling,
                refAttr,
                type: 'fromsize'
            });

            // Remove replacer from DOM - we'll add it back when needed
            replacer.remove();
        }
    });
}

export function performFromSizeSwap(active) {
    Object.values(clientState.result).forEach(item => {
        // Filter to only fromsize items
        if (item.type !== 'fromsize') return;
        
        const { replacer, refelem, fromSize, parent, nextSibling } = item;
        
        // Determine which element should be visible
        // Show replacer FROM the specified breakpoint onwards
        const shouldShowReplacer = active.pos >= fromSize;
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
