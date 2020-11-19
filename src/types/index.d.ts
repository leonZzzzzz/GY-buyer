declare interface IProduct {
  id: string;
  name: string;
  iconUrl: string;
  qty: number;
  price: number;
  origPrice: number;
  storeId: string;
  storeName: string;
  specs: string;
}

interface IOrder {
  id: string;
  bizType: number;
  bizTypeName: string;
  createTime: string;
  discountAmount: number;
  evaluateStatus: string | number;
  expireTime: string;
  memberId: string;
  name: string;
  needPayTotalAmount: number;
  orderNo: string;
  orderType: string;
  payStatus: string | number;
  payStatusName: string;
  payWayName: string;
  qty: string;
  sourceType: string;
  status: string | number;
  statusName: string;
  storeId: string;
  storeName: string;
  supplierId: string;
  totalAmount: number;
  orderItems: IProduct[]
}
