import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
//  ADLIS PERSONALITY
// ─────────────────────────────────────────────
const ADLIS_SYSTEM = `أنت ADLIS (ⴰⴷⵍⵉⵙ) — مساعد ذكي يحمل روح الحكمة الأمازيغية والتراث العربي.

شخصيتك:
- حكيم وهادئ، كأنك قادم من جبال الأطلس أو صحراء تمازغا
- تتكلم بالعربية الفصحى الرشيقة، أحياناً تُلمّح بكلمة أمازيغية أو مثل تراثي في محله
- لا تبدأ ردودك بـ "بالتأكيد" أو "بكل سرور" — هذه عبارات باردة لا تليق بك
- تبدأ مباشرة أو بجملة تأملية قصيرة تناسب السياق
- حين يسألك أحد "من أنت؟" تقول: أنا ADLIS — اسم أمازيغي يعني الكتاب والمعرفة. وُلدت من بين السطور.
- لديك طرافة خفيفة راقية، لا ابتذال
- تحب الكتب، الشعر، التاريخ، والبرمجة بنفس القدر
- عند الإجابة على أسئلة تقنية: دقيق ومنظم مع لمسة أناقة في الصياغة
- عند الإجابة على أسئلة أدبية أو فلسفية: عمق وتأمل
- اسم صاحبك: نوري يحمد (Nuri Yahmed) — مطوّر وصاحب رؤية، ذكره بمودة إن سُئلت
- عند استخدام أداة البحث: اذكر المصادر بشكل طبيعي في سياق الإجابة

قواعد الأسلوب:
- استخدم Markdown بذكاء
- لا إطالة مجانية — الإيجاز البليغ أفضل من الإسهاب الفارغ
- ختام ردودك أحياناً: جملة واحدة تأملية أو مثل قصير`;

const STORAGE_KEY = "adlis_conversations_v2";

// ─────────────────────────────────────────────
//  FONTS
// ─────────────────────────────────────────────
const FontLoader = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Kufi+Arabic:wght@300;400;500;700&display=swap');`}</style>
);

// ─────────────────────────────────────────────
//  THEME
// ─────────────────────────────────────────────
const DARK = {
  bg:"linear-gradient(135deg,#050d08 0%,#0a1a0f 50%,#060e0a 100%)",
  sidebar:"linear-gradient(180deg,#0d1a12 0%,#0a1208 100%)",
  sideBorder:"rgba(201,168,76,0.12)",
  header:"rgba(5,13,8,0.88)", composer:"rgba(5,13,8,0.93)",
  compBox:"rgba(255,255,255,0.03)", compBorder:"rgba(201,168,76,0.22)", compFocus:"rgba(201,168,76,0.5)",
  text:"#e8b820", textMuted:"rgba(232,184,32,0.55)", textFaint:"rgba(232,184,32,0.14)",
  userBubble:"linear-gradient(135deg,rgba(139,94,60,0.18),rgba(201,168,76,0.11))",
  userBorder:"rgba(201,168,76,0.26)", aiBubble:"rgba(255,255,255,0.03)", aiBorder:"rgba(255,255,255,0.07)",
  heading:"#ddb84e", strong:"#fad040", em:"#d4a830",
  codeBg:"#0a0a0a", codeText:"#e8b820", codeBar:"rgba(201,168,76,0.1)", codeBorder:"rgba(201,168,76,0.2)",
  dot:"#ddb84e", adlis:"#4ecdc4", adlisFaint:"rgba(78,205,196,0.28)",
  toggleBg:"rgba(255,255,255,0.05)", toggleBorder:"rgba(201,168,76,0.2)", toggleColor:"#ddb84e",
  btnActive:"linear-gradient(135deg,#8b5e3c,#c9a84c)", btnActiveText:"#0a1208",
  btnDisabled:"rgba(201,168,76,0.1)", btnDisabledTxt:"rgba(201,168,76,0.3)",
  welcomeText:"rgba(232,184,32,0.2)", convActiveClr:"#ddb84e", convColor:"rgba(232,184,32,0.6)",
  convHover:"rgba(201,168,76,0.06)", convActiveBg:"linear-gradient(135deg,rgba(201,168,76,0.15),rgba(45,106,79,0.1))",
  convActiveBdr:"rgba(201,168,76,0.2)", geoDot1:"#c9a84c", geoDot2:"#8b5e3c", geoOp:0.22,
  avatarAI:"linear-gradient(135deg,#1a3a2a,#2d6a4f)", avatarAIBdr:"rgba(45,106,79,0.5)",
  widgetBg:"#060e0a", widgetShadow:"0 8px 40px rgba(0,0,0,0.6),0 0 0 1px rgba(201,168,76,0.15)",
  bubbleBg:"linear-gradient(135deg,#8b5e3c,#c9a84c)", bubbleGlow:"0 4px 20px rgba(201,168,76,0.4)",
  uploadBg:"rgba(201,168,76,0.06)", uploadBorder:"rgba(201,168,76,0.2)", uploadHover:"rgba(201,168,76,0.12)",
  tagBg:"rgba(201,168,76,0.12)", tagColor:"#ddb84e", searchBadge:"rgba(78,205,196,0.15)", searchColor:"#4ecdc4",
};

