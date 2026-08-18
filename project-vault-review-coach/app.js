"use strict";

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const state = {
  screen: "start",
  docsTab: "atlas",
  slidesTab: "atlas",
  slopTab: "learn",
  practiceFilter: "All",
  practiceIndex: 0,
  practiceAnswered: false,
  practiceChoice: null,
  docClass: {},
  docScore: {axis:null, step:0},
  slideClass: {},
  slopClass: {}
};

const docsAxes = [
  {axis:"Content", name:"Instruction Following", ask:"Did the document actually do what the prompt asked — scope, audience, required sections and constraints?", good:"Every requested deliverable is present, correctly scoped and aimed at the right audience.", minor:"A tiny non-core instruction detail is missed.", moderate:"A repeated or noticeable instruction mismatch creates friction, but the main deliverable still works.", major:"A core requested section, constraint, audience or deliverable is missing or wrong.", contrast:"Wrong facts or weak reasoning belong to Writing Substance, not Instruction Following."},
  {axis:"Content", name:"Writing Substance", ask:"Are the facts, reasoning, analysis, calculations and conclusions accurate, supported, complete and useful?", good:"Claims are source-faithful, sufficiently deep, relevant and supported.", minor:"One peripheral detail is slightly shallow or imprecise.", moderate:"A section is visibly shallow, or several claims lack enough support, but the main answer remains usable.", major:"A headline conclusion, important calculation, core analysis or key factual claim is wrong, unsupported or missing.", contrast:"If the meaning is sound but the prose is bloated, route it to Writing Style."},
  {axis:"Content", name:"Writing Style", ask:"Is the prose clear, concise, professional, audience-appropriate and non-repetitive?", good:"Direct professional prose; each section adds information; tone and grammar fit the audience.", minor:"One awkward sentence or isolated generic phrase.", moderate:"Repeated redundancy, jargon or verbosity materially slows reading.", major:"Generic padded filler or unprofessional writing replaces expert communication and requires substantial rewriting.", contrast:"If the claim itself is empty or unsupported, that is Writing Substance."},
  {axis:"Content", name:"Document Structure", ask:"Are the ideas and substantive sections organized in a logical order?", good:"Analysis builds naturally toward findings, recommendations and next steps; content sits under the right headings.", minor:"One paragraph would work better in a nearby section.", moderate:"Several sections are awkwardly ordered, but the argument can still be followed.", major:"The conclusion appears before the analysis, key sections are disconnected, or organization prevents the deliverable from working.", contrast:"Ideas in the wrong order = Structure. A page that is visually hard to scan = Readability."},
  {axis:"Content", name:"Citations", ask:"When sourcing is expected, are important claims traceable and citations correctly placed?", good:"Required claims are traceable to the correct source and citations sit beside the claims they support.", minor:"One citation is placed imprecisely but the source remains clear.", moderate:"Several important claims are difficult to trace, though the document remains usable.", major:"Critical sourced claims are unsupported, attached to the wrong source or untraceable.", contrast:"Do not penalize missing citations when the task genuinely does not expect them."},
  {axis:"Visual Aesthetics", name:"Color", ask:"Is color consistent, legible and professionally meaningful?", good:"Consistent palette, strong contrast and stable semantic meaning.", minor:"One off-palette accent or small inconsistency.", moderate:"Recurring color inconsistency weakens polish but does not block reading.", major:"Repeated low contrast or confusing semantic color materially interferes with understanding.", contrast:"A flat image or non-editable chart belongs to Editability, not Color."},
  {axis:"Visual Aesthetics", name:"Fonts", ask:"Is typography consistent and is the heading hierarchy clear?", good:"Consistent font family, size logic and obvious heading levels.", minor:"One inconsistent heading or isolated font change.", moderate:"Recurring font or hierarchy inconsistency makes the document look visibly unpolished.", major:"Typography is so inconsistent that hierarchy and normal reading are repeatedly disrupted.", contrast:"Poor ordering of sections belongs to Document Structure."},
  {axis:"Visual Aesthetics", name:"Readability", ask:"Is the page easy to scan and read — density, whitespace, text size, spacing and visual hierarchy?", good:"Comfortable text size, whitespace and spacing; the page is fast to scan.", minor:"One slightly dense paragraph or uneven spacing area.", moderate:"Several dense pages, weak whitespace or repeated scanability friction.", major:"Tiny text, extreme density or poor hierarchy repeatedly slows or confuses the reader.", contrast:"Ideas wrong order = Document Structure. Page hard to scan = Readability."},
  {axis:"Visual Aesthetics", name:"Tables", ask:"Are tables visually legible and easy to interpret?", good:"Clear labels, sensible column widths, alignment and consistent formatting.", minor:"One cramped column or small alignment issue.", moderate:"Several widths, labels or alignments create real interpretation friction.", major:"A key table is visually unreadable or materially misleading.", contrast:"A table being a screenshot is an Editability issue unless it also has a separate visual defect."},
  {axis:"Visual Aesthetics", name:"Charts", ask:"Does each chart visually communicate the data clearly?", good:"Appropriate chart choice, readable labels and legend, clear colors and easy interpretation.", minor:"One label or legend detail needs cleanup.", moderate:"Recurring clutter, weak labels or confusing color choices slow interpretation.", major:"A central chart is misleading, illegible or impossible to interpret.", contrast:"A flat/non-editable chart belongs to Editability unless a separate visual defect exists."},
  {axis:"Visual Aesthetics", name:"Images", ask:"Are images clear, relevant, correctly sized and professionally cropped?", good:"Sharp, relevant imagery with sensible crop, size and placement.", minor:"One peripheral image is slightly soft or awkwardly cropped.", moderate:"Several images are blurry, distorted or inconsistently handled.", major:"Central or repeated imagery materially damages professional usability.", contrast:"Whether an image can be edited is separate from whether it looks good."},
  {axis:"Editability", name:"Editability", ask:"Can a normal editor efficiently revise the actual content or data without rebuilding it?", good:"Native text and tables, editable chart/data objects and maintainable construction.", minor:"One isolated element creates small revision friction.", moderate:"Several elements are awkward to revise, but the document remains editable overall.", major:"A key table, chart or content block requires reconstruction to update.", contrast:"Bad-looking does not equal uneditable. Judge construction independently from visual quality."}
];

