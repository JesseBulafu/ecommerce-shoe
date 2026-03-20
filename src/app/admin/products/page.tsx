import type { Metadata } from "next";
import Image from "next/image";
import { getAdminProducts } from "@/lib/actions/admin";
import { Package } from "lucide-react";
import AdminProductActions from "./AdminProductActions";

export const metadata: Metadata = {
  title: "Products — Admin — Arstra",
};

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-3 font-medium text-dark-900">Products</h1>
          <p className="text-body text-dark-700 mt-1">
            {products.length} product{products.length !== 1 && "s"}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-body text-dark-500 text-center py-20">No products yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-light-300">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-light-300 bg-light-200">
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Product</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Brand</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Category</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Variants</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Status</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Added</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-light-300 hover:bg-light-200/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-light-200">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package size={16} className="text-light-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-caption text-dark-900 font-medium truncate max-w-[200px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-caption text-dark-700">
                    {product.brandName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-caption text-dark-700">
                    {product.categoryName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-caption text-dark-700">
                    {product.variantCount}
                  </td>
                  <td className="px-4 py-3">
                    {product.isPublished ? (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-footnote font-medium bg-green/10 text-green">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-footnote font-medium bg-light-300 text-dark-500">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-footnote text-dark-500">
                    {new Date(product.createdAt).toLocaleDateString("en-UG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <AdminProductActions productId={product.id} isPublished={product.isPublished} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
