function colorMap (value, max_range) {
	let color = Math.floor(0x9f * (value / max_range));
	return rgb (0, 5, 255 - color);
}

function rgb (... arg) {
	return `rgb(${[... arg].join(', ')})`;
}