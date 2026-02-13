import { clientState } from '../client.state.js';

// --- INITIALIZATION: Set up DOM manipulation toggle system ---
export function initializeDomManipulate() {
    // Store all toggle references and their elements
    const toggleRefs = new Map();
    
    document.querySelectorAll('[refElemToggle]').forEach(toggleElem => {
        const toggleRef = toggleElem.getAttribute('refElemToggle');
        
        if (!toggleRefs.has(toggleRef)) {
            toggleRefs.set(toggleRef, []);
        }
        
        toggleRefs.get(toggleRef).push({
            elem: toggleElem,
            parent: toggleElem.parentNode,
            nextSibling: toggleElem.nextSibling
        });
    });

    // Store toggle data in clientState
    // Note: elementsData is an array, but per validation there should be exactly one element per toggle reference
    toggleRefs.forEach((elementsData, toggleRef) => {
        // Detect the allowed breakpoint range for this toggle
        // Check ALL buttons (both "on" and "off") to find breakpoint info
        let allowedBreakpoints = null;
        const allButtons = document.querySelectorAll(`[dommanipulate="${toggleRef}"]`);
        
        for (let btn of allButtons) {
            let parent = btn.parentElement;
            while (parent) {
                if (parent.hasAttribute('replacesibling')) {
                    const uptosize = parent.getAttribute('uptosize');
                    const fromsize = parent.getAttribute('fromsize');
                    const atsize = parent.getAttribute('atsize');
                    const withinSizeRange = parent.getAttribute('withinSizeRange');
                    
                    if (uptosize) {
                        allowedBreakpoints = { type: 'uptosize', value: parseInt(uptosize) };
                    } else if (fromsize) {
                        allowedBreakpoints = { type: 'fromsize', value: parseInt(fromsize) };
                    } else if (atsize) {
                        allowedBreakpoints = { type: 'atsize', value: parseInt(atsize) };
                    } else if (withinSizeRange) {
                        const [min, max] = withinSizeRange.split('-').map(Number);
                        allowedBreakpoints = { type: 'withinSizeRange', min, max };
                    }
                    break;
                }
                parent = parent.parentElement;
            }
            
            // If we found breakpoints, stop searching
            if (allowedBreakpoints) break;
        }
        
        clientState.update(`toggle_${toggleRef}`, {
            elementsData, // Array with single element (validated)
            toggleRef,
            type: 'domManipulate',
            isVisible: false,
            allowedBreakpoints,
            lastBreakpointPos: null // Track last breakpoint to detect boundary crossing
        });
    });

    // INITIAL PAGE LOAD:
    // 1. Keep all triggertype="on" buttons in DOM
    // 2. Remove all triggertype="off" buttons from DOM
    // 3. Remove all refElemToggle elements from DOM
    
    document.querySelectorAll('[dommanipulate][triggertype="off"]').forEach(btn => {
        btn.remove();
    });
    
    // Remove all refElemToggle elements from DOM initially
    document.querySelectorAll('[refElemToggle]').forEach(elem => {
        if (elem.parentNode) {
            elem.remove();
        }
    });

    // Add event listeners to all triggertype="on" buttons
    document.querySelectorAll('[dommanipulate][triggertype="on"]').forEach(btn => {
        btn.addEventListener('click', handleButtonClick);
    });
}

function handleButtonClick(event) {
    const button = event.currentTarget;
    const toggleRef = button.getAttribute('dommanipulate');
    const triggerType = button.getAttribute('triggertype');
    
    // Get the toggle state
    const toggleState = clientState.result[`toggle_${toggleRef}`];
    if (!toggleState) return;

    const { elementsData } = toggleState;

    if (triggerType === 'on') {
        // Clicking "on" button:
        // 1. Remove all "on" buttons for this toggle
        // 2. Add all refElemToggle elements for this toggle (FIRST, so they're in DOM)
        // 3. Add all "off" buttons for this toggle
        
        removeAllButtonsOfType(toggleRef, 'on');
        
        // Add all toggle elements FIRST
        elementsData.forEach(elemData => {
            const { elem, parent, nextSibling } = elemData;
            if (!elem.parentNode) {
                parent.insertBefore(elem, nextSibling);
            }
        });
        
        // Then add "off" buttons (which may go inside the toggle element)
        addAllButtonsOfType(toggleRef, 'off');
        
        toggleState.isVisible = true;
        
    } else if (triggerType === 'off') {
        // Clicking "off" button:
        // 1. Remove all "off" buttons for this toggle
        // 2. Remove all refElemToggle elements for this toggle
        // 3. Add all "on" buttons for this toggle
        
        removeAllButtonsOfType(toggleRef, 'off');
        
        // Remove all toggle elements
        elementsData.forEach(elemData => {
            const { elem } = elemData;
            if (elem.parentNode) {
                elem.remove();
            }
        });
        
        addAllButtonsOfType(toggleRef, 'on');
        
        toggleState.isVisible = false;
    }

    // Log updated client state to console.
    console.log('Client State:', clientState.result);
}

function removeAllButtonsOfType(toggleRef, triggerType) {
    document.querySelectorAll(`[dommanipulate="${toggleRef}"][triggertype="${triggerType}"]`).forEach(btn => {
        if (btn.parentNode) {
            btn.remove();
        }
    });
}

