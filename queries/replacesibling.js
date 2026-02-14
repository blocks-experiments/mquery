import { domState } from '../dom.state.js';
import { validateSiblingSwapPairs } from '../validate.js';
import { instructionAttribute, swapsize } from '../var.js';

// ------------------------------------------------------------------------
// INITIALIZATION: Build swap state in clientState BEFORE starting watchers
// ------------------------------------------------------------------------
export const initializeSiblingSwap = ({ deviceSizeAttributeType }) => {

    const replacerElems = document.querySelectorAll(`[${instructionAttribute}][${deviceSizeAttributeType}]`);

    //-------------------------------------------
    // Validate & return sibling swap user issues
    //-------------------------------------------
    validateSiblingSwapPairs({ replacerElems });
    //-------------------------------------------

    replacerElems.forEach(replacerElem => {
        const refAttribute = replacerElem.getAttribute(instructionAttribute);
        const refelem = document.querySelector(`[refelem="${refAttribute}"]`);

        if (refelem) {
            //---------------------------------------------------------
            // Store swap data in clientState with insertion point info
            //---------------------------------------------------------
            let swapObj = {
                refelem,
                _replacerElem: replacerElem,
                _parentElem: refelem.parentNode,
                _nextSiblingElem: refelem.nextSibling,
                _refAttribute: refAttribute,
                _sizeAttributeType: deviceSizeAttributeType,
            };
            //-
            if (deviceSizeAttributeType === swapsize.AT) {
                swapObj = {
                    ...swapObj,
                    atsize: parseInt(replacerElem.getAttribute(deviceSizeAttributeType)),
                };
            }
            if (deviceSizeAttributeType === swapsize.UPTO) {
                swapObj = {
                    ...swapObj,
                    uptosize: parseInt(replacerElem.getAttribute(deviceSizeAttributeType)),
                };
            }
            if (deviceSizeAttributeType === swapsize.FROM) {
                swapObj = {
                    ...swapObj,
                    fromsize: parseInt(replacerElem.getAttribute(deviceSizeAttributeType)),
                };
            }
            if (deviceSizeAttributeType === swapsize.WITHINRANGE) {
                //----------------------------------------
                // Parse e.g. range "2-4" into min and max
                //----------------------------------------
                const rangeStr = replacerElem.getAttribute(swapsize.WITHINRANGE);
                const [minSize, maxSize] = rangeStr.split('-').map(Number);

                swapObj = {
                    ...swapObj,
                    range: {
                        minSize,
                        maxSize,
                    },
                    withinsizerange: parseInt(replacerElem.getAttribute(deviceSizeAttributeType)),
                };
            }
            //----------------
            // Update domState
            //----------------
            domState.update(`${deviceSizeAttributeType}_${refAttribute}`, swapObj);

            //---------------------------------------------------------
            // Remove replacer from DOM - we'll add it back when needed
            //---------------------------------------------------------
            replacerElem.remove();
        }
    });
}

export const performSiblingSwap = ({ activeDevice, deviceSizeAttributeType }) => {
    Object.values(domState.result).forEach(item => {
        // ----------------------------------------------------------------
        // Filter to only items that have specified deviceSizeAttributeType
        // ----------------------------------------------------------------
        if (item._sizeAttributeType !== deviceSizeAttributeType) return;

        const { refelem, _replacerElem, _parentElem, _nextSiblingElem, atsize, uptosize, fromsize, withinsizerange, range } = item;

        // ---------------------------------------------------------
        // Determine which element should be visible
        // Show replacer ONLY when we're at the specified breakpoint
        // ---------------------------------------------------------
        let shouldShowReplacerElem = false;
        if (atsize) shouldShowReplacerElem = activeDevice.id === atsize;
        if (uptosize) shouldShowReplacerElem = activeDevice.id <= uptosize;
        if (fromsize) shouldShowReplacerElem = activeDevice.id >= fromsize;
        if (withinsizerange) shouldShowReplacerElem = activeDevice.id >= range.minSize && activeDevice.id <= range.maxSize;
        //-
        const elementToShow = shouldShowReplacerElem ? _replacerElem : refelem;
        const elementToHide = shouldShowReplacerElem ? refelem : _replacerElem;

        // ---------------------
        // Remove hidden element
        // ---------------------
        if (elementToHide.parentNode) {
            elementToHide.remove();
        }

        // --------------------------------------------
        // Insert visible element if not already in DOM
        // --------------------------------------------
        if (!elementToShow.parentNode) {
            _parentElem.insertBefore(elementToShow, _nextSiblingElem);
        }
    });
}
