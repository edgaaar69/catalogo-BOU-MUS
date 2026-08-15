// Si más adelante quieres abrir un chat directo, escribe aquí el número con lada de país.
// Ejemplo México: const WHATSAPP_NUMBER = "5215512345678";
const WHATSAPP_NUMBER = "";

const products = window.PRODUCTOS_BOU_MUS || [];
const productsContainer = document.querySelector("#products");
const filtersContainer = document.querySelector("#filters");
const search = document.querySelector("#search");
const count = document.querySelector("#count");
const empty = document.querySelector("#empty");
const viewer = document.querySelector("#product-viewer");
const viewerClose = document.querySelector("#viewer-close");
const viewerImage = document.querySelector("#viewer-image");
const thumbnails = document.querySelector("#thumbnails");
const viewerCategory = document.querySelector("#viewer-category");
const viewerName = document.querySelector("#viewer-name");
const viewerModel = document.querySelector("#viewer-model");
const viewerPrice = document.querySelector("#viewer-price");
const viewerColor = document.querySelector("#viewer-color");
const viewerSizes = document.querySelector("#viewer-sizes");
const viewerState = document.querySelector("#viewer-state");
const viewerCode = document.querySelector("#viewer-code");
const orderProduct = document.querySelector("#order-product");
const shareProduct = document.querySelector("#share-product");
const shareLabel = document.querySelector("#share-label");

let activeCategory = "Todo";
let activeProduct = null;
let activeVariant = null;

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function variantPrice(product, variant) {
  return variant?.price ?? product.price;
}

function productPrice(product) {
  const prices = [...new Set(product.variants.map(variant => variantPrice(product, variant)))].sort((a, b) => a - b);
  if (prices.length < 2) return money(prices[0] ?? product.price);
  return `${money(prices[0])} – ${money(prices.at(-1))}`;
}

function availableVariants(product) {
  return product.variants.filter(variant => variant.quantity > 0 && variant.state !== "Agotado");
}

function productCard(product, index) {
  const variants = availableVariants(product);
  const hasSizes = variants.length > 1;
  const sizes = variants.map(variant => variant.size).join(", ") || "Agotado";
  const searchText = [product.code, product.name, product.category, product.model, product.color, sizes].join(" ");

  return `
    <article class="card" data-code="${product.code}" data-category="${product.category}" data-search="${normalizeText(searchText)}">
      <button class="photo" type="button" data-action="open" aria-label="Ver detalles de ${product.name}, ${product.color}">
        <span class="badge">${product.state}</span>
        <img class="primary-image" src="${product.images[0]}" alt="${product.name} ${product.color}, vista de frente" ${index < 3 ? "fetchpriority=\"high\"" : "loading=\"lazy\""} decoding="async">
        <img class="secondary-image" src="${product.images[1]}" alt="${product.name} ${product.color} en modelo" loading="lazy" decoding="async">
        <span class="view-cue">Ver detalles</span>
      </button>

      <div class="info">
        <div>
          <p class="category">${product.category}</p>
          <h2>${product.name}</h2>
          <p class="variant">${product.model ? `${product.model} · ` : ""}${product.color}</p>
        </div>
        <div class="card-side">
          <p class="price">${productPrice(product)}</p>
          ${hasSizes ? `
            <button class="variant-toggle" type="button" data-action="toggle-sizes" aria-expanded="false" aria-label="Mostrar tallas de ${product.name}">
              <span>Tallas</span><i>+</i>
            </button>
          ` : ""}
        </div>
      </div>

      ${hasSizes ? `
        <div class="card-sizes" hidden>
          ${variants.map(variant => `
            <button type="button" class="card-size" data-action="select-size" data-sku="${variant.sku}">
              ${variant.size}<small>${variant.quantity} disp.</small>
            </button>
          `).join("")}
        </div>
      ` : ""}
    </article>
  `;
}

function buildFilters() {
  const categories = ["Todo", ...new Set(products.map(product => product.category))];
  filtersContainer.innerHTML = categories.map((category, index) => `
    <button class="filter${index === 0 ? " active" : ""}" type="button" data-category="${category}">${category}</button>
  `).join("");
}

function renderProducts() {
  productsContainer.innerHTML = products.map(productCard).join("");
  filterCatalog();
}

function filterCatalog() {
  const text = normalizeText(search.value);
  let visible = 0;

  document.querySelectorAll(".card").forEach(card => {
    const matchesCategory = activeCategory === "Todo" || card.dataset.category === activeCategory;
    const matchesSearch = card.dataset.search.includes(text);
    card.hidden = !(matchesCategory && matchesSearch);
    if (!card.hidden) visible += 1;
  });

  count.textContent = `${visible} artículo${visible === 1 ? "" : "s"}`;
  empty.hidden = visible !== 0;
}

function setViewerImage(image, alt, button) {
  viewerImage.src = image;
  viewerImage.alt = alt;
  document.querySelectorAll(".thumbnail").forEach(thumbnail => thumbnail.classList.toggle("active", thumbnail === button));
}

