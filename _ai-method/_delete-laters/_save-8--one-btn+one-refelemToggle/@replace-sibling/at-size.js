import { clientState } from '../client.state.js';
import { validateSwapPairs } from '../validate.js';


// --- INITIALIZATION: Build swap state in clientState BEFORE starting watchers ---
export function initializeAtSizeSwaps() {
    validateSwapPairs();

    document.querySelectorAll('[replacesibling][atsize]').forEach(replacer => {
        const refAttr = replacer.getAttribute('replacesibling');
        const refelem = document.querySelector(`[refelem="${refAttr}"]`);
        
        if (refelem) {
            // Store swap data in clientState with insertion point info
            clientState.update(`atsize_${refAttr}`, {
                replacer,
                refelem,
                atSize: parseInt(replacer.getAttribute('atsize')),
                parent: refelem.parentNode,
                nextSibling: refelem.nextSibling,
                refAttr,
                type: 'atsize'
            });

            // Remove replacer from DOM - we'll add it back when needed
            replacer.remove();
        }
    });
}

export function performAtSizeSwap(active) {
    Object.values(clientState.result).forEach(item => {
        // Filter to only atsize items
        if (item.type !== 'atsize') return;
        
        const { replacer, refelem, atSize, parent, nextSibling } = item;
        
        // Determine which element should be visible
        // Show replacer ONLY when we're at the specified breakpoint
        const shouldShowReplacer = active.pos === atSize;
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
