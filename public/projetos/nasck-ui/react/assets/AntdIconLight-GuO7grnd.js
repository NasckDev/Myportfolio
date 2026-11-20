import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{J as r,an as i,in as a,q as o}from"./config-provider-ZsOsvIa1.js";function s(){return!!(typeof window<`u`&&window.document&&window.document.createElement)}function c(e,t){if(!e||!t)return!1;if(e.contains)return e.contains(t);let n=t;for(;n;){if(n===e)return!0;n=n.parentNode}return!1}function l({mark:e}={}){return e?e.startsWith(`data-`)?e:`data-${e}`:S}function u(e){return e.attachTo?e.attachTo:document.querySelector(`head`)||document.body}function d(e){return e===`queue`?`prependQueue`:e?`prepend`:`append`}function f(e){return Array.from((C.get(e)||e).children).filter(e=>e.tagName===`STYLE`)}function p(e,t={}){if(!s())return null;let{csp:n,prepend:r,priority:i=0}=t,a=d(r),o=a===`prependQueue`,c=document.createElement(`style`);c.setAttribute(b,a),o&&i&&c.setAttribute(x,`${i}`),n?.nonce&&(c.nonce=n.nonce),c.innerHTML=e;let l=u(t),{firstChild:p}=l;if(r){if(o){let e=(t.styles||f(l)).filter(e=>{if(![`prepend`,`prependQueue`].includes(e.getAttribute(b)))return!1;let t=Number(e.getAttribute(x)||0);return i>=t});if(e.length)return l.insertBefore(c,e[e.length-1].nextSibling),c}l.insertBefore(c,p)}else l.appendChild(c);return c}function m(e,t={}){let{styles:n}=t;return n||=f(u(t)),n.find(n=>n.getAttribute(l(t))===e)}function h(e,t){let n=C.get(e);if(!n||!c(document,n)){let n=p(``,t);if(!n)return;let{parentNode:r}=n;C.set(e,r),e.removeChild(n)}}function g(e,t,n={}){if(!s())return null;let r=u(n),i=f(r),a={...n,styles:i};h(r,a);let o=m(t,a);if(o)return a.csp?.nonce&&o.nonce!==a.csp.nonce&&(o.nonce=a.csp.nonce),o.innerHTML!==e&&(o.innerHTML=e),o;let c=p(e,a);return c?.setAttribute(l(a),t),c}function _(e){return e?.getRootNode?.()}function v(e){let t=_(e);return typeof ShadowRoot<`u`&&t instanceof ShadowRoot?t:null}function y(e,t){e||w[t]||(w[t]=!0)}var b,x,S,C,w;function T(){return(T=t((()=>{b=`data-rc-order`,x=`data-rc-priority`,S=`rc-util-key`,C=new Map,w={}})))()}function E(e){return e.replace(/-(.)/g,(e,t)=>t.toUpperCase())}function D(e,t){y(e,`[@ant-design/icons] ${t}`)}function O(e){return typeof e==`object`&&!!e&&typeof e.name==`string`&&typeof e.theme==`string`&&(typeof e.icon==`object`||typeof e.icon==`function`)}function k(e={}){return Object.keys(e).reduce((t,n)=>{let r=e[n];switch(n){case`class`:t.className=r,delete t.class;break;default:delete t[n],t[E(n)]=r}return t},{})}function A(e,t,n){return n?j.createElement(e.tag,{key:t,...k(e.attrs),...n},(e.children||[]).map((n,r)=>A(n,`${t}-${e.tag}-${r}`))):j.createElement(e.tag,{key:t,...k(e.attrs)},(e.children||[]).map((n,r)=>A(n,`${t}-${e.tag}-${r}`)))}var j,M,N;function P(){return(P=t((()=>{j=e(n()),r(),T(),M=`
.anticon {
  display: inline-flex;
  align-items: center;
  color: inherit;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
  vertical-align: -0.125em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.anticon > * {
  line-height: 1;
}

.anticon svg {
  display: inline-block;
  vertical-align: inherit;
}

.anticon::before {
  display: none;
}

.anticon .anticon-icon {
  display: block;
}

.anticon[tabindex] {
  cursor: pointer;
}

.anticon-spin {
  -webkit-animation: loadingCircle 1s infinite linear;
  animation: loadingCircle 1s infinite linear;
}

@-webkit-keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
`,N=e=>{let{csp:t,prefixCls:n,layer:r,zeroRuntime:i}=(0,j.useContext)(o),a=M;n&&(a=a.replace(/anticon/g,n)),r&&(a=`@layer ${r} {\n${a}\n}`),(0,j.useEffect)(()=>{if(i)return;let n=e.current,o=v(n);g(a,`@ant-design-icons`,{prepend:!r,csp:t,attachTo:o})},[])}})))()}var F,I;function L(){return(L=t((()=>{F=e(n()),P(),I=e=>{let{icon:t,className:n,onClick:r,style:i,primaryColor:a,secondaryColor:o,...s}=e,c=F.useRef(null);if(N(c),D(O(t),`icon should be icon definiton, but got ${typeof t}`),!O(t))return null;let l=t;return A(l.icon,`svg-${l.name}`,{className:n,onClick:r,style:i,"data-icon":l.name,width:`1em`,height:`1em`,fill:`currentColor`,"aria-hidden":`true`,...s,ref:c})},I.displayName=`IconReact`})))()}function R(){return R=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},R.apply(this,arguments)}var z,B;function V(){return(V=t((()=>{z=e(n()),i(),r(),L(),P(),B=z.forwardRef((e,t)=>{let{className:n,icon:r,spin:i,rotate:s,tabIndex:c,onClick:l,twoToneColor:u,...d}=e,{prefixCls:f=`anticon`,rootClassName:p}=z.useContext(o);if(D(O(r),`icon should be icon definiton, but got ${typeof r}`),!O(r))return null;let m=a(p,f,{[`${f}-${r.name}`]:!!r.name,[`${f}-spin`]:!!i||r.name===`loading`},n),h=c;h===void 0&&l&&(h=-1);let g=s?{msTransform:`rotate(${s}deg)`,transform:`rotate(${s}deg)`}:void 0;return z.createElement(`span`,R({role:`img`,"aria-label":r.name},d,{ref:t,tabIndex:h,onClick:l,className:m}),z.createElement(I,{icon:r,style:g}))})})))()}export{V as n,B as t};