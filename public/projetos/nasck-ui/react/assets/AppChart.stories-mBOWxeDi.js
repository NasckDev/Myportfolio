import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,n,o as r,t as i}from"./sample-data-DWomN7GM.js";import{n as a,t as o}from"./AppChart-B5vnCgkG.js";var s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{r(),a(),s={title:`Componentes/AppChart`,component:o,args:{type:`area`,title:`Receita mensal`,categories:i,series:[{name:`Receita`,data:n}],valueFormat:`currency`,ariaLabel:`Receita mensal de junho a novembro, em reais, crescendo de 48 mil para 66 mil`,height:300},argTypes:{type:{control:`inline-radio`,options:[`line`,`area`,`bar`,`pie`]},valueFormat:{control:`inline-radio`,options:[`number`,`currency`,`percent`]},height:{control:{type:`range`,min:160,max:520,step:20}}}},c={name:`Padrão`},l={args:{type:`bar`,title:`Chamados por mês`,series:[{name:`Chamados`,data:t}],valueFormat:`number`,ariaLabel:`Chamados por mês, em queda`}},u={args:{type:`line`,series:[{name:`2025`,data:[41e3,43200,44100,47800,50100,52300]},{name:`2026`,data:n}]}},d={args:{type:`pie`,title:`Clientes por plano`,categories:[`Essencial`,`Profissional`,`Empresarial`],series:[{name:`Clientes`,data:[214,96,31]}],valueFormat:`number`,ariaLabel:`Clientes por plano: 214 Essencial, 96 Profissional, 31 Empresarial`}},f={args:{loading:!0}},p={args:{series:[],emptyText:`Sem receita neste período. Escolha outro intervalo.`}},m=[`Padrao`,`Barras`,`Comparativo`,`Rosca`,`Carregando`,`Vazio`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Padrão'
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'bar',
    title: 'Chamados por mês',
    series: [{
      name: 'Chamados',
      data: TICKETS
    }],
    valueFormat: 'number',
    ariaLabel: 'Chamados por mês, em queda'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'line',
    series: [{
      name: '2025',
      data: [41000, 43200, 44100, 47800, 50100, 52300]
    }, {
      name: '2026',
      data: REVENUE
    }]
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'pie',
    title: 'Clientes por plano',
    categories: ['Essencial', 'Profissional', 'Empresarial'],
    series: [{
      name: 'Clientes',
      data: [214, 96, 31]
    }],
    valueFormat: 'number',
    ariaLabel: 'Clientes por plano: 214 Essencial, 96 Profissional, 31 Empresarial'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    series: [],
    emptyText: 'Sem receita neste período. Escolha outro intervalo.'
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{l as Barras,f as Carregando,u as Comparativo,c as Padrao,d as Rosca,p as Vazio,m as __namedExportsOrder,s as default};