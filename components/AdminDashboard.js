"use client";

import { useState, useTransition } from "react";

const defaultProductImage = "/products/ember-crown.svg";

const emptyForm = {
  name: "",
  description: "",
  image: defaultProductImage,
  category: "Signature",
  size: "50 ml",
  notes: "",
  inventory: 0,
  price: 0,
  tag: "Limited Batch",
  featured: false
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

async function prepareUploadImage(file) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new window.Image();
    image.src = objectUrl;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longestEdge > 1400 ? 1400 / longestEdge : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to prepare this image for upload.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminDashboard({
  databaseIssue,
  initialProducts,
  databaseConfigured
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
  }

  function loadProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.category,
      size: product.size,
      notes: product.notes,
      inventory: product.inventory,
      price: product.price,
      tag: product.tag,
      featured: product.featured
    });
    setMessage(`Editing ${product.name}`);
  }

  function handleImageFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const nextImage = await prepareUploadImage(file);

          setForm((current) => ({
            ...current,
            image: nextImage
          }));
          setMessage(`${file.name} is ready to save.`);
        } catch {
          setMessage("Unable to read that image. Please try another file.");
        }
      })();
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    startTransition(() => {
      void (async () => {
        const response = await fetch(
          editingId ? `/api/products/${editingId}` : "/api/products",
          {
            method: editingId ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...form,
              price: Number(form.price),
              inventory: Number(form.inventory)
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Unable to save product.");
          return;
        }

        if (editingId) {
          setProducts((current) =>
            current.map((product) =>
              product.id === editingId ? data.product : product
            )
          );
          setMessage("Product updated.");
        } else {
          setProducts((current) => [data.product, ...current]);
          setMessage("Product added.");
        }

        resetForm();
      })();
    });
  }

  function handleDelete(productId) {
    startTransition(() => {
      void (async () => {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE"
        });
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Unable to delete product.");
          return;
        }

        setProducts((current) =>
          current.filter((product) => product.id !== productId)
        );

        if (editingId === productId) {
          resetForm();
        }

        setMessage("Product deleted.");
      })();
    });
  }

  return (
    <section className="page-section">
      <div className="section-shell">
        <div className="split-hero">
          <div className="hero-copy">
            <span className="eyebrow">Admin Studio</span>
            <h1>Manage your perfume catalog with a simpler product editor.</h1>
            <p className="section-copy">
              Upload product images directly from your device, then fill in
              pricing, notes, category labels, inventory counts, and featured
              badges from one clean dashboard.
            </p>
            {!databaseConfigured ? (
              <div className="notice-banner">
                <strong>Demo storage is active.</strong>{" "}
                {databaseIssue
                  ? "Your MongoDB connection could not be reached, so admin changes are saving only in local demo storage right now."
                  : "Admin changes work in demo mode for now, but they become permanent once you add MONGODB_URI."}
              </div>
            ) : null}
            {message ? <div className="status-banner">{message}</div> : null}
          </div>
          <div className="content-card">
            <span className="eyebrow">Quick Guide</span>
            <div className="info-stack">
              <div>
                <span className="info-label">Product image</span>
                <strong>Upload a bottle photo directly and preview it before saving</strong>
              </div>
              <div>
                <span className="info-label">Admin access</span>
                <strong>The account using ADMIN_EMAIL becomes admin</strong>
              </div>
              <div>
                <span className="info-label">Recommended next step</span>
                <strong>Use clean bottle shots with simple backgrounds</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-layout">
          <form className="content-card" onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
            <div className="form-grid">
              <label className="form-field">
                <span className="form-label">Product name</span>
                <input
                  className="form-input"
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                  type="text"
                  value={form.name}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Price in INR</span>
                <input
                  className="form-input"
                  min="0"
                  onChange={(event) => updateField("price", event.target.value)}
                  required
                  type="number"
                  value={form.price}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Category</span>
                <input
                  className="form-input"
                  onChange={(event) => updateField("category", event.target.value)}
                  type="text"
                  value={form.category}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Bottle size</span>
                <input
                  className="form-input"
                  onChange={(event) => updateField("size", event.target.value)}
                  type="text"
                  value={form.size}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Inventory</span>
                <input
                  className="form-input"
                  min="0"
                  onChange={(event) => updateField("inventory", event.target.value)}
                  type="number"
                  value={form.inventory}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Badge text</span>
                <input
                  className="form-input"
                  onChange={(event) => updateField("tag", event.target.value)}
                  type="text"
                  value={form.tag}
                />
              </label>

              <label className="form-field form-field-wide">
                <span className="form-label">Product image</span>
                <div className="image-upload-box">
                  <input
                    accept="image/png,image/jpeg,image/webp"
                    className="form-input"
                    onChange={handleImageFileChange}
                    type="file"
                  />
                  <p className="form-help">
                    Upload a product photo from your device. The app compresses it
                    before saving so the catalog stays lighter.
                  </p>
                  <div className="image-upload-actions">
                    <button
                      className="button-secondary"
                      onClick={() => updateField("image", defaultProductImage)}
                      type="button"
                    >
                      Use placeholder
                    </button>
                  </div>
                </div>
              </label>

              <label className="form-field form-field-wide">
                <span className="form-label">Notes</span>
                <input
                  className="form-input"
                  onChange={(event) => updateField("notes", event.target.value)}
                  type="text"
                  value={form.notes}
                />
              </label>

              <label className="form-field form-field-wide">
                <span className="form-label">Description</span>
                <textarea
                  className="form-textarea"
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  required
                  value={form.description}
                />
              </label>

              <label className="form-field form-field-wide">
                <span className="form-label">Feature this product on top</span>
                <select
                  className="form-select"
                  onChange={(event) =>
                    updateField("featured", event.target.value === "true")
                  }
                  value={String(form.featured)}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
            </div>

            <div className="image-preview-panel">
              <span className="info-label">Current preview</span>
              <div className="image-preview-frame">
                <img alt="Product preview" src={form.image || defaultProductImage} />
              </div>
            </div>

            <div className="card-actions">
              <button className="button-primary" disabled={isPending} type="submit">
                {editingId ? "Update product" : "Add product"}
              </button>
              <button
                className="button-secondary"
                onClick={resetForm}
                type="button"
              >
                Reset form
              </button>
            </div>
          </form>

          <div className="content-card">
            <h2>Current Products</h2>
            <div className="cart-list">
              {products.map((product) => (
                <article className="admin-row" key={product.id}>
                  <div className="cart-product">
                    <div className="cart-item-image">
                      <img alt={product.name} src={product.image} />
                    </div>
                    <div>
                      <h3 className="product-title">{product.name}</h3>
                      <p className="section-copy">{product.description}</p>
                      <span className="pill">
                        {product.category} / {product.size} / Stock {product.inventory}
                      </span>
                    </div>
                  </div>
                  <div>
                    <strong className="price-text">
                      {currencyFormatter.format(product.price)}
                    </strong>
                    <div className="cart-actions">
                      <button
                        className="button-secondary"
                        onClick={() => loadProduct(product)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button-muted"
                        disabled={isPending}
                        onClick={() => handleDelete(product.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
