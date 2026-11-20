import{n as e}from"./rolldown-runtime-sJBDdmOt.js";var t,n;function r(){return(r=e((()=>{t=e=>({animationDuration:e,animationFillMode:`both`}),n=(e,n,r,i,a=!1)=>{let o=a?`&`:``;return{[`
      ${o}${e}-enter,
      ${o}${e}-appear
    `]:{...t(i),animationPlayState:`paused`},[`${o}${e}-leave`]:{...t(i),animationPlayState:`paused`},[`
      ${o}${e}-enter${e}-enter-active,
      ${o}${e}-appear${e}-appear-active
    `]:{animationName:n,animationPlayState:`running`},[`${o}${e}-leave${e}-leave-active`]:{animationName:r,animationPlayState:`running`,pointerEvents:`none`}}}})))()}export{r as n,n as t};