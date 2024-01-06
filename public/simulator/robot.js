class Robot {
    constructor(factor, _x = 0, _y = 0, _width = 50, _height = 75, _angle = 0, _vitesse = 10) {
        this.factor = factor;
        // x and y represent the center of the robot
        this.x = _x;
        this.y = _y;
        this.angle = _angle;
        this.width = _width;
        this.height = _height;
        this.vitesse = _vitesse;
    }
  
    show() {
        push();
        const canvasX = this.x * this.factor;
        const canvasY = this.y * this.factor;
        translate(canvasX, canvasY);
        rotate(this.angle);
        stroke(255, 255, 255);
        rect(-this.height/2, -this.width/2, this.height, this.width);
        stroke(255, 0, 0);
        fill(255, 0, 0);
        const h = (Math.sqrt(3)/2) * (this.width/3)
        triangle(-0.5*h, -(this.height/6), -0.5*h, this.height/6, 0.5*h, 0);
        pop();

        
    }
  
    turn(angle){
        this.angle += angle;
        if(this.angle<0){
            this.angle += 360;
        } else if (this.angle >= 360){
            this.angle -= 360;
        }
    }

    async move(dist) {
        const stepSize = 1; 
        const steps = dist / stepSize; 
        const anglecos = cos(this.angle);
        const anglesin = sin(this.angle);
    
        for (let i = 0; i < steps; i++) {
            this.x += anglecos * stepSize;
            this.y += anglesin * stepSize;
    
            if (i < steps - 1) {
                await new Promise(r => setTimeout(r, (1/this.vitesse)*100));
            }
        }
    }
    

    side(dist){
        let anglecos = cos(this.angle);
        let anglesin = sin(this.angle);
        this.x += -anglesin*dist;
        this.y += anglecos*dist;
    }
  }