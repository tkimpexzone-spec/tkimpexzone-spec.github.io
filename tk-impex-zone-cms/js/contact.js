import { supabase, supabaseReady } from "./supabase.js";
import { WHATSAPP_NUMBER } from "./config.js";
import "./site.js";
const form=document.getElementById("enquiryForm"), msg=document.getElementById("formMessage");
const params=new URLSearchParams(location.search);if(params.get("product"))form.elements.product_name.value=params.get("product");
form.addEventListener("submit",async e=>{
 e.preventDefault();msg.textContent="";
 const d=Object.fromEntries(new FormData(form).entries());
 if(!supabaseReady){msg.textContent="Enquiry service is not configured yet. Please use WhatsApp or contact us directly.";return;}
 try{
 const {error}=await supabase.from("enquiries").insert({name:d.name,company_name:d.company_name,email:d.email,phone:d.phone,country:d.country,product_name:d.product_name,quantity:d.quantity,message:d.message});
 if(error)throw error; form.reset();msg.textContent="Thank you. Your enquiry has been submitted successfully.";
 }catch(err){console.error(err);msg.textContent="We could not submit your enquiry. Please try WhatsApp instead.";}
});