const docsOfficial = {
  "Content":["Wrong or unreadable; does not answer the prompt.","Main answer missing; severe content or source issues.","Topic addressed, but important pieces are missing or weak.","Usable, but visible gaps or unclear parts remain.","Strong answer with only small content or wording issues.","Complete, accurate, clear, supported and usable as-is."],
  "Visual Aesthetics":["Visually broken; layout or styling blocks understanding.","Visual issues repeatedly interfere with reading.","Readable in parts, but design issues slow or confuse the reader.","Readable and usable, but visible polish issues remain.","Clean and easy to read; only small visual issues.","Polished, scannable, consistent and supports understanding."],
  "Editability":["Not practically editable; key content needs rebuilding.","Mostly hard to edit; changes require reconstruction.","Some editable parts, but key elements are hard to revise.","Editable enough, but revisions would be awkward.","Practical to revise; only small editability issues.","Cleanly structured for efficient editing."],
  "Overall":["Fails the task; unusable for the reader.","Far from the request; major issues prevent normal use.","Partly works, but a core requirement needs major revision.","Meets the basic goal, but visible issues remain.","Strong and useful; only low-impact issues.","Excellent, complete and usable as-is."]
};

const docsCal = [
  "Complete failure of the axis.",
  "Multiple Major or pervasive failures materially prevent normal use.",
  "One Major/core issue requires substantial revision.",
  "Several minor issues or a repeated/systemic Moderate weakness; still usable.",
  "A few localized minor issues; no repeated weakness or core gap.",
  "No meaningful defect; optional preference is not necessarily a defect."
];

const slidesAxes = [
  {name:"Content Quality", ask:"How complete, accurate, useful and source-faithful is the content?", good:"Key concepts are covered accurately with no misleading omissions or irrelevant additions.", minor:"One small omission or slightly shallow point.", major:"Required content is missing, claims are wrong or unsupported, or generic filler replaces expert substance.", contrast:"A disjointed order belongs to Storytelling; a visual overlap belongs to Layout."},
  {name:"Storytelling", ask:"Does the deck build as one coherent, ready-to-present story for its audience?", good:"Clear progression, purposeful transitions, audience fit and professional register.", minor:"One abrupt transition or a weak opening that still lands.", major:"No through-line, disjointed sections, flat list-like progression or professional writing quality that independently harms the narrative.", contrast:"Unsupported or empty claims usually belong to Content. Do not double-count the same phrase."},
  {name:"Aesthetics", ask:"How polished and visually coherent does the deck feel?", good:"Strong typography, hierarchy, color harmony, consistency and quality visuals.", minor:"One off-palette color or isolated low-quality image.", major:"Repeated style inconsistency, poor typography or visuals make the deck look unprofessional.", contrast:"Overlap, cutoff and spacing belong to Layout."},
  {name:"Layout", ask:"How well are elements arranged within and across slides?", good:"Clear spacing, margins, alignment, grouping, hierarchy and easy scanning.", minor:"One uneven margin or isolated cramped area.", major:"Text overlaps or is cut off, hierarchy fails, or several slides are materially misaligned or cramped.", contrast:"A pixelated image is Aesthetics; a flat image-only slide is Editability."},
  {name:"Editability", ask:"Can the deck be updated and reused through native objects?", good:"Native text, tables, charts and shapes that hold up to real edits.", minor:"Mostly editable with isolated friction.", major:"Image-only slides, screenshot tables/charts or construction that requires rebuilding.", contrast:"A deck can look terrible and still score high here if objects are genuinely native."},
  {name:"Overall", ask:"Would a professional accept and use this complete presentation as-is?", good:"Professional-ready, useful and coherent across the whole artifact.", minor:"A few low-impact issues remain, but the deck is solid.", major:"One weakness materially limits the deck, or several axes require significant work.", contrast:"Overall is holistic, not a mathematical average."}
];

const slidesScale = [
  {n:1,t:"Broken / unusable"},{n:2,t:"Multiple major issues; heavy rework"},{n:3,t:"At least one serious problem"},{n:4,t:"Several minor issues; not polished"},{n:5,t:"Solid; 1–3 minor issues"},{n:6,t:"Essentially ready; one optional improvement"},{n:7,t:"Ready as-is; industry-standard"}
];

const slopPatterns = [
  {name:"Formulaic, slogan-like or strained figurative language", explain:"A normal claim is packaged as a stock slogan, staged cadence, canned emotional phrase or strained metaphor instead of clear analysis.", isolated:"“This initiative unlocks new possibilities.” once, inside otherwise specific analysis.", pattern:"Repeated “new era / transformative value / bold journey / future-ready innovation” language replacing analysis."},
  {name:"Vague, inflated or unsupported substance", explain:"The reader cannot tell what changed, why a benefit follows, what evidence supports the claim, who acted or what caused the result.", isolated:"One broad claim that is clarified immediately afterward.", pattern:"“This groundbreaking transformation will revolutionize operational excellence” with no actor, evidence, mechanism or observable meaning."},
  {name:"Wordy, jargon-filled or indirect language", explain:"The same necessary meaning could be stated materially shorter and clearer without losing a real qualification.", isolated:"One mildly bureaucratic sentence.", pattern:"“Strategically leveraging cross-functional synergies to optimize future-state outcomes” repeated throughout."},
  {name:"Unnecessary framing, repetition or structure", explain:"Setup, repetition or formatting delays the point or makes the artifact harder to scan.", isolated:"One unnecessary introductory sentence.", pattern:"Each section restates the same recommendation before offering any evidence or new information."}
];

