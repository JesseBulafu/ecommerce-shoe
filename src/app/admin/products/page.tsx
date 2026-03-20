import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAdminProducts } from "@/lib/actions/admin";
import AdminProductActions from "./AdminProductActions";

export const metadata: Metadata = {
  title: "Products — Admin — Arstra",
};

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-semibold text-dark-900 tracking-tight">Products</h1>
          <p className="text-[15px] text-dark-500 mt-1">
            {products.length} product{products.length !== 1 && "s"} in catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-dark-900 px-4 py-2.5 text-[13px] font-semibold text-light-100 transition-all hover:bg-dark-700 active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-light-300 bg-light-100">
          <svg className="h-12 w-12 text-dark-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <p className="text-[15px] text-dark-500">No products yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-light-300/60 bg-light-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-light-300/60">
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Product</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Brand</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Category</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Variants</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Status</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Added</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-300/40">
                {products.map((product) => (
                  <tr key={product.id} className="group transition hover:bg-light-200/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-light-200">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill sizes="44px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <svg className="h-5 w-5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-[13px] font-medium text-dark-900 truncate max-w-48">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-dark-700">
                      {product.brandName ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-dark-700">
                      {product.categoryName ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-[28px] items-center justify-center rounded-lg bg-light-200 px-2 py-0.5 text-[13px] font-medium text-dark-700">
                        {product.variantCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {product.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-emerald-50 text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-light-200 text-dark-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-dark-500" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-dark-500">
                      {new Date(product.createdAt).toLocaleDateString("en-UG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <AdminProductActions productId={product.id} isPublished={product.isPublished} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
