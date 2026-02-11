import { clientState } from '../client.state.js';
import { validateSwapPairs } from '../validate.js';

// --- INITIALIZATION: Build swap state in clientState for uptosize ---
export function initializeUpToSizeSwaps() {
    validateSwapPairs();

    document.querySelectorAll('[replacesibling][uptosize]').forEach(replacer => {
        const refAttr = replacer.getAttribute('replacesibling');
        const refelem = document.querySelector(`[refelem="${refAttr}"]`);
        
        if (refelem) {
            // Store swap data in clientState with insertion point info
            clientState.update(`uptosize_${refAttr}`, {
                replacer,
                refelem,
                upToSize: parseInt(replacer.getAttribute('uptosize')),
                parent: refelem.parentNode,
                nextSibling: refelem.nextSibling,
                refAttr,
                type: 'uptosize'
            });

            // Remove replacer from DOM - we'll add it back when needed
            replacer.remove();
        }
    });
}

export function performUpToSizeSwap(active) {
    Object.values(clientState.result).forEach(item => {
        // Filter to only uptosize items
        if (item.type !== 'uptosize') return;
        
        const { replacer, refelem, upToSize, parent, nextSibling } = item;
        
        // Determine which element should be visible
        // Show replacer when we're UP TO and including the specified breakpoint
        const shouldShowReplacer = active.pos <= upToSize;
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
