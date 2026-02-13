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
        clientState.update(`toggle_${toggleRef}`, {
            elementsData, // Array with single element (validated)
            toggleRef,
            type: 'domManipulate',
            isVisible: false
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
        // 2. Add all "off" buttons for this toggle
        // 3. Add all refElemToggle elements for this toggle
        
        removeAllButtonsOfType(toggleRef, 'on');
        addAllButtonsOfType(toggleRef, 'off');
        
        // Add all toggle elements
        elementsData.forEach(elemData => {
            const { elem, parent, nextSibling } = elemData;
            if (!elem.parentNode) {
                parent.insertBefore(elem, nextSibling);
            }
        });
        toggleState.isVisible = true;
        
    } else if (triggerType === 'off') {
        // Clicking "off" button:
        // 1. Remove all "off" buttons for this toggle
        // 2. Add all "on" buttons for this toggle
        // 3. Remove all refElemToggle elements for this toggle
        
        removeAllButtonsOfType(toggleRef, 'off');
        addAllButtonsOfType(toggleRef, 'on');
        
        // Remove all toggle elements
        elementsData.forEach(elemData => {
            const { elem } = elemData;
            if (elem.parentNode) {
                elem.remove();
            }
        });
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
    // Find all matching buttons in the document (they might be in the original HTML)
    // We need to check if they exist as DOM nodes we can re-add
    // Since we removed them, we need to recreate them or store them
    
    // Get all elements that should have these buttons
    const buttons = document.querySelectorAll(`[dommanipulate="${toggleRef}"][triggertype="${triggerType}"]`);
    
    // If buttons don't exist, we need to look in our stored state or original HTML
    // For now, we'll query from the entire document (which won't find removed ones)
    // So we need a different approach - store the buttons
    
    // Get stored button data if available
    const toggleState = clientState.result[`toggle_${toggleRef}`];
    if (!toggleState) return;
    
    // Get button data for this type
    const buttonKey = `${toggleRef}_${triggerType}_buttons`;
    let buttonData = clientState.result[buttonKey];
    
    if (buttonData) {
        buttonData.forEach(data => {
            const { elem, parent, nextSibling } = data;
            if (!elem.parentNode) {
                parent.insertBefore(elem, nextSibling);
                elem.addEventListener('click', handleButtonClick);
            }
        });
    }
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