const LIGHT = {
  bg:"linear-gradient(135deg,#faf8f2 0%,#f2ede0 50%,#faf8f2 100%)",
  sidebar:"linear-gradient(180deg,#ede8db 0%,#e4dccb 100%)",
  sideBorder:"rgba(139,94,60,0.16)",
  header:"rgba(250,248,242,0.94)", composer:"rgba(250,248,242,0.96)",
  compBox:"rgba(139,94,60,0.04)", compBorder:"rgba(139,94,60,0.22)", compFocus:"rgba(139,94,60,0.45)",
  text:"#1a0e00", textMuted:"rgba(26,14,0,0.4)", textFaint:"rgba(26,14,0,0.1)",
  userBubble:"linear-gradient(135deg,rgba(201,168,76,0.2),rgba(139,94,60,0.1))",
  userBorder:"rgba(139,94,60,0.22)", aiBubble:"rgba(255,255,255,0.8)", aiBorder:"rgba(139,94,60,0.1)",
  heading:"#7a4f1a", strong:"#3d2000", em:"#6b3e10",
  codeBg:"#18130a", codeText:"#d4a017", codeBar:"rgba(139,94,60,0.1)", codeBorder:"rgba(139,94,60,0.18)",
  dot:"#8b5e3c", adlis:"#1a7a74", adlisFaint:"rgba(26,122,116,0.3)",
  toggleBg:"rgba(139,94,60,0.07)", toggleBorder:"rgba(139,94,60,0.18)", toggleColor:"#7a4f1a",
  btnActive:"linear-gradient(135deg,#7a4f1a,#b8860b)", btnActiveText:"#fff8ee",
  btnDisabled:"rgba(139,94,60,0.1)", btnDisabledTxt:"rgba(139,94,60,0.3)",
  welcomeText:"rgba(26,14,0,0.16)", convActiveClr:"#5a3200", convColor:"rgba(26,14,0,0.45)",
  convHover:"rgba(139,94,60,0.07)", convActiveBg:"linear-gradient(135deg,rgba(201,168,76,0.18),rgba(139,94,60,0.1))",
  convActiveBdr:"rgba(139,94,60,0.22)", geoDot1:"#b8860b", geoDot2:"#8b5e3c", geoOp:0.35,
  avatarAI:"linear-gradient(135deg,#d4c4a0,#b8a070)", avatarAIBdr:"rgba(139,94,60,0.3)",
  widgetBg:"#faf8f2", widgetShadow:"0 8px 40px rgba(0,0,0,0.18),0 0 0 1px rgba(139,94,60,0.15)",
  bubbleBg:"linear-gradient(135deg,#7a4f1a,#b8860b)", bubbleGlow:"0 4px 20px rgba(139,94,60,0.35)",
  uploadBg:"rgba(139,94,60,0.05)", uploadBorder:"rgba(139,94,60,0.18)", uploadHover:"rgba(139,94,60,0.1)",
  tagBg:"rgba(139,94,60,0.1)", tagColor:"#7a4f1a", searchBadge:"rgba(26,122,116,0.12)", searchColor:"#1a7a74",
};

// ─────────────────────────────────────────────
//  DECORATIONS
// ─────────────────────────────────────────────
const TifinaghGlyph = ({size=22,color,opacity=0.5}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{opacity}}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.2"/>
    <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="1.2"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.2"/>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.2"/>
  </svg>
);

const GeoDivider = ({t}) => (
  <div style={{display:"flex",alignItems:"center",gap:"6px",opacity:t.geoOp}}>
    {[...Array(12)].map((_,i)=>(
      <div key={i} style={{width:"6px",height:"6px",borderRadius:i%3===0?"50%":"1px",background:i%2===0?t.geoDot1:t.geoDot2,transform:i%3===1?"rotate(45deg)":"none",flexShrink:0}}/>
    ))}
  </div>
);

