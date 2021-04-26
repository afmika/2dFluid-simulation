/**
 * @author afmika
 */
class Vector {
	constructor (x, y) {
		this.setX (x);
		this.setY (y);
	}

	static add (u, v) {
		return new Vector (u.getX () + v.getX (), u.getY () + v.getY ());
	}
	static sub (u, v) {
		return Vector.add (u, v.times (-1));
	}
	static randDir () {
		let x = Math.random () * 2,
			y = Math.random () * 2;
		let v = new Vector (x, y);
		return v.normalize ();
	}
	static zero () {
		return new Vector (0, 0);
	}
	static dot (u, v) {
		 return u.getX ()*v.getX () + u.getY ()*v.getY ();
	}
	static distance (u, v) {
		return Vector.sub (u, v).getLength ();
	}
	static angleBetween (u, v) {
		let dot = Vector.dot (u, v);
		let prod = u.getLength () * v.getLength ();
		return Math.acos (dot / prod);
	}

	argTheta () {
		return Math.atan (this.getX(), this.getY());
	}

	rotate (center, angle) {
	    let x = this.getX () - center.getX ();
	    let y = this.getY () - center.getY ();
	    let _x = x * Math.cos (angle) - y * Math.sin (angle);
	    let _y = x * Math.sin (angle) + y * Math.cos (angle);
	    return new Vector ( _x + center.x, _y + center.y);
	}
	
	normalize () {
		let lg = this.getLength (); 
		return lg == 0 ? Vector.zero () : this.times (1 / lg);
	}

	times (a, b) {
		let vec = null;
		if (b != undefined || !isNaN (parseFloat (b))) {
			vec = new Vector (this.getX () * a, this.getY () * b);
		} else {
			vec = new Vector (this.getX () * a, this.getY () * a);
		}
		return vec;
	}

	setX (x) {
		this.x = parseFloat (x);
	}
	setY (y) {
		this.y = parseFloat (y);
	}

	getX () {
		return this.x;
	}
	getY () {
		return this.y;
	}
	getLength () {
		return Math.sqrt ( this.getSqrLength () );
	}
	getSqrLength () {
		let x = this.getX (), y = this.getY ();
		return x*x + y*y;
	}

	getStatus (precision) {
		if (precision != undefined) {
			let pow = Math.pow (10, precision);
			let tx = Math.round ( this.getX () * pow );
			let ty = Math.round ( this.getY () * pow );
			tx = Math.floor (tx) / pow;
			ty = Math.floor (ty) / pow;
			return tx+", "+ty;
		}
		return this.getX () + ", "+this.getY ();
	}


	clone () {
		return new Vector (this.x, this.y);
	}

	static randomDir () {
		return new Vector (
			(0.1 + Math.random ()) * (Math.random () < 0.5 ? -1 : 1),
			(0.1 + Math.random ()) * (Math.random () < 0.5 ? -1 : 1),
		).normalize ();
	}
}