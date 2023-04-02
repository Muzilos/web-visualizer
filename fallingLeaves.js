class FallingLeavesVisualizer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.leaves = [];
      this.maxLeaves = 100;
    }
  
    addLeaf() {
      const x = Math.random() * this.canvas.width;
      const y = 0;
      const size = Math.random() * 20 + 10;
      const speed = Math.random() * 2 + 1;
      const angle = Math.random() * 2 * Math.PI;
      const rotationSpeed = Math.random() * 0.01 - 0.005;
  
      const leaf = {
        x: x,
        y: y,
        size: size,
        speed: speed,
        angle: angle,
        rotationSpeed: rotationSpeed,
      };
  
      this.leaves.push(leaf);
    }
  
    update() {
      this.leaves.forEach((leaf, index) => {
        leaf.y += leaf.speed;
        leaf.angle += leaf.rotationSpeed;
  
        if (leaf.y > this.canvas.height) {
          this.leaves.splice(index, 1);
          this.addLeaf();
        }
      });
  
      if (this.leaves.length < this.maxLeaves) {
        this.addLeaf();
      }
    }
  
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.leaves.forEach((leaf) => {
        this.ctx.save();
        this.ctx.translate(leaf.x, leaf.y);
        this.ctx.rotate(leaf.angle);
        this.ctx.fillStyle = '#8C5E2A';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, leaf.size / 2, leaf.size / 4, 0, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      });
    }
  
    visualize() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.visualize());
    }
  }
  