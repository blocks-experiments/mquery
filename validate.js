import { _device } from './config.base.js';

// --- VALIDATION: Check for duplicates ---
export function validateSwapPairs() {
    const reflemMap = new Map();
    const replaceSiblingMap = new Map();
    const errors = [];

    // Check refelem duplicates
    document.querySelectorAll('[refelem]').forEach(elem => {
        const refAttr = elem.getAttribute('refelem');
        if (reflemMap.has(refAttr)) {
            errors.push(`❌ Duplicate [refelem="${refAttr}"]: Found at multiple locations!`);
        }
        reflemMap.set(refAttr, elem);
    });

    // Check replacesibling duplicates
    document.querySelectorAll('[replacesibling]').forEach(elem => {
        const refAttr = elem.getAttribute('replacesibling');
        const atSize = elem.getAttribute('atsize');
        const key = `${refAttr}:${atSize}`;
        
        if (replaceSiblingMap.has(key)) {
            errors.push(`❌ Duplicate [replacesibling="${refAttr}" atsize="${atSize}"]: Found at multiple locations!`);
        }
        replaceSiblingMap.set(key, elem);

        // Also check if the refelem exists
        if (!reflemMap.has(refAttr)) {
            errors.push(`⚠️  Missing [refelem="${refAttr}"]: Required by [replacesibling="${refAttr}"]`);
        }
    });

    if (errors.length > 0) {
        console.error('🚨 Swap Pair Validation Errors:');
        errors.forEach(err => console.error(err));
        throw new Error('Swap pair validation failed. Check console for details.');
    } else {
        console.log('✅ All swap pairs validated successfully!');
    }
}


// --- VALIDATION: Don't allow use of the largest or smallest device size ---
export function validateWithinSizeRanges() {
    const maxBreakpoint = Math.max(...Object.keys(_device.sizes).map(Number));
    const errors = [];

    document.querySelectorAll('[withinSizeRange]').forEach(elem => {
        const rangeStr = elem.getAttribute('withinSizeRange');
        const [minSize, maxSize] = rangeStr.split('-').map(Number);
        const refName = elem.getAttribute('replacesibling');

        // Check if minimum is the smallest breakpoint (1)
        if (minSize === 1) {
            errors.push(`❌ [withinSizeRange="${rangeStr}" replacesibling="${refName}"]: Cannot use breakpoint 1 (smallest). Use uptosize instead.`);
        }

        // Check if maximum is the highest breakpoint
        if (maxSize === maxBreakpoint) {
            errors.push(`❌ [withinSizeRange="${rangeStr}" replacesibling="${refName}"]: Cannot use breakpoint ${maxBreakpoint} (highest). Use fromsize instead.`);
        }

        // Check if both are extreme
        if (minSize === 1 && maxSize === maxBreakpoint) {
            errors.push(`❌ [withinSizeRange="${rangeStr}" replacesibling="${refName}"]: Cannot use extreme breakpoints. Use atsize, uptosize, or fromsize instead.`);
        }

        // Check if range is valid
        if (minSize > maxSize) {
            errors.push(`❌ [withinSizeRange="${rangeStr}" replacesibling="${refName}"]: Invalid range. Min (${minSize}) cannot be greater than Max (${maxSize}).`);
        }

        // Check if range is the same (which would be better served by atsize)
        if (minSize === maxSize) {
            errors.push(`⚠️  [withinSizeRange="${rangeStr}" replacesibling="${refName}"]: Single breakpoint range detected. Consider using atsize="${minSize}" instead.`);
        }
    });

    if (errors.length > 0) {
        console.error('🚨 Within Size Range Validation Errors:');
        errors.forEach(err => console.error(err));
        throw new Error('Within size range validation failed. Check console for details.');
    } else {
        console.log('✅ All within size ranges validated successfully!');
    }
}