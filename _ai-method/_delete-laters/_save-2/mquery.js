import { clientState } from './client.state.js';
import { _device } from './base.js';

function watchBreakpoints(config, callback) {
  // Convert object to a sorted array to ensure we calculate ranges correctly
  const bps = Object.values(config).sort((a, b) => a.value - b.value);

  bps.forEach((bp, index) => {

    // ---------------------------
    bp = { ...bp, pos: index + 1 };
    // ---------------------------

    const nextBp = bps[index + 1];
    
    // Build the query: 
    // If there is a next breakpoint, set a max-width limit.
    // If it's the last one, it's just min-width to infinity.
    let query = `(min-width: ${bp.value}px)`;
    if (nextBp) {
      query += ` and (max-width: ${nextBp.value - 1}px)`;
    }

    const mql = window.matchMedia(query);

    // bp = { ...bp, current: window.innerWidth };

    const handler = (e) => {
      if (e.matches) {
        callback(bp);
      }
    };

    // Attach listener
    mql.addEventListener('change', handler);

    // Immediate check on load
    if (mql.matches) callback(bp);

    // window.addEventListener('resize', () => callback({ ...bp, current: window.innerWidth }) );
  });
}

// --- INITIALIZATION: Build swap map BEFORE starting watchers ---
const swapMap = [];

function initializeSwaps() {
    document.querySelectorAll('[replacesibling]').forEach(replacer => {
        const refAttr = replacer.getAttribute('replacesibling');
        const refelem = document.querySelector(`[refelem="${refAttr}"]`);
        
        if (refelem) {
            // Create anchor to mark original position
            const anchor = document.createComment(` anchor-${refAttr} `);
            refelem.parentNode.insertBefore(anchor, refelem);

            swapMap.push({
                replacer,
                refelem,
                atSize: parseInt(replacer.getAttribute('atsize')),
                anchor,
                refAttr
            });

            // Remove replacer from DOM - we'll add it back when needed
            replacer.remove();
        }
    });
}

function performSwap(active) {
    swapMap.forEach(item => {
        const { replacer, refelem, atSize, anchor } = item;
        
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
            anchor.parentNode.insertBefore(elementToShow, anchor.nextSibling);
        }
    });
}

// Initialize swaps when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSwaps);
} else {
    initializeSwaps();
}

// Setup breakpoint watcher
watchBreakpoints(_device.sizes, (active) => {
    console.clear();
    console.log('Active Breakpoint:', active.name, 'Pos:', active.pos);
    console.log('Swap Map:', swapMap.map(item => ({ ref: item.refAttr, atSize: item.atSize })));
    
    document.body.setAttribute('data-breakpoint', active.name);

    performSwap(active);
});
