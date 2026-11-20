const c=(o,s)=>!!o[s],n=(o,s)=>String(o[s]??""),l=(o,s)=>n(o,s).split(",").map(a=>a.trim()).filter(Boolean),t=o=>"'"+o.replaceAll("\\","\\\\").replaceAll("'","\\'")+"'",r=(o,s)=>o+'="'+s.replaceAll('"',"&quot;")+'"',e=o=>o.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),p=(o,s="options")=>"const "+s+` = [
`+o.map(a=>"  { value: "+t(e(a))+", label: "+t(a)+" },").join(`
`)+`
];`,i=o=>o.map(s=>({value:e(s),label:s}));export{r as a,c as b,l as c,i as d,p as o,t as q,n as s};