function selectVariant(variant) {
  activeVariant = variant;
  viewerPrice.textContent = money(variantPrice(activeProduct, variant));
  viewerCode.textContent = variant.sku;
  viewerState.textContent = variant.quantity > 0 ? `Disponible · ${variant.quantity} ${variant.quantity === 1 ? "pieza" : "piezas"}` : "Agotado";
  viewerState.classList.toggle("available", variant.quantity > 0);
  viewerState.classList.toggle("sold-out", variant.quantity <= 0);

  viewerSizes.querySelectorAll(".size-option").forEach(button => {
    const selected = button.dataset.sku === variant.sku;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", selected);
  });
}

function openProduct(product, sku = "") {
  activeProduct = product;
  const variants = availableVariants(product);
  const selected = variants.find(variant => variant.sku === sku) || variants[0] || product.variants[0];

  viewerCategory.textContent = product.category;
  viewerName.textContent = product.name;
  viewerModel.textContent = product.model;
  viewerColor.textContent = product.color;
  shareLabel.textContent = "Compartir producto";

  thumbnails.innerHTML = product.images.map((image, index) => `
    <button class="thumbnail${index === 0 ? " active" : ""}" type="button" data-image="${image}" data-index="${index}" aria-label="Ver foto ${index + 1} de ${product.name}">
      <img src="${image}" alt="" loading="lazy">
    </button>
  `).join("");

  viewerSizes.innerHTML = product.variants.map(variant => `
    <button class="size-option" type="button" data-sku="${variant.sku}" ${variant.quantity <= 0 ? "disabled" : ""} aria-pressed="false">
      ${variant.size}
    </button>
  `).join("");

  setViewerImage(product.images[0], `${product.name} ${product.color}, vista de frente`, thumbnails.querySelector(".thumbnail"));
  if (selected) selectVariant(selected);
  else {
    viewerPrice.textContent = money(product.price);
    viewerCode.textContent = product.code;
    viewerState.textContent = "Agotado";
  }

  if (!viewer.open) viewer.showModal();
  history.replaceState(null, "", `#${product.code}`);
}

function closeViewer() {
  viewer.close();
  if (location.hash.startsWith("#BM-")) history.replaceState(null, "", location.pathname + location.search);
}

function selectedMessage() {
  const size = activeVariant?.size || "Sin talla seleccionada";
  const code = activeVariant?.sku || activeProduct.code;
  const price = variantPrice(activeProduct, activeVariant);
  return `Hola, me interesa ${activeProduct.name} (${activeProduct.color}), talla ${size}, precio ${money(price)}, código ${code}. ${location.href}`;
}

search.addEventListener("input", filterCatalog);

filtersContainer.addEventListener("click", event => {
  const button = event.target.closest(".filter");
  if (!button) return;
  activeCategory = button.dataset.category;
  filtersContainer.querySelectorAll(".filter").forEach(filter => filter.classList.toggle("active", filter === button));
  filterCatalog();
});

productsContainer.addEventListener("click", event => {
  const card = event.target.closest(".card");
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!card || !action) return;
  const product = products.find(item => item.code === card.dataset.code);

  if (action === "open") openProduct(product);

  if (action === "toggle-sizes") {
    const panel = card.querySelector(".card-sizes");
    const button = card.querySelector(".variant-toggle");
    panel.hidden = !panel.hidden;
    button.setAttribute("aria-expanded", String(!panel.hidden));
    button.querySelector("i").textContent = panel.hidden ? "+" : "−";
  }

  if (action === "select-size") openProduct(product, event.target.closest("[data-sku]").dataset.sku);
});

thumbnails.addEventListener("click", event => {
  const button = event.target.closest(".thumbnail");
  if (!button) return;
  const index = Number(button.dataset.index);
  const labels = ["vista de frente", "vista en modelo", "detalles"];
  setViewerImage(button.dataset.image, `${activeProduct.name} ${activeProduct.color}, ${labels[index]}`, button);
});

viewerSizes.addEventListener("click", event => {
  const button = event.target.closest(".size-option");
  if (!button) return;
  const variant = activeProduct.variants.find(item => item.sku === button.dataset.sku);
  if (variant) selectVariant(variant);
});

viewerClose.addEventListener("click", closeViewer);
viewer.addEventListener("click", event => {
  if (event.target === viewer) closeViewer();
});
viewer.addEventListener("close", () => {
  if (location.hash.startsWith("#BM-")) history.replaceState(null, "", location.pathname + location.search);
});

orderProduct.addEventListener("click", () => {
  const destination = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
  window.open(`${destination}?text=${encodeURIComponent(selectedMessage())}`, "_blank", "noopener");
});

shareProduct.addEventListener("click", async () => {
  try {
    const data = { title: `${activeProduct.name} | BOU&MUS`, text: selectedMessage(), url: location.href };
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(selectedMessage());
      shareLabel.textContent = "Datos copiados";
    }
  } catch (error) {
    // El producto permanece abierto si se cancela el menú de compartir.
  }
});

buildFilters();
renderProducts();

const initialProduct = products.find(product => `#${product.code}` === location.hash.toUpperCase());
if (initialProduct) openProduct(initialProduct);
