import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./AppSelect-CgvWRiLn.js";var r,i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{t(),{fn:r}=__STORYBOOK_MODULE_TEST__,i={title:`Componentes/AppSelect`,component:n,args:{label:`Estado`,placeholder:`Escolha um estado`,options:[{value:`sp`,label:`São Paulo`},{value:`rj`,label:`Rio de Janeiro`},{value:`mg`,label:`Minas Gerais`},{value:`rs`,label:`Rio Grande do Sul`},{value:`ba`,label:`Bahia`},{value:`pr`,label:`Paraná`,disabled:!0}],onChange:r(),onSearch:r()},argTypes:{size:{control:`inline-radio`,options:[`small`,`medium`,`large`]}}},a={name:`Padrão`,args:{value:`sp`}},o={name:`Com busca`,args:{searchable:!0,allowClear:!0,hint:`Digite para filtrar a lista.`}},s={name:`Múltipla`,args:{multiple:!0,value:[`sp`,`rj`],searchable:!0}},c={args:{value:`sp`,disabled:!0}},l={args:{loading:!0,placeholder:`Carregando estados...`}},u={args:{errorMessage:`Escolha um estado para continuar.`}},d={args:{options:[],searchable:!0,emptyText:`Nenhum estado cadastrado`}},f=[`Padrao`,`ComBusca`,`Multipla`,`Desabilitado`,`Carregando`,`Erro`,`Vazio`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Padrão',
  args: {
    value: 'sp'
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Com busca',
  args: {
    searchable: true,
    allowClear: true,
    hint: 'Digite para filtrar a lista.'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Múltipla',
  args: {
    multiple: true,
    value: ['sp', 'rj'],
    searchable: true
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'sp',
    disabled: true
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    placeholder: 'Carregando estados...'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    errorMessage: 'Escolha um estado para continuar.'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    options: [],
    searchable: true,
    emptyText: 'Nenhum estado cadastrado'
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{l as Carregando,o as ComBusca,c as Desabilitado,u as Erro,s as Multipla,a as Padrao,d as Vazio,f as __namedExportsOrder,i as default};