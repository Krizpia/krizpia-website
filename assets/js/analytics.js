(function(){
  'use strict';
  var CONSENT_KEY='krizpia_consent_v1';
  var CONSENT_VERSION='2026-07-analytics-v1';
  var allowedEvents=new Set(['whatsapp_click','phone_click','email_click','instagram_click','select_item','view_item','add_to_cart','remove_from_cart','view_cart','form_start','form_error','generate_lead','video_start','video_progress','video_complete','article_view','cta_click']);
  var piiKeys=/name|phone|email|message|address|customer/i;
  var products={
    'traditional-kuzhalappam':{id:'traditional_kuzhalappam',name:'Traditional Kuzhalappam',variant:'traditional'},
    'spicy-kuzhalappam':{id:'spicy_kuzhalappam',name:'Spicy Kuzhalappam',variant:'spicy'},
    'sweet-kuzhalappam':{id:'sweet_kuzhalappam',name:'Sweet Kuzhalappam',variant:'sweet'},
    'thatta':{id:'thatta',name:'Thatta',variant:'thatta'}
  };
  window.dataLayer=window.dataLayer||[];
  function gtag(){window.dataLayer.push(arguments);} window.gtag=window.gtag||gtag;
  function cleanUrl(url){try{var u=new URL(url,location.href); u.search=''; u.hash=''; return u.href;}catch(e){return undefined;}}
  function text(el){return ((el&& (el.getAttribute('aria-label')||el.textContent))||'').replace(/\s+/g,' ').trim().slice(0,80).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')||undefined;}
  function pageType(){var p=location.pathname; if(p==='/'||p==='/index.html')return 'home'; if(/privacy|terms|shipping|refund/.test(p))return 'policy'; if(/blog|guide|snacks|travel|healthy|rice-flour/.test(p))return 'blog_article'; if(productFromPath())return 'product'; return 'content';}
  function productFromPath(){var path=location.pathname.toLowerCase(); for(var k in products){ if(path.indexOf(k)>-1) return products[k]; } return null;}
  function productFromElement(el){var cur=el; while(cur&&cur!==document){ for(var k in products){ var hay=((cur.getAttribute&&((cur.getAttribute('href')||'')+' '+(cur.dataset.product||'')+' '+cur.textContent))||'').toLowerCase(); if(hay.indexOf(k)>-1 || hay.indexOf(products[k].name.toLowerCase())>-1) return products[k]; } cur=cur.parentNode;} return null;}
  function sanitize(params){var out={page_type:pageType(),page_title:document.title,page_path:location.pathname}; Object.keys(params||{}).forEach(function(k){var v=params[k]; if(v==null||piiKeys.test(k))return; if(typeof v==='string'){ if(/@/.test(v)||/\+?\d[\d\s().-]{6,}/.test(v)) return; v=v.replace(/\s+/g,' ').trim(); } out[k]=v;}); return out;}
  var recent={};
  window.pushKrizpiaEvent=function(eventName,parameters){try{ if(!allowedEvents.has(eventName)) return false; var payload=sanitize(parameters||{}); var key=eventName+JSON.stringify(payload); var now=Date.now(); if(recent[key]&&now-recent[key]<600)return false; recent[key]=now; window.dataLayer.push(Object.assign({event:eventName},payload)); return true;}catch(e){return false;}};
  function readConsent(){try{var raw=localStorage.getItem(CONSENT_KEY); if(!raw)return null; var c=JSON.parse(raw); return c.version===CONSENT_VERSION?c:null;}catch(e){return null;}}
  function saveConsent(choice){try{localStorage.setItem(CONSENT_KEY,JSON.stringify({choice:choice,version:CONSENT_VERSION,timestamp:new Date().toISOString()}));}catch(e){} }
  function updateConsent(choice){var granted=choice==='analytics_on'; window.gtag('consent','update',{analytics_storage:granted?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted'}); window.dataLayer.push({event:'krizpia_consent_update',analytics_storage:granted?'granted':'denied'});}
  function setupConsent(){var banner=document.getElementById('cookieConsent'); if(!banner)return; var accept=banner.querySelector('[data-cookie-accept]'); var decline=banner.querySelector('[data-cookie-decline]'); var saved=readConsent(); if(saved){banner.hidden=true; updateConsent(saved.choice); } else {banner.hidden=false;}
    function choose(choice){saveConsent(choice); updateConsent(choice); banner.hidden=true;}
    if(accept)accept.addEventListener('click',function(){choose('analytics_on');}); if(decline)decline.addEventListener('click',function(){choose('analytics_off');});
    document.querySelectorAll('[data-open-cookie-preferences]').forEach(function(btn){btn.addEventListener('click',function(){banner.hidden=false; if(accept)accept.focus();});});
  }
  function quantityBucket(v){var n=parseInt(String(v||'').match(/\d+/)); if(!n)return 'not_provided'; if(n===1)return '1'; if(n<=5)return '2_to_5'; if(n<=10)return '6_to_10'; if(n<=25)return '11_to_25'; if(n<=50)return '26_to_50'; return '51_plus';}
  function setupClicks(){document.addEventListener('click',function(e){var a=e.target.closest('a,button'); if(!a||a.dataset.trackedClick)return; a.dataset.trackedClick='1'; setTimeout(function(){delete a.dataset.trackedClick;},0); var href=a.getAttribute('href')||''; var p=productFromElement(a); var base={link_text:text(a),button_location:(a.closest('footer')?'footer':a.closest('header')?'header':a.closest('section')?a.closest('section').id||'body':'body')}; if(p)Object.assign(base,{product_id:p.id,product_name:p.name,product_category:'kerala_snacks',product_variant:p.variant});
      if(/^https?:\/\/(wa\.me|api\.whatsapp\.com)|^whatsapp:\/\//i.test(href)) return window.pushKrizpiaEvent('whatsapp_click',Object.assign(base,{contact_method:'whatsapp',link_url:cleanUrl(href)}));
      if(/^tel:/i.test(href)) return window.pushKrizpiaEvent('phone_click',Object.assign(base,{contact_method:'phone'}));
      if(/^mailto:/i.test(href)) return window.pushKrizpiaEvent('email_click',Object.assign(base,{contact_method:'email'}));
      if(/instagram\.com/i.test(href)) return window.pushKrizpiaEvent('instagram_click',Object.assign(base,{social_platform:'instagram'}));
      if(p && /view_product|product|card/.test((text(a)||'')+' '+href)) return window.pushKrizpiaEvent('select_item',{item_list_id:'homepage_product_range',item_list_name:'Homepage Product Range',items:[{item_id:p.id,item_name:p.name,item_brand:'Krizpia',item_category:'Kerala Snacks',item_variant:p.variant,quantity:1}],product_id:p.id,product_name:p.name});
      if(/send_enquiry|open_video|explore_products|read_customer_feedback|view_all_blog_articles/.test(text(a)||'')) return window.pushKrizpiaEvent('cta_click',Object.assign(base,{cta_name:text(a),cta_location:base.button_location,link_url:cleanUrl(href)}));
    },true);}
  function setupForm(){var form=document.getElementById('enquiryForm'); if(!form)return; var started=false; form.addEventListener('input',function(){if(!started){started=true; window.pushKrizpiaEvent('form_start',{form_id:form.id,form_name:'product_enquiry'});}},true); form.addEventListener('submit',function(e){var invalid=form.querySelectorAll(':invalid').length; if(invalid){window.pushKrizpiaEvent('form_error',{form_id:form.id,form_name:'product_enquiry',form_status:'validation_error',error_count:invalid,error_type:'required_field'}); return;} var fd=new FormData(form); var p=products[String(fd.get('product')||'').toLowerCase().replace(/\s+/g,'-')]; window.pushKrizpiaEvent('generate_lead',{form_id:form.id,form_name:'product_enquiry',form_status:'success',contact_method:'form',product_id:p&&p.id,product_name:p&&p.name,enquiry_type:String(fd.get('product')||'product_enquiry').toLowerCase().replace(/[^a-z0-9]+/g,'_'),quantity_bucket:quantityBucket(fd.get('quantity'))});},true);}
  function setupVideo(){document.querySelectorAll('video').forEach(function(v){var title=v.getAttribute('title')||v.getAttribute('aria-label')||'krizpia_process_video'; var marks={}; v.addEventListener('play',function(){window.pushKrizpiaEvent('video_start',{video_title:title,video_percent:0});},{once:true}); v.addEventListener('timeupdate',function(){if(!v.duration)return; [25,50,75].forEach(function(m){if(!marks[m]&&v.currentTime/v.duration*100>=m){marks[m]=1;window.pushKrizpiaEvent('video_progress',{video_title:title,video_percent:m});}});}); v.addEventListener('ended',function(){window.pushKrizpiaEvent('video_complete',{video_title:title,video_percent:100});});});}
  function pageEvents(){var p=productFromPath(); if(p)window.pushKrizpiaEvent('view_item',{currency:'INR',items:[{item_id:p.id,item_name:p.name,item_brand:'Krizpia',item_category:'Kerala Snacks',item_variant:p.variant,quantity:1}],product_id:p.id,product_name:p.name}); if(pageType()==='blog_article')window.pushKrizpiaEvent('article_view',{article_title:document.querySelector('h1')?document.querySelector('h1').textContent.trim():document.title,article_category:'kerala_snacks'});}
  document.addEventListener('DOMContentLoaded',function(){setupConsent();setupClicks();setupForm();setupVideo();pageEvents();});
})();
