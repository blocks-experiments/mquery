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

// --- Usage ---
// watchBreakpoints(_breakpoints, (active) => {
//   console.log(`✨ Current Viewport: ${active.name.toUpperCase()}`);
  
//   // You can now use the 'active' object properties directly
//   document.body.setAttribute('data-breakpoint', active.name);
// });

watchBreakpoints(_device.sizes, (active) => {
  console.clear();
  console.log('breakpoint:', active);
  
  // You can now use the 'active' object properties directly
  document.body.setAttribute('data-breakpoint', active.name);
});