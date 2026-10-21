import type { Asset, ContainerResource, Entity, AnimTrack, MorphInstance } from 'playcanvas';
export interface RigAnimation { host:Entity; state:string; clips:string[]; morphs:MorphInstance[] }
export function attachAnimation(host:Entity,asset:Asset):RigAnimation{
 const clips=(asset.resource as ContainerResource).animations;
 host.addComponent('anim',{activate:true});
 const names=clips.map(c=>(c.resource as AnimTrack).name);
 host.anim!.loadStateGraph({layers:[{name:'Locomotion',states:[{name:'START'},...names.map(name=>({name,speed:1,loop:!['Panic','Stumble','Relief'].includes(name)}))],transitions:[{from:'START',to:'Idle',time:0}]}],parameters:{}});
 for(const clip of clips)host.anim!.assignAnimation((clip.resource as AnimTrack).name,clip.resource as AnimTrack);
 const morphs:MorphInstance[]=[];for(const c of host.findComponents('render'))for(const mesh of (c as import('playcanvas').RenderComponent).meshInstances)if(mesh.morphInstance)morphs.push(mesh.morphInstance);
 return {host,state:'Idle',clips:names,morphs};
}
export function animateRig(rig:RigAnimation,state:string,paused:boolean,time:number,panic:number){
 rig.host.anim!.playing=!paused;
 if(state!==rig.state&&rig.clips.includes(state)){rig.host.anim!.baseLayer!.transition(state,.13);rig.state=state;}
 const blink=Math.max(0,1-Math.abs((time%3.8)-3.5)/.09);
 for(const morph of rig.morphs){
  // Only set named morphs present on this mesh. No overwriting authored transforms.
  for(const target of ['Blink','Panic'])if(morph.morph.targets.some(t=>t.name===target))morph.setWeight(target,target==='Blink'?blink:Math.min(1,Math.max(0,panic)));
 }
}
