'use strict';
// Career Ready: the choices made once for every job (replaces the AI Fellow course.cjs).
// Written at BAU Innovate 2026. The state code says what a fact IS: proposed (said, not yet checked,
// hatched), confirmed (stated in the posting or checked) and decided (a choice by a named owner).
// People are not defined here: each job's cast is drawn with illustrations.figure() from the AI's
// looks, so nothing in the define-once registries changes between jobs.
const {T,defineStates,STATES}=require('./design.cjs');
const {defineParts,PARTS}=require('./templates.cjs');

if(!STATES.proposed) {
  defineStates({
    proposed:{color:T.slate,label:'Proposed',treatment:'hatched',meaning:'Said or suggested, not yet checked'},
    confirmed:{color:T.cobalt,label:'Confirmed',meaning:'Stated in the posting or checked against a source'},
    decided:{color:T.umber,label:'Decided',meaning:'A decision made by a named owner'},
  },{aliases:{draft:'proposed',checked:'confirmed',posting:'confirmed',approved:'decided'}});
}

if(!PARTS.I) {
  defineParts({
    I:{name:'The organization',layout:'heroRight',motif:'columns'},
    II:{name:'The work',layout:'heroLeft',motif:'grid'},
    III:{name:'The role',layout:'heroBelow',motif:'ledger'},
    IV:{name:'Getting hired',layout:'heroLeft',motif:'form'},
    V:{name:'The first 90 days',layout:'heroRight',motif:'calendar'},
    VI:{name:'Growth',layout:'heroBelow',motif:'columns'},
  });
}

module.exports={};