const practiceCases = [
  {module:"Docs",q:"The prompt requires an implementation recommendation. The document contains analysis but no recommendation.",opts:["Writing Substance","Instruction Following","Document Structure"],a:1,why:"A core requested deliverable is absent, so this is Content → Instruction Following.",contrast:"Not Structure: the recommendation is not merely misplaced; it is missing.",score:"Major; Content is likely around 2 territory if the recommendation is core."},
  {module:"Docs",q:"Three sections repeat essentially the same recommendation with little new information.",opts:["Writing Style","Writing Substance","Citations"],a:0,why:"The main defect is repeated, inefficient prose: Content → Writing Style.",contrast:"If the repeated sentences also contain no recoverable claim or evidence, Substance could be a separate defect.",score:"Repeated Moderate weakness; often 3 territory if the document remains usable."},
  {module:"Docs",q:"Recommendations appear before the analysis that supports them.",opts:["Readability","Document Structure","Instruction Following"],a:1,why:"The substantive order of ideas is wrong: Content → Document Structure.",contrast:"Not Readability: the issue is argument order, not page scanning.",score:"Moderate or Major depending on how badly this breaks the deliverable."},
  {module:"Docs",q:"Pages 3–6 use tiny type and very little whitespace, but the ideas are logically ordered.",opts:["Document Structure","Fonts","Readability"],a:2,why:"The page is visually difficult to scan: Visual Aesthetics → Readability.",contrast:"Not Structure because the ideas themselves are logically organized.",score:"Repeated Moderate; Visual often around 3 if still readable."},
  {module:"Docs",q:"A key chart is pasted as a screenshot; its numbers cannot be updated.",opts:["Charts","Editability","Images"],a:1,why:"The core defect is inability to revise the real data: Editability.",contrast:"Use Charts only if there is a separate visual communication problem.",score:"Major if the chart is important; Editability can land around 2."},
  {module:"Docs",q:"The executive summary says margin reached 24%, while the supplied source supports 20%.",opts:["Writing Style","Writing Substance","Citations"],a:1,why:"A material factual conclusion is wrong: Content → Writing Substance.",contrast:"A citation problem would be separate only if the source placement is also wrong.",score:"Major if this is a headline conclusion."},
  {module:"Slides",q:"Body text overlaps two chart labels on slide 5.",opts:["Aesthetics","Layout","Editability"],a:1,why:"Overlap and cutoff are Layout defects.",contrast:"Do not also punish Aesthetics for the exact same overlap unless a separate style problem exists.",score:"Severity depends on readability; repeated/blocking overlap can be serious."},
  {module:"Slides",q:"The cover logo is visibly pixelated, but all elements are native and easy to edit.",opts:["Aesthetics","Layout","Editability"],a:0,why:"Image quality lowers Aesthetics; native construction can keep Editability high.",contrast:"Bad-looking does not equal uneditable.",score:"Usually a minor Aesthetics defect; a strong axis may remain around 5–6."},
  {module:"Slides",q:"The deck opens by asking the CTO to approve a tool before explaining the problem or why the tool was chosen.",opts:["Content Quality","Storytelling","Layout"],a:1,why:"The deck’s argument is ordered incoherently: Storytelling.",contrast:"Missing facts or unsupported claims would be Content, but the stated defect is progression.",score:"A serious coherence problem can put Storytelling around 3."},
  {module:"Slides",q:"A required risks-and-safeguards section is absent.",opts:["Content Quality","Storytelling","Aesthetics"],a:0,why:"Required content is missing: Content Quality.",contrast:"Storytelling may still be fine even though the brief is incomplete.",score:"Potentially serious/major, depending on centrality."},
  {module:"Slides",q:"The deck looks rough, but every chart, table, shape and text box is native and easy to update.",opts:["Editability low","Editability high","Overall must be high"],a:1,why:"Editability can be excellent even when other axes are poor.",contrast:"Overall still reflects the whole artifact and can remain low.",score:"Editability may be 7 while Layout/Aesthetics are much lower."},
  {module:"Slides",q:"One slide uses a single off-palette accent color; everything else is polished.",opts:["Minor Aesthetics","Major Aesthetics","Layout"],a:0,why:"One isolated color inconsistency is a minor Aesthetics issue.",contrast:"Do not turn one tiny issue into a major score collapse.",score:"Aesthetics likely remains in 5–6 territory, depending on the live scale."},
  {module:"AI Slop",q:"A six-page report is specific and evidence-based, but once says “This initiative unlocks new possibilities.”",opts:["Definitely major slop","Not necessarily a slop pattern","Storytelling failure"],a:1,why:"One isolated generic phrase is not automatically a conspicuous, repeated or harmful pattern.",contrast:"It can still be a small Writing Style weakness if relevant.",score:"Usually local/minor, not a major slop penalty."},
  {module:"AI Slop",q:"The document repeatedly says “new era,” “transformative value,” and “future-ready innovation” instead of explaining the analysis.",opts:["Likely slop pattern","Harmless style preference","Visual issue"],a:0,why:"Repeated formulaic language is replacing analytical work.",contrast:"The repetition and lack of substance make this more than one awkward phrase.",score:"Moderate to Major depending on how much real analysis is displaced."},
  {module:"AI Slop",q:"“This groundbreaking transformation will revolutionize operational excellence.” No evidence, actor or mechanism follows.",opts:["Writing Style only","Substance / Content","Layout"],a:1,why:"The reader cannot recover a specific supported claim, so the primary defect is Substance/Content.",contrast:"Inflated wording may also be stylistically poor, but do not double-count the same root defect.",score:"Major when this kind of empty claim drives the recommendation."},
  {module:"AI Slop",q:"“Strategically leveraging cross-functional synergies to optimize future-state outcomes.” The underlying point is real but could be much shorter.",opts:["Writing Style","Writing Substance","Citations"],a:0,why:"Meaning exists, but the sentence is bloated, jargon-heavy and indirect: Writing Style.",contrast:"Substance is the better route only when the actual claim is empty, unsupported or wrong.",score:"Isolated = minor; repeated throughout = Moderate or worse."},
  {module:"AI Slop",q:"Each section repeats setup and delays the recommendation, making the deck feel flat and hard to follow.",opts:["Slides Storytelling / Docs Structure","Editability","Images"],a:0,why:"Unnecessary framing and repetition damage the argument’s progression.",contrast:"If the only problem is page density, use Readability/Layout instead.",score:"Repeated narrative friction can be Moderate; incoherence can become Major."},
  {module:"AI Slop",q:"A highly visual Jack-and-the-beanstalk deck suddenly introduces Christmas, a monkey and unrelated dramatic fragments with no plot.",opts:["Content only","Storytelling only","Separate Content and Storytelling defects"],a:2,why:"Irrelevant/inaccurate additions hurt Content, while the missing coherent plot independently hurts Storytelling.",contrast:"This is not double-counting because there are two distinct professional consequences.",score:"Both axes can move into serious-problem territory if the failures are pervasive."}
];

