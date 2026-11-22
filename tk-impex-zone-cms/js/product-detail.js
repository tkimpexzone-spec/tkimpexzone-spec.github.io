import { supabase, supabaseReady, escapeHtml } from "./supabase.js";
import { WHATSAPP_NUMBER } from "./config.js";
import "./site.js";
const root=document.getElementById("productDetail"), slug=new URLSearchParams(location.search).get("slug");
async function load(){
 if(!supabaseReady||!slug){root.innerHTML='<div class="container section-pad">Product unavailable. Please return to the <a href="products.html">catalogue</a>.</div>';return;}
 const {data:p,error}=await supabase.from("products").select("*,divisions(name),categories(name),product_images(id,image_url,alt_text,sort_order)").eq("slug",slug).eq("is_published",true).single();
 if(error||!p){root.innerHTML='<div class="container section-pad">Product not found. <a href="products.html">Browse products</a>.</div>';return;}
 document.title=`${p.seo_title||p.name} | TK Impex Zone`;
 document.querySelector('meta[name="description"]')?.setAttribute("content",p.seo_description||p.short_description||"");
 const images=(p.product_images||[]).sort((a,b)=>a.sort_order-b.sort_order); if(p.cover_image_url&&!images.some(i=>i.image_url===p.cover_image_url))images.unshift({image_url:p.cover_image_url,alt_text:p.name});
 const first=images[0]?.image_url||"";
 const specs=Object.entries(p.specifications||{}).map(([k,v])=>`<div><span>${escapeHtml(k)}</span><b>${escapeHtml(v)}</b></div>`).join("");
 const msg=encodeURIComponent(`Hello TK Impex Zone, I am interested in ${p.name}. Please share details.`);
 root.innerHTML=`<section class="container section-pad"><p class="eyebrow">${escapeHtml(p.divisions?.name||"PRODUCT")} / ${escapeHtml(p.categories?.name||"")}</p><div class="gallery-layout"><div><img class="gallery-main" id="mainProductImage" src="${escapeHtml(first)}" alt="${escapeHtml(p.name)}">${images.length>1?`<div class="gallery-thumbs">${images.map((i,n)=>`<img class="${n===0?"selected":""}" src="${escapeHtml(i.image_url)}" data-image="${escapeHtml(i.image_url)}" alt="${escapeHtml(i.alt_text||p.name)}">`).join("")}</div>`:""}</div><div class="detail-info"><h1>${escapeHtml(p.name)}</h1><p class="detail-desc">${escapeHtml(p.description||p.short_description||"Contact us for product information.")}</p><div class="spec-list">${specs}${p.origin?`<div><span>Origin</span><b>${escapeHtml(p.origin)}</b></div>`:""}${p.grades?`<div><span>Available grades</span><b>${escapeHtml(p.grades)}</b></div>`:""}${p.packaging?`<div><span>Packaging</span><b>${escapeHtml(p.packaging)}</b></div>`:""}</div><a class="button button-dark" href="contact.html?product=${encodeURIComponent(p.name)}">Send enquiry ↗</a> <a class="text-link dark" target="_blank" rel="noopener" href="https://wa.me/${WHATSAPP_NUMBER}?text=${msg}">WhatsApp ↗</a></div></div></section>`;
 root.querySelectorAll(".gallery-thumbs img").forEach(img=>img.addEventListener("click",()=>{root.querySelector("#mainProductImage").src=img.dataset.image;root.querySelectorAll(".gallery-thumbs img").forEach(x=>x.classList.remove("selected"));img.classList.add("selected");}));
}
load();
