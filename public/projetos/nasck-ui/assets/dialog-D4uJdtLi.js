import{j as e,B as i,r as l,D as d}from"./index-CzJNKntm.js";import{a as s,s as n}from"./shared-DWIdoH4h.js";function c({destructive:o=!1}){const[t,a]=l.useState(!1),r=l.useRef(null);return e.jsxs(e.Fragment,{children:[e.jsx(i,{variant:o?"danger":"primary",onClick:()=>a(!0),children:o?"Excluir projeto":"Abrir diálogo"}),e.jsx(d,{open:t,onOpenChange:a,role:o?"alertdialog":"dialog",title:o?"Excluir este projeto?":"Convidar pessoas",description:o?"Todos os arquivos e histórico serão apagados. Não dá para desfazer.":"Elas recebem um e-mail com o link de acesso.",initialFocusRef:o?r:void 0,footer:e.jsxs(e.Fragment,{children:[e.jsx(i,{ref:r,variant:"secondary",onClick:()=>a(!1),children:"Cancelar"}),e.jsx(i,{variant:o?"danger":"primary",onClick:()=>a(!1),children:o?"Excluir":"Enviar convites"})]}),children:o?null:"Use Tab e Shift+Tab: o foco fica preso aqui até você fechar com Esc."})]})}const p=[{name:"title",kind:"text",default:"Convidar pessoas"},{name:"description",kind:"text",default:"Elas recebem um e-mail com o link de acesso."},{name:"confirmLabel",kind:"text",default:"Enviar convites"},{name:"role",kind:"select",options:["dialog","alertdialog"],default:"dialog"}];function u({values:o}){const[t,a]=l.useState(!1),r=o.role==="alertdialog";return e.jsxs(e.Fragment,{children:[e.jsx(i,{variant:r?"danger":"primary",onClick:()=>a(!0),children:"Abrir diálogo"}),e.jsx(d,{open:t,onOpenChange:a,role:r?"alertdialog":"dialog",title:n(o,"title")||"Diálogo",description:n(o,"description")||void 0,footer:e.jsxs(e.Fragment,{children:[e.jsx(i,{variant:"secondary",onClick:()=>a(!1),children:"Cancelar"}),e.jsx(i,{variant:r?"danger":"primary",onClick:()=>a(!1),children:n(o,"confirmLabel")||"Confirmar"})]})})]})}const f={slug:"dialog",name:"Dialog",group:"Navegação e sobreposição",summary:"Diálogo modal com foco preso, fundo inerte e retorno de foco ao gatilho.",semantics:'role="dialog" (ou "alertdialog") com aria-modal, aria-labelledby e aria-describedby.',keyboard:[{keys:"Esc",action:"Fecha o diálogo. Se houver um menu, lista ou dica aberta dentro dele, Esc fecha primeiro só essa camada."},{keys:"Tab / Shift+Tab",action:"Circula só entre os controles do diálogo."},{keys:"Clique no fundo",action:"Fecha (conveniência para mouse)."}],aria:["Título vira aria-labelledby; descrição, aria-describedby.","O restante da página recebe inert enquanto o diálogo está aberto.","Ao fechar, o foco volta ao elemento que abriu.",'Use role="alertdialog" e initialFocusRef no botão seguro para confirmações destrutivas.',"Renderizado em portal, fora de qualquer overflow ou stacking context."],props:[{name:"open / onOpenChange",type:"boolean / (open: boolean) => void",description:"Estado controlado (obrigatório)."},{name:"title",type:"ReactNode",description:"Título (obrigatório)."},{name:"description / footer",type:"ReactNode",description:"Texto de apoio e área de ações."},{name:"initialFocusRef",type:"RefObject<HTMLElement>",description:"Elemento focado ao abrir."},{name:"role",type:"'dialog' | 'alertdialog'",description:"Padrão: dialog."},{name:"closeLabel",type:"string",description:'Nome do botão de fechar. Padrão: "Fechar".'}],demos:[{title:"Diálogo simples",preview:e.jsx(c,{}),code:`const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Convidar pessoas"
  description="Elas recebem um e-mail com o link de acesso."
  footer={<Button onClick={() => setOpen(false)}>Enviar convites</Button>}
>
  Conteúdo
</Dialog>`},{title:"Confirmação destrutiva",note:"alertdialog com o foco inicial no botão seguro (Cancelar).",preview:e.jsx(c,{destructive:!0}),code:`const [open, setOpen] = useState(false);
const cancelRef = useRef<HTMLButtonElement>(null);

<Button variant="danger" onClick={() => setOpen(true)}>Excluir projeto</Button>
<Dialog
  open={open}
  onOpenChange={setOpen}
  role="alertdialog"
  title="Excluir este projeto?"
  description="Todos os arquivos e histórico serão apagados."
  initialFocusRef={cancelRef}
  footer={
    <>
      <Button ref={cancelRef} variant="secondary" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button variant="danger" onClick={() => setOpen(false)}>
        Excluir
      </Button>
    </>
  }
/>`}],playground:{controls:p,render:o=>e.jsx(u,{values:o}),code:o=>{const t=o.role==="alertdialog";return["const [open, setOpen] = useState(false);","","<Button onClick={() => setOpen(true)}>Abrir diálogo</Button>","<Dialog","  open={open}","  onOpenChange={setOpen}",t?'  role="alertdialog"':"","  "+s("title",n(o,"title")),n(o,"description")?"  "+s("description",n(o,"description")):"","  footer={","    <>",'      <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>','      <Button variant="'+(t?"danger":"primary")+'" onClick={() => setOpen(false)}>',"        "+n(o,"confirmLabel"),"      </Button>","    </>","  }","/>"].filter(a=>a!=="").join(`
`)}},anatomyStage:e.jsxs("div",{className:"nui-dialog",style:{animation:"none",maxWidth:"24rem"},children:[e.jsx("header",{className:"nui-dialog__header",children:e.jsx("h3",{className:"nui-dialog__title",children:"Excluir projeto?"})}),e.jsx("p",{className:"nui-dialog__description",children:"Isso apaga os arquivos e não dá para desfazer."}),e.jsx("div",{className:"nui-dialog__body",children:"Conteúdo opcional."}),e.jsxs("footer",{className:"nui-dialog__footer",children:[e.jsx(i,{variant:"secondary",size:"sm",tabIndex:-1,children:"Cancelar"}),e.jsx(i,{variant:"danger",size:"sm",tabIndex:-1,children:"Excluir"})]})]}),anatomy:[{label:"Título",description:"Nomeia o diálogo (aria-labelledby).",selector:".nui-dialog__title"},{label:"Descrição",description:"Contexto lido ao abrir (aria-describedby).",selector:".nui-dialog__description"},{label:"Rodapé",description:"Ações; a destrutiva nunca recebe o foco inicial.",selector:".nui-dialog__footer"}],dos:[{text:"Use alertdialog para confirmações destrutivas e foque Cancelar."},{text:"Devolva o foco a quem abriu ao fechar (já é automático)."}],donts:[{text:"Não abra diálogos sem ação do usuário."},{text:"Não empilhe um diálogo dentro de outro."}]};export{f as doc};
