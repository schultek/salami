
import {round} from "@/functions"

export default class SvgBuilder {
  constructor(layer) {
    this.layer = layer;
  }
  r(d) {
    return round(d, 100);
  }
  deg(r) {
    return (r/Math.PI/2)*360;
  }
  lx(x) {
    return this.r(x-this.layer.x);
  }
  ly(y) {
    return this.r(y-this.layer.y);
  }
  l(p) {
    return "L"+this.lx(p.x)+","+this.ly(p.y)+" ";
  }
  m(p) {
    return "M"+this.lx(p.x)+","+this.ly(p.y)+" ";
  }
  a(r,s,p) {
    return "A"+this.r(r)+","+this.r(r)+" 0 0 "+s+" "+this.lx(p.x)+","+this.ly(p.y)+" ";
  }
  c(p) {
    return "M "+this.lx(p.x-this.r(p.r))+" "+this.ly(p.y)+" A"+this.r(p.r)+" "+this.r(p.r)+" 0 0 0"+this.lx(p.x+this.r(p.r))+" "+this.ly(p.y)
            +" A"+this.r(p.r)+" "+this.r(p.r)+" 0 0 0"+this.lx(p.x-this.r(p.r))+" "+this.ly(p.y)+" "
  }
}
