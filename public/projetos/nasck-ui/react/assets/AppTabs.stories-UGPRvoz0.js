import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./AppTabs-CyqMIQdj.js";var r,i,a,o,s,c;function l(){return(l=e((()=>{t(),{fn:r}=__STORYBOOK_MODULE_TEST__,i={title:`Componentes/AppTabs`,component:n,args:{items:[{key:`geral`,label:`Visão geral`,content:`Resumo da conta e atividade recente.`},{key:`cobrancas`,label:`Cobranças`,content:`Faturas pagas e em aberto.`},{key:`equipe`,label:`Equipe`,content:`Pessoas com acesso à conta.`},{key:`api`,label:`Integrações`,content:`Chaves e webhooks.`,disabled:!0}],activeKey:`geral`,onChange:r()},argTypes:{type:{control:`inline-radio`,options:[`line`,`card`]},size:{control:`inline-radio`,options:[`small`,`medium`,`large`]}}},a={name:`Padrão`},o={name:`Cartão`,args:{type:`card`}},s={args:{items:[{key:`geral`,label:`Visão geral`}]}},c=[`Padrao`,`Cartao`,`Vazio`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Padrão'
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Cartão',
  args: {
    type: 'card'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      key: 'geral',
      label: 'Visão geral'
    }]
  }
}`,...s.parameters?.docs?.source}}}})))()}l();export{o as Cartao,a as Padrao,s as Vazio,c as __namedExportsOrder,i as default};