function nav(screen){
  state.screen = screen;
  $$(".screen").forEach(s=>s.classList.toggle("active",s.dataset.screen===screen));
  $$(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.go===screen));
  window.scrollTo({top:0,behavior:"smooth"});
  if(screen==="start") renderStart();
  if(screen==="docs") renderDocs();
  if(screen==="slides") renderSlides();
  if(screen==="slop") renderSlop();
  if(screen==="practice") renderPractice();
  if(screen==="sheets") renderSheets();
  if(screen==="help") renderHelp();
}

function sectionHead(title, back=true){return `<div class="section-head"><div>${back?`<button class="back" onclick="nav('start')">← Start</button>`:""}<h2>${title}</h2></div><div class="mini-actions"><button class="icon-btn" onclick="nav('sheets')">▤</button><button class="icon-btn" onclick="nav('help')">?</button></div></div>`}
function tabs(items, active, fn){return `<div class="tabs">${items.map(x=>`<button class="tab ${x===active?'active':''}" onclick="${fn}('${x}')">${x}</button>`).join('')}</div>`}
function exampleGrid(d){return `<div class="examples"><div class="example good"><b>Good</b>${d.good}</div><div class="example minor"><b>Minor</b>${d.minor}</div><div class="example moderate"><b>Moderate</b>${d.moderate||d.minor}</div><div class="example major"><b>Major</b>${d.major}</div><div class="example contrast" style="grid-column:1/-1"><b>Usually not here</b>${d.contrast}</div></div>`}
function choice(label, action, small=""){return `<button class="choice" onclick="${action}">${label}${small?`<small>${small}</small>`:""}</button>`}

function renderStart(){
  $("#startScreen").innerHTML = `
    <div class="hero"><div class="eyebrow">Final study system</div><h1>Find the issue. Route it once. Score the impact.</h1><p class="lede">A concise reference and interactive coach for Docs, Slides and the AI-Slop gate.</p><div class="rule-strip"><span><b>1</b> Task instructions</span><span>›</span><span><b>2</b> Campaign rules</span><span>›</span><span><b>3</b> General guide</span></div></div>
    <div class="grid three">
      <div class="card docs"><div class="kicker"><i class="dot docs"></i>Docs</div><h3>Content • Visual • Editability</h3><p class="muted">Dependent sub-axes, 0–5 calibrator and issue classifier.</p><div class="actions"><button class="btn" onclick="nav('docs')">Open Docs coach</button></div></div>
      <div class="card slides"><div class="kicker"><i class="dot slides"></i>Slides</div><h3>Six axes • 1–7 calibration</h3><p class="muted">Know exactly where content, story, design, layout and construction belong.</p><div class="actions"><button class="btn" onclick="nav('slides')">Open Slides coach</button></div></div>
      <div class="card slop"><div class="kicker"><i class="dot slop"></i>AI Slop</div><h3>Pattern, not punctuation</h3><p class="muted">Recognize repeated manufactured language and route it correctly.</p><div class="actions"><button class="btn" onclick="nav('slop')">Open AI-Slop coach</button></div></div>
    </div>
    <div class="card" style="margin-top:10px"><h3>Universal workflow</h3><div class="flow"><span>READ EVERYTHING</span><b>→</b><span>SCORE INDEPENDENTLY</span><b>→</b><span>ROUTE ONCE</span><b>→</b><span>RATIONALE</span><b>→</b><span>RANK</span><b>→</b><span>CHECK</span></div><div class="callout"><strong>Rationale formula:</strong> WHERE → WHAT → WHY IT MATTERS.<br><br><b>Strong:</b> “Slide 5: body text overlaps two chart labels, making the values unreadable before presentation.”<br><b>Weak:</b> “The layout has issues.”</div></div>
    <div class="grid two" style="margin-top:10px"><button class="btn" onclick="nav('practice')"><b>Practice 18 fictional cases</b><small>Learn category boundaries and severity without confidential material.</small></button><button class="btn" onclick="nav('sheets')"><b>Open final one-sheets</b><small>Docs, Slides and AI-Slop printable references.</small></button></div>`;
}

function setDocsTab(x){state.docsTab=x;state.docClass={};state.docScore={axis:null,step:0};renderDocs()}
function renderDocs(){
  let body="";
  if(state.docsTab==="atlas"){
    body=`<div class="callout gold"><strong>Docs scoring:</strong> top-level Content, Visual Aesthetics, Editability and Overall use 0–5. Content and Visual sub-axes use 1–5. No official Editability sub-axis list was shown, so none is invented here.</div><div class="axis-list" style="margin-top:10px">${docsAxes.map(d=>`<details class="axis-card"><summary>${d.axis} → ${d.name}</summary><div class="axis-body"><p class="muted" style="margin-top:12px">${d.ask}</p>${exampleGrid(d)}</div></details>`).join('')}</div><h3 style="margin-top:14px">0–5 calibration</h3><div class="score-ladder">${[0,1,2,3,4,5].map(n=>`<div class="score-card"><strong>${n}</strong><span>${docsCal[n]}</span></div>`).join('')}</div><p class="muted" style="margin-top:8px"><b>Calibration aid, not an exact official count formula.</b> Count identifies the neighborhood; professional impact decides the address. Overall is holistic, not an average.</p>`;
  } else if(state.docsTab==="Classify") body=renderDocClass();
  else body=renderDocScore();
  $("#docsScreen").innerHTML=`${sectionHead("Docs Review Coach")}${tabs(["atlas","Classify","Score"],state.docsTab,"setDocsTab")} ${body}`;
}

