import { supabase, supabaseReady, escapeHtml } from "./supabase.js";
import { WHATSAPP_NUMBER } from "./config.js";
import "./site.js";
const heroImage=document.getElementById("heroImage");
async function loadHome(){
  if(!supabaseReady){document.getElementById("featuredProducts").innerHTML='<div class="empty-state">Connect Supabase and add published products to populate this section. The sample division imagery is currently shown.</div>';return;}
  const [{data:banners},{data:products}] = await Promise.all([
    supabase.from("banners").select("*").eq("is_published",true).order("sort_order").limit(1),
    supabase.from("products").select("id,name,slug,short_description,division_id,cover_image_url,divisions(name,slug)").eq("is_published",true).eq("is_featured",true).order("sort_order").limit(6)
  ]);
  if(banners?.[0]){
    const b=banners[0]; if(b.image_url) heroImage.style.backgroundImage=`url("${b.image_url}")`;
    document.getElementById("heroTitle").innerHTML=escapeHtml(b.heading||"Connecting Resources.") ;
    document.getElementById("heroText").textContent=b.subheading||"A sourcing and trading partner for agricultural commodities, stones and minerals.";
  }
  const grid=document.getElementById("featuredProducts");
  grid.innerHTML=products?.length?products.map(p=>`<article class="product-card"><img src="${escapeHtml(p.cover_image_url||"https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80")}" alt="${escapeHtml(p.name)}" loading="lazy"><div class="product-card-body"><p class="eyebrow">${escapeHtml(p.divisions?.name||"PRODUCT")}</p><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.short_description||"Explore product details and specifications.")}</p><a href="product.html?slug=${encodeURIComponent(p.slug)}">VIEW PRODUCT ↗</a></div></article>`).join(""):'<div class="empty-state">No featured products have been published yet. Use the admin dashboard to add and feature products.</div>';
}
loadHome().catch(e=>{console.error(e);document.getElementById("featuredProducts").innerHTML='<div class="empty-state">Unable to load products. Please check the Supabase setup.</div>';});
