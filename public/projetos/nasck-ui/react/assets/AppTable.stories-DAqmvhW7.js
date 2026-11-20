import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,o as n,r}from"./sample-data-DWomN7GM.js";import{n as i,t as a}from"./AppTable-CKrzkUmU.js";var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{i(),n(),{fn:o}=__STORYBOOK_MODULE_TEST__,s={title:`Componentes/AppTable`,component:a,args:{columns:r,data:t,rowKey:`id`,onRowClick:o()},argTypes:{size:{control:`inline-radio`,options:[`small`,`medium`,`large`]}}},c={name:`Padrão`},l={args:{pageSize:3}},u={args:{loading:!0}},d={args:{data:[],emptyText:`Nenhum cliente encontrado. Ajuste os filtros ou cadastre um cliente.`}},f={args:{data:[],emptyText:`Não foi possível carregar os clientes. Verifique a conexão e tente de novo.`}},p=[`Padrao`,`Paginada`,`Carregando`,`Vazio`,`Erro`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Padrão'
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    pageSize: 3
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    data: [],
    emptyText: 'Nenhum cliente encontrado. Ajuste os filtros ou cadastre um cliente.'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    data: [],
    emptyText: 'Não foi possível carregar os clientes. Verifique a conexão e tente de novo.'
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{u as Carregando,f as Erro,c as Padrao,l as Paginada,d as Vazio,p as __namedExportsOrder,s as default};