function setDocClass(k,v){state.docClass[k]=v;renderDocs()}
function resetDocClass(){state.docClass={};renderDocs()}
function docResult(){
  const s=state.docClass;
  if(s.none) return {sev:"No meaningful defect",score:5,why:"An optional preference is not necessarily a defect. Use the official axis definition before awarding the top score."};
  if(s.repair==="unusable") return {sev:"Complete failure",score:0,why:"The axis fundamentally fails its purpose and normal use cannot be recovered without rebuilding."};
  if(!s.usable && (s.scope==="throughout"||s.core)) return {sev:"Pervasive Major",score:1,why:"Normal professional use is materially blocked by a core or pervasive failure."};
  if(s.core||s.repair==="substantial") return {sev:"Major",score:2,why:"A core requirement or important professional use case needs substantial revision."};
  if(s.scope!=="isolated"||s.repair==="noticeable") return {sev:"Moderate",score:3,why:"The problem repeats or creates visible friction, but the document remains usable."};
  return {sev:"Minor",score:4,why:"The problem is localized and non-blocking; a small cleanup should resolve it."};
}
function renderDocClass(){
  const s=state.docClass;
  if(!s.axis) return `<div class="progress"><i style="width:12%"></i></div><div class="question">What is fundamentally wrong?</div><div class="choices">${choice("Content","setDocClass('axis','Content')","What it says, omits, supports or how the ideas are organized.")}${choice("Visual Aesthetics","setDocClass('axis','Visual Aesthetics')","How the page looks, scans or visually communicates.")}${choice("Editability","setDocClass('axis','Editability')","The real content or data cannot be efficiently revised.")}${choice("No meaningful defect","setDocClass('axis','Overall');setDocClass('none',true)")}</div>`;
  if(s.none){const r=docResult();return docResultCard("Overall",r,"Optional preference ≠ defect.")}
  if(s.axis!=="Editability"&&!s.sub){const subs=docsAxes.filter(d=>d.axis===s.axis);return `<div class="progress"><i style="width:28%"></i></div><div class="question">Which ${s.axis} sub-axis fits best?</div><div class="choices">${subs.map(d=>choice(d.name,`setDocClass('sub','${d.name.replace(/'/g,"\\'")}')`,d.ask)).join('')}</div><button class="back" onclick="resetDocClass()">Start over</button>`}
  if(!s.scope) return `<div class="progress"><i style="width:45%"></i></div><div class="question">How broadly does the issue appear?</div><div class="choices">${choice("One isolated place","setDocClass('scope','isolated')")}${choice("Several places / repeated","setDocClass('scope','repeated')")}${choice("Throughout / systemic","setDocClass('scope','throughout')")}</div>`;
  if(s.core===undefined) return `<div class="progress"><i style="width:60%"></i></div><div class="question">Does it affect a core requirement or important professional use case?</div><div class="choices">${choice("Yes","setDocClass('core',true)")}${choice("No","setDocClass('core',false)")}</div>`;
  if(s.usable===undefined) return `<div class="progress"><i style="width:75%"></i></div><div class="question">Could a professional still use the document without fixing this first?</div><div class="choices">${choice("Yes","setDocClass('usable',true)")}${choice("No","setDocClass('usable',false)")}</div>`;
  if(!s.repair) return `<div class="progress"><i style="width:90%"></i></div><div class="question">What would the repair require?</div><div class="choices">${choice("Tiny cleanup","setDocClass('repair','tiny')")}${choice("Noticeable revision","setDocClass('repair','noticeable')")}${choice("Substantial rewrite / rebuild","setDocClass('repair','substantial')")}${choice("Axis is unusable","setDocClass('repair','unusable')")}</div>`;
  const r=docResult(), route=s.axis+(s.sub?` → ${s.sub}`:"");
  const contrast=s.sub?docsAxes.find(d=>d.name===s.sub)?.contrast:"Bad-looking ≠ uneditable; judge construction independently.";
  return docResultCard(route,r,contrast);
}
function docResultCard(route,r,contrast){return `<div class="result"><div class="route">Suggested route</div><div class="big">${route}</div><div class="route">Suggested severity / score neighborhood</div><div class="big">${r.sev} · ${r.score}/5</div><p>${r.why}</p><div class="callout"><strong>Official definition:</strong> ${(docsOfficial[route.split(' → ')[0]]||docsOfficial.Overall)[r.score]}</div><div class="callout"><strong>Check the boundary:</strong> ${contrast}</div><div class="actions"><button class="btn" onclick="resetDocClass()">Classify another issue</button></div></div>`}

function setDocScoreAxis(a){state.docScore={axis:a,step:0};renderDocs()}
function docScoreAnswer(yes){
  const scores=[0,1,2,3,4];
  if(yes){state.docScore.result=scores[state.docScore.step];}
  else if(state.docScore.step===4){state.docScore.result=5;}
  else state.docScore.step++;
  renderDocs();
}
function renderDocScore(){
  const d=state.docScore;
  if(!d.axis) return `<div class="question">Which top-level score are you calibrating?</div><div class="choices">${["Content","Visual Aesthetics","Editability","Overall"].map(a=>choice(a,`setDocScoreAxis('${a}')`)).join('')}</div>`;
  if(d.result!==undefined){const n=d.result;return `<div class="result"><div class="route">Suggested ${d.axis} score</div><div class="big">${n}/5</div><div class="callout"><strong>Official definition:</strong> ${docsOfficial[d.axis][n]}</div><div class="callout"><strong>Calibration interpretation:</strong> ${docsCal[n]}</div><p class="muted">Use the official definition to make the final judgment. Severity beats arithmetic; Overall is not an average.</p><div class="actions"><button class="btn" onclick="setDocScoreAxis('${d.axis}')">Run again</button></div></div>`}
  const qs=["Does this axis fundamentally fail its purpose?","Do multiple Major or pervasive failures materially prevent normal use?","Does one core/Major issue require substantial revision?","Are there several minor issues or a repeated/systemic Moderate weakness?","Are there only a few localized minor issues?"];
  return `<div class="progress"><i style="width:${(d.step+1)*18}%"></i></div><div class="question">${qs[d.step]}</div><div class="choices">${choice("Yes",`docScoreAnswer(true)`) }${choice("No",`docScoreAnswer(false)`)}</div>`;
}

