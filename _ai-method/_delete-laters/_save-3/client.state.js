export const clientState = {
    update: function(id, obj) {
        this.result[id] = { ...this.result[id], ...obj };
    },
    result: {},
};
