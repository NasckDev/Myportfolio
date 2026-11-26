import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{o as t}from"./iframe-ONn6A6CR.js";import{n,t as r}from"./AppButton-B8RjBRFQ.js";var i,a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),i=t(),{fn:a}=__STORYBOOK_MODULE_TEST__,o={title:`Componentes/AppButton`,component:r,args:{children:`Salvar alterações`,onClick:a()},argTypes:{variant:{control:`select`,options:[`primary`,`default`,`dashed`,`text`,`link`]},size:{control:`inline-radio`,options:[`small`,`medium`,`large`]},icon:{control:`select`,options:[void 0,`plus`,`download`,`delete`,`edit`,`reload`]},htmlType:{control:`inline-radio`,options:[`button`,`submit`,`reset`]}}},s={name:`Padrão`,args:{variant:`primary`}},c={args:{variant:`primary`,disabled:!0}},l={args:{variant:`primary`,loading:!0,children:`Salvando...`}},u={args:{variant:`primary`,danger:!0,icon:`delete`,children:`Excluir conta`}},d={args:{variant:`dashed`,icon:`plus`,children:`Adicionar primeiro item`}},f={render:e=>(0,i.jsx)(`div`,{style:{display:`flex`,gap:12,flexWrap:`wrap`},children:[`primary`,`default`,`dashed`,`text`,`link`].map(t=>(0,i.jsx)(r,{...e,variant:t,children:t},t))})},p=[`Padrao`,`Desabilitado`,`Carregando`,`Erro`,`Vazio`,`Variantes`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Padrão',
  args: {
    variant: 'primary'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    disabled: true
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    loading: true,
    children: 'Salvando...'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    danger: true,
    icon: 'delete',
    children: 'Excluir conta'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'dashed',
    icon: 'plus',
    children: 'Adicionar primeiro item'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => <div style={{
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  }}>\r
      {(['primary', 'default', 'dashed', 'text', 'link'] as const).map(variant => <AppButton key={variant} {...args} variant={variant}>\r
          {variant}\r
        </AppButton>)}\r
    </div>
}`,...f.parameters?.docs?.source}}}})))()}m();export{l as Carregando,c as Desabilitado,u as Erro,s as Padrao,f as Variantes,d as Vazio,p as __namedExportsOrder,o as default};