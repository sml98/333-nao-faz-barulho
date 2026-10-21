import { Entity, Vec3 } from 'playcanvas';
import { walkable,lineClear } from './level';
import type {Point} from './config';
export class FollowCamera{
 entity:Entity;position=new Vec3();initialized=false;hideNico=false;
 constructor(entity:Entity){this.entity=entity;}
 tick(dt:number,p:Point,yaw:number,pitch:number){
 const target=new Vec3(p.x,1.0,p.z);let d=.25;
 for(let probe=.25;probe<=3.45;probe+=.08){const q={x:p.x-Math.sin(yaw)*probe+Math.cos(yaw)*.22,z:p.z-Math.cos(yaw)*probe-Math.sin(yaw)*.22};if(!walkable(q,.32,false)||!walkable(q,.1,true))break;d=probe;}
 const desired=new Vec3(p.x-Math.sin(yaw)*d+Math.cos(yaw)*.22,Math.min(3.05,2.02+Math.sin(pitch)*d+Math.max(0,2.0-d)*.8),p.z-Math.cos(yaw)*d-Math.sin(yaw)*.22);
 if(!this.initialized){this.position.copy(desired);this.initialized=true;}else this.position.lerp(this.position,desired,1-Math.exp(-16*dt));
 if(!walkable({x:this.position.x,z:this.position.z},.32,false)||!lineClear(p,{x:this.position.x,z:this.position.z},.08))this.position.copy(desired);
 // Orbit interpolation may cross the player's centre. Move above the head instead of through it.
 const horizontal=Math.hypot(this.position.x-p.x,this.position.z-p.z);
 if(horizontal<.95)this.position.y=Math.max(this.position.y,2.85);
 this.hideNico=horizontal<.55&&this.position.y<2.45;
 this.entity.setPosition(this.position);this.entity.lookAt(target);
 }
}
