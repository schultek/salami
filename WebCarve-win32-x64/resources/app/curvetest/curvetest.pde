int gap = 40;
int num = 10;
int rect = 40;
int stretch = 40;
float dir = radians(45);


float f = 0;
float d = 0.003;

Curve[] curves = new Curve[2];


void setup() {
  size(300, 200);
 
  makeCurves();
}

void makeCurves() {
   float dcos = cos(dir);
    float dsin = sin(dir);
    
    float startx = width/2+dsin*(height/2/dcos);
    float starty = 0;
    float endx = width/2-dsin*(height/2/dcos);
    float endy = height;
    float midx = dcos*stretch+width/2;
    float midy = dsin*stretch+height/2;
  
   curves[0] = new Curve(startx, starty, endx, endy, midx, midy);
   
}

void mouseDragged() {
  d = -d;
}

void mouseClicked() {

  }

void draw() {
  
  background(0);
  translate(width/2, height/2);
  scale(1);
  translate(-width/2, -height/2);
  /*
  
  dir += d;
  dir %= TWO_PI;
  
  makeCurves();
  
  stretch += d*1000;
 */
  f += d;
  strokeWeight(2);
  stroke(255);
  rect(0,0,width,height);
  
  for (Curve c : curves) {
    
    if (c != null) {
      c.draw();
    }
  }
  
}

class Curve {
  
  float[] start, end, mid;
  float[] c0, c1, c2;
  float[] start0, end0;
  
  public Curve(float startx, float starty, float endx, float endy, float midx, float midy) {
    start = new float[]{startx, starty};
    end = new float[]{endx, endy};
    mid = new float[]{midx, midy};
    
    makeConsts();
  }
  
  public Curve(Curve c, float dir, float gap) {
    
    float dcos = cos(dir);
    float dsin = sin(dir);
  
    start = new float[]{c.start[0]+dcos*gap, c.start[1]+dsin*gap};
    end = new float[]{c.end[0]+dcos*gap, c.end[1]+dsin*gap};
    mid = new float[]{c.mid[0]+dcos*gap, c.mid[1]+dsin*gap};
    
    makeConsts();
  }
  
  private void makeConsts() {
    c0 = start;
    c1 = new float[]{end[0]-2*mid[0]+start[0], end[1]-2*mid[1]+start[1]};
    c2 = new float[]{2*mid[0]-2*start[0], 2*mid[1]-2*start[1]};
    
    
  }
  
  public void draw() {
    noFill();
    stroke(255);
    strokeWeight(6);
    beginShape();
    vertex(start[0], start[1]);
    quadraticVertex(mid[0], mid[1], end[0], end[1]);
    endShape();
    stroke(0,0,255);
    strokeWeight(10);
    point(start[0], start[1]);
    point(end[0], end[1]);
    point(mid[0], mid[1]);
    
    drawCurvePoint();
    stroke(255,255,0);
    strokeWeight(20);
    printall();
    
  }
  float[] p, q;
  void drawCurvePoint() {
    
    float pxa = c0[0]+f*(f*c1[0]+c2[0]);
    float pya = c0[1]+f*(f*c1[1]+c2[1]);
    stroke(255,0,0);
    point(pxa, pya);
    
  }
  
  void printall() {
    p = new float[]{-c2[0]/2/c1[0], -c2[1]/2/c1[1]};
    q = new float[]{(p[0]*p[0])-(c0[0])/c1[0], (p[0]*p[0])-(c0[0]-width)/c1[0], 
                (p[1]*p[1])-(c0[1])/c1[1], (p[1]*p[1])-(c0[1]-height)/c1[1]};
    println("--");
    make(0,0);make(1,0);make(2,1);make(3,1);
  }
  
  void make(int j, int i) {
   makef(p[i]+sqrt(q[j]), 1);
   makef(p[i]-sqrt(q[j]), -1);
  }
  
  void makef(float f1, int i) {
    float dx = round(c0[0]+f1*(f1*c1[0]+c2[0]), 100);
    float dy = round(c0[1]+f1*(f1*c1[1]+c2[1]), 100);
    println(round(f1,100)+" "+i+" "+dx+" "+dy);
    point(dx, dy);
    if (dx >= 0 && dx <= width && dy >= 0 && dy <= height) {
      println("##");
    }
  }
  
  float round(float d, float r) {
    return Math.round(d*r)/r;
  }
}