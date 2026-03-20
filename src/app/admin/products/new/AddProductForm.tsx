"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createProduct, type ProductFormOptions } from "@/lib/actions/admin";

/* ── Reusable Field Components ─────────────────────────────────────────────── */

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-dark-900 mb-1.5">
      {children}
    </label>
  );
}

function InputField({
  id,
  name,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  min,
  step,
}: {
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  step?: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      step={step}
      className="w-full rounded-xl border border-light-300/80 bg-light-100 px-4 py-2.5 text-[14px] text-dark-900 placeholder:text-dark-500 outline-none transition focus:border-dark-900 focus:ring-1 focus:ring-dark-900/10"
    />
  );
}

function SelectField({
  id,
  name,
  value,
  onChange,
  children,
  required,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full rounded-xl border border-light-300/80 bg-light-100 px-4 py-2.5 text-[14px] text-dark-900 outline-none transition focus:border-dark-900 focus:ring-1 focus:ring-dark-900/10 appearance-none cursor-pointer"
    >
      {children}
    </select>
  );
}

/* ── Main Form ─────────────────────────────────────────────────────────────── */

export default function AddProductForm({ options }: { options: ProductFormOptions }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [genderId, setGenderId] = useState("");
  const [colorId, setColorId] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("10");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleSize(sizeId: string) {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((s) => s !== sizeId) : [...prev, sizeId],
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function handleSubmit(publish: boolean) {
    setError(null);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("brandId", brandId);
    fd.append("categoryId", categoryId);
    fd.append("genderId", genderId);
    fd.append("colorId", colorId);
    fd.append("price", price);
    if (salePrice) fd.append("salePrice", salePrice);
    fd.append("stock", stock);
    fd.append("publish", publish ? "true" : "false");
    selectedSizes.forEach((s) => fd.append("sizeIds", s));

    const file = fileRef.current?.files?.[0];
    if (file) fd.append("image", file);

    startTransition(async () => {
      const res = await createProduct(fd);
      if (res.success) {
        router.push("/admin/products");
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  const selectedColor = options.colors.find((c) => c.id === colorId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ─── Left: Main Info ─────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Product Info Card */}
        <div className="rounded-2xl border border-light-300/60 bg-light-100 p-6 space-y-5">
          <h2 className="text-[16px] font-semibold text-dark-900">Product Information</h2>

          <div>
            <FieldLabel htmlFor="name">Product Name</FieldLabel>
            <InputField id="name" name="name" placeholder="e.g. Nike Air Max 90" required value={name} onChange={setName} />
          </div>

          <div>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe this product — materials, comfort, style…"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-light-300/80 bg-light-100 px-4 py-2.5 text-[14px] text-dark-900 placeholder:text-dark-500 outline-none transition focus:border-dark-900 focus:ring-1 focus:ring-dark-900/10 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel htmlFor="brandId">Brand</FieldLabel>
              <SelectField id="brandId" name="brandId" value={brandId} onChange={setBrandId} required>
                <option value="">Select brand</option>
                {options.brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="categoryId">Category</FieldLabel>
              <SelectField id="categoryId" name="categoryId" value={categoryId} onChange={setCategoryId} required>
                <option value="">Select category</option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="genderId">Gender</FieldLabel>
              <SelectField id="genderId" name="genderId" value={genderId} onChange={setGenderId} required>
                <option value="">Select gender</option>
                {options.genders.map((g) => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </SelectField>
            </div>
          </div>
        </div>

        {/* Pricing & Stock Card */}
        <div className="rounded-2xl border border-light-300/60 bg-light-100 p-6 space-y-5">
          <h2 className="text-[16px] font-semibold text-dark-900">Pricing & Stock</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel htmlFor="price">Price (UGX)</FieldLabel>
              <InputField id="price" name="price" type="number" placeholder="250000" required value={price} onChange={setPrice} min="0" step="1000" />
            </div>
            <div>
              <FieldLabel htmlFor="salePrice">Sale Price (optional)</FieldLabel>
              <InputField id="salePrice" name="salePrice" type="number" placeholder="—" value={salePrice} onChange={setSalePrice} min="0" step="1000" />
            </div>
            <div>
              <FieldLabel htmlFor="stock">Stock per Size</FieldLabel>
              <InputField id="stock" name="stock" type="number" placeholder="10" value={stock} onChange={setStock} min="0" />
            </div>
          </div>
        </div>

        {/* Variants Card */}
        <div className="rounded-2xl border border-light-300/60 bg-light-100 p-6 space-y-5">
          <h2 className="text-[16px] font-semibold text-dark-900">Variants</h2>

          {/* Color */}
          <div>
            <FieldLabel>Color</FieldLabel>
            <div className="flex flex-wrap gap-2.5">
              {options.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorId(c.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-medium transition cursor-pointer ${
                    colorId === c.id
                      ? "border-dark-900 bg-dark-900 text-light-100"
                      : "border-light-300/80 bg-light-100 text-dark-700 hover:border-dark-500"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-light-300"
                    style={{ backgroundColor: c.hexCode }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
            {selectedColor && (
              <p className="text-[12px] text-dark-500 mt-2">
                Selected: {selectedColor.name} ({selectedColor.hexCode})
              </p>
            )}
          </div>

          {/* Sizes */}
          <div>
            <FieldLabel>Sizes</FieldLabel>
            <p className="text-[12px] text-dark-500 mb-2">Select all available sizes for this product.</p>
            <div className="flex flex-wrap gap-2">
              {options.sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSize(s.id)}
                  className={`min-w-[52px] rounded-xl border px-3 py-2 text-[13px] font-medium transition cursor-pointer ${
                    selectedSizes.includes(s.id)
                      ? "border-dark-900 bg-dark-900 text-light-100"
                      : "border-light-300/80 bg-light-100 text-dark-700 hover:border-dark-500"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {selectedSizes.length > 0 && (
              <p className="text-[12px] text-dark-500 mt-2">
                {selectedSizes.length} size{selectedSizes.length !== 1 && "s"} selected — {selectedSizes.length} variant{selectedSizes.length !== 1 && "s"} will be created.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Right: Image & Actions ──────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Image Upload Card */}
        <div className="rounded-2xl border border-light-300/60 bg-light-100 p-6 space-y-4">
          <h2 className="text-[16px] font-semibold text-dark-900">Product Image</h2>

          <div
            onClick={() => fileRef.current?.click()}
            className="group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-light-300 bg-light-200/50 transition hover:border-dark-500"
          >
            {preview ? (
              <Image src={preview} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-dark-500 group-hover:text-dark-700 transition">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                </svg>
                <span className="text-[13px] font-medium">Click to upload</span>
                <span className="text-[11px]">JPEG, PNG, WebP, AVIF · Max 5 MB</span>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-[13px] text-red hover:underline cursor-pointer"
            >
              Remove image
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="rounded-2xl border border-light-300/60 bg-light-100 p-6 space-y-3">
          <h2 className="text-[16px] font-semibold text-dark-900">Publish</h2>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 px-4 py-3 text-[13px] text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={pending}
            onClick={() => handleSubmit(true)}
            className="w-full rounded-xl bg-dark-900 px-4 py-3 text-[14px] font-semibold text-light-100 transition-all hover:bg-dark-700 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Publishing…" : "Publish to Store"}
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() => handleSubmit(false)}
            className="w-full rounded-xl border border-light-300/80 bg-light-100 px-4 py-3 text-[14px] font-semibold text-dark-700 transition-all hover:bg-light-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Saving…" : "Save as Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}
