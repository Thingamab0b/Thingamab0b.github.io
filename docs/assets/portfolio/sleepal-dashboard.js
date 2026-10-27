(() => {
  const t = window.portfolioText;
  const demo = document.querySelector('[data-dashboard-demo]');
  if (!demo) return;
  // Constructed demonstration records, never business or customer data.
  // Each variant mirrors aggregates supplied by the original dashboard API.
  const sources = [
    {id:'meta-a',name:'Meta A',category:'ads',base:[1200,420,24],filtered:[700,400,24]},
    {id:'meta-b',name:'Meta B',category:'ads',base:[800,240,8],filtered:[420,220,8]},
    {id:'creator-a',name:'Creator A',category:'kol',base:[400,260,20],filtered:[320,250,20]},
    {id:'ks-discover',name:'KS Discover',category:'platform',base:[600,300,30],filtered:[480,290,30]}
  ];
  const category = demo.querySelector('#demo-category');
  const duration = demo.querySelector('#demo-duration');
  const body = demo.querySelector('[data-demo-rows]');
  const number = value => value.toLocaleString('en-US');
  const percent = (n,d) => (d ? n/d*100 : 0).toFixed(2) + '%';
  let selected = sources[0].id;
  function render() {
    const visible = sources.filter(row => category.value === 'all' || row.category === category.value);
    const data = row => duration.checked ? row.filtered : row.base;
    if (!visible.some(row => row.id === selected)) selected = visible[0].id;
    const totals = visible.reduce((sum,row) => sum.map((v,i) => v+data(row)[i]), [0,0,0]);
    demo.querySelector('[data-demo-total]').textContent = number(totals[0]);
    demo.querySelector('[data-demo-wins]').textContent = number(totals[2]);
    demo.querySelector('[data-demo-rate]').textContent = percent(totals[2],totals[0]);
    body.replaceChildren(...visible.map(row => {
      const [sessions,engaged,wins] = data(row);
      const tr = document.createElement('tr');
      tr.classList.toggle('is-selected',row.id === selected);
      const sourceCell = document.createElement('td');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = row.name;
      button.setAttribute('aria-pressed',String(row.id === selected));
      button.addEventListener('click',() => {
        selected = row.id;
        render();
        body.querySelector(`[data-source="${row.id}"]`).focus({preventScroll:true});
      });
      button.dataset.source = row.id;
      sourceCell.append(button);
      tr.append(sourceCell);
      [number(sessions),percent(sessions-engaged,sessions),percent(wins,sessions)].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        tr.append(cell);
      });
      const shareCell = document.createElement('td');
      const share = document.createElement('div');
      share.className = 'demo-share';
      const bar = document.createElement('i');
      bar.setAttribute('aria-hidden','true');
      const fill = document.createElement('b');
      fill.style.width = percent(sessions,totals[0]);
      bar.append(fill);
      const label = document.createElement('span');
      label.textContent = percent(sessions,totals[0]);
      share.append(bar,label);
      shareCell.append(share);
      tr.append(shareCell);
      return tr;
    }));
    const row = visible.find(row => row.id === selected);
    const [sessions,,wins] = data(row);
    demo.querySelector('[data-demo-detail-label]').textContent = `${row.name} · ${t('完成页比例', 'Completion rate')}`;
    demo.querySelector('[data-demo-equation]').textContent = `${number(wins)} ÷ ${number(sessions)} = ${percent(wins,sessions)}`;
    demo.querySelector('[data-demo-detail-copy]').textContent = duration.checked
      ? t('完成页会话 ÷ 筛选后的来源会话', 'Completion-page sessions ÷ filtered source sessions')
      : t('完成页会话 ÷ 来源会话', 'Completion-page sessions ÷ source sessions');
  }
  category.addEventListener('change',render);
  duration.addEventListener('change',render);
  demo.querySelector('[data-demo-reset]').addEventListener('click',() => {
    category.value = 'all'; duration.checked = false; selected = sources[0].id; render();
  });
  render();
})();
