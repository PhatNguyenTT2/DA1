import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { PurchaseOrderList, PurchaseOrderListHeader } from '../components/PurchaseOrderList';
import purchaseOrderService from '../services/purchaseOrderService';

const PurchaseOrders = () => {
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Inventory', href: null },
    { label: 'Purchase Orders', href: null },
  ];

  // State management
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });

  // Filters - Backend uses 'limit' not 'per_page'
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sort: '-orderDate' // Backend format: '-field' for desc, 'field' for asc
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sort state
  const [sortField, setSortField] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch purchase orders from API
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[PurchaseOrders] Fetching with filters:', filters);
      const response = await purchaseOrderService.getPurchaseOrders(filters);
      console.log('[PurchaseOrders] API Response:', response);

      // Backend returns { purchaseOrders, pagination } directly
      if (response && response.purchaseOrders) {
        console.log('[PurchaseOrders] Raw purchase orders:', response.purchaseOrders);
        const formattedPOs = purchaseOrderService.formatPurchaseOrdersForDisplay(response.purchaseOrders);
        console.log('[PurchaseOrders] Formatted purchase orders:', formattedPOs);
        setPurchaseOrders(formattedPOs);

        if (response.pagination) {
          setPagination({
            current_page: response.pagination.page || 1,
            per_page: response.pagination.limit || 20,
            total: response.pagination.total || 0,
            total_pages: response.pagination.pages || 0
          });
        }
      } else {
        console.warn('[PurchaseOrders] Unexpected response format:', response);
        setPurchaseOrders([]);
      }
    } catch (err) {
      console.error('[PurchaseOrders] Error fetching purchase orders:', err);
      setError(err.error || err.message || 'Failed to fetch purchase orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchase orders on component mount and when filters change
  useEffect(() => {
    fetchPurchaseOrders();
  }, [filters]);

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    console.log('[PurchaseOrders] Changing limit to:', newLimit);
    setFilters(prev => ({
      ...prev,
      limit: newLimit,
      page: 1
    }));
  };

  // Handle search
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleSearch = (query) => {
    console.log('[PurchaseOrders] Searching for:', query);
    setFilters(prev => ({
      ...prev,
      search: query,
      page: 1
    }));
  };

  // Handle sort
  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);

    // Backend format: '-field' for desc, 'field' for asc
    const sortString = newSortOrder === 'desc' ? `-${field}` : field;
    console.log('[PurchaseOrders] Sorting by:', sortString);

    setFilters(prev => ({
      ...prev,
      sort: sortString
    }));
  };

  // Handle add purchase order
  const handleAddPurchaseOrder = () => {
    console.log('Add new purchase order');
    // TODO: Open create modal
  };

  if (loading && purchaseOrders.length === 0) {
    return (
      <Layout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPurchaseOrders}
            className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={breadcrumbItems} />

      <div className="space-y-4">
        <PurchaseOrderListHeader
          itemsPerPage={filters.limit}
          onItemsPerPageChange={handleItemsPerPageChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onAddPurchaseOrder={handleAddPurchaseOrder}
        />

        <PurchaseOrderList
          purchaseOrders={purchaseOrders}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
          onRefresh={fetchPurchaseOrders}
        />
      </div>
    </Layout>
  );
};

export default PurchaseOrders;