/**
 * @author afmika
 */
class FluidEngine {
    constructor (n_col, n_row) {
        this.n_col = n_col;
        this.n_row = n_row;

        this.blocks = [];
        this.default_source_amount = 1;
        this.init ();
    }

    init () {
        for (let y = 0; y < this.n_row; y++) {
            this.blocks.push ([]);
            for (let x = 0; x < this.n_col; x++) {
                let block = null;
                if (x > 40 && x < 60 && y > 40 && y < 60) {
                    block = new Block (500);
                    block.curr_velocity = new Vector (100, 100)
                                    .times (Math.random ())
                                    .times (Math.random () < 0.5 ? -1 : 1);
                } else {
                    block = new Block (5);
                }

                // block.updateVelocity (0);
                this.blocks[y].push (block);
            }
        }
    }

    /**
     * @param {Function} fun Takes block, y, x, surroundings : blocks[] as arguments
     */
    eachBlock (fun) {
        for (let y = 0; y < this.n_row; y++) {
            for (let x = 0; x < this.n_col; x++) {
                const block = this.blocks[y][x];
                if (y == 10 && x == 10) {
                    // console.log(block.getDensity (), block.velocityGradient().getStatus(), block.n0);
                }
                fun (block, y, x);
            }
        }
    }


    /**
     * 
     * @param {*} dt 
     */
    next (dim, context, dt) {
        let maxi = -Infinity;
        this.eachBlock ((block, y, x) => {
            maxi = 10;
        });

        this.eachBlock ((block, y, x) => {
            const density_infos = block.getDensity ();
            // outlines
            // context.strokeStyle = 'gray';
            // context.strokeRect (y * dim, x * dim, dim, dim);
            // fill
            // 255 --> maxi
            // density_infos = ?
            let color = 255 - Math.floor(255 * (density_infos / maxi));
            if (x == 10 && y == 10) console.log (color, density_infos);
            context.fillStyle = `rgb(${color}, ${color}, ${color})`
            context.fillRect (y * dim, x * dim, dim, dim);

            block.nextState (dt);
        });

        // left ---> right flow
        for (let y = 0; y < this.n_row; y++) {
            for (let x = this.n_col - 1; x >= 0; x--) {
                let prev = x - 1, curr = x;
                if (prev >= 0) {
                    this.blocks[y][curr].nW = this.blocks[y][prev].nW ;
                    this.blocks[y][curr].nNW = this.blocks[y][prev].nNW;
                    this.blocks[y][curr].nSW = this.blocks[y][prev].nSW;
                }
            }
        }
    }
}