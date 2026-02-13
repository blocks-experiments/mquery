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

// --- Usage ---
// watchBreakpoints(_breakpoints, (active) => {
//   console.log(`✨ Current Viewport: ${active.name.toUpperCase()}`);
  
//   // You can now use the 'active' object properties directly
//   document.body.setAttribute('data-breakpoint', active.name);
// });

const save = {};


window.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('[replaceSibling][atSize]');
    elements.forEach(el => {

        const refSiblingSelector = el.getAttribute('replaceSibling');
        const parentElement = el.parentElement;
        const refSibling = parentElement.querySelector(`[refElem=${refSiblingSelector}]`);

          clientState.update(refSiblingSelector, {
                parentElement,
                refSibling,
                el,
            });

        console.log(clientState);
        console.log(clientState.result);
    });
})


watchBreakpoints(_device.sizes, (active) => {
  console.clear();
  console.log('breakpoint:', active);
  
  // You can now use the 'active' object properties directly
  document.body.setAttribute('data-breakpoint', active.name);

  // e.g 
    // fromSize=3 means 3 to biggest size i.e 3 - 5
    // upToSize=3 means smalles to to 3 i.e. 1 - 3
    // atSize=3 means only at 3
    // withinSizeRange="2 - 4" means from 2 to 4

    // Solution: if active.value matches the value of atSize in <div replaceSibling="nav" atSize="1"> display the div and remove the referenced sibling element, otherwise display the sibling element and remove the div.


    const elements = document.querySelectorAll('[replaceSibling][atSize]');
    elements.forEach(el => {
        const targetSize = parseInt(el.getAttribute('atSize'), 10);

        console.log('active.pos: ', active.pos, 'target size: ', targetSize);

        const refSiblingSelector = el.getAttribute('replaceSibling');
        const parentElement = el.parentElement;
        const refSibling = parentElement.querySelector(`[refElem=${refSiblingSelector}]`);

        parentElement.setAttribute(refSiblingSelector, active.pos === targetSize);

        if (active.pos === targetSize) {

        } else {

        }

        console.log(clientState);
    });

});


// on window resize ???
// Get the elements with the attribute 'replaceSibling' and 'atSize' (and the attribute values...)

