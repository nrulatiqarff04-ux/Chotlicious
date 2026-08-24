const PRODUCTS = [
  {id:"coco-ball", name:"Coco Ball", price:10, tag:"Round & crunchy", image:"/assets/coco-ball.jpeg", desc:"Crunchy round bites covered in smooth melted chocolate. A simple, chocolatey favourite with a satisfying bite."},
  {id:"mini-coco-crunch", name:"Mini Coco Crunch", price:10, tag:"Tiny & crispy", image:"/assets/mini-coco-crunch.jpg", desc:"Mini crispy pieces coated in melted chocolate for a lighter, extra-crunchy snack."},
  {id:"coco-rice", name:"Coco Rice", price:10, tag:"Crispy classic", image:"/assets/coco-rice.jpeg", desc:"Crispy rice pieces covered in rich melted chocolate for a classic crunchy chocolate jar."}
];

let cart = JSON.parse(localStorage.getItem("chotlicious_cart") || "{}");
let modalProduct = null;
let modalQty = 1;

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => `RM${Number(n).toFixed(2)}`;

function persist(){ localStorage.setItem("chotlicious_cart", JSON.stringify(cart)); renderCart(); }
function qtyTotal(){ return Object.values(cart).reduce((a,b)=>a+b,0); }
function cartSubtotal(){ return Object.entries(cart).reduce((sum,[id,qty]) => {
  const p=PRODUCTS.find(x=>x.id===id); return sum+(p?p.price*qty:0);
},0); }

