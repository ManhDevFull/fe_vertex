import { CategoryTree, ICategory } from "@/types/type";

export const formatTree = (data: ICategory[]): CategoryTree[] => {
  const buildTree = (parentId: number | null): CategoryTree[] => {
    return data
      .filter((item) => item.idparent === parentId)
      .map((item) => ({
        id: item.id,
        namecategory: item.namecategory,
        product: item.product,
        idparent: item.idparent ?? null,
        children: buildTree(item.id),
      }));
  };

  return buildTree(null);
};
