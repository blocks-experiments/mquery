import { breakpointsWatcher } from './breakpoints.watcher.js';
import { initializeSiblingSwap, performSiblingSwap } from './queries/replacesibling.js';
import { swapsize } from './var.js';

const deviceSizeAttributeTypes = Object.values(swapsize);

const initializeAllSiblingSwaps = () => {
    deviceSizeAttributeTypes.forEach((deviceSizeAttributeType) => {
        initializeSiblingSwap({ deviceSizeAttributeType });
    });
}

// Initialize swaps when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {

        //-----------------------
        // Initialize all systems
        //-----------------------
        initializeAllSiblingSwaps();

    });
} else {

    initializeAllSiblingSwaps();

}


export const DOMautoquery = {
    devices: (_devices) => {

        // Use breakpoint watcher
        breakpointsWatcher(_devices, (activeDevice) => {
            console.clear();

            // TODO C1 [DOCvelop]: Feed activeDevice into "debug mode"
            console.log('Active Device:', activeDevice);

            // TODO B1 [Add non-existing]: Array of all devices (with each device object taking similar shape as the activeDevice object).
            // console.log('All Devices: ', allDevices);

            deviceSizeAttributeTypes.forEach((deviceSizeAttributeType) => {
                performSiblingSwap({ activeDevice, deviceSizeAttributeType });
            });
        });
    },
};
