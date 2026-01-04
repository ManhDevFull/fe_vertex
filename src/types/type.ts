import { Account } from "./models/Account";
import { Address } from "./models/Addrress";
import { OrderDetail } from "./models/OrderDetail";
import { Variant } from "./models/Variant";

export type category = {
  _id: number;
  name_category: string;
}

export type VariantDTO = {
  id: number;
  valuevariant: { [key: string]: string };
  stock: number;
  inputprice: number;
  discounts: DiscountDTO[]
  price: number;
}
export type ChatMessage = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
};

export type ThreadResponse = {
  contactId: number;
  contactName: string;
  avatarInitials: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
};

export type DiscountDTO = {
  id: number;
  typediscount: number;
  discount: number;
  starttime: Date;
  endtime: Date;
}
export type ProductUi = {
  id: number;
  name: string;
  description: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  imgUrls: string[];
  variant: VariantDTO[];
  rating: number;
  order: number;
  wishlistCount?: number;
}
// khai báo cho Frequently, sản phẩm kèm theo
export type FrequentlyDTO = {
  accompanying: ProductUi[];
  main: ProductUi;
};

// lấy ra tất cả variant khi bắt đầu load trang
export type allvariant = {
  key: string;
  values: string[];
}
// lưu khi cetgory thay đổi, lấy brand, variant theo category
export type variants = {
  id: number;
  namecategory: string;
  brand: string[];
  variant: valueFilter;
}

export type valueFilter = {
  [key: string]: string[];
}
export type PaginationInfo = {
  pageNumber: number;
  pageSize: number;
}
export type PagedResultDTO<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}
// time unit
export type timeUnit = {
  endtime: Date;
  unit: {
    day?: string,
    hour: string,
    min: string,
    sec: string
  }
}
// img product
export type imgproductProps = {
  img: string;
  type: boolean;
  isNew: boolean;
}
export type ResponData<T = unknown> = {
  data: T;
  message: string;
  status: number;
};
export interface ICategory {
  id: number;
  namecategory: string;
  idparent: number | null;
  product: number;
}

export type CategoryTree = {
  id: number;
  namecategory: string;
  product: number;
  idparent?: number | null;
  children?: CategoryTree[];
};
export type IUser = {
  id: number;
  avatarImg?: string;
  name: string;
  tel: string;
  email: string;
  orders?: number;
  role: number;
};
export type IAddress = {
  accountid: number;
  codeward: number;
  createdate: string;
  description: string;
  detail: string;
  id: number;
  namerecipient: string;
  tel: string;
  title: string;
  updatedate: string;
};
export type IProductAdmin = {
  brand: string;
  category_id: number;
  category_name: string;
  createdate: string;
  description: string;
  imageurls: string[];
  max_price: number;
  min_price: number;
  name: string;
  product_id: number;
  updatedate: string;
  variant_count: number;
  variants: IVariant[];
};
export type IVariant = {
  createdate: string;
  inputprice: number;
  isdeleted: boolean;
  price: number;
  product_id: number;
  stock: number;
  sold?: number;
  updatedate: string;
  valuevariant: unknown;
  variant_id: number;
};

export type IOrderAdmin = {
  account: Account
  accountid: number
  address: Address
  addressid: number
  id: number
  orderdate: string
  orderdetails: OrderDetail[]
  receivedate: string | null
  statusorder: string
  statuspay: string
  typepay: string
}
export type IOrderSummary = {
  total: number;
  pending: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  paid: number;
  unpaid: number;
  revenue: number;
};

export type IAdminDashboardOrder = {
  id: number;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  totalPrice: number;
  statusOrder: string;
  statusPay: string;
  typePay: string;
  orderDate: string;
};

export type IAdminDashboardSummary = {
  orderSummary: IOrderSummary;
  reviewSummary: IReviewSummary;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: IAdminDashboardOrder[];
  changes: IAdminDashboardChange;
  trend: IAdminDashboardTrendPoint[];
  generatedAt: string;
};

export type IAdminDashboardChange = {
  revenuePercent: number;
  profitPercent: number;
  orderPercent: number;
};

export type IAdminDashboardTrendPoint = {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
};

export type IReviewAdmin = {
  id: number;
  orderId: number;
  rating: number;
  content: string;
  imageUrls: string[];
  createDate: string;
  updateDate?: string | null;
  isUpdated: boolean;
  customerName: string;
  customerEmail: string;
  productName: string;
  productImage: string;
  variantAttributes: Record<string, string>;
};

export type IReviewSummary = {
  total: number;
  updated: number;
  averageRating: number;
};

export type IProductReview = {
  id: number;
  rating: number;
  content: string;
  imageUrls: string[];
  createDate?: string | null;
  customerName: string;
  customerAvatar?: string | null;
  variantAttributes?: Record<string, string>;
};
