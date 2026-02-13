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

    // const elements = document.querySelectorAll('[replaceSibling][atSize]');
    // elements.forEach(el => {
    //     const targetSize = parseInt(el.getAttribute('atSize'), 10);
    //     if (active.pos === targetSize) {
    //         const siblingSelector = el.getAttribute('replaceSibling');
    //         // console.log(siblingSelector);
    //         const sibling = el.parentElement.querySelector(`[refElem=${siblingSelector}]`);
            
    //         clientState.update(siblingSelector, {
    //             age: 28,
    //             $_locked: true,
    //         });

    //         if (!!sibling) {
    //             // console.log(`200. Remove ${}`);
    //             sibling.replaceWith(el);
    //         } else {
    //             console.log('200. Use element saved in state');
    //         }

    //         // console.log(el);
    //         // console.log(sibling);

    //         // clientState.update(compOneID, {
    //         //     age: 28,
    //         //     $_locked: true,
    //         // });
            
    //     // } else {
    //     //     const siblingSelector = el.getAttribute('replaceSibling');
    //     //     // console.log(siblingSelector);
    //     //     const sibling = el.parentElement.querySelector(`[refElem=${siblingSelector}]`);
    //     //     if (!!el) {
    //     //         el.replaceWith(sibling);
    //     //     } else {
    //     //         console.log('100. Use element saved in state');
    //     //     }
    //     }
    // });

    // const elements = document.querySelectorAll('[replaceSibling][atSize]');
    // elements.forEach(el => {
    //     const targetSize = parseInt(el.getAttribute('atSize'), 10);

    //     console.log('active.pos: ', active.pos, 'target size: ', targetSize);

    //     const siblingSelector = el.getAttribute('replaceSibling');
    //     const sibling = el.parentElement.querySelector(siblingSelector);

    //     // console.log(siblingSelector, sibling, el.parentElement);
    //     if (active.pos === targetSize) {
            
    //         console.log('Yay!');
    //         if (sibling) {
    //             sibling.replaceWith(el);
    //         }
    //     } else {

    //         console.log('No.');
    //     }
    // });



    // const elements = document.querySelectorAll('[replaceSibling][atSize]');
    // elements.forEach(el => {
    //     const targetSize = parseInt(el.getAttribute('atSize'), 10);
    //     if (active.pos === targetSize) {
    //         const siblingSelector = el.getAttribute('replaceSibling');
    //         const sibling = el.parentElement.querySelector(siblingSelector);
    //         if (sibling) {
    //             sibling.replaceWith(el);
    //         }
    //     }
    // });



    // let res = {};

    // const elements = document.querySelectorAll('[replaceSibling][atSize]');
    // elements.forEach(el => {
    //     const targetSize = parseInt(el.getAttribute('atSize'), 10);

    //     console.log('active.pos: ', active.pos, 'target size: ', targetSize);

    //     const refSiblingSelector = el.getAttribute('replaceSibling');
    //     const parentElement = el.parentElement;
    //     const refSibling = parentElement.querySelector(`[refElem=${refSiblingSelector}]`);

    //     // if () {

    //     // }

    //     // if (el && refSibling && parentElement) {
    //     //     clientState.update(refSiblingSelector, {
    //     //         parentElement,
    //     //         refSibling,
    //     //         el,
    //     //     });
    //     // }


    //     const res = clientState.result;

    //     console.log(res);



    //     // if (active.pos === targetSize) {
    //         parentElement.setAttribute(refSiblingSelector, active.pos === targetSize)
    //     // }

    //     if (active.pos === targetSize) {

    //         // const _refSibling = refSibling || res[refSiblingSelector]. .replaceWith(el);

    //         // console.log(parentElement.children)


    //         // check if parent element has NAV, then remove NAV?
    //         // check if parent has d...
    //     } else {
    //         // remove DIV
    //         // check...
    //     }

    //     // if (sibling) {

        
    //     // console.log(el, el.parentElement, refSiblingSelector, refSibling  /*el.parentElement.querySelector(`[${}]`)*/)
    //     // }
    //     // if (active.pos === targetSize) {
            
    //     // // const refSiblingSelector = el.getAttribute('replaceSibling');
    //     // // const refSibling = el.parentElement.querySelector(`[refElem=${refSiblingSelector}]`);

    //     //     // if (refSibling) {
    //     //     //     // clientState.update(refSiblingSelector, {
    //     //     //     //     parentElement,
    //     //     //     //     refSibling,
    //     //     //     //     el,
    //     //     //     // });

    //     //     //     // res = clientState.result;

    //     //     //     refSibling.replaceWith(el);

    //     //     //     // console.log(res);
    //     //     // }
            
    //     //     console.log('Yay!');

    //     // } else {
    //     //     // const refSiblingSelector = el.getAttribute('replaceSibling');
    //     //     // const refSibling = el.parentElement.querySelector(`[refElem=${refSiblingSelector}]`);

    //     //         // if (el) {
    //     //         //     el.replaceWith(refSibling);
    //     //         // } else {
    //     //         //     el.replaceWith(res[refSiblingSelector].refSibling);
    //     //         // }
            
    //     //     console.log('No.');
    //     // }
    // });

    const elements = document.querySelectorAll('[replaceSibling][atSize]');
    elements.forEach(el => {
        const targetSize = parseInt(el.getAttribute('atSize'), 10);

        console.log('active.pos: ', active.pos, 'target size: ', targetSize);

        const refSiblingSelector = el.getAttribute('replaceSibling');
        const parentElement = el.parentElement;
        const refSibling = parentElement.querySelector(`[refElem=${refSiblingSelector}]`);

        parentElement.setAttribute(refSiblingSelector, active.pos === targetSize)

        if (active.pos === targetSize) {

        } else {

        }

        // if (sibling) {

        
        // console.log(el, el.parentElement, refSiblingSelector, refSibling  /*el.parentElement.querySelector(`[${}]`)*/)
        // }
        // if (active.pos === targetSize) {
            
        // // const refSiblingSelector = el.getAttribute('replaceSibling');
        // // const refSibling = el.parentElement.querySelector(`[refElem=${refSiblingSelector}]`);

        //     // if (refSibling) {
        //     //     // clientState.update(refSiblingSelector, {
        //     //     //     parentElement,
        //     //     //     refSibling,
        //     //     //     el,
        //     //     // });

        //     //     // res = clientState.result;

        //     //     refSibling.replaceWith(el);

        //     //     // console.log(res);
        //     // }
            
        //     console.log('Yay!');

        // } else {
        //     // const refSiblingSelector = el.getAttribute('replaceSibling');
        //     // const refSibling = el.parentElement.querySelector(`[refElem=${refSiblingSelector}]`);

        //         // if (el) {
        //         //     el.replaceWith(refSibling);
        //         // } else {
        //         //     el.replaceWith(res[refSiblingSelector].refSibling);
        //         // }
            
        //     console.log('No.');
        // }
    });

});


// on window resize ???
// Get the elements with the attribute 'replaceSibling' and 'atSize' (and the attribute values...)