function setSlidesTab(x){state.slidesTab=x;state.slideClass={};renderSlides()}
function renderSlides(){
  let body="";
  if(state.slidesTab==="atlas") body=`<div class="callout gold"><strong>Scale rule:</strong> many Slides tasks use 1–7, but some use 1–5. The exact live task scale always wins.</div><div class="axis-list" style="margin-top:10px">${slidesAxes.map(d=>`<details class="axis-card"><summary>${d.name}</summary><div class="axis-body"><p class="muted" style="margin-top:12px">${d.ask}</p><div class="examples"><div class="example good"><b>Good</b>${d.good}</div><div class="example minor"><b>Minor</b>${d.minor}</div><div class="example major"><b>Major</b>${d.major}</div><div class="example contrast"><b>Boundary</b>${d.contrast}</div></div></div></details>`).join('')}</div><h3 style="margin-top:14px">Default 1–7 ladder</h3><div class="score-ladder seven">${slidesScale.map(s=>`<div class="score-card"><strong>${s.n}</strong><span>${s.t}</span></div>`).join('')}</div><div class="callout"><strong>Golden-example lesson:</strong> poor Layout can coexist with excellent Editability when underlying objects are native. One meaningful limitation can keep an otherwise strong axis at 6 rather than 7.</div>`;
  else body=renderSlideClass();
  $("#slidesScreen").innerHTML=`${sectionHead("Slides Review Coach")}${tabs(["atlas","Classify / Score"],state.slidesTab,"setSlidesTab")} ${body}`;
}
function setSlideClass(k,v){state.slideClass[k]=v;renderSlides()}
function resetSlideClass(){state.slideClass={};renderSlides()}
function renderSlideClass(){
  const s=state.slideClass;
  if(!s.axis) return `<div class="question">What is actually wrong?</div><div class="choices">${slidesAxes.slice(0,5).map(d=>choice(d.name,`setSlideClass('axis','${d.name}')`,d.ask)).join('')}${choice("No meaningful defect","setSlideClass('axis','Overall');setSlideClass('impact','perfect')")}</div>`;
  if(!s.impact) return `<div class="question">How serious is the issue on ${s.axis}?</div><div class="choices">${choice("One optional improvement","setSlideClass('impact','optional')")}${choice("1–3 localized minor issues","setSlideClass('impact','minor')")}${choice("Several minor issues, no major blocker","setSlideClass('impact','several')")}${choice("At least one serious problem before use","setSlideClass('impact','serious')")}${choice("Multiple major issues / heavy rework","setSlideClass('impact','multiple')")}${choice("Broken or unusable","setSlideClass('impact','broken')")}</div>`;
  const map={perfect:7,optional:6,minor:5,several:4,serious:3,multiple:2,broken:1}, n=map[s.impact];
  const a=slidesAxes.find(x=>x.name===s.axis)||slidesAxes[5];
  return `<div class="result"><div class="route">Suggested axis</div><div class="big">${s.axis}</div><div class="route">Suggested default-scale neighborhood</div><div class="big">${n}/7</div><p>${slidesScale.find(x=>x.n===n)?.t||"Ready as-is"}.</p><div class="callout"><strong>Axis boundary:</strong> ${a.contrast}</div><div class="callout"><strong>Remember:</strong> use the exact live scale and instructions. Do not double-count one root defect across axes unless you can name two genuinely different professional consequences.</div><div class="actions"><button class="btn" onclick="resetSlideClass()">Classify another issue</button></div></div>`;
}

function setSlopTab(x){state.slopTab=x;state.slopClass={};renderSlop()}
function renderSlop(){
  let body="";
  if(state.slopTab==="learn") body=`<div class="hero" style="border-left:4px solid var(--slop)"><div class="eyebrow">Core definition</div><h2>Pattern, not punctuation.</h2><p class="lede">AI slop is a pattern where manufactured language replaces clear, specific, evidence-based professional communication.</p></div><div class="callout gold"><strong>Threshold:</strong> do not flag one isolated odd phrase automatically. Flag a pattern when it is conspicuous, repeated, unearned or harmful to the requested writing.</div><div class="pattern-list" style="margin-top:10px">${slopPatterns.map(p=>`<div class="card pattern"><h3>${p.name}</h3><p class="muted">${p.explain}</p><div class="examples"><div class="example minor"><b>Isolated / not necessarily a pattern</b>${p.isolated}</div><div class="example major"><b>Likely pattern</b>${p.pattern}</div></div></div>`).join('')}</div><div class="callout"><strong>Fast test:</strong> Is there actual information underneath the wording?<br>Meaning exists but wording is bloated → Style.<br>Meaning is empty, wrong or unsupported → Substance / Content.<br>Ideas are ordered incoherently → Structure (Docs) or Storytelling (Slides).</div>`;
  else if(state.slopTab==="Assessment") body=`<div class="card slop"><h3>Assessment flow</h3><div class="flow"><span>CLAIM</span><b>→</b><span>OVERVIEW</span><b>→</b><span>READ TO BOTTOM</span><b>→</b><span>REVIEW PATTERNS</span><b>→</b><span>BOTTOM BLUE BUTTONS</span><b>→</b><span>PRACTICE</span></div><p class="muted">The exact assessment definitions and examples are the source of truth. The exact question count and pass threshold are not shown in the materials you provided.</p></div><div class="grid two" style="margin-top:10px"><div class="card"><h3>Five things to remember</h3><p class="muted">1. One weird phrase ≠ automatic slop.<br>2. Repetition and professional harm matter.<br>3. Empty meaning → Substance/Content.<br>4. Bloated language → Style.<br>5. Bad organization → Structure/Storytelling.</p></div><div class="card"><h3>Slides nuance</h3><p class="muted">AI slop is usually penalized in Content. Storytelling can also be affected only when flow, progression, audience fit or professional register is independently harmed. Do not automatically punish both axes for the same phrase.</p></div></div>`;
  else body=renderSlopClass();
  $("#slopScreen").innerHTML=`${sectionHead("AI-Slop Coach")}${tabs(["learn","Assessment","Classify"],state.slopTab,"setSlopTab")} ${body}`;
}
function setSlopClass(k,v){state.slopClass[k]=v;renderSlop()}
function resetSlopClass(){state.slopClass={};renderSlop()}
function renderSlopClass(){
  const s=state.slopClass;
  if(!s.campaign) return `<div class="question">Where are you routing the issue?</div><div class="choices">${choice("Docs","setSlopClass('campaign','Docs')")}${choice("Slides","setSlopClass('campaign','Slides')")}</div>`;
  if(!s.pattern) return `<div class="question">Is it an isolated phrase, or a conspicuous/repeated/harmful pattern?</div><div class="choices">${choice("One isolated phrase","setSlopClass('pattern','isolated')")}${choice("Repeated / conspicuous / harmful pattern","setSlopClass('pattern','pattern')")}</div>`;
  if(!s.type) return `<div class="question">What is fundamentally wrong?</div><div class="choices">${choice("Meaning is vague, inflated, wrong or unsupported","setSlopClass('type','substance')")}${choice("Meaning exists, but wording is formulaic, bloated or jargon-heavy","setSlopClass('type','style')")}${choice("Framing or repetition damages order and progression","setSlopClass('type','structure')")}${choice("Only the page/slide is visually hard to scan","setSlopClass('type','visual')")}</div>`;
  if(!s.impact) return `<div class="question">How much professional harm does it cause?</div><div class="choices">${choice("Small/local cleanup","setSlopClass('impact','minor')")}${choice("Repeated friction, but still usable","setSlopClass('impact','moderate')")}${choice("Replaces real analysis or requires major rewriting","setSlopClass('impact','major')")}</div>`;
  let route="", note="";
  if(s.campaign==="Docs"){
    route={substance:"Content → Writing Substance",style:"Content → Writing Style",structure:"Content → Document Structure",visual:"Visual Aesthetics → Readability"}[s.type];
  } else {
    route={substance:"Content Quality",style:"Usually Content Quality",structure:"Storytelling",visual:"Layout or Aesthetics — follow the actual visual defect"}[s.type];
    if(s.type==="style") note="Professional register may also affect Storytelling only when it independently harms audience fit or narrative delivery.";
  }
  const sev=s.pattern==="isolated"&&s.impact!=="major"?"Not necessarily a slop pattern / likely Minor":({minor:"Minor",moderate:"Moderate pattern",major:"Major pattern"}[s.impact]);
  return `<div class="result"><div class="route">Primary route</div><div class="big">${route}</div><div class="route">Suggested classification</div><div class="big">${sev}</div><p>${s.pattern==="isolated"?"An isolated generic phrase is not automatically a slop pattern. Note it only to the extent it actually affects quality.":"The wording is repeated or harmful enough to treat as a pattern rather than a one-off preference."}</p>${note?`<div class="callout">${note}</div>`:""}<div class="callout"><strong>No double-counting:</strong> use another axis only when you can name a separate professional consequence.</div><div class="actions"><button class="btn" onclick="resetSlopClass()">Classify another example</button></div></div>`;
}

