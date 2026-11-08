import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('one-question navigation exposes next until the final question, then submit',async()=>{
 const vite=await createServer({optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'});
 try{
  const {default:Navigation}=await vite.ssrLoadModule('/src/components/QuestionNavigation.jsx');
  const render=index=>renderToStaticMarkup(React.createElement(Navigation,{index,total:3,onChange:()=>{},onSubmit:()=>{}}));
  const first=render(0),middle=render(1),last=render(2);
  assert.match(first,/ถัดไป/);assert.doesNotMatch(first,/ส่งคำตอบ/);assert.match(first,/disabled/);
  assert.match(middle,/ถัดไป/);assert.doesNotMatch(middle,/disabled/);
  assert.match(last,/ส่งคำตอบ/);assert.doesNotMatch(last,/ถัดไป/);
  const single=renderToStaticMarkup(React.createElement(Navigation,{index:0,total:1,onChange:()=>{},onSubmit:()=>{},disabled:true}));
  assert.match(single,/ส่งคำตอบ/);assert.equal((single.match(/disabled/g)||[]).length,2);
 }finally{await vite.close();}
});

test('question numbers identify current and answered questions and lock during submission',async()=>{
 const vite=await createServer({optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'});
 try{
  const {default:Numbers}=await vite.ssrLoadModule('/src/components/QuestionNumbers.jsx');
  const render=disabled=>renderToStaticMarkup(React.createElement(Numbers,{index:1,answered:[true,false,false],onChange:()=>{},disabled}));
  const html=render(false);
  assert.equal((html.match(/<button/g)||[]).length,3);
  assert.equal((html.match(/aria-current="step"/g)||[]).length,1);
  assert.match(html,/aria-label="ข้อที่ 1 ตอบแล้ว"/);
  assert.match(html,/aria-label="ข้อที่ 2 ยังไม่ตอบ" aria-current="step"/);
  assert.doesNotMatch(html,/disabled/);
  assert.equal((render(true).match(/disabled/g)||[]).length,3);
 }finally{await vite.close();}
});
