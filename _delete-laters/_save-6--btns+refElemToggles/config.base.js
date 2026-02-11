export const _device = {
    mobileFirst: true,
    unit: 'px', // TODO 1: If no unit is specified, make the watchBreakpoints() code default to px unit; TODO 2: Only allow acceptable units 'px', 'rem' and 'em'
    sizes: { // TODO 3: sizes must be arranged in the order lowest to highest; TODO 4: for sizes, determine the maximum number of sizes allowed
        1: { name: 'mobile', value: 0},
        2: { name: 'tablet', value: 768 },
        3: { name: 'desktop', value: 1024 },
        4: { name: 'wide', value: 1280 },
        5: { name: 'ultraWide', value: 1600 },
    }
};
