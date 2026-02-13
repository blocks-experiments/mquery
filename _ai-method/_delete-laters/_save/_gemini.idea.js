

const _breakpoints = {
    1: { name: 'mobile', px: 0},
    2: { name: 'tablet', px: 768 },
    3: { name: 'desktop', px: 1024 },
    4: { name: 'wide', px: 1280 },
    5: { name: 'ultraWide', px: 1600 },
};

/**
 * Initializes listeners based on a breakpoint configuration object
 * @param {Object} config - The _breakpoints object
 * @param {Function} callback - Function that runs when a breakpoint becomes active
 */
function watchBreakpoints(config, callback) {
  // Convert object to a sorted array to ensure we calculate ranges correctly
  const bps = Object.values(config).sort((a, b) => a.px - b.px);

  bps.forEach((bp, index) => {

    // ---------------------------
    bp = { ...bp, pos: index + 1 };
    // ---------------------------

    const nextBp = bps[index + 1];
    
    // Build the query: 
    // If there is a next breakpoint, set a max-width limit.
    // If it's the last one, it's just min-width to infinity.
    let query = `(min-width: ${bp.px}px)`;
    if (nextBp) {
      query += ` and (max-width: ${nextBp.px - 1}px)`;
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

// --- Usage ---
// watchBreakpoints(_breakpoints, (active) => {
//   console.log(`✨ Current Viewport: ${active.name.toUpperCase()}`);
  
//   // You can now use the 'active' object properties directly
//   document.body.setAttribute('data-breakpoint', active.name);
// });

watchBreakpoints(_breakpoints, (active) => {
  console.clear();
  console.log('breakpoint:', active);
  
  // You can now use the 'active' object properties directly
  document.body.setAttribute('data-breakpoint', active.name);
});
