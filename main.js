const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=80`;
const PRODUCTS = [
    { id: 1, name: 'Cama premium para gatos', cat: 'Gatos', price: 289.9, old: 349.9, rating: 5, img: U('1573865526739-10659fec78a5') },
    { id: 2, name: 'Arranhador minimalista', cat: 'Gatos', price: 199.9, rating: 4, img: U('1518791841217-8f162f1e1131') },
    { id: 3, name: 'Brinquedo interativo', cat: 'Gatos', price: 69.9, old: 89.9, rating: 4, img: U('1495360010541-f48722b34f7d') },
    { id: 4, name: 'Coleira comfort', cat: 'Acessórios', price: 79.9, rating: 5, img: U('1587300003388-59208cc962cb') },
    { id: 5, name: 'Comedouro de cerâmica', cat: 'Alimentação', price: 119.9, rating: 5, img: U('1561948955-570b270e7c36') },
    { id: 6, name: 'Kit de higiene pet', cat: 'Cachorros', price: 149.9, old: 179.9, rating: 4, img: U('1548199973-03cce0bbc87b') },
    { id: 7, name: 'Bolsa de transporte', cat: 'Acessórios', price: 259.9, rating: 5, img: U('1583511655857-d19b40a7a54e') },
    { id: 8, name: 'Fonte automática para pets', cat: 'Alimentação', price: 219.9, old: 259.9, rating: 4, img: U('1514888286974-6c03e2ca1dba') }
];
const CATEGORIES = [
    { name: 'Gatos', d: 'Camas, arranhadores e brinquedos.', img: U('1573865526739-10659fec78a5') },
    { name: 'Cachorros', d: 'Passeio, descanso e cuidados.', img: U('1543852786-1cf6624b9987') },
    { name: 'Alimentação', d: 'Comedouros, fontes e petiscos.', img: U('1561948955-570b270e7c36') },
    { name: 'Brinquedos', d: 'Diversão para todas as idades.', img: U('1495360010541-f48722b34f7d') },
    { name: 'Higiene', d: 'Banho, escovas e bem-estar.', img: U('1548199973-03cce0bbc87b') },
    { name: 'Acessórios', d: 'Coleiras, bolsas e detalhes.', img: U('1587300003388-59208cc962cb') }
];
const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const store = {
    get: k => { try { return JSON.parse(localStorage.getItem(k)) || [] } catch { return [] } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { } }
};
let cart = store.get('tc_cart'), favs = store.get('tc_favs');
const Cart = {
    add(id) { const i = cart.find(x => x.id === id); i ? i.qty++ : cart.push({ id, qty: 1 }); this.save() },
    qty(id, d) { const i = cart.find(x => x.id === id); if (!i) return; i.qty += d; if (i.qty < 1) cart = cart.filter(x => x.id !== id); this.save() },
    remove(id) { cart = cart.filter(x => x.id !== id); this.save() },
    total() { return cart.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0) },
    count() { return cart.reduce((s, i) => s + i.qty, 0) },
    save() { store.set('tc_cart', cart); this.render() },
    render() {
        const c = this.count(), el = document.getElementById('cartCount');
        el.textContent = c; el.classList.toggle('show', c > 0);
        const box = document.getElementById('cartItems');
        box.innerHTML = cart.length ? cart.map(i => {
            const p = PRODUCTS.find(x => x.id === i.id);
            return `<div class="ci"><img src="${p.img}" alt=""><div><b>${p.name}</b><span>${brl(p.price)}</span>
      <div class="qty"><button data-q="-1" data-id="${p.id}" aria-label="Diminuir">−</button><em>${i.qty}</em><button data-q="1" data-id="${p.id}" aria-label="Aumentar">+</button></div></div>
      <button class="rm" data-rm="${p.id}" aria-label="Remover"><i class="fa-regular fa-trash-can"></i></button></div>`
        }).join('')
            : '<p class="empty">Seu carrinho está vazio. Explore os favoritos e adicione o primeiro item.</p>';
        const f = Math.max(0, 199 - this.total()); document.getElementById('ship').innerHTML = c ? (f > 0 ? `Faltam <b>${brl(f)}</b> para frete grátis` : 'Você ganhou frete grátis') + `<i style="width:${Math.min(100, this.total() / 199 * 100)}%"></i>` : '';
        const t = brl(this.total()); document.getElementById('subtotal').textContent = t; document.getElementById('total').textContent = t;
    }
};
const Favs = {
    toggle(id) { favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; store.set('tc_favs', favs); this.render() },
    render() {
        const el = document.getElementById('favCount'); el.textContent = favs.length; el.classList.toggle('show', favs.length > 0);
        document.querySelectorAll('[data-fav]').forEach(b => { const on = favs.includes(+b.dataset.fav); b.classList.toggle('on', on); b.querySelector('i').className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart' })
    }
};
const $ = s => document.querySelector(s);
let state = { cat: 'Todos', sort: '', q: '', onlyFav: false };
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200) };
const stars = n => '<i class="fa-solid fa-star"></i>'.repeat(n) + '<i class="fa-regular fa-star"></i>'.repeat(5 - n);
function renderProducts() {
    let l = PRODUCTS.filter(p => (state.cat === 'Todos' || p.cat === state.cat) && p.name.toLowerCase().includes(state.q) && (!state.onlyFav || favs.includes(p.id)));
    if (state.sort) l = [...l].sort((a, b) => state.sort === 'asc' ? a.price - b.price : b.price - a.price);
    $('#products').innerHTML = l.length ? l.map(p => `<article class="card">
    <div class="ph"><img loading="lazy" src="${p.img}" alt="${p.name}">${p.old ? `<span class="off">-${Math.round((1 - p.price / p.old) * 100)}%</span>` : ''}<button class="fav" data-fav="${p.id}" aria-label="Favoritar"><i class="fa-regular fa-heart"></i></button></div>
    <small>${p.cat}</small><h3>${p.name}</h3><div class="stars">${stars(p.rating)}</div>
    <div class="price">${p.old ? `<s>${brl(p.old)}</s>` : ''}<b>${brl(p.price)}</b></div>
    <button class="btn dark full" data-add="${p.id}"><i class="fa-solid fa-bag-shopping"></i> Adicionar</button></article>`).join('')
        : '<p class="empty">Nenhum produto encontrado. Tente outra busca ou categoria.</p>';
    Favs.render();
}
function renderChips() {
    $('#chips').innerHTML = ['Todos', 'Gatos', 'Cachorros', 'Alimentação', 'Acessórios'].map(c => `<button class="chip ${c === state.cat ? 'on' : ''}" data-chip="${c}"><i class="fa-solid fa-${IC[c]}"></i> ${c}</button>`).join('');
}
const IC = { Gatos: 'cat', Cachorros: 'dog', 'Alimentação': 'bowl-food', Brinquedos: 'bone', Higiene: 'soap', 'Acessórios': 'paw', Todos: 'paw' };
$('#catGrid').innerHTML = CATEGORIES.map(c => `<a href="#vitrine" class="cc" data-cat="${c.name}"><span class="ic"><i class="fa-solid fa-${IC[c.name]}"></i></span><i class="fa-solid fa-arrow-right go"></i><div class="cc-t"><h3>${c.name}</h3><p>${c.d}</p></div></a>`).join('');
const setCat = c => { state.cat = PRODUCTS.some(p => p.cat === c) || c === 'Todos' ? c : 'Todos'; state.onlyFav = false; renderChips(); renderProducts() };
document.addEventListener('click', e => {
    const t = e.target.closest('button,a'); if (!t) return;
    if (t.dataset.add) { Cart.add(+t.dataset.add); t.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado'; setTimeout(() => { t.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Adicionar' }, 1400); const b = $('#btnCart'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); toast('Adicionado ao carrinho') }
    if (t.dataset.fav) { Favs.toggle(+t.dataset.fav); toast(favs.includes(+t.dataset.fav) ? 'Salvo nos favoritos' : 'Removido dos favoritos') }
    if (t.dataset.chip) setCat(t.dataset.chip);
    if (t.dataset.cat) { setCat(t.dataset.cat); $('#nav').classList.remove('open') }
    if (t.closest('#nav')) $('#nav').classList.remove('open');
    if (t.dataset.q) Cart.qty(+t.dataset.id, +t.dataset.q);
    if (t.dataset.rm) Cart.remove(+t.dataset.rm);
});
const drawer = o => { document.body.classList.toggle('lock', o); $('#drawer').classList.toggle('open', o); $('#overlay').classList.toggle('show', o); $('#drawer').setAttribute('aria-hidden', !o) };
$('#btnCart').onclick = () => drawer(true); $('#closeCart').onclick = $('#overlay').onclick = () => drawer(false);
$('#btnMenu').onclick = () => $('#nav').classList.toggle('open');
$('#btnSearch').onclick = () => { $('#searchbar').classList.toggle('open'); $('#searchInput').focus() };
$('#searchInput').oninput = e => { state.q = e.target.value.toLowerCase().trim(); renderProducts(); if (state.q) $('#vitrine').scrollIntoView({ behavior: 'smooth' }) };
$('#sort').onchange = e => { state.sort = e.target.value; renderProducts() };
$('#btnFav').onclick = () => { state.onlyFav = !state.onlyFav; state.cat = 'Todos'; renderChips(); renderProducts(); $('#vitrine').scrollIntoView({ behavior: 'smooth' }); toast(state.onlyFav ? 'Mostrando favoritos' : 'Mostrando todos') };
$('#checkout').onclick = () => toast(Cart.count() ? 'Demonstração: integre um gateway de pagamento para concluir.' : 'Adicione itens antes de finalizar.');
$('#newsForm').onsubmit = e => {
    e.preventDefault(); const v = $('#email').value.trim(), m = $('#newsMsg');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); m.textContent = ok ? 'Inscrição confirmada. Em breve você recebe novidades.' : 'Digite um e-mail válido, como nome@email.com.'; m.className = ok ? 'ok' : 'err'; if (ok) e.target.reset()
};
const spy = () => { const y = scrollY + 220; let cur = '#inicio';['#vitrine', '#essencia'].forEach(s => { if ($(s).offsetTop <= y) cur = s }); document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', !a.dataset.cat && a.getAttribute('href') === cur)) };
addEventListener('scroll', () => { $('#header').classList.toggle('scrolled', scrollY > 30); $('#toTop').classList.toggle('show', scrollY > 700); spy() }, { passive: true });
addEventListener('keydown', e => { if (e.key === 'Escape') { drawer(false); $('#nav').classList.remove('open'); $('#searchbar').classList.remove('open') } });
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.style.visibility = 'hidden' }, true);
const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } }), { threshold: .15 });
document.querySelectorAll('.cc,.kc,.bc,.head').forEach(el => { el.classList.add('rv'); io.observe(el) });
renderChips(); renderProducts(); Cart.render(); Favs.render();
$('#heroCards').innerHTML = [PRODUCTS[4], PRODUCTS[1]].map(p => `<div class="hc glass"><img src="${p.img}" alt=""><div class="stars">${stars(5)}</div><b>${p.name}</b><span>${brl(p.price)}</span></div>`).join('');
$('#toTop').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });