/**
 * @author afmika
 */
class Block {
    /**
     * A block represents a density-amount of particles
     * This will speed up our calculations
     */
    constructor (density) {
        this.viscosity = 0.001; // 
        this.omega = 1 / (3 * this.viscosity + 0.5);

        this.curr_density = density || 0;
        this.prev_density = 0;

        this.curr_velocity = Vector.zero();
        this.prev_velocity = Vector.zero();

        // nothing yet
        this.initAllAttributesTo (9);
    }


    clone () {
        const bclone = new Block (0);
        bclone.viscosity = this.viscosity;
        bclone.omega =  this.omega;

        bclone.curr_velocity = this.curr_velocity.clone ();
        bclone.prev_velocity = this.prev_velocity.clone ();
        bclone.curr_density = this.curr_density;
        bclone.prev_density = this.prev_density;
        bclone.n0 = this.n0;
        bclone.nN = this.nN;
        bclone.nS = this.nS;
        bclone.nE = this.nE;
        bclone.nW = this.nW;
        bclone.nNE = this.nNE;
        bclone.nSE = this.nSE;
        bclone.nNW = this.nNW;
        bclone.nSW = this.nSW;

        return bclone;
    }

    initAllAttributesTo (value) {
        this.n0  = value * (4 / 9) * Math.random ();
        this.nN  = value * (1 / 9) * Math.random ();
        this.nS  = value * (1 / 9) * Math.random ();
        this.nE  = value * (1 / 9) * Math.random ();
        this.nW  = value * (1 / 9) * Math.random ();
        this.nNE = value * (1 / 36) * Math.random ();
        this.nSE = value * (1 / 36) * Math.random ();
        this.nNW = value * (1 / 36) * Math.random ();
        this.nSW = value * (1 / 36) * Math.random ();
    }
    /**
     * Updates the current viscosity (set up to 0.01 by default)
     * @param {number} value 
     */
    setViscosity (value) {
        this.viscosity = value;
        this.omega = 1 / (3 * this.viscosity + 0.5); 
    }

    /**
     * Outputs the current viscosity information
     * @returns {JSON} {viscosity : [number], omega : [number]}
     */
    getViscosityInformation () {
        return {
            viscosity : this.viscosity,
            omega : this.omega
        };
    }

    /**
     * Updates the current macro velocity.
     */
    updateVelocity () {
        const rho = this.getDensity ();
        if (rho <= 0) return;

        this.prev_velocity = this.curr_velocity;
        /**
         * This should explain the stuff below (value-compensation trick)
         * nNE ----- nN ----- nNW
         *       \   |   /  
         * nE  ----  n0 --- nW
         *       /   |   \
         * nSE ----- nS ---- nSW 
         */
        this.curr_velocity = new Vector (
            ((this.nE + this.nNE + this.nSE) - (this.nW + this.nNW + this.nSW)) / rho,
            ((this.nN + this.nNE + this.nNW) - (this.nS + this.nSE + this.nSW)) / rho
        );
    }

    /**
     * Updates the current macro density (rho).
     * Basically it is the sum of all 9 attributes
     */
    updateDensity () {
        const macro_density = this.n0 + this.nN 
                            + this.nS + this.nE 
                            + this.nW + this.nNW 
                            + this.nNE + this.nSW 
                            + this.nSE;
        this.prev_density = this.curr_density;
        this.curr_density = macro_density;
    }

    /**
     * @returns {Vector} velocity of this block
     */
    getVelocity () {
        return this.curr_velocity;
    }

    /**
     * Useful when we want to compute the velocity gradient
     * @returns {Vector} old velocity of this block
     */
    getOldVelocity () {
        return this.prev_velocity;
    }

    /**
     * @returns {number} density of this block
     */
    getDensity () {
        return this.curr_density;
    }

    /**
     * Useful when we want to compute the density gradient
     * @returns {number} old density of this block
     */
    getOldDensity () {
        return this.prev_density;
    }

