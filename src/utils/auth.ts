export const isAdminRole = (role?: number | null) =>
  typeof role === "number" && role >= 0 && role <= 2;

export const getPostLoginRoute = (role?: number | null) =>
  isAdminRole(role) ? "/dashboard" : "/";
