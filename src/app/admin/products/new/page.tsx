import type { Metadata } from "next";
import { getProductFormOptions } from "@/lib/actions/admin";
import AddProductForm from "./AddProductForm";

export const metadata: Metadata = {
  title: "Add Product — Admin — Arstra",
};

export default async function AddProductPage() {
  const options = await getProductFormOptions();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[26px] font-semibold text-dark-900 tracking-tight">Add Product</h1>
        <p className="text-[15px] text-dark-500 mt-1">
          Fill in the details below to add a new product to the catalog.
        </p>
      </div>

      <AddProductForm options={options} />
    </div>
  );
}
