const money = new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'});

const defaultCategories = [
  {name:'Housing', items:['Mortgage or rent','Other']},
  {name:'Entertainment', items:['Night out','Music platforms','Movies']},
  {name:'Transportation', items:['Bus / taxi fare','Other']},
  {name:'Loans', items:['Personal','Student']},
  {name:'Food', items:['Groceries','Dining out','Other']},
  {name:'Savings or investments', items:['Investment account','Other']},
  {name:'Personal care', items:['Medical','Hair / nails','Clothing','Gym','Hygiene']}
];

function currentMonthKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
let selectedMonth = currentMonthKey();

function blankState(){
  return {
    projectedIncome:[
      {name:'Income 1',amount:641.27},
      {name:'Extra income',amount:50}
    ],
    actualIncome:[
      {name:'Income 1',amount:3834.27},
      {name:'Extra income',amount:50}
    ],
    categories: defaultCategories.map(cat=>({
      name:cat.name,
      items:cat.items.map(item=>({
        name:item,
        projected: sampleProjected(cat.name,item),
        actual: sampleActual(cat.name,item)
      }))
    })),
    goals:[
      {name:'Emergency fund',target:1000,saved:0}
    ],
    review:{win:'',improve:'',goal:''}
  };
}
function sampleProjected(cat,item){
  const samples={
    'Housing|Mortgage or rent':3213,
    'Entertainment|Night out':30,
    'Food|Groceries':20,
    'Food|Dining out':10,
    'Savings or investments|Investment account':13,
    'Personal care|Medical':5,
    'Personal care|Gym':18,
    'Personal care|Hygiene':20
  };
  return samples[`${cat}|${item}`] ?? 0;
}
function sampleActual(cat,item){
  const samples={'Housing|Mortgage or rent':3213};
  return samples[`${cat}|${item}`] ?? 0;
}
function storageKey(){return `poundBudgetTracker:${selectedMonth}`;}
function loadState(){
  try{
    const saved=localStorage.getItem(storageKey());
    return saved ? JSON.parse(saved) : blankState();
  }catch(e){return blankState();}
}
let state=loadState();
function save(){
  localStorage.setItem(storageKey(),JSON.stringify(state));
  renderAll();
}
const num=v=>Number(v)||0;
const sum=a=>a.reduce((x,y)=>x+num(y),0);

function totals(){
  const projectedIncome=sum(state.projectedIncome.map(x=>x.amount));
  const actualIncome=sum(state.actualIncome.map(x=>x.amount));
  const projectedSpend=sum(state.categories.flatMap(c=>c.items.map(i=>i.projected)));
  const actualSpend=sum(state.categories.flatMap(c=>c.items.map(i=>i.actual)));
  return {
    projectedIncome,actualIncome,projectedSpend,actualSpend,
    projectedBalance:projectedIncome-projectedSpend,
    actualBalance:actualIncome-actualSpend,
    balanceDifference:(actualIncome-actualSpend)-(projectedIncome-projectedSpend)
  };
}

function setText(id,val){document.getElementById(id).textContent=val;}
function prettyMonth(key){
  const [y,m]=key.split('-').map(Number);
  return new Date(y,m-1,1).toLocaleDateString('en-GB',{month:'long',year:'numeric'});
}
function renderDashboard(){
  const t=totals();
  setText('projectedIncomeCard',money.format(t.projectedIncome));
  setText('actualIncomeCard',money.format(t.actualIncome));
  setText('projectedSpendCard',money.format(t.projectedSpend));
  setText('actualBalanceCard',money.format(t.actualBalance));
  setText('heroBalance',money.format(t.actualBalance));
  setText('heroMonth',prettyMonth(selectedMonth));
  setText('projectedBalance',money.format(t.projectedBalance));
  setText('actualBalance',money.format(t.actualBalance));
  setText('balanceDifference',money.format(t.balanceDifference));
  styleSigned(document.getElementById('actualBalanceCard'),t.actualBalance);
  styleSigned(document.getElementById('balanceDifference'),t.balanceDifference);

  const pct=t.projectedSpend>0 ? Math.round(t.actualSpend/t.projectedSpend*100) : 0;
  setText('spendPercent',`${pct}%`);
  document.getElementById('spendBar').style.width=`${Math.min(pct,100)}%`;
  setText('actualSpendText',`${money.format(t.actualSpend)} spent`);
  setText('projectedSpendText',`${money.format(t.projectedSpend)} planned`);

  const box=document.getElementById('categorySummary');
  box.innerHTML='';
  state.categories.slice(0,5).forEach(cat=>{
    const p=sum(cat.items.map(i=>i.projected)), a=sum(cat.items.map(i=>i.actual));
    const row=document.createElement('div');
    row.className='summary-row';
    row.innerHTML=`<div><strong>${escapeHtml(cat.name)}</strong><div class="mini">${money.format(a)} actual · ${money.format(p)} planned</div></div><strong>${p?Math.round(a/p*100):0}%</strong>`;
    box.appendChild(row);
  });
}

