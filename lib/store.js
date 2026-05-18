import { randomUUID } from "crypto";
import { getDatabase } from "./mongodb";

const defaultProducts = [
  {
    id: "ember-crown-extrait",
    name: "Ember Crown Extrait",
    description:
      "A regal amber perfume with saffron sparks, smoked rose, oud warmth, and a velvet dry down.",
    price: 3899,
    image: "/products/ember-crown.svg",
    category: "Signature",
    size: "50 ml",
    notes: "Saffron, smoked rose, oud, amberwood",
    inventory: 18,
    featured: true,
    tag: "Bestseller"
  },
  {
    id: "solar-veil-elixir",
    name: "Solar Veil Elixir",
    description:
      "A luminous day-to-evening blend with bergamot brightness, orange blossom, cedar, and soft musk.",
    price: 3299,
    image: "/products/solar-veil.svg",
    category: "Radiant",
    size: "50 ml",
    notes: "Bergamot, neroli, cedar, musk",
    inventory: 24,
    featured: true,
    tag: "New Arrival"
  },
  {
    id: "nocturne-plume",
    name: "Nocturne Plume",
    description:
      "An evening perfume with plum depth, black pepper, incense, and resinous woods.",
    price: 4199,
    image: "/products/nocturne-plume.svg",
    category: "Night",
    size: "50 ml",
    notes: "Plum, black pepper, incense, patchouli",
    inventory: 11,
    featured: false,
    tag: "Evening Edit"
  }
];

function stampRecord(record) {
  const now = new Date().toISOString();

  return {
    createdAt: record.createdAt || now,
    updatedAt: now,
    ...record
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createMemoryStore() {
  return {
    users: [],
    products: defaultProducts.map((product) => stampRecord(product)),
    carts: [],
    inquiries: []
  };
}

const memoryStore = globalThis.__houseOfPhoenixStore || createMemoryStore();
globalThis.__houseOfPhoenixStore = memoryStore;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function parsePrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Enter a valid price.");
  }

  return Math.round(amount);
}

function parseCount(value, fallback = 0) {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) {
    return fallback;
  }

  return Math.round(count);
}

function sortProducts(products) {
  return clone(products).sort((left, right) => {
    if (Boolean(left.featured) !== Boolean(right.featured)) {
      return Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    }

    return left.name.localeCompare(right.name);
  });
}

export function publicUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function resolveUserRole(email) {
  const adminEmail = normalizeEmail(
    process.env.ADMIN_EMAIL || "admin@houseofphoenix.com"
  );

  return normalizeEmail(email) === adminEmail ? "admin" : "customer";
}

export function normalizeProductInput(payload) {
  const name = normalizeText(payload?.name);
  const description = normalizeText(payload?.description);

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!description) {
    throw new Error("Product description is required.");
  }

  return {
    name,
    description,
    price: parsePrice(payload?.price),
    image: normalizeText(payload?.image) || "/products/ember-crown.svg",
    category: normalizeText(payload?.category) || "Signature",
    size: normalizeText(payload?.size) || "50 ml",
    notes: normalizeText(payload?.notes) || "Crafted fragrance notes coming soon",
    inventory: parseCount(payload?.inventory, 0),
    featured: Boolean(payload?.featured),
    tag: normalizeText(payload?.tag) || "Limited Batch"
  };
}

async function getCollections() {
  const db = await getDatabase();

  if (!db) {
    return null;
  }

  const users = db.collection("users");
  const products = db.collection("products");
  const carts = db.collection("carts");
  const inquiries = db.collection("inquiries");

  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    products.createIndex({ id: 1 }, { unique: true }),
    carts.createIndex({ userId: 1 }, { unique: true }),
    inquiries.createIndex({ createdAt: -1 })
  ]);

  const count = await products.countDocuments();

  if (count === 0) {
    await products.insertMany(defaultProducts.map((product) => stampRecord(product)));
  }

  return { users, products, carts, inquiries };
}

function createCartSummary(rawItems, products) {
  let subtotal = 0;
  let itemCount = 0;

  const productMap = new Map(products.map((product) => [product.id, product]));

  const items = rawItems
    .map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        return null;
      }

      const quantity = Math.max(1, parseCount(item.quantity, 1));
      const lineTotal = product.price * quantity;

      subtotal += lineTotal;
      itemCount += quantity;

      return {
        productId: product.id,
        quantity,
        lineTotal,
        product
      };
    })
    .filter(Boolean);

  return {
    items,
    itemCount,
    subtotal
  };
}

function upsertMemoryCart(userId, items) {
  const existing = memoryStore.carts.find((cart) => cart.userId === userId);

  if (existing) {
    existing.items = items;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }

  const cart = stampRecord({
    userId,
    items
  });

  memoryStore.carts.push(cart);
  return cart;
}

export async function listProducts() {
  const collections = await getCollections();

  if (!collections) {
    return sortProducts(memoryStore.products);
  }

  const products = await collections.products
    .find({}, { projection: { _id: 0 } })
    .toArray();

  return sortProducts(products);
}

export async function getProductById(id) {
  const collections = await getCollections();

  if (!collections) {
    return clone(memoryStore.products.find((product) => product.id === id) || null);
  }

  return collections.products.findOne(
    { id },
    { projection: { _id: 0 } }
  );
}

export async function createProduct(payload) {
  const collections = await getCollections();
  const product = stampRecord({
    id: randomUUID(),
    ...normalizeProductInput(payload)
  });

  if (!collections) {
    memoryStore.products.push(product);
    return clone(product);
  }

  await collections.products.insertOne(product);
  return clone(product);
}

