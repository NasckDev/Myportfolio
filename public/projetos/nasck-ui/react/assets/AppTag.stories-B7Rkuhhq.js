import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,r as n,t as r}from"./AppTag-DbEY0sOj.js";import{o as i}from"./iframe-ONn6A6CR.js";var a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),a=i(),{fn:o}=__STORYBOOK_MODULE_TEST__,s={title:`Componentes/AppTag`,component:t,args:{label:`Em análise`,color:`info`,onClose:o()},argTypes:{color:{control:`select`,options:[`default`,`success`,`warning`,`error`,`info`,`processing`]},icon:{control:`select`,options:[void 0,`check`,`warning`,`info`,`bell`]}}},c={name:`Padrão`},l={name:`Fechável`,args:{closable:!0,label:`Filtro: pendentes`}},u={name:`Com ícone`,args:{color:`success`,icon:`check`,label:`Pago`}},d={args:{color:`error`,icon:`warning`,label:`Vencido`}},f={name:`Sem borda`,args:{bordered:!1,color:`warning`,label:`Pendente`}},p={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,gap:24,flexWrap:`wrap`},children:[(0,a.jsx)(r,{status:`success`,label:`Aprovado`}),(0,a.jsx)(r,{status:`warning`,label:`Pendente`}),(0,a.jsx)(r,{status:`error`,label:`Rejeitado`}),(0,a.jsx)(r,{status:`info`,label:`Em análise`}),(0,a.jsx)(r,{status:`processing`,label:`Processando`}),(0,a.jsx)(r,{status:`default`,label:`Rascunho`})]})},m=[`Padrao`,`Fechavel`,`ComIcone`,`Erro`,`SemBorda`,`Status`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Padrão'
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Fechável',
  args: {
    closable: true,
    label: 'Filtro: pendentes'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Com ícone',
  args: {
    color: 'success',
    icon: 'check',
    label: 'Pago'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    color: 'error',
    icon: 'warning',
    label: 'Vencido'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Sem borda',
  args: {
    bordered: false,
    color: 'warning',
    label: 'Pendente'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap'
  }}>\r
      <AppStatus status="success" label="Aprovado" />\r
      <AppStatus status="warning" label="Pendente" />\r
      <AppStatus status="error" label="Rejeitado" />\r
      <AppStatus status="info" label="Em análise" />\r
      <AppStatus status="processing" label="Processando" />\r
      <AppStatus status="default" label="Rascunho" />\r
    </div>
}`,...p.parameters?.docs?.source}}}})))()}h();export{u as ComIcone,d as Erro,l as Fechavel,c as Padrao,f as SemBorda,p as Status,m as __namedExportsOrder,s as default};