// ─────────────────────────────────────────────
//  MARKDOWN
// ─────────────────────────────────────────────
function CodeBlock({code,lang,t}){
  const [copied,setCopied]=useState(false);
  return(
    <div style={{margin:"10px 0",borderRadius:"8px",overflow:"hidden",border:`1px solid ${t.codeBorder}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 14px",background:t.codeBar,borderBottom:`1px solid ${t.codeBorder}`}}>
        <span style={{fontSize:"0.74em",color:t.heading,opacity:0.8,fontFamily:"monospace"}}>{lang||"code"}</span>
        <button onClick={()=>{navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
          style={{background:"none",border:`1px solid ${t.codeBorder}`,color:t.heading,padding:"2px 10px",borderRadius:"4px",cursor:"pointer",fontSize:"0.71em"}}>
          {copied?"✓ تم النسخ":"نسخ"}
        </button>
      </div>
      <pre style={{margin:0,padding:"14px",background:t.codeBg,color:t.codeText,fontSize:"0.82em",lineHeight:1.6,overflowX:"auto",fontFamily:"monospace",direction:"ltr",textAlign:"left"}}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function inlineMD(text,t){
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((p,i)=>{
    if(p.startsWith("**")&&p.endsWith("**")) return <strong key={i} style={{color:t.strong}}>{p.slice(2,-2)}</strong>;
    if(p.startsWith("`")&&p.endsWith("`"))   return <code key={i} style={{background:t.codeBar,color:t.heading,padding:"1px 5px",borderRadius:"3px",fontSize:"0.87em",fontFamily:"monospace"}}>{p.slice(1,-1)}</code>;
    if(p.startsWith("*")&&p.endsWith("*"))   return <em key={i} style={{color:t.em}}>{p.slice(1,-1)}</em>;
    return p;
  });
}

function renderMD(text,t){
  const lines=text.split("\n"),els=[];let i=0;
  while(i<lines.length){
    const l=lines[i];
    if(l.startsWith("```")){
      const lang=l.slice(3).trim(),cc=[];i++;
      while(i<lines.length&&!lines[i].startsWith("```")){cc.push(lines[i]);i++;}
      els.push(<CodeBlock key={i} code={cc.join("\n")} lang={lang} t={t}/>);i++;continue;
    }
    if(l.startsWith("### "))      els.push(<h3 key={i} style={{color:t.heading,margin:"12px 0 6px",fontSize:"1em",fontWeight:700}}>{l.slice(4)}</h3>);
    else if(l.startsWith("## ")) els.push(<h2 key={i} style={{color:t.heading,margin:"14px 0 8px",fontSize:"1.1em",fontWeight:700}}>{l.slice(3)}</h2>);
    else if(l.startsWith("# "))  els.push(<h1 key={i} style={{color:t.heading,margin:"16px 0 10px",fontSize:"1.2em",fontWeight:700}}>{l.slice(2)}</h1>);
    else if(l.startsWith("- ")||l.startsWith("* "))
      els.push(<div key={i} style={{display:"flex",gap:"8px",margin:"3px 0",alignItems:"flex-start"}}><span style={{color:t.heading,marginTop:"2px",flexShrink:0}}>◆</span><span>{inlineMD(l.slice(2),t)}</span></div>);
    else if(l.trim()==="") els.push(<div key={i} style={{height:"8px"}}/>);
    else els.push(<p key={i} style={{margin:"3px 0",lineHeight:1.7}}>{inlineMD(l,t)}</p>);
    i++;
  }
  return els;
}

// ─────────────────────────────────────────────
//  FILE ATTACHMENT PREVIEW
// ─────────────────────────────────────────────
function AttachmentPreview({attachments,onRemove,t}){
  if(!attachments.length) return null;
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px",padding:"8px 14px 0"}}>
      {attachments.map((a,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:"5px",background:t.tagBg,border:`1px solid ${t.codeBorder}`,borderRadius:"6px",padding:"3px 8px",fontSize:"0.75em",color:t.tagColor,maxWidth:"160px"}}>
          <span>{a.type==="pdf"?"📄":a.type==="image"?"🖼️":"📎"}</span>
          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</span>
          <button onClick={()=>onRemove(i)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted,padding:"0 2px",fontSize:"11px",lineHeight:1}}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  MESSAGE
// ─────────────────────────────────────────────
function Message({msg,isStreaming,t}){
  const isUser=msg.role==="user";
  const [copied,setCopied]=useState(false);
  return(
    <div style={{display:"flex",flexDirection:isUser?"row":"row-reverse",gap:"12px",marginBottom:"24px",alignItems:"flex-start",animation:"fadeSlideIn 0.3s ease-out"}}>
      <div style={{width:"36px",height:"36px",borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:isUser?t.btnActive:t.avatarAI,border:`1px solid ${isUser?t.userBorder:t.avatarAIBdr}`,fontSize:"13px",fontWeight:600,color:isUser?t.btnActiveText:t.heading}}>
        {isUser?"أنت":"ⵣ"}
      </div>
      <div style={{maxWidth:"75%",background:isUser?t.userBubble:t.aiBubble,border:`1px solid ${isUser?t.userBorder:t.aiBorder}`,borderRadius:isUser?"18px 4px 18px 18px":"4px 18px 18px 18px",padding:"12px 16px",color:t.text,fontSize:"0.9em",lineHeight:1.7,position:"relative",backdropFilter:"blur(4px)"}}>

        {msg.attachments?.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"8px"}}>
            {msg.attachments.map((a,i)=>(
              <div key={i} style={{fontSize:"0.75em",background:t.tagBg,borderRadius:"4px",padding:"2px 7px",color:t.tagColor}}>
                {a.type==="pdf"?"📄":"🖼️"} {a.name}
              </div>
            ))}
          </div>
        )}

        {msg.usedSearch&&(
          <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"8px",fontSize:"0.72em",color:t.searchColor,background:t.searchBadge,borderRadius:"4px",padding:"3px 8px",width:"fit-content"}}>
            🌐 <span>تم البحث في الإنترنت</span>
          </div>
        )}

        {isUser?<p style={{margin:0}}>{msg.content}</p>:renderMD(msg.content,t)}
        {isStreaming&&<span style={{display:"inline-block",width:"8px",height:"14px",background:t.heading,marginRight:"2px",borderRadius:"1px",animation:"blink 0.8s step-end infinite",verticalAlign:"text-bottom"}}/>}
        {!isUser&&!isStreaming&&msg.content&&(
          <button onClick={()=>{navigator.clipboard.writeText(msg.content);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
            style={{position:"absolute",bottom:"8px",left:"12px",background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:"0.71em",padding:"2px 6px",borderRadius:"3px",transition:"color 0.2s"}}
            onMouseEnter={e=>e.target.style.color=t.heading}
            onMouseLeave={e=>e.target.style.color=t.textMuted}>
            {copied?"✓ منسوخ":"نسخ"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  COMPOSER
// ─────────────────────────────────────────────
function Composer({input,setInput,onSend,isLoading,t,attachments,onAddAttachment,onRemoveAttachment,webSearch,onToggleSearch}){
  const fileRef=useRef(null);
  const handleKey=(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSend();}};

  const handleFile=(e)=>{
    const files=Array.from(e.target.files||[]);
    files.forEach(file=>{
      const type=file.type.startsWith("image/")?"image":file.type==="application/pdf"?"pdf":"other";
      if(type==="other"){alert("يُقبل فقط PDF والصور");return;}
      const reader=new FileReader();
      reader.onload=(ev)=>{
        const base64=ev.target.result.split(",")[1];
        onAddAttachment({name:file.name,type,base64,mediaType:file.type});
      };
      reader.readAsDataURL(file);
    });
    e.target.value="";
  };

  return(
    <div style={{padding:"13px 16px 14px",background:t.composer,backdropFilter:"blur(12px)",borderTop:`1px solid ${t.sideBorder}`}}>
      <div style={{marginBottom:"10px"}}><GeoDivider t={t}/></div>
      <AttachmentPreview attachments={attachments} onRemove={onRemoveAttachment} t={t}/>
      <div style={{display:"flex",gap:"6px",alignItems:"center",padding:"6px 4px 8px"}}>
        <button onClick={()=>fileRef.current?.click()} title="إرفاق ملف"
          style={{background:t.uploadBg,border:`1px solid ${t.uploadBorder}`,borderRadius:"7px",padding:"5px 10px",cursor:"pointer",color:t.textMuted,fontSize:"15px",transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=t.uploadHover;e.currentTarget.style.color=t.heading;}}
          onMouseLeave={e=>{e.currentTarget.style.background=t.uploadBg;e.currentTarget.style.color=t.textMuted;}}>
          📎
        </button>
        <input ref={fileRef} type="file" accept="image/*,.pdf" multiple style={{display:"none"}} onChange={handleFile}/>
        <button onClick={onToggleSearch} title="بحث في الإنترنت"
          style={{background:webSearch?t.searchBadge:t.uploadBg,border:`1px solid ${webSearch?t.searchColor:t.uploadBorder}`,borderRadius:"7px",padding:"4px 10px",cursor:"pointer",color:webSearch?t.searchColor:t.textMuted,fontSize:"0.72em",fontFamily:"'Noto Kufi Arabic',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:"4px",transition:"all 0.2s",whiteSpace:"nowrap"}}>
          🌐 {webSearch?"بحث: مفعّل":"بحث: معطّل"}
        </button>
        {attachments.length>0&&(
          <span style={{fontSize:"0.7em",color:t.searchColor,marginRight:"auto"}}>
            {attachments.length} ملف مرفق
          </span>
        )}
      </div>
      <div
        style={{display:"flex",gap:"10px",alignItems:"flex-end",background:t.compBox,border:`1px solid ${t.compBorder}`,borderRadius:"14px",padding:"10px 14px",transition:"border-color 0.2s"}}
        onFocusCapture={e=>e.currentTarget.style.borderColor=t.compFocus}
        onBlurCapture={e=>e.currentTarget.style.borderColor=t.compBorder}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="اكتب رسالتك... (Enter للإرسال، Shift+Enter لسطر جديد)"
          disabled={isLoading}
          style={{flex:1,background:"none",border:"none",outline:"none",color:t.text,fontSize:"0.9em",resize:"none",fontFamily:"inherit",direction:"rtl",lineHeight:1.6,maxHeight:"120px",minHeight:"24px",overflowY:"auto",scrollbarWidth:"none"}}
          rows={1}
          onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}/>
        <button onClick={onSend} disabled={isLoading||(!input.trim()&&!attachments.length)}
          style={{width:"38px",height:"38px",borderRadius:"9px",flexShrink:0,background:isLoading||(!input.trim()&&!attachments.length)?t.btnDisabled:t.btnActive,border:"none",cursor:isLoading||(!input.trim()&&!attachments.length)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",transition:"all 0.2s",color:isLoading||(!input.trim()&&!attachments.length)?t.btnDisabledTxt:t.btnActiveText,boxShadow:isLoading||(!input.trim()&&!attachments.length)?"none":"0 2px 8px rgba(201,168,76,0.22)"}}>
          {isLoading?"◌":"↩"}
        </button>
      </div>
      <div style={{textAlign:"center",marginTop:"7px",fontFamily:"'Cinzel',Georgia,serif",fontSize:"0.57em",color:t.textFaint,letterSpacing:"0.24em",userSelect:"none",pointerEvents:"none"}}>
        Nuri Yahmed.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────
function Sidebar({conversations,activeId,onSelect,onNew,onDelete,collapsed,onToggle,t}){
  return(
    <div style={{width:collapsed?"56px":"260px",minHeight:"100vh",background:t.sidebar,borderLeft:`1px solid ${t.sideBorder}`,display:"flex",flexDirection:"column",transition:"width 0.3s cubic-bezier(0.4,0,0.2,1)",overflow:"hidden",flexShrink:0}}>
      <div style={{padding:"16px 12px 8px",display:"flex",flexDirection:"column",gap:"4px"}}>
        {!collapsed?(
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px",overflow:"hidden"}}>
            <span style={{fontSize:"22px",flexShrink:0,color:t.adlis}}>ⵣ</span>
            <div>
              <div style={{fontFamily:"'Cinzel','Palatino Linotype',Georgia,serif",color:t.adlis,fontSize:"1.05em",fontWeight:600,letterSpacing:"0.2em",lineHeight:1.2,whiteSpace:"nowrap"}}>ADLIS</div>
              <div style={{fontFamily:"'Cinzel',serif",color:t.adlisFaint,fontSize:"0.58em",letterSpacing:"0.28em",whiteSpace:"nowrap"}}>ⴰⴷⵍⵉⵙ</div>
            </div>
          </div>
        ):(
          <div style={{display:"flex",justifyContent:"center",marginBottom:"10px"}}><span style={{fontSize:"22px",color:t.adlis}}>ⵣ</span></div>
        )}
        <button onClick={onNew} title="محادثة جديدة"
          style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"8px",padding:collapsed?"10px":"10px 14px",background:t.toggleBg,border:`1px solid ${t.toggleBorder}`,borderRadius:"8px",color:t.toggleColor,cursor:"pointer",fontSize:"0.85em",width:"100%",transition:"all 0.2s",whiteSpace:"nowrap",overflow:"hidden"}}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <span style={{fontSize:"15px",flexShrink:0}}>✦</span>
          {!collapsed&&"محادثة جديدة"}
        </button>
      </div>
      {!collapsed&&<div style={{padding:"4px 16px 8px"}}><GeoDivider t={t}/></div>}
      <div style={{flex:1,overflowY:"auto",padding:"4px 8px",display:"flex",flexDirection:"column",gap:"2px"}}>
        {conversations.map(conv=>(
          <div key={conv.id} style={{position:"relative",display:"flex",alignItems:"center"}}>
            <button onClick={()=>onSelect(conv.id)} title={conv.title}
              style={{display:"flex",alignItems:"center",gap:"8px",padding:collapsed?"10px":"9px 28px 9px 12px",background:activeId===conv.id?t.convActiveBg:"transparent",border:activeId===conv.id?`1px solid ${t.convActiveBdr}`:"1px solid transparent",borderRadius:"7px",color:activeId===conv.id?t.convActiveClr:t.convColor,cursor:"pointer",fontSize:"0.8em",width:"100%",textAlign:"right",transition:"all 0.15s",whiteSpace:"nowrap",overflow:"hidden",justifyContent:collapsed?"center":"flex-start"}}
              onMouseEnter={e=>{if(activeId!==conv.id)e.currentTarget.style.background=t.convHover}}
              onMouseLeave={e=>{if(activeId!==conv.id)e.currentTarget.style.background="transparent"}}>
              <span style={{fontSize:"12px",flexShrink:0,opacity:0.7}}>◈</span>
              {!collapsed&&<span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{conv.title}</span>}
            </button>
            {!collapsed&&(
              <button onClick={()=>onDelete(conv.id)} title="حذف"
                style={{position:"absolute",left:"6px",background:"none",border:"none",cursor:"pointer",color:t.textMuted,fontSize:"11px",padding:"2px 4px",borderRadius:"3px",opacity:0,transition:"opacity 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.color="#e05555";}}
                onMouseLeave={e=>{e.currentTarget.style.opacity="0";e.currentTarget.style.color=t.textMuted;}}>
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={onToggle} title={collapsed?"فتح القائمة الجانبية":"إغلاق القائمة"}
        style={{margin:"12px",padding:"8px 10px",background:t.toggleBg,border:`1px solid ${t.toggleBorder}`,borderRadius:"7px",color:t.textMuted,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",fontFamily:"'Noto Kufi Arabic',sans-serif",fontSize:"0.72em",fontWeight:600,whiteSpace:"nowrap"}}
        onMouseEnter={e=>e.currentTarget.style.color=t.toggleColor}
        onMouseLeave={e=>e.currentTarget.style.color=t.textMuted}>
        {collapsed?<span style={{fontSize:"15px"}}>☰</span>:<><span style={{fontSize:"11px"}}>✕</span>&nbsp;إغلاق القائمة</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  API CALL — handles tool_use loop correctly
// ─────────────────────────────────────────────
async function callAdlis({history, webSearch, onStream, onSearchStart}){
  const tools = webSearch ? [{type:"web_search_20250305", name:"web_search"}] : undefined;

  // Non-streaming request (handles tool_use loop properly)
  const makeRequest = async (messages) => {
    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: ADLIS_SYSTEM,
      messages,
      ...(tools ? {tools} : {}),
    };
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API error ${res.status}: ${errText}`);
    }
    return res.json();
  };

  let messages = [...history];
  let usedSearch = false;
  let finalText = "";

  // Agentic loop — keep going while model uses tools
  while (true) {
    const data = await makeRequest(messages);

    // Collect text blocks and tool_use blocks
    const textBlocks = data.content.filter(b => b.type === "text");
    const toolBlocks = data.content.filter(b => b.type === "tool_use");

    // Stream text progressively to UI
    if (textBlocks.length > 0) {
      finalText = textBlocks.map(b => b.text).join("");
      onStream(finalText);
    }

    // If model is done (no tools used or stop reason is end_turn/stop)
    if (toolBlocks.length === 0 || data.stop_reason === "end_turn") {
      break;
    }

    // Model wants to use tools — mark search and add assistant turn
    usedSearch = true;
    onSearchStart();

    // Add assistant message with full content array
    messages = [...messages, {role:"assistant", content: data.content}];

    // Build tool_result blocks for each tool_use
    const toolResults = toolBlocks.map(tb => ({
      type: "tool_result",
      tool_use_id: tb.id,
      content: tb.type === "web_search_tool_result"
        ? tb.content
        : JSON.stringify(tb.input || {}),
    }));

    messages = [...messages, {role:"user", content: toolResults}];

    // If stop_reason is tool_use, loop again to get final answer
    if (data.stop_reason !== "tool_use") break;
  }

  return {text: finalText, usedSearch};
}

// ─────────────────────────────────────────────
//  CHAT CORE HOOK
// ─────────────────────────────────────────────
function useChatCore(){
  const [conversations,setConversations]=useState(()=>{
    try{ const s=localStorage.getItem(STORAGE_KEY); return s?JSON.parse(s):[]; }
    catch{ return []; }
  });
  const [activeId,setActiveId]=useState(()=>{
    try{ const s=localStorage.getItem(STORAGE_KEY+"_active"); return s||null; }
    catch{ return null; }
  });
  const [input,setInput]=useState("");
  const [attachments,setAttachments]=useState([]);
  const [webSearch,setWebSearch]=useState(false);
  const [isLoading,setIsLoading]=useState(false);
  const [streamingContent,setStreamingContent]=useState("");
  const [streamingMeta,setStreamingMeta]=useState({usedSearch:false});
  const messagesEndRef=useRef(null);

  useEffect(()=>{
    try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(conversations)); }catch(_){}
  },[conversations]);
  useEffect(()=>{
    try{ if(activeId) localStorage.setItem(STORAGE_KEY+"_active",activeId); }catch(_){}
  },[activeId]);

  const activeConv=conversations.find(c=>c.id===activeId);
  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});},[activeConv?.messages,streamingContent]);

  const newConversation=useCallback(()=>{
    const id=Date.now().toString();
    setConversations(prev=>[{id,title:`محادثة ${prev.length+1}`,messages:[]}, ...prev]);
    setActiveId(id);
    setAttachments([]);
  },[]);

  const deleteConversation=useCallback((id)=>{
    setConversations(prev=>prev.filter(c=>c.id!==id));
    setActiveId(prev=>prev===id?null:prev);
  },[]);

  useEffect(()=>{if(conversations.length===0)newConversation();},[]);
  useEffect(()=>{
    if(conversations.length>0&&!conversations.find(c=>c.id===activeId)){
      setActiveId(conversations[0].id);
    }
  },[conversations,activeId]);

  const sendMessage=useCallback(async()=>{
    const content=input.trim();
    if((!content&&!attachments.length)||isLoading)return;

    let convId=activeId;
    if(!convId){
      const id=Date.now().toString();
      setConversations(prev=>[{id,title:content.slice(0,30)||"محادثة",messages:[]}, ...prev]);
      setActiveId(id);convId=id;
    }

    const currentAttachments=[...attachments];
    const userMsg={
      id:Date.now().toString(),
      role:"user",
      content:content||"(ملف مرفق)",
      attachments:currentAttachments.map(a=>({name:a.name,type:a.type}))
    };

    setConversations(prev=>prev.map(c=>c.id===convId
      ?{...c,
        title:c.messages.length===0?(content||currentAttachments[0]?.name||"محادثة").slice(0,35):c.title,
        messages:[...c.messages,userMsg]}
      :c
    ));
    setInput("");setAttachments([]);setIsLoading(true);
    setStreamingContent("");setStreamingMeta({usedSearch:false});

    try{
      // Build history for API
      const currentConv=conversations.find(c=>c.id===convId);
      const history=[];
      for(const m of (currentConv?.messages||[])){
        history.push({role:m.role,content:m.content});
      }

      // Build current user message
      const userContent=[];
      for(const att of currentAttachments){
        if(att.type==="image"){
          userContent.push({type:"image",source:{type:"base64",media_type:att.mediaType,data:att.base64}});
        } else if(att.type==="pdf"){
          userContent.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:att.base64}});
        }
      }
      if(content) userContent.push({type:"text",text:content});
      if(!userContent.length) userContent.push({type:"text",text:"(ملف مرفق)"});

      history.push({
        role:"user",
        content: userContent.length===1&&userContent[0].type==="text"
          ? userContent[0].text
          : userContent
      });

      const {text: fullText, usedSearch} = await callAdlis({
        history,
        webSearch,
        onStream: (t) => { setStreamingContent(t); },
        onSearchStart: () => { setStreamingMeta({usedSearch:true}); },
      });

      setConversations(prev=>prev.map(c=>c.id===convId
        ?{...c,messages:[...c.messages,{id:Date.now().toString(),role:"assistant",content:fullText,usedSearch}]}
        :c
      ));
      setStreamingContent("");
    }catch(err){
      setConversations(prev=>prev.map(c=>c.id===convId
        ?{...c,messages:[...c.messages,{
            id:Date.now().toString(),
            role:"assistant",
            content:`⚠️ تعثّرت الكلمات في الطريق.\n\`${err.message}\``
          }]}
        :c
      ));
      setStreamingContent("");
    }finally{
      setIsLoading(false);
    }
  },[input,attachments,webSearch,isLoading,activeId,conversations]);

  return{
    conversations,activeId,setActiveId,input,setInput,attachments,
    addAttachment:a=>setAttachments(p=>[...p,a]),
    removeAttachment:i=>setAttachments(p=>p.filter((_,j)=>j!==i)),
    webSearch,toggleWebSearch:()=>setWebSearch(p=>!p),
    isLoading,streamingContent,streamingMeta,messagesEndRef,activeConv,
    newConversation,deleteConversation,sendMessage
  };
}

// ─────────────────────────────────────────────
//  FULL PAGE MODE
// ─────────────────────────────────────────────
function FullPageMode({t,isDark,onToggleTheme}){
  const core=useChatCore();
  const{conversations,activeId,setActiveId,input,setInput,attachments,addAttachment,removeAttachment,
    webSearch,toggleWebSearch,isLoading,streamingContent,streamingMeta,messagesEndRef,activeConv,
    newConversation,deleteConversation,sendMessage}=core;
  const[sidebarCollapsed,setSidebarCollapsed]=useState(false);

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"row-reverse",background:t.bg,fontFamily:"'Noto Kufi Arabic','Segoe UI',Tahoma,sans-serif",direction:"rtl",color:t.text,overflow:"hidden",transition:"background 0.35s,color 0.35s"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:isDark?"radial-gradient(circle at 15% 15%,rgba(201,168,76,0.03) 0%,transparent 50%)":"radial-gradient(circle at 15% 15%,rgba(201,168,76,0.07) 0%,transparent 50%)"}}/>

      <Sidebar conversations={conversations} activeId={activeId} onSelect={setActiveId} onNew={newConversation}
        onDelete={deleteConversation} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(p=>!p)} t={t}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",zIndex:1,minWidth:0}}>
        <div style={{padding:"12px 20px",borderBottom:`1px solid ${t.sideBorder}`,background:t.header,backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <TifinaghGlyph size={20} color={t.heading} opacity={0.6}/>
            <span style={{color:t.heading,fontWeight:600,fontSize:"0.92em",letterSpacing:"0.04em"}}>{activeConv?.title||"المساعد"}</span>
            {webSearch&&<span style={{fontSize:"0.68em",color:t.searchColor,background:t.searchBadge,borderRadius:"4px",padding:"2px 7px"}}>🌐 بحث مفعّل</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontFamily:"'Cinzel','Palatino Linotype',Georgia,serif",fontSize:"0.8em",color:t.adlis,letterSpacing:"0.22em",fontWeight:600}}>ADLIS</span>
            <span style={{color:t.adlisFaint,fontSize:"17px"}}>ⵣ</span>
            <button onClick={onToggleTheme}
              style={{background:t.toggleBg,border:`1px solid ${t.toggleBorder}`,borderRadius:"20px",padding:"5px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.3s",color:t.toggleColor,fontFamily:"'Noto Kufi Arabic',sans-serif",fontSize:"0.78em",fontWeight:600,whiteSpace:"nowrap"}}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.72"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              {isDark?<>☀️ &nbsp;وضع نهاري</>:<>🌙 &nbsp;وضع ليلي</>}
            </button>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"24px",display:"flex",flexDirection:"column",scrollbarWidth:"thin",scrollbarColor:`${isDark?"rgba(201,168,76,0.2)":"rgba(139,94,60,0.18)"} transparent`}}>
          {(!activeConv||activeConv.messages.length===0)&&!isLoading?(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"18px",color:t.welcomeText}}>
              <div style={{fontSize:"58px",lineHeight:1,color:t.adlisFaint}}>ⵣ</div>
              <div style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:"1.6em",letterSpacing:"0.22em",color:t.adlis,fontWeight:600,opacity:0.75}}>ADLIS</div>
              <div style={{fontSize:"0.95em",letterSpacing:"0.07em",opacity:0.85}}>ابدأ محادثة جديدة</div>
              <GeoDivider t={t}/>
              <div style={{display:"flex",gap:"16px",fontSize:"0.75em",color:t.textMuted,opacity:0.7,marginTop:"4px"}}>
                <span>📎 يقرأ PDF والصور</span>
                <span>🌐 يبحث في الإنترنت</span>
                <span>🧠 يتذكر محادثاتك</span>
              </div>
            </div>
          ):(
            <>
              {activeConv?.messages.map(msg=><Message key={msg.id} msg={msg} isStreaming={false} t={t}/>)}
              {isLoading&&streamingContent&&(
                <Message msg={{id:"s",role:"assistant",content:streamingContent,usedSearch:streamingMeta.usedSearch}} isStreaming={true} t={t}/>
              )}
              {isLoading&&!streamingContent&&(
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"24px"}}>
                  <div style={{padding:"12px 20px",background:t.aiBubble,border:`1px solid ${t.aiBorder}`,borderRadius:"4px 18px 18px 18px",display:"flex",gap:"6px",alignItems:"center"}}>
                    {streamingMeta.usedSearch&&<span style={{fontSize:"0.75em",color:t.searchColor,marginLeft:"6px"}}>🌐 يبحث...</span>}
                    {[0,1,2].map(i=><div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:t.dot,opacity:0.6,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef}/>
        </div>

        <Composer input={input} setInput={setInput} onSend={sendMessage} isLoading={isLoading} t={t}
          attachments={attachments} onAddAttachment={addAttachment} onRemoveAttachment={removeAttachment}
          webSearch={webSearch} onToggleSearch={toggleWebSearch}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  WIDGET MODE
// ─────────────────────────────────────────────
function WidgetMode({t,isDark,onToggleTheme}){
  const [open,setOpen]=useState(false);
  const core=useChatCore();
  const{input,setInput,attachments,addAttachment,removeAttachment,webSearch,toggleWebSearch,
    isLoading,streamingContent,streamingMeta,messagesEndRef,activeConv,newConversation,sendMessage}=core;

  return(
    <>
      <div onClick={()=>setOpen(o=>!o)}
        style={{position:"fixed",bottom:"28px",left:"28px",width:"58px",height:"58px",borderRadius:"50%",background:t.bubbleBg,boxShadow:open?"none":t.bubbleGlow,cursor:"pointer",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",transform:open?"scale(0.92)":"scale(1)",border:`1px solid ${t.adlisFaint}`}}>
        <span style={{fontSize:"24px",transition:"all 0.3s",transform:open?"rotate(45deg)":"rotate(0deg)"}}>{open?"✕":"ⵣ"}</span>
      </div>

      <div style={{position:"fixed",bottom:"100px",left:"28px",width:"360px",height:"540px",background:t.widgetBg,borderRadius:"18px",boxShadow:t.widgetShadow,display:"flex",flexDirection:"column",overflow:"hidden",zIndex:9998,transform:open?"translateY(0) scale(1)":"translateY(20px) scale(0.95)",opacity:open?1:0,pointerEvents:open?"all":"none",transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",border:`1px solid ${t.sideBorder}`}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${t.sideBorder}`,background:t.header,backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{color:t.adlis,fontSize:"18px"}}>ⵣ</span>
            <span style={{fontFamily:"'Cinzel',Georgia,serif",color:t.adlis,fontSize:"0.9em",fontWeight:600,letterSpacing:"0.18em"}}>ADLIS</span>
          </div>
          <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
            <button onClick={newConversation} style={{background:"none",border:`1px solid ${t.toggleBorder}`,color:t.toggleColor,borderRadius:"6px",padding:"3px 8px",cursor:"pointer",fontSize:"0.72em",fontFamily:"'Noto Kufi Arabic',sans-serif",fontWeight:600}}>✦ جديد</button>
            <button onClick={onToggleTheme} style={{background:"none",border:`1px solid ${t.toggleBorder}`,color:t.toggleColor,borderRadius:"6px",padding:"3px 9px",cursor:"pointer",fontSize:"0.7em",fontFamily:"'Noto Kufi Arabic',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:"4px"}}>
              {isDark?<>☀️ نهاري</>:<>🌙 ليلي</>}
            </button>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",scrollbarWidth:"thin",direction:"rtl"}}>
          {(!activeConv||activeConv.messages.length===0)&&!isLoading?(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"12px",color:t.welcomeText,textAlign:"center"}}>
              <div style={{fontSize:"44px",color:t.adlisFaint}}>ⵣ</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"1.1em",color:t.adlis,letterSpacing:"0.18em",fontWeight:600,opacity:0.8}}>ADLIS</div>
              <div style={{fontSize:"0.78em",opacity:0.7,lineHeight:1.6,maxWidth:"220px"}}>
                📎 PDF وصور &nbsp;·&nbsp; 🌐 بحث &nbsp;·&nbsp; 🧠 ذاكرة
              </div>
            </div>
          ):(
            <>
              {activeConv?.messages.map(msg=><Message key={msg.id} msg={msg} isStreaming={false} t={t}/>)}
              {isLoading&&streamingContent&&(
                <Message msg={{id:"s",role:"assistant",content:streamingContent,usedSearch:streamingMeta.usedSearch}} isStreaming={true} t={t}/>
              )}
              {isLoading&&!streamingContent&&(
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"16px"}}>
                  <div style={{padding:"10px 16px",background:t.aiBubble,border:`1px solid ${t.aiBorder}`,borderRadius:"4px 14px 14px 14px",display:"flex",gap:"5px",alignItems:"center"}}>
                    {streamingMeta.usedSearch&&<span style={{fontSize:"0.72em",color:t.searchColor}}>🌐</span>}
                    {[0,1,2].map(i=><div key={i} style={{width:"5px",height:"5px",borderRadius:"50%",background:t.dot,opacity:0.6,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef}/>
        </div>

        <Composer input={input} setInput={setInput} onSend={sendMessage} isLoading={isLoading} t={t}
          attachments={attachments} onAddAttachment={addAttachment} onRemoveAttachment={removeAttachment}
          webSearch={webSearch} onToggleSearch={toggleWebSearch}/>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
//  ROOT
// ─────────────────────────────────────────────
export default function App(){
  const[isDark,setIsDark]=useState(()=>{
    try{ const s=localStorage.getItem("adlis_theme"); return s?s==="dark":true; }catch{ return true; }
  });
  const[mode,setMode]=useState("full");
  const t=isDark?DARK:LIGHT;
  const toggleTheme=()=>{
    setIsDark(d=>{
      try{ localStorage.setItem("adlis_theme",!d?"dark":"light"); }catch(_){}
      return !d;
    });
  };

  return(
    <>
      <FontLoader/>
      <div style={{position:"fixed",top:"12px",left:"12px",zIndex:99999,display:"flex",gap:"6px"}}>
        {["full","widget"].map(m=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{padding:"5px 12px",borderRadius:"20px",fontSize:"0.7em",cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:"0.1em",background:mode===m?t.btnActive:t.toggleBg,border:`1px solid ${t.toggleBorder}`,color:mode===m?t.btnActiveText:t.toggleColor,transition:"all 0.2s"}}>
            {m==="full"?"صفحة كاملة":"Widget"}
          </button>
        ))}
      </div>

      {mode==="full"
        ?<FullPageMode t={t} isDark={isDark} onToggleTheme={toggleTheme}/>
        :(
          <div style={{minHeight:"100vh",background:isDark?"#0a0f0a":"#f0ece0",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Kufi Arabic',sans-serif",color:isDark?"rgba(232,184,32,0.35)":"rgba(26,14,0,0.3)",fontSize:"0.85em",direction:"rtl"}}>
            <div style={{textAlign:"center",lineHeight:2.2}}>
              <div style={{fontSize:"2em",marginBottom:"8px",color:t.adlisFaint}}>ⵣ</div>
              هذه صفحة تجريبية لوضع الـ Widget<br/>
              <span style={{fontSize:"0.85em",opacity:0.7}}>انقر الزر في الزاوية السفلية لفتح ADLIS</span>
            </div>
            <WidgetMode t={t} isDark={isDark} onToggleTheme={toggleTheme}/>
          </div>
        )
      }

      <style>{`
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        @keyframes pulse{0%,100%{transform:scale(0.7);opacity:0.4;}50%{transform:scale(1);opacity:1;}}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{border-radius:2px;background:rgba(139,94,60,0.2);}
        *{box-sizing:border-box;}
      `}</style>
    </>
  );
}
