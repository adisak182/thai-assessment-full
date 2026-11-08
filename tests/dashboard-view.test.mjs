import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardStatus,filterDashboardHistory} from '../src/utils/dashboardView.js';
test('untested and pending learners are not presented as failing',()=>{
 assert.equal(dashboardStatus(null,0).label,'ยังไม่มีผลประเมิน');
 assert.equal(dashboardStatus(null,2).label,'รอเจ้าหน้าที่ตรวจ');
 assert.equal(dashboardStatus({score:0,max_score:100},0).label,'ยังไม่ผ่านเกณฑ์');
 assert.equal(dashboardStatus({score:70,max_score:100},1).label,'ผ่านเกณฑ์');
});
test('history filters exclude pending results from both pass and fail',()=>{
 const history=[{id:'a',score:70,max_score:100,pending_count:0},{id:'b',score:0,max_score:100,pending_count:1},{id:'c',score:0,max_score:100,pending_count:0}];
 assert.deepEqual(filterDashboardHistory(history,'pending','latest').map(h=>h.id),['b']);
 assert.deepEqual(filterDashboardHistory(history,'passed','latest').map(h=>h.id),['a']);
 assert.deepEqual(filterDashboardHistory(history,'notPassed','latest').map(h=>h.id),['c']);
});
test('highest history ordering compares percentage and does not mutate source',()=>{
 const history=[{id:'a',score:20,max_score:25},{id:'b',score:70,max_score:100}];
 assert.equal(filterDashboardHistory(history,'all','highest')[0].id,'a');assert.deepEqual(history.map(h=>h.id),['a','b']);
});
