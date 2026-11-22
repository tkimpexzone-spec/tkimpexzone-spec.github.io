import { supabase, supabaseReady, escapeHtml } from "./supabase.js";
import "./site.js";
const list=document.getElementById("productList"), filter=document.getElementById("divisionFilter");
const params=new URLSearchParams(location.search); if(params.get("division"))filter.value=params.get("division");
async function load(){
 if(!supabaseReady){list.innerHTML='<div class="empty-state">Connect Supabase and publish products from the admin dashboard to display your catalogue.</div>';return;}
 let q=supabase.from("products").select("id,name,slug,short_description,cover_image_url,divisions(name,slug)").eq("is_published",true).order("sort_order");
 if(filter.value) q=q.eq("divisions.slug",filter.value);
 const {data,error}=await q; if(error)throw error;
 list.innerHTML=data?.length?data.map(p=>`<article class="product-card"><img src="${escapeHtml(p.cover_image_url||"")}" alt="${escapeHtml(p.name)}" loading="lazy"><div class="product-card-body"><p class="eyebrow">${escapeHtml(p.divisions?.name||"")}</p><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.short_description||"")}</p><a href="product.html?slug=${encodeURIComponent(p.slug)}">VIEW DETAILS ↗</a></div></article>`).join(""):'<div class="empty-state">No products found in this division.</div>';
}
filter.addEventListener("change",load);load().catch(e=>{console.error(e);list.innerHTML='<div class="empty-state">Could not load catalogue. Check Supabase configuration.</div>';});