function renderProducts(){
  $("#productGrid").innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-tag">${p.tag}</span>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-bottom">
          <div class="price">${money(p.price)} <small>/ jar</small></div>
          <div class="product-buttons">
            <button class="small-btn quick-btn" data-quick="${p.id}" type="button">View</button>
            <button class="small-btn add-btn" data-add="${p.id}" type="button">Add</button>
          </div>
        </div>
      </div>
    </article>`).join("");

  $$("[data-add]").forEach(b=>b.onclick=()=>addToCart(b.dataset.add,1));
  $$("[data-quick]").forEach(b=>b.onclick=()=>openProduct(b.dataset.quick));
}

function addToCart(id, qty=1){
  cart[id]=(cart[id]||0)+qty;
  persist();
  showToast("Added to your cart ♡");
}

function changeQty(id, delta){
  cart[id]=(cart[id]||0)+delta;
  if(cart[id]<=0) delete cart[id];
  persist();
}

function removeItem(id){
  delete cart[id];
  persist();
}

function renderCart(){
  $("#cartCount").textContent=qtyTotal();
  const entries=Object.entries(cart);
  $("#cartItems").innerHTML=entries.length ? entries.map(([id,qty])=>{
    const p=PRODUCTS.find(x=>x.id===id);
    return `<div class="cart-item">
      <img src="${p.image}" alt="${p.name}">
      <div>
        <h4>${p.name}</h4>
        <div class="line-price">${money(p.price*qty)}</div>
        <div class="cart-controls">
          <button class="qty-btn" data-minus="${id}" type="button">−</button>
          <strong>${qty}</strong>
          <button class="qty-btn" data-plus="${id}" type="button">+</button>
        </div>
      </div>
      <button class="remove-btn" data-remove="${id}" type="button">Remove</button>
    </div>`;
  }).join("") : `<div class="empty-cart"><div><p style="font-size:36px;margin:0">🍫</p><p>Your cart is waiting for some chocolate.</p><button class="btn btn-dark" id="emptyShop">Shop cocojar</button></div></div>`;

  $("#cartSubtotal").textContent=money(cartSubtotal());
  $$("[data-minus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));
  $$("[data-plus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));
  $$("[data-remove]").forEach(b=>b.onclick=()=>removeItem(b.dataset.remove));
  const emptyShop=$("#emptyShop"); if(emptyShop) emptyShop.onclick=closeCart;
}

function openCart(){
  $("#cartDrawer").classList.add("open"); $("#cartOverlay").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden","false"); document.body.classList.add("locked");
}
function closeCart(){
  $("#cartDrawer").classList.remove("open"); $("#cartOverlay").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden","true"); document.body.classList.remove("locked");
}

function openModal(id){
  const el=$("#"+id); el.classList.add("open"); el.setAttribute("aria-hidden","false"); document.body.classList.add("locked");
}
function closeModal(id){
  const el=$("#"+id); el.classList.remove("open"); el.setAttribute("aria-hidden","true");
  if(!$("#cartDrawer").classList.contains("open")) document.body.classList.remove("locked");
}

function openProduct(id){
  modalProduct=PRODUCTS.find(p=>p.id===id); modalQty=1;
  $("#modalProductImage").src=modalProduct.image;
  $("#modalProductImage").alt=modalProduct.name;
  $("#modalProductName").textContent=modalProduct.name;
  $("#modalProductDesc").textContent=modalProduct.desc;
  $("#modalQty").textContent=modalQty;
  openModal("productModal");
}

function openCheckout(){
  if(!qtyTotal()){ showToast("Your cart is empty."); return; }
  closeCart();
  const total=cartSubtotal();
  $("#checkoutContent").innerHTML=`
    <p class="kicker">SECURE CHECKOUT</p>
    <h2>Almost<br><em>yours.</em></h2>
    <p class="checkout-sub">Enter the customer's details. When the live gateway is connected, the order will be sent to a secure hosted payment page and the site will never ask for a card PIN, banking password or OTP.</p>
    <form id="checkoutForm">
      <div class="checkout-grid">
        <div class="field"><label>Full name</label><input name="name" autocomplete="name" required></div>
        <div class="field"><label>Phone number</label><input name="phone" inputmode="tel" autocomplete="tel" required></div>
        <div class="field"><label>Email</label><input name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label>Postcode</label><input name="postcode" inputmode="numeric" autocomplete="postal-code" required></div>
        <div class="field" style="grid-column:1/-1"><label>Delivery address</label><textarea name="address" rows="3" autocomplete="street-address" required></textarea></div>
      </div>
      <div class="payment-box">
        <h3>Payment gateway</h3>
        <p class="gateway-note">For the live version, Chotlicious will redirect customers to the merchant's activated gateway. Payment availability is controlled by the merchant account.</p>
        <div class="payment-method-list">
          <span>FPX / Online Banking</span><span>DuitNow QR</span><span>Visa / Mastercard</span>
          <span>Touch 'n Go</span><span>GrabPay</span><span>Boost</span><span>ShopeePay</span>
        </div>
      </div>
      <div class="checkout-summary"><span>Total</span><span>${money(total)}</span></div>
      <button class="btn btn-dark full" type="submit">Continue to secure payment <span>→</span></button>
    </form>`;
  openModal("checkoutModal");
  $("#checkoutForm").onsubmit=e=>{
    e.preventDefault();
    createPayment(e.target);
  };
}

async function createPayment(form){
  const submit=form.querySelector("button[type=submit]");
  submit.disabled=true; submit.innerHTML="Preparing secure payment…";
  const data=Object.fromEntries(new FormData(form).entries());
  const order={
    customer:data,
    items:Object.entries(cart).map(([id,qty])=>({id,qty})),
    total:cartSubtotal()
  };

  try{
    const res=await fetch("/api/create-payment",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(order)
    });
    if(!res.ok) throw new Error("Payment endpoint unavailable");
    const result=await res.json();
    if(result.paymentUrl){
      window.location.href=result.paymentUrl;
      return;
    }
    throw new Error(result.message || "No payment URL returned");
  }catch(err){
    // Safe prototype fallback: do not pretend a real payment happened.
    $("#checkoutContent").innerHTML=`
      <div class="success">
        <div class="success-icon">!</div>
        <p class="kicker">PROTOTYPE MODE</p>
        <h2>Checkout is ready.</h2>
        <p>The secure payment endpoint is not configured yet. This is expected until the merchant's payment gateway credentials and collection ID are added on the server.</p>
        <p><strong>Nothing was charged.</strong></p>
        <button class="btn btn-dark" id="returnShop">Back to shop</button>
      </div>`;
    $("#returnShop").onclick=()=>closeModal("checkoutModal");
  }
}

function showToast(text){
  const t=$("#toast"); t.textContent=text; t.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>t.classList.remove("show"),1800);
}

$("#cartTrigger").onclick=openCart;
$("#closeCart").onclick=closeCart;
$("#cartOverlay").onclick=closeCart;
$("#checkoutBtn").onclick=openCheckout;

$$("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
$("#modalMinus").onclick=()=>{modalQty=Math.max(1,modalQty-1);$("#modalQty").textContent=modalQty};
$("#modalPlus").onclick=()=>{modalQty++;$("#modalQty").textContent=modalQty};
$("#modalAdd").onclick=()=>{addToCart(modalProduct.id,modalQty);closeModal("productModal")};

$("#menuBtn").onclick=()=>showToast("Use Shop and Story sections below.");
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeModal("productModal");closeModal("checkoutModal")}});
$$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id)}));

renderProducts();
renderCart();