function renderPractice(){
  const filtered=state.practiceFilter==="All"?practiceCases:practiceCases.filter(c=>c.module===state.practiceFilter);
  if(state.practiceIndex>=filtered.length) state.practiceIndex=0;
  const c=filtered[state.practiceIndex];
  $("#practiceScreen").innerHTML=`${sectionHead("Practice Cases")}<div class="practice-top"><div class="filter-row">${["All","Docs","Slides","AI Slop"].map(f=>`<button class="filter ${f===state.practiceFilter?'active':''}" onclick="setPracticeFilter('${f}')">${f}</button>`).join('')}</div><div class="counter">${state.practiceIndex+1}/${filtered.length}</div></div><div class="card ${c.module==='Docs'?'docs':c.module==='Slides'?'slides':'slop'}"><div class="kicker">${c.module}</div><div class="case-title">${c.q}</div><div class="choices" style="margin-top:12px">${c.opts.map((o,i)=>choice(o,`answerPractice(${i})`)).join('')}</div>${state.practiceAnswered?`<div class="callout ${state.practiceChoice===c.a?'':'gold'}"><strong>${state.practiceChoice===c.a?'Correct':'Best answer: '+c.opts[c.a]}</strong><br>${c.why}<br><br><b>Boundary:</b> ${c.contrast}<br><br><b>Score note:</b> ${c.score}</div><div class="actions"><button class="btn primary" onclick="nextPractice()">Next case</button></div>`:""}</div>`;
}
function setPracticeFilter(f){state.practiceFilter=f;state.practiceIndex=0;state.practiceAnswered=false;renderPractice()}
function answerPractice(i){if(state.practiceAnswered)return;state.practiceChoice=i;state.practiceAnswered=true;const filtered=state.practiceFilter==="All"?practiceCases:practiceCases.filter(c=>c.module===state.practiceFilter);const c=filtered[state.practiceIndex];const stats=JSON.parse(localStorage.getItem("pvrPractice")||'{"seen":0,"correct":0}');stats.seen++;if(i===c.a)stats.correct++;localStorage.setItem("pvrPractice",JSON.stringify(stats));renderPractice()}
function nextPractice(){const filtered=state.practiceFilter==="All"?practiceCases:practiceCases.filter(c=>c.module===state.practiceFilter);state.practiceIndex=(state.practiceIndex+1)%filtered.length;state.practiceAnswered=false;state.practiceChoice=null;renderPractice()}

function renderSheets(){
  $("#sheetsScreen").innerHTML=`${sectionHead("Final One-Sheets")}<div class="grid three"><div class="card docs one-sheet-preview"><h3>Docs one-sheet</h3><p>All official Docs axes/sub-axes, 0–5 ladder and the most important category boundaries.</p><button class="btn print-btn" onclick="printSheet('docs')">Print / Save PDF</button></div><div class="card slides one-sheet-preview"><h3>Slides one-sheet</h3><p>Six axes, default 1–7 ladder, major distinctions and rationale reminders.</p><button class="btn print-btn" onclick="printSheet('slides')">Print / Save PDF</button></div><div class="card slop one-sheet-preview"><h3>AI-Slop one-sheet</h3><p>Pattern threshold, four pattern families, routing rules and assessment flow.</p><button class="btn print-btn" onclick="printSheet('slop')">Print / Save PDF</button></div></div>`;
}
function renderHelp(){const stats=JSON.parse(localStorage.getItem("pvrPractice")||'{"seen":0,"correct":0}');$("#helpScreen").innerHTML=`${sectionHead("How to Use This")}<div class="card"><h3>Master rules</h3><p class="muted"><b>Task instructions > campaign rules > general guide.</b><br><br>Route each root issue once. Count and repetition help locate the score range; professional impact decides the final score. Overall is holistic, not arithmetic. Fictional setup data is not automatically inaccurate — check the prompt, sources and context first.</p><h3>Rationale formula</h3><p class="muted"><b>WHERE → WHAT → WHY IT MATTERS.</b> Keep each point short, specific and on the correct axis.</p><h3>Practice progress</h3><p class="muted">${stats.correct} correct out of ${stats.seen} answered in this browser.</p><div class="actions"><button class="btn" onclick="localStorage.removeItem('pvrPractice');alert('Practice progress cleared.')">Clear progress</button><button class="btn" onclick="nav('sheets')">Open one-sheets</button></div></div>`}

