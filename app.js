const PRODUCTS=[
 {id:"coco-ball",name:"Coco Ball",price:10,image:"assets/coco-ball-v5.png",desc:"Round crunchy bites coated in rich melted chocolate."},
 {id:"mini-coco-crunch",name:"Mini Coco Crunch",price:10,image:"assets/mini-coco-crunch-v5.png",desc:"Mini crispy pieces covered in smooth chocolate for extra crunch."},
 {id:"coco-rice",name:"Coco Rice",price:10,image:"assets/coco-rice-v5.png",desc:"Crispy rice pieces coated in creamy, indulgent chocolate."}
];
let cart=JSON.parse(localStorage.getItem("chotliciousCart")||"{}");
const $=s=>document.querySelector(s);
const money=n=>`RM${n.toFixed(2)}`;
function save(){localStorage.setItem("chotliciousCart",JSON.stringify(cart));renderCart()}
function totalQty(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function subtotal(){return Object.entries(cart).reduce((sum,[id,qty])=>{const p=PRODUCTS.find(x=>x.id===id);return sum+(p?p.price*qty:0)},0)}
function renderProducts(){
 const grid=$("#productGrid");
 if(!grid)return;
 grid.innerHTML=PRODUCTS.map((p,i)=>`<article class="product-card"><div class="product-image-wrap"><img class="product-image" src="${p.image}" alt="${p.name}"><span class="flavour-tag">0${i+1} · ${p.name}</span></div><div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p><div class="price-row"><span class="price">${money(p.price)} / jar</span><button class="add-btn" data-add="${p.id}">Add to bag +</button></div></div></article>`).join("");
 document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>add(b.dataset.add));
}
function add(id){cart[id]=(cart[id]||0)+1;save();toast("Added to your bag ♡")}
function change(id,d){cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];save()}
function remove(id){delete cart[id];save()}
function renderCart(){
 const count=$("#cartCount"), itemsBox=$("#cartItems"), sub=$("#cartSubtotal");
 if(!count||!itemsBox||!sub)return;
 count.textContent=totalQty();
 const items=Object.entries(cart);
 itemsBox.innerHTML=items.length?items.map(([id,q])=>{
   const p=PRODUCTS.find(x=>x.id===id);
   return `<div class="cart-item"><img src="${p.image}" alt="${p.name}"><div><h4>${p.name}</h4><div class="qty"><button data-minus="${id}">−</button><strong>${q}</strong><button data-plus="${id}">+</button></div></div><div><strong>${money(p.price*q)}</strong><br><button class="remove" data-remove="${id}">Remove</button></div></div>`
 }).join(""):`<p>Your bag is waiting for some chocolate. 🍫</p>`;
 sub.textContent=money(subtotal());
 document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>change(b.dataset.minus,-1));
 document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>change(b.dataset.plus,1));
 document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>remove(b.dataset.remove));
}
function openCart(){$("#cartDrawer")?.classList.add("open");$("#cartDrawer")?.setAttribute("aria-hidden","false")}
function closeCart(){$("#cartDrawer")?.classList.remove("open");$("#cartDrawer")?.setAttribute("aria-hidden","true")}
function openCheckout(){
 if(!totalQty()){toast("Add a jar first ♡");return}
 closeCart();
 $("#checkoutView").innerHTML=`<p class="script-label">A sweet final step</p><h2 class="checkout-title">Almost yours.</h2><p class="checkout-sub">RM10 per jar. Enter your details and choose a payment method.</p><form id="checkoutForm"><div class="checkout-grid"><div class="field"><label>Full name</label><input required autocomplete="name"></div><div class="field"><label>Phone</label><input required inputmode="tel" autocomplete="tel"></div><div class="field"><label>Email</label><input type="email" required autocomplete="email"></div><div class="field"><label>Postcode</label><input required inputmode="numeric" autocomplete="postal-code"></div><div class="field full-field"><label>Delivery address</label><textarea rows="3" required autocomplete="street-address"></textarea></div></div><div class="field"><label>Payment method</label><div class="payment-options"><label class="payment-option"><input type="radio" name="payment" value="FPX / Online Banking" required> FPX / Online Banking</label><label class="payment-option"><input type="radio" name="payment" value="DuitNow QR"> DuitNow QR</label><label class="payment-option"><input type="radio" name="payment" value="Visa / Mastercard"> Visa / Mastercard</label><label class="payment-option"><input type="radio" name="payment" value="Touch 'n Go eWallet"> Touch 'n Go eWallet</label><label class="payment-option"><input type="radio" name="payment" value="GrabPay"> GrabPay</label><label class="payment-option"><input type="radio" name="payment" value="Boost"> Boost</label><label class="payment-option"><input type="radio" name="payment" value="ShopeePay"> ShopeePay</label><label class="payment-option"><input type="radio" name="payment" value="BNPL"> Instalment / BNPL</label></div></div><div class="order-total"><span>Total</span><span>${money(subtotal())}</span></div><p class="mini-note">Demo mode: no card or banking credentials are collected here. A live version should redirect customers to the payment provider's secure hosted checkout.</p><button class="button primary full" type="submit">Continue to secure payment →</button></form>`;
 $("#checkoutModal").classList.add("open");
 $("#checkoutForm").onsubmit=e=>{e.preventDefault();completeDemoOrder(new FormData(e.target))}
}
function closeCheckout(){$("#checkoutModal")?.classList.remove("open");$("#checkoutModal")?.setAttribute("aria-hidden","true")}
function completeDemoOrder(form){
 const order="CHT-"+Math.floor(100000+Math.random()*900000);
 $("#checkoutView").innerHTML=`<div class="success"><div class="check">✓</div><p class="script-label">Order received</p><h2>Thank you!</h2><p>Your demo order <strong>${order}</strong> has been created using <strong>${form.get("payment")}</strong>.</p><p>For the live version, this step will redirect to the payment provider's secure hosted page.</p><button class="button primary" id="doneBtn">Back to shop</button></div>`;
 cart={};save();$("#doneBtn").onclick=closeCheckout
}
function toast(msg){const t=$("#toast");if(!t)return;t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
renderProducts();renderCart();
$("#openCart")?.addEventListener("click",openCart);
$("#closeCart")?.addEventListener("click",closeCart);
$("#checkoutBtn")?.addEventListener("click",openCheckout);
$("#closeCheckout")?.addEventListener("click",closeCheckout);
$("#cartDrawer")?.addEventListener("click",e=>{if(e.target.id==="cartDrawer")closeCart()});
$("#checkoutModal")?.addEventListener("click",e=>{if(e.target.id==="checkoutModal")closeCheckout()});
