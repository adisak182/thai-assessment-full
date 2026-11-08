import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeAttempts, summarizeLearners, filterUsers } from '../src/utils/adminSummary.js';

test('admin averages use only reviewed attempts and normalize different exam sizes',()=>{
 const data=[{skill:'full_test',score:0,max_score:100,pending_count:0,taken_at:'2026-11-01'},
  {skill:'reading',score:15,max_score:30,pending_count:0,taken_at:'2026-11-02'},
  {skill:'full_test',score:90,max_score:100,pending_count:2,taken_at:'2026-11-03'}];
 const s=summarizeAttempts(data);assert.equal(s.total,3);assert.equal(s.reviewed,2);assert.equal(s.pending,1);
 assert.equal(s.average,25);assert.equal(s.best,50);assert.equal(s.passed,0);assert.equal(s.latestFullTest.score,0);
 assert.equal(summarizeAttempts([]).average,null);
});
test('learner summary excludes staff and preserves zero-score completed tests',()=>{
 const s=summarizeLearners([{role:'admin',full_test_passed:true},{role:'user',is_literacy_learner:true,full_test_completed:true,full_test_score:0},
  {role:'user',full_test_passed:true,full_test_pending:2,full_test_pending_questions:3},{role:'user'}]);
 assert.equal(s.total,3);assert.equal(s.literacy,1);assert.equal(s.passed,1);assert.equal(s.pendingAttempts,2);assert.equal(s.pendingQuestions,3);
});
test('admin filters distinguish pending, untested, failed and literacy status',()=>{
 const users=[{name:'ผู้เรียน ก',role:'user',full_test_completed:true,full_test_score:0,status:'กำลังศึกษา'},
  {name:'ผู้เรียน ข',role:'user',is_literacy_learner:true,full_test_pending:1,full_test_attempts:1},
  {name:'ผู้เรียน ค',role:'user',address:'นราธิวาส'}];
 assert.equal(filterUsers(users,{status:'notPassed'}).length,1);
 assert.equal(filterUsers(users,{status:'notTested'}).length,1);
 assert.equal(filterUsers(users,{status:'pending',enrollment:'literacy'})[0].name,'ผู้เรียน ข');
 assert.equal(filterUsers(users,{search:' นราธิวาส '})[0].name,'ผู้เรียน ค');
 assert.equal(filterUsers(users,{enrollment:'other'}).length,2);
 assert.equal(filterUsers([{name:null,username:null}],{search:'a'}).length,0);
});
