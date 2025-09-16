import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Forja3D - Loja/landing (mobile-first + desktop)
 * Separação corrigida: "Novidades" e "Catálogo" agora são páginas distintas.
 * Fonte do título "Forja 3D": Cinzel (Google Fonts).
 */

const WHATSAPP_PHONE = "5524998635828"; // Ex.: 55DDDNUMERO
const BRAND_NAME = "Forja 3D";

export default function Forja3DStore() {
  // ---- Carregar fonte Cinzel (Google Fonts) só para o título ----
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // ---- Produtos (exemplo) ----
  const sampleProducts = [
    {
      id: "p1",
      title: "Figurine - Guerreiro Épico",
      price: 79.9,
      categories: ["Figures", "Colecionáveis"],
      rarity: "épico",
      isNew: true,
      desc: "Figura detalhada 3D com acabamento premium. Altura: 18cm.",
      media: [
        { type: "image", src: "https://picsum.photos/seed/fig1a/800/800" },
        { type: "image", src: "https://picsum.photos/seed/fig1b/800/800" },
        { type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
      ],
    },
    {
      id: "p2",
      title: "Vaso Dragão Mini",
      price: 39.9,
      categories: ["Vasos", "Decoração"],
      rarity: "raro",
      isNew: false,
      desc: "Vaso decorativo com temática de dragão, ideal para plantas pequenas.",
      media: [
        { type: "image", src: "https://picsum.photos/seed/vase1a/800/800" },
        { type: "image", src: "https://picsum.photos/seed/vase1b/800/800" },
      ],
    },
    {
      id: "p3",
      title: "Chaveiro + Personalização",
      price: 19.9,
      categories: ["Chaveiros", "Personalizados"],
      rarity: "comum",
      isNew: true,
      desc: "Chaveiro em PLA impresso sob demanda — opção de gravar iniciais.",
      media: [
        { type: "image", src: "https://picsum.photos/seed/key1a/800/800" },
        { type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
      ],
    },
    {
      id: "p4",
      title: "Copo Mágico (Thermal) - Runas",
      price: 59.9,
      categories: ["Copos", "Utilidades"],
      rarity: "raro",
      isNew: false,
      desc: "Copo com design de runas — mantém a temperatura por mais tempo.",
      media: [
        { type: "image", src: "https://picsum.photos/seed/cup1a/800/800" },
        { type: "image", src: "https://picsum.photos/seed/cup1b/800/800" },
      ],
    },
    {
      id: "p5",
      title: "Decoração Mural - Mapa do Mundo",
      price: 129.9,
      categories: ["Decoração"],
      rarity: "épico",
      isNew: false,
      desc: "Peça de parede impressa em 3D — detalhes e relevo.",
      media: [
        { type: "image", src: "https://picsum.photos/seed/deco1a/800/800" },
        { type: "image", src: "https://picsum.photos/seed/deco1b/800/800" },
      ],
    },
  ];
  const [products] = useState(sampleProducts);

  // ---- Carrinho ----
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("forja3d_cart") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("forja3d_cart", JSON.stringify(cart));
  }, [cart]);

  // ---- View ----
  const [view, setView] = useState({ page: "home", filter: "Todos" });

  // ---- Modal ----
  const [selected, setSelected] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // ---- Busca ----
  const [typedQuery, setTypedQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  function onSearchSubmit(e) {
    e.preventDefault();
    setSearchTerm(typedQuery);
    setView((v) => ({ ...v, page: "shop" }));
  }

  // ---- Toast ----
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);
  function showToast(msg) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2200);
  }

  // ---- Utils ----
  const fmtBRL = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0);

  // ---- Categorias ----
  const categorySet = new Set();
  products.forEach((p) => (p.categories || []).forEach((c) => categorySet.add(c)));
  const categories = ["Todos", ...Array.from(categorySet)];

  // ---- Filtro ----
  const filtered = products.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm =
      term === "" ||
      p.title.toLowerCase().includes(term) ||
      p.desc.toLowerCase().includes(term) ||
      (p.categories || []).some((c) => c.toLowerCase().includes(term));
    const matchesCat = !view.filter || view.filter === "Todos" || (p.categories || []).includes(view.filter);
    return matchesTerm && matchesCat;
  });

  // ---- Carrinho ----
  function addToCart(product, qty = 1) {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        showToast("Produto adicionado ao carrinho");
        return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + qty } : p));
      }
      const base = {
        id: product.id,
        title: product.title,
        price: product.price,
        qty,
        thumb:
          product.media?.[0]?.type === "image"
            ? product.media[0].src
            : product.media?.find((m) => m.type === "image")?.src || "",
      };
      showToast("Produto adicionado ao carrinho");
      return [...prev, base];
    });
  }
  function removeFromCart(productId) {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  }
  function changeQty(productId, qty) {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) => prev.map((p) => (p.id === productId ? { ...p, qty } : p)));
  }

  // ---- WhatsApp ----
  function buildWhatsAppMessage({ name, email, address, cep, note }) {
    const lines = [];
    lines.push(`Olá! Tenho interesse em comprar no ${BRAND_NAME}.`);
    lines.push("");
    lines.push("Itens do pedido:");
    cart.forEach((c) => lines.push(`- ${c.title} x${c.qty} — ${fmtBRL(c.price * c.qty)}`));
    lines.push("");
    lines.push(`Subtotal: ${fmtBRL(subtotal)}`);
    lines.push("Frete: informar");
    lines.push("Pagamento: enviar link (Pix/cartão)");
    lines.push("");
    lines.push("Dados do comprador:");
    if (name) lines.push(`• Nome: ${name}`);
    if (email) lines.push(`• E-mail: ${email}`);
    if (address) lines.push(`• Endereço: ${address}`);
    if (cep) lines.push(`• CEP: ${cep}`);
    if (note) lines.push(`• Observações: ${note}`);
    lines.push("");
    lines.push("Pode me enviar o link de pagamento e o valor do frete, por favor?");
    const msg = encodeURIComponent(lines.join("\\n"));
    return `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`;
  }
  function openWhatsAppWithOrder(formData) {
    window.open(buildWhatsAppMessage(formData), "_blank");
  }

  // ---- UI helpers ----
  function RarityBadge({ rarity }) {
    const map = {
      comum: "bg-gray-200 text-gray-800",
      raro: "bg-indigo-100 text-indigo-800",
      épico: "bg-yellow-100 text-yellow-800",
    };
    const label = rarity?.toUpperCase() || "COMUM";
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold ${map[rarity] || map.comum}`}>
        {label}
      </span>
    );
  }
  function getPrimaryMediaSrc(product) {
    const first = product.media?.[0];
    if (!first) return "https://picsum.photos/seed/placeholder/800/800";
    if (first.type === "image") return first.src;
    const img = product.media.find((m) => m.type === "image");
    return img ? img.src : "https://picsum.photos/seed/placeholder/800/800";
  }
  function ProductMediaViewer({ media, index }) {
    const item = media[index];
    if (!item) return null;
    if (item.type === "video") {
      return <video key={item.src} src={item.src} controls className="w-full h-64 md:h-80 rounded-lg bg-black object-contain" />;
    }
    return <img key={item.src} src={item.src} className="w-full h-64 md:h-80 object-cover rounded-lg" alt="" />;
  }

  // ---- Mobile defaults ----
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    if (isMobile) setView((v) => ({ ...v, page: "shop" }));
  }, [isMobile]);

  // ---- Novidades (apenas isNew) com fallback ----
  const newItems = products.filter((p) => p.isNew);
  const novidadesList = newItems.length > 0 ? newItems : products.slice(0, 6);

  return (
    // trava arrasto lateral
    <div className="min-h-screen bg-neutral-50 text-neutral-900 overflow-x-hidden overscroll-x-none">
      {/* Header */}
      <header className="max-w-6xl mx-auto p-4 md:p-6 flex items-center justify-between">
        <div
          className="flex items-center gap-3 md:gap-4 cursor-pointer"
          onClick={() => setView((v) => ({ ...v, page: isMobile ? "shop" : "home" }))}
        >
          <img
            src="/logo.png"
            alt="Forja 3D Logo"
            className="w-16 h-16 md:w-20 md:h-20 object-contain"
          />
          <div>
            {/* Título com a fonte Cinzel */}
            <h1 className="text-xl md:text-2xl font-black tracking-tight font-['Cinzel']">{BRAND_NAME}</h1>
            <p className="md:hidden text-xs text-neutral-600">Geek • RPG • Feito com paixão nerd.</p>
            <p className="hidden md:block text-sm text-neutral-600">Geek • RPG • Feito com paixão nerd.</p>
          </div>
        </div>

        {/* Busca desktop */}
        <form
          onSubmit={onSearchSubmit}
          className="hidden md:flex items-center gap-3 rounded-full bg-white/60 backdrop-blur px-3 py-2 shadow-sm"
        >
          <input
            className="bg-transparent outline-none text-sm"
            placeholder="Buscar peças, ex: dragão, chaveiro"
            value={typedQuery}
            onChange={(e) => setTypedQuery(e.target.value)}
          />
          <button type="submit" className="text-sm px-2 py-1 rounded bg-indigo-600 text-white">Buscar</button>
        </form>

        <button
          className="relative inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow hover:shadow-md"
          onClick={() => setView((v) => ({ ...v, page: "cart" }))}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Carrinho</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {cart.reduce((s, p) => s + p.qty, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Abas desktop */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 mb-4">
        <div className="inline-flex rounded-xl bg-white shadow-sm overflow-hidden">
          <button
            className={`px-4 py-2 text-sm ${view.page === "home" ? "bg-neutral-900 text-white" : "text-neutral-700"}`}
            onClick={() => setView((v) => ({ ...v, page: "home" }))}
          >
            Novidades
          </button>
        </div>
        <div className="inline-flex rounded-xl bg-white shadow-sm overflow-hidden ml-2">
          <button
            className={`px-4 py-2 text-sm ${view.page === "shop" ? "bg-neutral-900 text-white" : "text-neutral-700"}`}
            onClick={() => setView((v) => ({ ...v, page: "shop" }))}
          >
            Catálogo
          </button>
        </div>
      </div>

      {/* Barra fixa MOBILE: busca + chips */}
      <div className="md:hidden sticky top-0 z-40 bg-neutral-50/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <form onSubmit={onSearchSubmit} className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm">
            <input
              className="bg-transparent outline-none text-sm flex-1"
              placeholder="Buscar: dragão, chaveiro..."
              value={typedQuery}
              onChange={(e) => setTypedQuery(e.target.value)}
            />
            <button type="submit" className="text-xs px-3 py-1 rounded bg-indigo-600 text-white whitespace-nowrap">Buscar</button>
          </form>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 max-w-full">
            {["Todos", ...categories.filter((c) => c !== "Todos")].map((c) => (
              <button
                key={c}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs ${
                  view.filter === c ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700"
                }`}
                onClick={() => setView({ page: "shop", filter: c })}
              >
                {c}
              </button>
            ))}
            <button
              className="whitespace-nowrap px-3 py-1.5 rounded-full border text-xs bg-indigo-600 text-white"
              onClick={() => setView((v) => ({ ...v, page: "custom" }))}
            >
              Encomenda
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-24">
        {/* HERO + SIDEBAR somente desktop */}
        <section className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-8">
          <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-6">
              <div className="w-36 h-36 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                <img src="https://picsum.photos/seed/hero/300/300" alt="preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold">{BRAND_NAME} — peças únicas para seu universo</h2>
                <p className="text-neutral-600 mt-1">
                  Figures, chaveiros personalizados, vasos temáticos e decoração para gamers e colecionadores.
                </p>
                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow" onClick={() => setView((v) => ({ ...v, page: "shop" }))}>
                    Ver catálogo
                  </button>
                  <button className="px-4 py-2 border rounded-lg" onClick={() => setView((v) => ({ ...v, page: "custom" }))}>
                    Fazer encomenda
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold mb-2">Categorias</h3>
            <div className="flex flex-col gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`text-left px-3 py-2 rounded-lg hover:bg-neutral-100 ${view.filter === c ? "bg-neutral-100" : ""}`}
                  onClick={() => setView({ page: "shop", filter: c })}
                >
                  {c}
                </button>
              ))}
            </div>
          </aside>
        </section>

        {/* HOME (Novidades) — desktop */}
        {view.page === "home" && (
          <section className="hidden md:block">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">Novidades</h3>
              {searchTerm && <div className="text-xs text-neutral-500">Filtrando por: “{searchTerm}”</div>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {novidadesList.map((p) => (
                <motion.article key={p.id} layout whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-4 shadow">
                  <button
                    className="block w-full"
                    onClick={() => {
                      setSelected(p);
                      setActiveMediaIndex(0);
                    }}
                    title="Ver detalhes"
                  >
                    <img src={getPrimaryMediaSrc(p)} className="w-full h-48 object-cover rounded-lg mb-3" alt={p.title} />
                  </button>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{p.title}</h4>
                      <div className="text-xs text-neutral-500">{(p.categories || []).join(", ")}</div>
                    </div>
                    <RarityBadge rarity={p.rarity} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-lg font-bold">{fmtBRL(p.price)}</div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-lg border" onClick={() => { setSelected(p); setActiveMediaIndex(0); }}>
                        Ver
                      </button>
                      <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white" onClick={() => addToCart(p)}>
                        Comprar
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {/* CATÁLOGO — mobile (1 col) + desktop (2–3 col) */}
        {view.page === "shop" && (
          <section className="mt-4">
            <div className="hidden md:flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">Catálogo</h3>
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <span>{filtered.length} itens</span>
                {searchTerm && <span className="text-xs">Filtrando por: “{searchTerm}”</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((p) => (
                <article key={p.id} className="bg-white rounded-2xl p-3 md:p-4 shadow flex flex-col">
                  <button
                    className="w-full rounded-lg overflow-hidden mb-2 md:mb-3"
                    onClick={() => {
                      setSelected(p);
                      setActiveMediaIndex(0);
                    }}
                    title="Ver detalhes"
                    style={{ aspectRatio: "4 / 3" }}
                  >
                    <img
                      src={getPrimaryMediaSrc(p)}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-base md:text-lg truncate">{p.title}</h4>
                      <div className="text-[11px] md:text-xs text-neutral-500 truncate">
                        {(p.categories || []).join(", ")}
                      </div>
                    </div>
                    <RarityBadge rarity={p.rarity} />
                  </div>

                  <p className="hidden md:block text-sm text-neutral-600 mt-2">{p.desc}</p>

                  <div className="mt-2 md:mt-3 flex items-center justify-between">
                    <div className="text-base md:text-lg font-bold">{fmtBRL(p.price)}</div>
                    <div className="flex gap-1.5 md:gap-2">
                      <button
                        className="px-3 py-1.5 md:px-3 md:py-1 rounded-lg border text-sm whitespace-nowrap"
                        onClick={() => {
                          setSelected(p);
                          setActiveMediaIndex(0);
                        }}
                      >
                        Ver
                      </button>
                      <button
                        className="px-3 py-1.5 md:px-3 md:py-1 rounded-lg bg-indigo-600 text-white text-sm whitespace-nowrap"
                        onClick={() => addToCart(p)}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Carrinho */}
        {view.page === "cart" && (
          <section>
            <h3 className="text-lg font-bold mb-4">Seu carrinho</h3>
            {cart.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow">Seu carrinho está vazio. Explore o catálogo!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow">
                  {cart.map((c) => (
                    <div key={c.id} className="flex items-center gap-4 border-b py-4">
                      {c.thumb ? <img src={c.thumb} className="w-20 h-20 object-cover rounded" alt="" /> : <div className="w-20 h-20 bg-neutral-200 rounded" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{c.title}</div>
                            <div className="text-xs text-neutral-500">{fmtBRL(c.price)}</div>
                          </div>
                          <div className="text-sm">{fmtBRL(c.price * c.qty)}</div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button className="px-2 py-1 border rounded" onClick={() => changeQty(c.id, c.qty - 1)}>-</button>
                          <div className="px-3 py-1 border rounded">{c.qty}</div>
                          <button className="px-2 py-1 border rounded" onClick={() => changeQty(c.id, c.qty + 1)}>+</button>
                          <button className="ml-4 text-sm text-red-500" onClick={() => removeFromCart(c.id)}>Remover</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="bg-white rounded-2xl p-6 shadow flex flex-col gap-4">
                  <div>
                    <div className="text-sm text-neutral-500">Resumo</div>
                    <div className="text-xl font-bold">{fmtBRL(subtotal)}</div>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg" onClick={() => setView((v) => ({ ...v, page: "checkout" }))}>
                    Finalizar pedido no WhatsApp
                  </button>
                  <button className="px-4 py-2 border rounded-lg" onClick={() => setView((v) => ({ ...v, page: "shop" }))}>
                    Continuar comprando
                  </button>
                </aside>
              </div>
            )}
          </section>
        )}

        {/* Checkout */}
        {view.page === "checkout" && (
          <section>
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <button className="text-sm text-neutral-600 underline" onClick={() => setView((v) => ({ ...v, page: "shop" }))}>
                ← Voltar ao catálogo
              </button>
            </div>
            <h3 className="text-lg font-bold mb-4">Finalizar pedido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form
                className="bg-white rounded-2xl p-6 shadow"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (cart.length === 0) return alert("Seu carrinho está vazio.");
                  const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
                  openWhatsAppWithOrder(fd);
                }}
              >
                <label className="block mb-2 text-sm font-semibold">Nome</label>
                <input name="name" required className="w-full border rounded px-3 py-2 mb-3" />

                <label className="block mb-2 text-sm font-semibold">E-mail</label>
                <input name="email" type="email" required className="w-full border rounded px-3 py-2 mb-3" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-semibold">Endereço</label>
                    <input name="address" required className="w-full border rounded px-3 py-2 mb-3" />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold">CEP</label>
                    <input name="cep" required className="w-full border rounded px-3 py-2 mb-3" />
                  </div>
                </div>

                <label className="block mb-2 text-sm font-semibold">Observações / Personalização</label>
                <textarea name="note" className="w-full border rounded px-3 py-2 mb-3" placeholder="Ex: Gravura no chaveiro: TH" />

                <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg">Enviar pedido no WhatsApp</button>
                <p className="text-xs text-neutral-500 mt-2">
                  Você será redirecionado para o WhatsApp com o resumo do pedido. Lá você receberá o link de pagamento (Pix/cartão) e o valor do frete.
                </p>
              </form>

              <aside className="bg-white rounded-2xl p-6 shadow">
                <div className="text-sm text-neutral-500 mb-2">Itens</div>
                {cart.map((c) => (
                  <div key={c.id} className="flex items-center justify-between mb-3">
                    <div className="text-sm">{c.title} x{c.qty}</div>
                    <div className="text-sm font-semibold">{fmtBRL(c.price * c.qty)}</div>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3 space-y-1">
                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <span>Subtotal</span>
                    <span>{fmtBRL(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-400">
                    <span>Frete</span>
                    <span>A combinar</span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* Encomenda personalizada */}
        {view.page === "custom" && (
          <section>
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <button className="text-sm text-neutral-600 underline" onClick={() => setView((v) => ({ ...v, page: isMobile ? "shop" : "home" }))}>
                ← Voltar
              </button>
            </div>
            <h3 className="text-lg font-bold mb-4">Encomenda personalizada</h3>
            <div className="bg-white rounded-2xl p-6 shadow">
              <p className="text-neutral-600 text-sm md:text-base">
                Descreva o que você precisa (formato, tamanho, material e referência). Nós retornamos com orçamento.
              </p>
              <form
                className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
                  const msg = encodeURIComponent(
                    `Olá! Quero uma peça personalizada.\\n\\n` +
                      `Título: ${fd.title || "(sem título)"}\\n` +
                      `Descrição: ${fd.description || ""}\\n` +
                      `Nome: ${fd.name}\\n` +
                      `E-mail: ${fd.email}`
                  );
                  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`, "_blank");
                }}
              >
                <input name="name" placeholder="Seu nome" className="border rounded px-3 py-2" required />
                <input name="email" placeholder="E-mail" className="border rounded px-3 py-2" required />
                <input name="title" placeholder="Título do projeto" className="border rounded px-3 py-2" />
                <textarea name="description" placeholder="Descreva sua ideia (referência / medidas)" className="border rounded px-3 py-2" />
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg col-span-full">Enviar pelo WhatsApp</button>
              </form>
            </div>
          </section>
        )}

        {/* Modal de produto com galeria */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="absolute inset-0 bg-black/40" onClick={() => { setSelected(null); setActiveMediaIndex(0); }} />
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="bg-white rounded-2xl p-6 shadow-lg z-10 max-w-3xl w-full">
                <div className="flex flex-col gap-4">
                  <ProductMediaViewer media={selected.media || []} index={activeMediaIndex} />
                  {selected.media?.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {selected.media.map((m, idx) => (
                        <button
                          key={m.src + idx}
                          className={`border rounded-md overflow-hidden w-20 h-20 flex items-center justify-center ${idx === activeMediaIndex ? "ring-2 ring-indigo-500" : ""}`}
                          onClick={() => setActiveMediaIndex(idx)}
                          title={m.type}
                        >
                          {m.type === "image" ? (
                            <img src={m.src} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-black text-white text-xs flex items-center justify-center">Vídeo</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xl font-bold">{selected.title}</h4>
                          <div className="text-sm text-neutral-500">
                            {(selected.categories || []).join(", ")} • <span className="font-semibold">{fmtBRL(selected.price)}</span>
                          </div>
                        </div>
                        <RarityBadge rarity={selected.rarity} />
                      </div>
                      <p className="text-neutral-600 mt-3">{selected.desc}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                        onClick={() => { addToCart(selected); setSelected(null); setActiveMediaIndex(0); }}
                      >
                        Adicionar ao carrinho
                      </button>
                      <button className="px-4 py-2 border rounded-lg" onClick={() => { setSelected(null); setActiveMediaIndex(0); }}>
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]"
              aria-live="assertive"
            >
              <div className="px-4 py-2 rounded-full bg-neutral-900 text-white shadow-lg text-sm">
                {toastMsg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rodapé */}
        <footer className="mt-14 md:mt-16 border-t pt-8 pb-20 md:pb-16">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-6">
            <div className="text-sm text-neutral-500">
              © {new Date().getFullYear()} {BRAND_NAME} — Feito com paixão nerd.
            </div>
            <div className="flex gap-4">
              <a className="text-sm hover:underline" href="#">Política de envio</a>
              <a className="text-sm hover:underline" href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noreferrer">Contato</a>
              <a className="text-sm hover:underline" href={`https://instagram.com/lojaforja3d`} target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
        </footer>
      </main>

      {/* WhatsApp flutuante */}
      <a
        href={`https://wa.me/${WHATSAPP_PHONE}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2"
        aria-label="Abrir WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.62-6.01C.122 5.281 5.403 0 12.057 0c3.17 0 6.155 1.237 8.4 3.482a11.82 11.82 0 013.5 8.394c-.003 6.654-5.284 11.935-11.94 11.935a11.9 11.9 0 01-6.013-1.616L.057 24zm6.597-3.807c1.742.995 3.276 1.591 5.392 1.593 5.448.003 9.886-4.431 9.889-9.878.002-5.462-4.415-9.885-9.881-9.888-5.451-.003-9.889 4.431-9.892 9.878a9.84 9.84 0 001.651 5.444l-.999 3.648 3.84-.797zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.03-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.41.248-.694.248-1.29.173-1.414z" />
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}
