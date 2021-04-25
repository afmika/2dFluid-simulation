const canvas = document.getElementById ('canvas');
const ctx = canvas.getContext ('2d');

const amount_x = 100;
const amount_y = 100;
const dim = Math.min(canvas.width / amount_x, canvas.height / amount_y);

const engine = new FluidEngine (amount_x, amount_y);
setInterval (() => {
    engine.next (dim, ctx, 0.1);
}, 1000 / 1);