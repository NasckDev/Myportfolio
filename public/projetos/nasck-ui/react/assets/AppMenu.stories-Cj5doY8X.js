import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./menu-BotnpaeG.js";import{i as r,r as i}from"./shared-caNgZEEa.js";import{o as a}from"./iframe-BpuUmYWF.js";function o({items:e,selectedKey:t,mode:i=`inline`,collapsed:a=!1,onSelect:o}){return(0,s.jsx)(n,{mode:i,inlineCollapsed:i===`inline`?a:void 0,selectedKeys:t?[t]:[],items:e.map(e=>({key:e.key,label:e.label,icon:r(e.icon),disabled:e.disabled,danger:e.danger})),onClick:({key:e})=>o?.(e)})}var s;function c(){return(c=e((()=>{t(),i(),s=a(),o.__docgenInfo={description:``,methods:[],displayName:`AppMenu`,props:{items:{required:!0,tsType:{name:`Array`,elements:[{name:`MenuItem`}],raw:`MenuItem[]`},description:``},selectedKey:{required:!1,tsType:{name:`string`},description:``},mode:{required:!1,tsType:{name:`union`,raw:`'inline' | 'horizontal' | 'vertical'`,elements:[{name:`literal`,value:`'inline'`},{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'vertical'`}]},description:``,defaultValue:{value:`'inline'`,computed:!1}},collapsed:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},onSelect:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(key: string) => void`,signature:{arguments:[{type:{name:`string`},name:`key`}],return:{name:`void`}}},description:``}}}})))()}var l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{c(),l=a(),{fn:u}=__STORYBOOK_MODULE_TEST__,d={title:`Componentes/AppMenu`,component:o,args:{items:[{key:`inicio`,label:`Início`,icon:`home`},{key:`clientes`,label:`Clientes`,icon:`user`},{key:`avisos`,label:`Avisos`,icon:`bell`},{key:`ajustes`,label:`Ajustes`,icon:`setting`},{key:`faturamento`,label:`Faturamento`,icon:`mail`,disabled:!0}],selectedKey:`clientes`,onSelect:u()},argTypes:{mode:{control:`inline-radio`,options:[`inline`,`horizontal`,`vertical`]}},decorators:[e=>(0,l.jsx)(`div`,{style:{maxWidth:260},children:(0,l.jsx)(e,{})})]},f={name:`Padrão`},p={args:{collapsed:!0}},m={args:{mode:`horizontal`},decorators:[e=>(0,l.jsx)(`div`,{style:{maxWidth:640},children:(0,l.jsx)(e,{})})]},h={args:{items:[],selectedKey:void 0}},g=[`Padrao`,`Recolhido`,`Horizontal`,`Vazio`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Padrão'
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    collapsed: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'horizontal'
  },
  decorators: [Story => <div style={{
    maxWidth: 640
  }}>\r
        <Story />\r
      </div>]
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    items: [],
    selectedKey: undefined
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{m as Horizontal,f as Padrao,p as Recolhido,h as Vazio,g as __namedExportsOrder,d as default};