export async function updateProduct(id, payload) {
  const collections = await getCollections();
  const nextProductFields = {
    ...normalizeProductInput(payload),
    updatedAt: new Date().toISOString()
  };

  if (!collections) {
    const index = memoryStore.products.findIndex((product) => product.id === id);

    if (index === -1) {
      throw new Error("Product not found.");
    }

    memoryStore.products[index] = {
      ...memoryStore.products[index],
      ...nextProductFields
    };

    return clone(memoryStore.products[index]);
  }

  const existing = await collections.products.findOne({ id });

  if (!existing) {
    throw new Error("Product not found.");
  }

  await collections.products.updateOne(
    { id },
    {
      $set: nextProductFields
    }
  );

  return getProductById(id);
}

export async function deleteProduct(id) {
  const collections = await getCollections();

  if (!collections) {
    memoryStore.products = memoryStore.products.filter((product) => product.id !== id);
    memoryStore.carts = memoryStore.carts.map((cart) => ({
      ...cart,
      items: cart.items.filter((item) => item.productId !== id)
    }));
    globalThis.__houseOfPhoenixStore = memoryStore;
    return { deleted: true };
  }

  await collections.products.deleteOne({ id });
  await collections.carts.updateMany(
    {},
    {
      $pull: {
        items: { productId: id }
      }
    }
  );

  return { deleted: true };
}

export async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const collections = await getCollections();

  if (!collections) {
    return clone(
      memoryStore.users.find((user) => normalizeEmail(user.email) === normalizedEmail) ||
        null
    );
  }

  return collections.users.findOne(
    { email: normalizedEmail },
    { projection: { _id: 0 } }
  );
}

export async function findUserById(id) {
  const collections = await getCollections();

  if (!collections) {
    return clone(memoryStore.users.find((user) => user.id === id) || null);
  }

  return collections.users.findOne(
    { id },
    { projection: { _id: 0 } }
  );
}

export async function createUser({ name, email, passwordHash, role }) {
  const user = stampRecord({
    id: randomUUID(),
    name: normalizeText(name),
    email: normalizeEmail(email),
    passwordHash,
    role: role || "customer"
  });

  if (!user.name) {
    throw new Error("Name is required.");
  }

  if (!user.email) {
    throw new Error("Email is required.");
  }

  const existing = await findUserByEmail(user.email);

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const collections = await getCollections();

  if (!collections) {
    memoryStore.users.push(user);
    return clone(user);
  }

  await collections.users.insertOne(user);
  return clone(user);
}

export async function getCartForUser(userId) {
  const products = await listProducts();
  const collections = await getCollections();

  if (!collections) {
    const cart = memoryStore.carts.find((entry) => entry.userId === userId);
    return createCartSummary(cart?.items || [], products);
  }

  const cart = await collections.carts.findOne(
    { userId },
    { projection: { _id: 0 } }
  );

  return createCartSummary(cart?.items || [], products);
}

export async function addCartItem(userId, productId, quantity = 1) {
  const current = await getCartForUser(userId);
  const existing = current.items.find((item) => item.productId === productId);
  const nextQuantity = (existing?.quantity || 0) + Math.max(1, parseCount(quantity, 1));

  return setCartQuantity(userId, productId, nextQuantity);
}

export async function setCartQuantity(userId, productId, quantity) {
  const product = await getProductById(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  const safeQuantity = parseCount(quantity, 1);
  const collections = await getCollections();

  if (!collections) {
    const existingCart = memoryStore.carts.find((entry) => entry.userId === userId);
    const items = clone(existingCart?.items || []);
    const index = items.findIndex((item) => item.productId === productId);

    if (safeQuantity <= 0) {
      if (index >= 0) {
        items.splice(index, 1);
      }
    } else if (index >= 0) {
      items[index].quantity = safeQuantity;
    } else {
      items.push({ productId, quantity: safeQuantity });
    }

    upsertMemoryCart(userId, items);
    return getCartForUser(userId);
  }

  const existingCart = await collections.carts.findOne(
    { userId },
    { projection: { _id: 0 } }
  );
  const items = clone(existingCart?.items || []);
  const index = items.findIndex((item) => item.productId === productId);

  if (safeQuantity <= 0) {
    if (index >= 0) {
      items.splice(index, 1);
    }
  } else if (index >= 0) {
    items[index].quantity = safeQuantity;
  } else {
    items.push({ productId, quantity: safeQuantity });
  }

  await collections.carts.updateOne(
    { userId },
    {
      $set: {
        userId,
        items,
        updatedAt: new Date().toISOString(),
        createdAt: existingCart?.createdAt || new Date().toISOString()
      }
    },
    { upsert: true }
  );

  return getCartForUser(userId);
}

export async function removeCartItem(userId, productId) {
  return setCartQuantity(userId, productId, 0);
}

export async function clearCart(userId) {
  const collections = await getCollections();

  if (!collections) {
    upsertMemoryCart(userId, []);
    return getCartForUser(userId);
  }

  await collections.carts.updateOne(
    { userId },
    {
      $set: {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    },
    { upsert: true }
  );

  return getCartForUser(userId);
}

export async function saveInquiry(payload) {
  const inquiry = stampRecord({
    id: randomUUID(),
    name: normalizeText(payload?.name),
    email: normalizeEmail(payload?.email),
    phone: normalizeText(payload?.phone),
    message: normalizeText(payload?.message)
  });

  if (!inquiry.name || !inquiry.email || !inquiry.message) {
    throw new Error("Name, email, and message are required.");
  }

  const collections = await getCollections();

  if (!collections) {
    memoryStore.inquiries.push(inquiry);
    return clone(inquiry);
  }

  await collections.inquiries.insertOne(inquiry);
  return clone(inquiry);
}
