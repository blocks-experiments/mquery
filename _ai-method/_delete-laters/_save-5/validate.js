
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
