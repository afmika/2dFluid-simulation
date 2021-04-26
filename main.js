const canvas = document.getElementById ('canvas');
const ctx = canvas.getContext ('2d');

const amount_x = 100;
const amount_y = 100;
const dim = Math.min(canvas.width / amount_x, canvas.height / amount_y);

const engine = new FluidEngine (amount_x, amount_y);
engine.equilibrumState ();

setInterval (() => {
    ctx.clearRect (0, 0, canvas.width, canvas.height);
    engine.next (dim, ctx, 0.1);
}, 1000 / 30);


function log (... arg) {
	document.getElementById ('logs').innerText = arg.join(' - ');
}

let pressed = false;
let origin = null;
canvas.addEventListener ('mouseup', e => {
	pressed = false;
	origin = null;
	log ('released');
});

canvas.addEventListener ('mousedown', e => {
	pressed = true;
	log ('pressed');
});

canvas.addEventListener ('mousemove', e => {
	if (pressed) {
		const rect = canvas.getBoundingClientRect();
		const [mx, my] = [e.clientX, e.clientY];
		const [dx, dy] = [rect.left, rect.top];
		const [px, py] = [mx - dx, my - dy];
		if (origin == null) {
			origin = new Vector (px, py);
		}

		const current = new Vector (px, py);
		const velocity = Vector.sub(origin, current).normalize().times(0.001);
		// console.log(velocity.getStatus());

		const [x, y] = [px, py].map(v => Math.floor(v / dim));

		engine.modifyBlockAt (x, y, velocity);

		log ('pressed <-> Moved', px, py);
	}
});

