import { clientState } from './client.state.js';
import { _device } from './config.base.js';
import { initializeAtSizeSwaps, performAtSizeSwap } from './@replace-sibling/at-size.js';
import { initializeUpToSizeSwaps, performUpToSizeSwap } from './@replace-sibling/up-to-size.js';
import { initializeFromSizeSwaps, performFromSizeSwap } from './@replace-sibling/from-size.js';
import { initializeWithinSizeRangeSwaps, performWithinSizeRangeSwap } from './@replace-sibling/within-size-range.js';
import { initializeDomManipulate, storeButtonData, handleToggleOnBreakpointChange } from './dom-manipulate/dom-manipulate.js';
import { validateDomManipulatePairs } from './validate.js';

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

    const handler = (e) => {
      if (e.matches) {
        callback(bp);
      }
    };

    // Attach listener
    mql.addEventListener('change', handler);

    // Immediate check on load
    if (mql.matches) callback(bp);

  });
}

// Initialize swaps when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Store button data BEFORE validation and initialization
        storeButtonData();

        // Validate DOM manipulate pairs
        validateDomManipulatePairs();

        initializeDomManipulate();

        // Initialize all systems
        initializeAtSizeSwaps();
        initializeUpToSizeSwaps();
        initializeFromSizeSwaps();
        initializeWithinSizeRangeSwaps();

        
        // Set ready flag to show initially hidden elements
        document.body.setAttribute('data-dom-ready', 'true');
    });
} else {
    storeButtonData();
    validateDomManipulatePairs();
    initializeDomManipulate();

    initializeAtSizeSwaps();
    initializeUpToSizeSwaps();
    initializeFromSizeSwaps();
    initializeWithinSizeRangeSwaps();

    // Set ready flag to show initially hidden elements
    document.body.setAttribute('data-dom-ready', 'true');
}

// Setup breakpoint watcher
watchBreakpoints(_device.sizes, (active) => {
    console.clear();
    console.log('Active Breakpoint:', active.name, 'Pos:', active.pos);
    // console.log('Client State:', clientState.result);
    
    document.body.setAttribute('data-breakpoint', active.name);
    document.body.setAttribute('data-swap-ready', 'true');

    performAtSizeSwap(active);
    performUpToSizeSwap(active);
    performFromSizeSwap(active);
    performWithinSizeRangeSwap(active);
    
    // Handle toggle state preservation on breakpoint changes
    handleToggleOnBreakpointChange(active);
});
