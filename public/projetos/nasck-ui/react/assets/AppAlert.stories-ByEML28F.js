import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./AppAlert-vp6VLnvB.js";var r,i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{t(),{fn:r}=__STORYBOOK_MODULE_TEST__,i={title:`Componentes/AppAlert`,component:n,args:{title:`Sua fatura vence em 3 dias`,description:`Pague até 05/12 para manter o acesso sem interrupção.`,onClose:r()},argTypes:{type:{control:`inline-radio`,options:[`success`,`info`,`warning`,`error`]}}},a={name:`Padrão`,args:{type:`info`}},o={args:{type:`success`,title:`Pagamento confirmado`,description:void 0}},s={args:{type:`warning`,closable:!0}},c={args:{type:`error`,title:`Não conseguimos cobrar o cartão`,description:`Atualize os dados do cartão ou escolha pagar com boleto.`}},l={args:{type:`warning`,banner:!0,title:`Manutenção programada hoje às 22h`}},u={name:`Sem ícone`,args:{showIcon:!1}},d=[`Padrao`,`Sucesso`,`Aviso`,`Erro`,`Faixa`,`SemIcone`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Padrão',
  args: {
    type: 'info'
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'success',
    title: 'Pagamento confirmado',
    description: undefined
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'warning',
    closable: true
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'error',
    title: 'Não conseguimos cobrar o cartão',
    description: 'Atualize os dados do cartão ou escolha pagar com boleto.'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'warning',
    banner: true,
    title: 'Manutenção programada hoje às 22h'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Sem ícone',
  args: {
    showIcon: false
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{s as Aviso,c as Erro,l as Faixa,a as Padrao,u as SemIcone,o as Sucesso,d as __namedExportsOrder,i as default};