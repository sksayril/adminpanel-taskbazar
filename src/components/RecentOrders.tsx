import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  trackingNo: string;
  productName: string;
  productImage: string;
  price: number;
  inStock: number;
  totalOrder: number;
  pending: number;
}

const RecentOrders = () => {
  const orders: Order[] = [
    {
      id: '1',
      trackingNo: '#1001',
      productName: 'Camera Lens',
      productImage: '📷',
      price: 178,
      inStock: 1236,
      totalOrder: 325,
      pending: 170,
    },
    {
      id: '2',
      trackingNo: '#1002',
      productName: 'Black Sleep Dress',
      productImage: '👗',
      price: 14,
      inStock: 720,
      totalOrder: 153,
      pending: 80,
    },
    {
      id: '3',
      trackingNo: '#1003',
      productName: 'Argan Oil',
      productImage: '🧴',
      price: 21,
      inStock: 940,
      totalOrder: 225,
      pending: 120,
    },
    {
      id: '4',
      trackingNo: '#1004',
      productName: 'EAU DE Parfum',
      productImage: '💐',
      price: 32,
      inStock: 940,
      totalOrder: 280,
      pending: 108,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search here"
            className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">
                Tracking no
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">
                Product Name
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">
                Price
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">
                In Stock
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">
                Total Order
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">
                Pending
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">
                Ca
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                  {order.trackingNo}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {order.productImage}
                    </div>
                    <span className="text-sm text-gray-900">{order.productName}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">${order.price}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{order.inStock}</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium">
                    {order.totalOrder}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium">
                    {order.pending}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                      ✏️
                    </button>
                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">1-4 of 12</div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            1
          </button>
          <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            2
          </button>
          <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            3
          </button>
          <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