function renderIncome(){
  renderIncomeList('projectedIncomeRows','projectedIncome','projectedIncomeTotal');
  renderIncomeList('actualIncomeRows','actualIncome','actualIncomeTotal');
}
function renderIncomeList(containerId,key,totalId){
  const box=document.getElementById(containerId);box.innerHTML='';
  state[key].forEach((item,idx)=>{
    const row=document.createElement('div');row.className='input-row';
    row.innerHTML=`
      <input aria-label="Income source" value="${escapeAttr(item.name)}" data-kind="${key}" data-idx="${idx}" data-field="name">
      <input aria-label="Amount" class="money-input" type="number" min="0" step="0.01" value="${num(item.amount)}" data-kind="${key}" data-idx="${idx}" data-field="amount">
      <button class="remove-btn" data-remove-income="${key}" data-idx="${idx}" title="Remove">×</button>`;
    box.appendChild(row);
  });
  setText(totalId,money.format(sum(state[key].map(x=>x.amount))));
}

function renderCategories(){
  const box=document.getElementById('budgetCategories');box.innerHTML='';
  state.categories.forEach((cat,cIdx)=>{
    const card=document.createElement('article');card.className='category-card';
    const projected=sum(cat.items.map(i=>i.projected)), actual=sum(cat.items.map(i=>i.actual));
    let rows=cat.items.map((item,iIdx)=>{
      const diff=num(item.actual)-num(item.projected);
      return `<tr>
        <td><input class="item-name" value="${escapeAttr(item.name)}" data-c="${cIdx}" data-i="${iIdx}" data-field="name"></td>
        <td><input class="money-input" type="number" min="0" step="0.01" value="${num(item.projected)}" data-c="${cIdx}" data-i="${iIdx}" data-field="projected"></td>
        <td><input class="money-input" type="number" min="0" step="0.01" value="${num(item.actual)}" data-c="${cIdx}" data-i="${iIdx}" data-field="actual"></td>
        <td class="diff ${diff>0?'negative':diff<0?'positive':''}">${money.format(diff)}</td>
      </tr>`;
    }).join('');
    card.innerHTML=`
      <div class="category-head">
        <div><div class="category-title">${escapeHtml(cat.name)}</div><small>${money.format(actual)} actual</small></div>
        <button class="remove-btn" data-remove-category="${cIdx}" title="Remove category">×</button>
      </div>
      <table class="budget-table">
        <thead><tr><th>Item</th><th>Projected</th><th>Actual</th><th>Difference</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="category-foot">
        <button class="text-btn" data-add-item="${cIdx}">+ Add item</button>
        <strong>${money.format(projected)} / ${money.format(actual)}</strong>
      </div>`;
    box.appendChild(card);
  });
  const t=totals();
  setText('totalProjectedCost',money.format(t.projectedSpend));
  setText('totalActualCost',money.format(t.actualSpend));
  setText('totalCostDifference',money.format(t.actualSpend-t.projectedSpend));
}

function renderGoals(){
  const box=document.getElementById('goalsGrid');box.innerHTML='';
  if(!state.goals.length){
    box.innerHTML='<article class="panel"><p>No savings goals yet. Add one below when you’re ready.</p></article>';
    return;
  }
  state.goals.forEach((g,idx)=>{
    const pct=num(g.target)>0?Math.min(100,Math.round(num(g.saved)/num(g.target)*100)):0;
    const card=document.createElement('article');card.className='goal-card';
    card.innerHTML=`
      <div class="goal-top"><h3>${escapeHtml(g.name)}</h3><button class="remove-btn" data-remove-goal="${idx}">×</button></div>
      <div class="goal-fields">
        <label><span>Target</span><input type="number" min="0" step="0.01" value="${num(g.target)}" data-goal="${idx}" data-goal-field="target"></label>
        <label><span>Saved</span><input type="number" min="0" step="0.01" value="${num(g.saved)}" data-goal="${idx}" data-goal-field="saved"></label>
      </div>
      <div class="goal-progress"><div style="width:${pct}%"></div></div>
      <div class="goal-meta"><span>${money.format(g.saved)} saved</span><span>${pct}% of ${money.format(g.target)}</span></div>`;
    box.appendChild(card);
  });
}

function renderReview(){
  document.getElementById('reviewWin').value=state.review?.win||'';
  document.getElementById('reviewImprove').value=state.review?.improve||'';
  document.getElementById('reviewGoal').value=state.review?.goal||'';
}
function renderAll(){
  renderDashboard();renderIncome();renderCategories();renderGoals();renderReview();
}
function styleSigned(el,val){
  el.classList.remove('positive','negative');
  if(val>0)el.classList.add('positive');
  if(val<0)el.classList.add('negative');
}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function escapeAttr(s=''){return escapeHtml(s);}

function switchView(view){
  document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===view));
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.view===view));
  const titles={dashboard:'Budget Dashboard',budget:'Monthly Budget',savings:'Savings Goals',review:'Monthly Review'};
  setText('pageTitle',titles[view]);
  window.scrollTo({top:0,behavior:'smooth'});
}