function addAllButtonsOfType(toggleRef, triggerType) {
    // First check if buttons already exist in DOM
    const existingButtons = document.querySelectorAll(`[dommanipulate="${toggleRef}"][triggertype="${triggerType}"]`);
    if (existingButtons.length > 0) return; // Buttons already in DOM
    
    // Get stored button data
    const toggleState = clientState.result[`toggle_${toggleRef}`];
    if (!toggleState) return;
    
    const buttonKey = `${toggleRef}_${triggerType}_buttons`;
    const buttonData = clientState.result[buttonKey];
    
    if (!buttonData) return;
    
    // Recreate and insert buttons
    buttonData.forEach(data => {
        const { elem, parent, nextSibling } = data;
        
        // Try original parent/nextSibling approach first
        if (parent && parent.isConnected) {
            // Parent is still in DOM, try to insert
            try {
                if (nextSibling && nextSibling.parentNode === parent) {
                    // nextSibling is still valid
                    parent.insertBefore(elem, nextSibling);
                } else {
                    // nextSibling is gone, append to parent
                    parent.appendChild(elem);
                }
                elem.addEventListener('click', handleButtonClick);
                return;
            } catch (e) {
                // insertBefore failed, continue to fallback
            }
        }
        
        // Fallback: try to find appropriate insertion point dynamically
        if (triggerType === 'off') {
            // "off" buttons go into or near the toggle element
            const toggleElements = document.querySelectorAll(`[refElemToggle="${toggleRef}"]`);
            if (toggleElements.length > 0) {
                toggleElements[0].appendChild(elem);
                elem.addEventListener('click', handleButtonClick);
                return;
            }
        } else if (triggerType === 'on') {
            // "on" buttons go into replacesibling parent
            const replacesiblingParents = document.querySelectorAll(`[replacesibling][uptosize], [replacesibling][fromsize], [replacesibling][atsize], [replacesibling][withinSizeRange]`);
            for (let p of replacesiblingParents) {
                // Check if this parent is for our toggle by looking at children
                const hasOnButton = p.querySelector(`[dommanipulate="${toggleRef}"][triggertype="on"]`);
                if (hasOnButton) {
                    p.appendChild(elem);
                    elem.addEventListener('click', handleButtonClick);
                    return;
                }
            }
        }
        
        // Last resort: append to body
        document.body.appendChild(elem);
        elem.addEventListener('click', handleButtonClick);
    });
}

// Store button data on initialization
export function storeButtonData() {
    document.querySelectorAll('[dommanipulate][triggertype]').forEach(btn => {
        const toggleRef = btn.getAttribute('dommanipulate');
        const triggerType = btn.getAttribute('triggertype');
        const key = `${toggleRef}_${triggerType}_buttons`;
        
        if (!clientState.result[key]) {
            clientState.result[key] = [];
        }
        
        clientState.result[key].push({
            elem: btn,
            parent: btn.parentNode,
            nextSibling: btn.nextSibling
        });
    });
}

// Handle breakpoint changes for toggle state preservation
export function handleToggleOnBreakpointChange(activeBreakpoint) {
    Object.keys(clientState.result).forEach(key => {
        if (key.startsWith('toggle_')) {
            const toggleState = clientState.result[key];
            const { toggleRef, elementsData, isVisible, allowedBreakpoints } = toggleState;
            
            if (!allowedBreakpoints) return;
            
            const isAllowedNow = isBreakpointAllowed(activeBreakpoint.pos, allowedBreakpoints);
            const wasAllowedBefore = toggleState.lastBreakpointPos !== null && 
                                     isBreakpointAllowed(toggleState.lastBreakpointPos, allowedBreakpoints);
            
            // Crossing boundary: leaving allowed zone
            if (wasAllowedBefore && !isAllowedNow) {
                // Remove element from DOM but keep isVisible state
                elementsData.forEach(elemData => {
                    if (elemData.elem.parentNode) {
                        elemData.elem.remove();
                    }
                });
            }
            // Crossing boundary: entering allowed zone
            else if (!wasAllowedBefore && isAllowedNow) {
                // If it was supposed to be visible, restore it with proper button state
                if (isVisible) {
                    elementsData.forEach(elemData => {
                        const { elem, parent, nextSibling } = elemData;
                        if (!elem.parentNode) {
                            parent.insertBefore(elem, nextSibling);
                        }
                    });
                }
            }
            // Within allowed zone: maintain current state
            else if (isAllowedNow) {
                // If state says visible but element missing, restore it
                if (isVisible && !elementsData[0]?.elem?.parentNode) {
                    elementsData.forEach(elemData => {
                        const { elem, parent, nextSibling } = elemData;
                        parent.insertBefore(elem, nextSibling);
                    });
                }
                // If state says hidden but element in DOM, remove it
                else if (!isVisible && elementsData[0]?.elem?.parentNode) {
                    elementsData.forEach(elemData => {
                        elemData.elem.remove();
                    });
                }
            }
            
            // Update last breakpoint position for next comparison
            toggleState.lastBreakpointPos = activeBreakpoint.pos;
        }
    });
}

function isBreakpointAllowed(pos, allowedBreakpoints) {
    if (!allowedBreakpoints) return true;
    
    const { type, value, min, max } = allowedBreakpoints;
    
    switch (type) {
        case 'uptosize':
            return pos <= value;
        case 'fromsize':
            return pos >= value;
        case 'atsize':
            return pos === value;
        case 'withinSizeRange':
            return pos >= min && pos <= max;
        default:
            return true;
    }
}
