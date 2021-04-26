let max_rho = -Infinity;
let count = 0;

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
        const sqRange = p => p >= 50 && p <= 60;
        for (let y = 0; y < this.n_row; y++) {
            this.blocks.push ([]);
            this.blocks_mirror.push ([]);
            for (let x = 0; x < this.n_col; x++) {
                // let block = null;
                // if (sqRange (x) && sqRange (y)) {
                //     block = new Block (Math.random());
                //     block.curr_velocity = new Vector (1, 1);
                // } else {
                //     block = new Block (0);
                // }
                const block = new Block (0);
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
                fun (block, y, x);
            }
        }
    }


    next (dim, context, dt) {
        this.collideParticles (context, dt);
        this.streamParticles ();
        this.flowRight ();
    }
    
    flowRight () {
        let last = this.n_col - 1;
        for (let y = 0; y < this.n_row; y++) {
            this.blocks[y][last].nW  = this.blocks[y][last - 1].nW ;
            this.blocks[y][last].nNW = this.blocks[y][last - 1].nNW;
            this.blocks[y][last].nSW = this.blocks[y][last - 1].nSW;
        }
    }

    equilibrumState () {
        this.eachBlock ((block, y, x) => {
            block.equilibrum ();
        });
    }

    collideParticles (context, dt) {
        this.eachBlock ((block, y, x) => {
            const rho = block.getDensity ();
            max_rho = Math.max (rho, max_rho); count++;
            if (count % 100000 == 0) 
                console.log('max_rho so far ', max_rho);
            // context.strokeRect (x * dim, y * dim, dim, dim);

            const vel = block.curr_velocity;
            const normal = vel.normalize ();
            const angle = normal.argTheta (); // [-pi/2, pi/2[
            let color = colorMap (angle + (Math.PI / 2), Math.PI) ;
            // let color = colorMap (rho, 1) ;
            // alert (color);
            context.fillStyle = color;
            context.fillRect (x * dim, y * dim, dim, dim);

            // context.save ();
            // context.translate (x * dim + dim / 2, y * dim + dim / 2)
            // context.beginPath ();
            //     context.strokeStyle = 'red';
            //     context.moveTo (0, 0);
            //     const  temp = normal.times (dim / 2);
            //     context.lineTo (temp.getX(), temp.getY());
            //     context.stroke ();
            // context.closePath ();
            // context.restore ();

            block.nextState (dt);
            this.blocks_mirror[y][x] = block.clone ();
        });
    }

    streamParticles () {
        const valid = (y, x) => y >= 0 && x >= 0 && y < this.n_row && x < this.n_col;
        let dir = {
            'nW' : [0, -1], 'nE' : [0, 1],
            'nS' : [1, 0], 'nN' : [-1, 0],
            'nSW' : [1, -1], 'nSE' : [1, 1],
            'nNW' : [-1, -1], 'nNE' : [-1, 1]
        };
        for (let y = 0; y < this.n_row; y++) {
            for (let x = 0; x < this.n_col; x++) {
                for (let d in dir) {
                    const [dy, dx] = dir [d];
                    const [nei_y, nei_x] = [y + dy, x + dx];
                    if (valid (nei_y, nei_x)) {
                        const nei = this.blocks[nei_y][nei_x];
                        nei[d] = this.blocks_mirror[y][x][d];
                        // nei[d] = this.blocks[y][x][d];
                    }
                }
            }
        }
    }


    modifyBlockAt (x, y, velocity) {
        this.blocks[y][x] = new Block (0.001);
        this.blocks[y][x].curr_velocity = velocity;
    }
}