document.addEventListener('click',e=>{
  const nav=e.target.closest('.nav-btn'); if(nav)switchView(nav.dataset.view);
  if(e.target.closest('.jump-budget'))switchView('budget');

  if(e.target.id==='addProjectedIncome'){state.projectedIncome.push({name:'New income',amount:0});save();}
  if(e.target.id==='addActualIncome'){state.actualIncome.push({name:'New income',amount:0});save();}

  const remIncome=e.target.dataset.removeIncome;
  if(remIncome){state[remIncome].splice(Number(e.target.dataset.idx),1);save();}

  if(e.target.dataset.addItem!==undefined){
    const c=Number(e.target.dataset.addItem);
    state.categories[c].items.push({name:'New item',projected:0,actual:0});save();
  }
  if(e.target.dataset.removeCategory!==undefined){
    if(confirm('Remove this category and its items?')){
      state.categories.splice(Number(e.target.dataset.removeCategory),1);save();
    }
  }
  if(e.target.id==='addCategory')openDialog('Add category','Category name',name=>{
    state.categories.push({name,items:[{name:'New item',projected:0,actual:0}]});save();
  });
  if(e.target.id==='addGoal')openDialog('Add savings goal','Goal name',name=>{
    state.goals.push({name,target:500,saved:0});save();
  });
  if(e.target.dataset.removeGoal!==undefined){
    state.goals.splice(Number(e.target.dataset.removeGoal),1);save();
  }
  if(e.target.id==='resetBtn'){
    if(confirm(`Reset all saved data for ${prettyMonth(selectedMonth)}?`)){
      localStorage.removeItem(storageKey());state=blankState();renderAll();
    }
  }
  if(e.target.id==='exportBtn')exportCSV();
});

document.addEventListener('input',e=>{
  if(e.target.dataset.kind){
    const arr=state[e.target.dataset.kind], i=Number(e.target.dataset.idx), field=e.target.dataset.field;
    arr[i][field]=field==='amount'?num(e.target.value):e.target.value;
    localStorage.setItem(storageKey(),JSON.stringify(state));
    renderDashboard();
    if(field==='amount'){
      setText(e.target.dataset.kind==='projectedIncome'?'projectedIncomeTotal':'actualIncomeTotal',
        money.format(sum(arr.map(x=>x.amount))));
    }
  }
  if(e.target.dataset.c!==undefined){
    const item=state.categories[Number(e.target.dataset.c)].items[Number(e.target.dataset.i)];
    const field=e.target.dataset.field;
    item[field]=(field==='projected'||field==='actual')?num(e.target.value):e.target.value;
    localStorage.setItem(storageKey(),JSON.stringify(state));
    // Keep the current expense field focused while typing.
    // Rebuilding the category grid here caused the one-digit/jump-to-top bug.
    renderDashboard();
  }
  if(e.target.dataset.goal!==undefined){
    const g=state.goals[Number(e.target.dataset.goal)];
    g[e.target.dataset.goalField]=num(e.target.value);
    localStorage.setItem(storageKey(),JSON.stringify(state));renderGoals();
  }
  if(['reviewWin','reviewImprove','reviewGoal'].includes(e.target.id)){
    const map={reviewWin:'win',reviewImprove:'improve',reviewGoal:'goal'};
    state.review[map[e.target.id]]=e.target.value;
    localStorage.setItem(storageKey(),JSON.stringify(state));
  }
});

document.addEventListener('change',e=>{
  if(e.target.dataset.c!==undefined){
    renderCategories();
    renderDashboard();
  }
});

const monthInput=document.getElementById('monthSelect');
monthInput.value=selectedMonth;
monthInput.addEventListener('change',()=>{
  selectedMonth=monthInput.value||currentMonthKey();
  state=loadState();renderAll();
});

function openDialog(title,label,onConfirm){
  const d=document.getElementById('simpleDialog'), input=document.getElementById('dialogInput');
  setText('dialogTitle',title);setText('dialogLabelText',label);input.value='';
  d.showModal();input.focus();
  d.addEventListener('close',function handler(){
    d.removeEventListener('close',handler);
    if(d.returnValue==='confirm'&&input.value.trim())onConfirm(input.value.trim());
  });
}

function exportCSV(){
  const rows=[['Month',prettyMonth(selectedMonth)],[],['Income source','Projected / Actual','Amount']];
  state.projectedIncome.forEach(x=>rows.push([x.name,'Projected',x.amount]));
  state.actualIncome.forEach(x=>rows.push([x.name,'Actual',x.amount]));
  rows.push([],['Category','Item','Projected','Actual','Difference']);
  state.categories.forEach(c=>c.items.forEach(i=>rows.push([c.name,i.name,i.projected,i.actual,num(i.actual)-num(i.projected)])));
  const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`budget-${selectedMonth}.csv`;a.click();URL.revokeObjectURL(a.href);
}

renderAll();
