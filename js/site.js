document.querySelectorAll(".year").forEach(el=>el.textContent=new Date().getFullYear());
document.getElementById("year")?.replaceChildren(String(new Date().getFullYear()));
document.querySelector(".menu-toggle")?.addEventListener("click",()=>document.querySelector(".main-nav")?.classList.toggle("open"));
