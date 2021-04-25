/**
 * @author afmika
 */
class FluidEngine {
    constructor (n_col, n_row) {
        this.n_col = n_col;
        this.n_row = n_row;

        this.blocks = [];
        this.blocks_mirror = [];
        this.default_source_amount = 1;
        this.init ();
    }

    init () {
        for (let y = 0; y < this.n_row; y++) {
            this.blocks.push ([]);
            this.blocks_mirror.push ([]);
            for (let x = 0; x < this.n_col; x++) {
                let block = null;
                if (x > 40 && x < 60 && y > 40 && y < 60) {
                    block = new Block (10);
                } else {
                    block = new Block (0.5);
                }
                // block.updateVelocity (0);
                this.blocks[y].push (block);
                this.blocks_mirror[y].push (this.blocks[y][x].clone ());
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
                if (y == 41 && x == 51) {
                    console.log(block.getDensity (), block.velocityGradient().getStatus(), block.n0);
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

        this.eachBlock ((block, y, x) => {
            const rho = block.getDensity ();
            const color = Math.floor(rho * 255);
            // const nColors = 10;
            // const contrast = 1.2**2;
            // const color =  Math.round(nColors * ((rho - 1) * 6 * contrast + 0.5));
            // outlines
            // context.strokeStyle = 'gray';
            // context.strokeRect (y * dim, x * dim, dim, dim);
            // fill
            context.fillStyle = `rgb(${color}, ${color}, ${color})`
            context.fillRect (y * dim, x * dim, dim, dim);

            block.nextState (dt);

            this.blocks_mirror[y][x] = block.clone ();
        });

        this.streamParticles ();

        // left ---> right flow
        for (let y = 0; y < this.n_row; y++) {
            let x = this.n_col - 1;
            if (x - 1 >= 0) {
                this.blocks[y][x].nW = this.blocks[y][x - 1].nW ;
                this.blocks[y][x].nNW = this.blocks[y][x - 1].nNW;
                this.blocks[y][x].nSW = this.blocks[y][x - 1].nSW;
            }
        }
    }

    streamParticles () {
        const valid = (y, x) => y >= 0 && x >= 0 && y < this.n_row && x < this.n_col;
        const neighboursOf = (y, x) => {
            let dir = {
                'nW' : [0, -1], 'nE' : [0, 1],
                'nS' : [1, 0], 'nN' : [-1, 0],
                'nSW' : [1, -1], 'nSE' : [1, 1],
                'nNW' : [-1, -1], 'nNE' : [-1, 1]
            };
            let result = {};
            for (let d in dir) {
                let [yy, xx] = dir [d];
                if (valid (yy, xx))
                    result[d] = this.blocks[yy][xx];
            }
            return result;
        };

        for (let y = 0; y < this.n_row; y++) {
            for (let x = 0; x < this.n_col; x++) {
                const neis_at = neighboursOf (y, x); // from this.blocks (NOT the mirrored one!)
                for (let dir in neis_at) {
                    const nei = neis_at [dir];
                    nei[dir] = this.blocks_mirror[y][x][dir];
                }
            }
        }
    }
}