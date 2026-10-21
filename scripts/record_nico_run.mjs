// Native Playwright video of the actual running game. No generated/interpolated frames.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:640,height:360},recordVideo:{dir:'evidence/raw-video',size:{width:640,height:360}}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173');await page.getByTestId('mode').selectOption('1');await page.locator('#quality').selectOption('low');await page.getByTestId('start').click();
const snapshot=()=>page.evaluate(()=>window.snapshot());
while((await snapshot()).time<.3)await page.waitForTimeout(100);
await page.mouse.move(2,190);await page.mouse.down();await page.mouse.move(630,190,{steps:6});await page.mouse.up();
await page.keyboard.down('Shift');await page.keyboard.down('s');
let start;for(let i=0;i<100;i++){const s=await snapshot();if(s.animation.state==='Run'){start=s;break;}await page.waitForTimeout(100);}
if(!start)throw new Error('Run not entered');
let end;for(let i=0;i<100;i++){end=await snapshot();if(end.time>start.time+.42&&Math.abs(end.joints.left-start.joints.left)>8&&Math.abs(end.joints.right-start.joints.right)>1)break;await page.waitForTimeout(100);}
await page.screenshot({path:'evidence/art-run-recording.png'});await page.keyboard.up('s');await page.keyboard.up('Shift');await page.waitForTimeout(500);
await page.keyboard.down('Space');let crouch;for(let i=0;i<80;i++){crouch=await snapshot();if(crouch.animation.state==='Crouch')break;await page.waitForTimeout(100);}await page.screenshot({path:'evidence/art-nico-crouch.png'});await page.keyboard.up('Space');
const video=page.video();await context.close();await video.saveAs('evidence/nico-running.webm');await browser.close();
await fs.writeFile('docs/nico-recording-proof.json',JSON.stringify({start,end,crouch,errors,method:'Native Playwright video, Chromium SwiftShader; real inputs, no state setters'},null,2));
if(errors.length||Math.abs(end.joints.left-start.joints.left)<=8||Math.abs(end.joints.right-start.joints.right)<=1)throw new Error('Motion proof failed');
console.log('Real Run video and two-joint proof saved');