function printSheet(type){document.body.dataset.print=type;setTimeout(()=>window.print(),40)}
function buildPrintRoot(){
  const docsRows=docsAxes.map(d=>`<li><b>${d.axis} → ${d.name}:</b> ${d.ask}</li>`).join('');
  const slidesRows=slidesAxes.map(d=>`<li><b>${d.name}:</b> ${d.ask}</li>`).join('');
  const slopRows=slopPatterns.map(d=>`<li><b>${d.name}:</b> ${d.explain}</li>`).join('');
  $("#printRoot").innerHTML=`
  <section class="print-page docs"><h1>Project Vault — Docs One-Sheet</h1><div class="print-grid"><div class="print-box"><h2>Content</h2><ul>${docsRows.split('</li>').slice(0,5).join('</li>')}</ul></div><div class="print-box"><h2>Visual Aesthetics</h2><ul>${docsRows.split('</li>').slice(5,11).join('</li>')}</ul></div><div class="print-box"><h2>Editability + boundaries</h2><ul><li>Can the actual content/data be revised without rebuilding?</li><li>Ideas wrong order → Structure.</li><li>Page hard to scan → Readability.</li><li>Screenshot chart/table → Editability.</li><li>Bad-looking ≠ uneditable.</li></ul></div></div><div class="print-ladder">${[0,1,2,3,4,5].map(n=>`<div><b>${n}</b><br>${docsCal[n]}</div>`).join('')}</div><div class="print-mantra">TASK INSTRUCTIONS > DOCS RULES > GENERAL GUIDE • WHERE → WHAT → WHY IT MATTERS • Overall is holistic, not an average.</div></section>
  <section class="print-page slides"><h1>Project Vault — Slides One-Sheet</h1><div class="print-grid"><div class="print-box"><h2>Axes</h2><ul>${slidesRows}</ul></div><div class="print-box"><h2>Route correctly</h2><ul><li>Wrong/missing/unsupported claims → Content.</li><li>No through-line or poor progression → Storytelling.</li><li>Typography/color/image quality → Aesthetics.</li><li>Spacing/overlap/cutoff → Layout.</li><li>Flat objects/screenshots → Editability.</li><li>Do not double-count one root defect.</li></ul></div><div class="print-box"><h2>Rationales</h2><ul><li>Name the slide or element.</li><li>State the issue.</li><li>Explain professional impact.</li><li>Ranking must match Overall scores.</li><li>Bad-looking can still be editable.</li></ul></div></div><div class="print-ladder">${slidesScale.map(s=>`<div><b>${s.n}</b><br>${s.t}</div>`).join('')}</div><div class="print-mantra">Use the exact live scale. A 7 means no meaningful issue. Overall is holistic.</div></section>
  <section class="print-page slop"><h1>Project Vault — AI-Slop One-Sheet</h1><div class="print-grid"><div class="print-box"><h2>Threshold</h2><ul><li>Pattern, not punctuation.</li><li>Flag when conspicuous, repeated, unearned or harmful.</li><li>One isolated generic phrase is not automatically slop.</li><li>Ask: is there actual information underneath?</li></ul></div><div class="print-box"><h2>Four patterns</h2><ul>${slopRows}</ul></div><div class="print-box"><h2>Route</h2><ul><li>Empty/wrong/unsupported meaning → Substance / Content.</li><li>Bloated/formulaic/jargon-heavy wording → Style.</li><li>Bad order/repetition → Docs Structure / Slides Storytelling.</li><li>Only hard to scan → Readability / Layout.</li><li>Slides: usually Content; add Storytelling only for a separate narrative consequence.</li></ul></div></div><div class="print-mantra">Assessment flow: CLAIM → OVERVIEW → REVIEW PATTERNS → BOTTOM BLUE BUTTONS → PRACTICE. Exact assessment instructions win.</div></section>`;
}

function toggleTheme(){document.body.classList.toggle("light");localStorage.setItem("pvrTheme",document.body.classList.contains("light")?"light":"dark")}
function runSelfTests(){
  const results=[];const test=(n,c)=>results.push({n,c});
  state.docClass={axis:"Content",sub:"Writing Style",scope:"isolated",core:false,usable:true,repair:"tiny"};test("Docs Minor → 4",docResult().score===4);
  state.docClass={axis:"Content",sub:"Instruction Following",scope:"isolated",core:true,usable:false,repair:"substantial"};test("Docs Major → 2",docResult().score===2);
  state.docClass={axis:"Editability",scope:"throughout",core:true,usable:false,repair:"unusable"};test("Docs failure → 0",docResult().score===0);
  test("18 practice cases",practiceCases.length===18);
  test("Docs dependent axes",docsAxes.filter(x=>x.axis==="Content").length===5&&docsAxes.filter(x=>x.axis==="Visual Aesthetics").length===6);
  state.docClass={};window.__reviewCoachTests={passed:results.filter(x=>x.c).length,total:results.length,results};
}

window.nav=nav;window.setDocsTab=setDocsTab;window.setDocClass=setDocClass;window.resetDocClass=resetDocClass;window.setDocScoreAxis=setDocScoreAxis;window.docScoreAnswer=docScoreAnswer;window.setSlidesTab=setSlidesTab;window.setSlideClass=setSlideClass;window.resetSlideClass=resetSlideClass;window.setSlopTab=setSlopTab;window.setSlopClass=setSlopClass;window.resetSlopClass=resetSlopClass;window.setPracticeFilter=setPracticeFilter;window.answerPractice=answerPractice;window.nextPractice=nextPractice;window.printSheet=printSheet;window.toggleTheme=toggleTheme;

$$(".bottom-nav button").forEach(b=>b.addEventListener("click",()=>nav(b.dataset.go)));
$("#themeBtn").addEventListener("click",toggleTheme);$("#printBtn").addEventListener("click",()=>nav("sheets"));
if(localStorage.getItem("pvrTheme")==="light")document.body.classList.add("light");
buildPrintRoot();runSelfTests();renderStart();