    /**
     * Computes the next state using the Boltzman distribution
     * This approximation is not using the exp function but the Taylor series up to the 3rd order instead
     */
    nextState (dt) {
        this.updateDensity ();
        this.updateVelocity ();
        const rho = this.getDensity ();
        const vel = this.getVelocity ();
        const [ux, uy] = [vel.getX(), vel.getY()];
        const _3ux = 3 * ux; 
        const _3uy = 3 * uy;
        const _2ux = ux * ux;
        const _2uy = uy * uy;
        const _2uxuy = 2 * ux * uy;
        const u2 = _2ux + _2uy;
        const _1_5u2 = 1.5 * u2;

        // if (ux != 0 || uy != 0)
        //     console.log('HEA,', ux, uy);

        // n_new = n_old + omega * (n_equlibrum - n_old)
        // since
        // n_new - n_old = omega * (n_equlibrum - n_old)
        // kind of messy
        // TODO : use matrix notation or vector notation (with proper projections)
        this.n0  += this.omega * ( (4 / 9)  * rho * ( 1 +    0 +    0 +         0           - _1_5u2 ) - this.n0  );
        this.nE  += this.omega * ( (1 / 9)  * rho * ( 1 + _3ux +    0 + 4.5 * _2ux          - _1_5u2 ) - this.nE  );
        this.nW  += this.omega * ( (1 / 9)  * rho * ( 1 - _3ux +    0 + 4.5 * _2ux          - _1_5u2 ) - this.nW  );
        this.nN  += this.omega * ( (1 / 9)  * rho * ( 1 + _3uy +    0 + 4.5 * _2uy          - _1_5u2 )  - this.nN  );
        this.nS  += this.omega * ( (1 / 9)  * rho * ( 1 - _3uy +    0 + 4.5 * _2uy          - _1_5u2 ) - this.nS  );
        this.nNE += this.omega * ( (1 / 36) * rho * ( 1 + _3ux + _3uy + 4.5 * (u2 + _2uxuy) - _1_5u2 ) - this.nNE );
        this.nSE += this.omega * ( (1 / 36) * rho * ( 1 + _3ux - _3uy + 4.5 * (u2 - _2uxuy) - _1_5u2 ) - this.nSE );
        this.nNW += this.omega * ( (1 / 36) * rho * ( 1 - _3ux + _3uy + 4.5 * (u2 - _2uxuy) - _1_5u2 ) - this.nNW );
        this.nSW += this.omega * ( (1 / 36) * rho * ( 1 - _3ux - _3uy + 4.5 * (u2 + _2uxuy) - _1_5u2 ) - this.nSW );
    }


    /**
     * @params {number} dt the amount of time needed in order to attain the current amount
     * @returns {Vector} the velocity gradient of this block
     */
    velocityGradient (dt = 1) {
        const vold = this.getOldVelocity ();
        const vnew = this.getVelocity ();
        const dv = Vector.sub (vnew, vold);
        return dv.times(1 / dt);
    }

    /**
     * @params {number} dt the amount of time needed in order to attain the current amount (set to 1 by default)
     * @returns {number} the density gradient of this block
     */
    densityGradient (dt = 1) {
        const dold = this.getOldDensity ();
        const dnew = this.getDensity ();
        const drho = dnew - dold;
        return drho / dt;
    }

    /**
     * The equilibrum state is easy
     * it depends en rho and the macroscopic velocity
     */
    equilibrum () {
        const rho = this.getDensity ();
        const vel = this.getVelocity ();
        const [ux, uy] = [vel.getX(), vel.getY()];
        const _3ux = 3 * ux; 
        const _3uy = 3 * uy;
        const _2ux = ux * ux;
        const _2uy = uy * uy;
        const _2uxuy = 2 * ux * uy;
        const u2 = _2ux + _2uy;
        const _1_5u2 = 1.5 * u2;

        this.n0  = (4 / 9)  * rho * ( 1 +    0 +    0 +         0           - _1_5u2 );
        this.nE  = (1 / 9)  * rho * ( 1 + _3ux +    0 + 4.5 * _2ux          - _1_5u2 );
        this.nW  = (1 / 9)  * rho * ( 1 - _3ux +    0 + 4.5 * _2ux          - _1_5u2 );
        this.nN  = (1 / 9)  * rho * ( 1 + _3uy +    0 + 4.5 * _2uy          - _1_5u2 );
        this.nS  = (1 / 9)  * rho * ( 1 - _3uy +    0 + 4.5 * _2uy          - _1_5u2 );
        this.nNE = (1 / 36) * rho * ( 1 + _3ux + _3uy + 4.5 * (u2 + _2uxuy) - _1_5u2 );
        this.nSE = (1 / 36) * rho * ( 1 + _3ux - _3uy + 4.5 * (u2 - _2uxuy) - _1_5u2 );
        this.nNW = (1 / 36) * rho * ( 1 - _3ux + _3uy + 4.5 * (u2 - _2uxuy) - _1_5u2 );
        this.nSW = (1 / 36) * rho * ( 1 - _3ux - _3uy + 4.5 * (u2 + _2uxuy) - _1_5u2 );
    }
}