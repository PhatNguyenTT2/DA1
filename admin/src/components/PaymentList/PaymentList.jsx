import { useState, useRef, useEffect } from 'react';

const PaymentList = ({
  payments = [],
  onStatusChange,
  onSort,
  sortField,
  sortOrder,
  onRefund
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const [refundModal, setRefundModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Handle sort click
  const handleSortClick = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  // Get sort icon with color
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
          <path d="M6 3V9M6 3L4 5M6 3L8 5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (sortOrder === 'asc') {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
          <path d="M6 9V3M6 3L4 5M6 3L8 5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    } else {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
          <path d="M6 3V9M6 9L4 7M6 9L8 7" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
  };

  // Toggle dropdown
  const toggleDropdown = (dropdownId, event) => {
    if (activeDropdown === dropdownId) {
      setActiveDropdown(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      let leftPosition;

      if (dropdownId.startsWith('status-') || dropdownId.startsWith('type-')) {
        leftPosition = buttonRect.left;
      } else {
        leftPosition = buttonRect.right - 160;
      }

      setDropdownPosition({
        top: buttonRect.bottom + 4,
        left: leftPosition
      });
      setActiveDropdown(dropdownId);
    }
  };

  // Handle status change
  const handleStatusChange = (paymentId, newStatus) => {
    if (onStatusChange) {
      onStatusChange(paymentId, newStatus);
    }
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Get status badge styling
  const getStatusStyles = (status) => {
    const statusMap = {
      pending: 'bg-[#fbbf24]',    // Yellow
      completed: 'bg-[#10b981]',  // Green
      failed: 'bg-[#ef4444]',     // Red
      refunded: 'bg-[#f59e0b]',   // Orange
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-500';
  };

  // Status options for dropdown (refunded is not manually selectable)
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-[#fbbf24]' },
    { value: 'completed', label: 'Completed', color: 'bg-[#10b981]' },
    { value: 'failed', label: 'Failed', color: 'bg-[#ef4444]' },
    // Note: 'refunded' status is set automatically via the refund process, not manually
  ];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format payment method display
  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Action handlers
  const handleView = (payment) => {
    console.log('View payment:', payment);
    // TODO: Open view modal
  };

  const handleEdit = (payment) => {
    console.log('Edit payment:', payment);
    // TODO: Open edit modal
  };

  const handleRefund = (payment) => {
    console.log('Refund payment:', payment);
    setRefundModal(payment);
    setRefundAmount(payment.amount.toString());
    setRefundReason('');
  };

  const handleRefundSubmit = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }

    if (!refundReason.trim()) {
      alert('Please provide a refund reason');
      return;
    }

    if (onRefund) {
      await onRefund(refundModal.id, parseFloat(refundAmount), refundReason);
    }

    setRefundModal(null);
    setRefundAmount('');
    setRefundReason('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Scrollable Container */}
      <div className="overflow-x-auto rounded-lg">
        <div className="min-w-[1200px]">
          {/* Table Header */}
          <div className="flex items-center h-[34px] bg-gray-50 border-b border-gray-200">
            {/* ID Column - Sortable */}
            <div
              className="w-[140px] px-3 flex items-center flex-shrink-0 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSortClick('paymentNumber')}
            >
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px] flex items-center">
                ID
                {getSortIcon('paymentNumber')}
              </p>
            </div>

            {/* Type Column */}
            <div className="w-[110px] px-3 flex items-center flex-shrink-0">
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px]">
                TYPE
              </p>
            </div>

            {/* Related Order Column - Sortable */}
            <div
              className="w-[150px] px-3 flex items-center flex-shrink-0 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSortClick('relatedOrder')}
            >
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px] flex items-center">
                ORDER #
                {getSortIcon('relatedOrder')}
              </p>
            </div>

            {/* Amount Column - Sortable */}
            <div
              className="w-[130px] px-3 flex items-center flex-shrink-0 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSortClick('amount')}
            >
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px] flex items-center">
                AMOUNT
                {getSortIcon('amount')}
              </p>
            </div>

            {/* Payment Method Column */}
            <div className="w-[150px] px-3 flex items-center flex-shrink-0">
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px]">
                METHOD
              </p>
            </div>

            {/* Date Column - Sortable */}
            <div
              className="w-[130px] px-3 flex items-center flex-shrink-0 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSortClick('date')}
            >
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px] flex items-center">
                DATE
                {getSortIcon('date')}
              </p>
            </div>

            {/* Status Column */}
            <div className="w-[130px] px-3 flex items-center flex-shrink-0">
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px]">
                STATUS
              </p>
            </div>

            {/* Received By Column */}
            <div className="flex-1 min-w-[150px] px-3 flex items-center">
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px]">
                RECEIVED BY
              </p>
            </div>

            {/* Actions Column */}
            <div className="w-[100px] px-3 flex items-center justify-center flex-shrink-0">
              <p className="text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px] leading-[18px]">
                ACTIONS
              </p>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            {payments.map((payment, index) => {
              const statusDropdownId = `status-${payment.id}`;

              return (
                <div
                  key={payment.id}
                  className={`flex items-center h-[60px] hover:bg-gray-50 transition-colors ${index !== payments.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                >
                  {/* ID */}
                  <div className="w-[140px] px-3 flex items-center flex-shrink-0">
                    <p className="text-[13px] font-normal font-['Poppins',sans-serif] text-emerald-600 leading-[20px]">
                      {payment.paymentNumber}
                    </p>
                  </div>

                  {/* Type */}
                  <div className="w-[110px] px-3 flex items-center flex-shrink-0">
                    <p className="text-[13px] font-normal font-['Poppins',sans-serif] text-[#212529] leading-[20px] capitalize">
                      {payment.type}
                    </p>
                  </div>

                  {/* Related Order */}
                  <div className="w-[150px] px-3 flex items-center flex-shrink-0">
                    <p className="text-[13px] font-normal font-['Poppins',sans-serif] text-[#212529] leading-[20px]">
                      {payment.relatedOrderNumber}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="w-[130px] px-3 flex items-center flex-shrink-0">
                    <p className="text-[13px] font-normal font-['Poppins',sans-serif] text-[#212529] leading-[20px]">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className="w-[150px] px-3 flex items-center flex-shrink-0">
                    <p className="text-[13px] font-normal font-['Poppins',sans-serif] text-[#212529] leading-[20px]">
                      {formatPaymentMethod(payment.paymentMethod)}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="w-[130px] px-3 flex items-center flex-shrink-0">
                    <p className="text-[13px] font-normal font-['Poppins',sans-serif] text-[#212529] leading-[20px]">
                      {formatDate(payment.date)}
                    </p>
                  </div>

                  {/* Status Badge with Dropdown */}
                  <div className="w-[130px] px-3 flex items-center flex-shrink-0">
                    {payment.status === 'pending' ? (
                      <button
                        onClick={(e) => toggleDropdown(statusDropdownId, e)}
                        className={`${getStatusStyles(payment.status)} px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity`}
                      >
                        <span className="text-[9px] font-bold font-['Poppins',sans-serif] text-white leading-[10px] uppercase">
                          {payment.status}
                        </span>
                        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L4 4L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : (
                      <div className={`${getStatusStyles(payment.status)} px-2 py-1 rounded inline-flex items-center`}>
                        <span className="text-[9px] font-bold font-['Poppins',sans-serif] text-white leading-[10px] uppercase">
                          {payment.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Received By */}
                  <div className="flex-1 min-w-[150px] px-3 flex items-center">
                    <p className="text-[13px] font-normal font-['Poppins',sans-serif] text-[#212529] leading-[20px] truncate">
                      {payment.receivedBy}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="w-[100px] px-3 flex items-center justify-center flex-shrink-0">
                    <button
                      onClick={(e) => toggleDropdown(`action-${payment.id}`, e)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      title="Actions"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="3" cy="8" r="1.5" fill="#6B7280" />
                        <circle cx="8" cy="8" r="1.5" fill="#6B7280" />
                        <circle cx="13" cy="8" r="1.5" fill="#6B7280" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {payments.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-500 text-[13px] font-['Poppins',sans-serif]">
                No payments found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Position Dropdown Menus */}
      {activeDropdown && (() => {
        const payment = payments.find(p =>
          activeDropdown === `status-${p.id}` ||
          activeDropdown === `action-${p.id}`
        );

        if (!payment) return null;

        const isStatus = activeDropdown === `status-${payment.id}`;
        const isAction = activeDropdown === `action-${payment.id}`;

        // Status Dropdown
        if (isStatus) {
          return (
            <div
              ref={dropdownRef}
              className="fixed min-w-[140px] bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
              }}
            >
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(payment.id, option.value)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <span className={`${option.color} w-2 h-2 rounded-full`}></span>
                  <span className="text-[12px] font-['Poppins',sans-serif] text-[#212529]">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          );
        }

        // Actions Dropdown
        if (isAction) {
          return (
            <div
              ref={dropdownRef}
              className="fixed w-[160px] bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
              }}
            >
              <button
                onClick={() => {
                  handleView(payment);
                  setActiveDropdown(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3C4.5 3 2 8 2 8s2.5 5 6 5 6-5 6-5-2.5-5-6-5z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="text-[12px] font-['Poppins',sans-serif] text-gray-700">View Details</span>
              </button>

              {payment.status === 'pending' && (
                <button
                  onClick={() => {
                    handleEdit(payment);
                    setActiveDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[12px] font-['Poppins',sans-serif] text-gray-700">Edit</span>
                </button>
              )}

              {payment.status === 'completed' && (
                <>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      handleRefund(payment);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 14A6 6 0 108 2a6 6 0 000 12z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 8H6M8 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-[12px] font-['Poppins',sans-serif]">Process Refund</span>
                  </button>
                </>
              )}
            </div>
          );
        }

        return null;
      })()}

      {/* Refund Modal */}
      {refundModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
          onClick={() => setRefundModal(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold font-['Poppins',sans-serif] text-[#212529]">
                Process Refund
              </h3>
              <button
                onClick={() => setRefundModal(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-[13px] font-['Poppins',sans-serif] text-yellow-800">
                  <span className="font-semibold">Warning:</span> This will restore inventory and update stock levels.
                </p>
              </div>

              <div>
                <p className="text-[13px] font-['Poppins',sans-serif] text-gray-700 mb-2">
                  <span className="font-semibold">Payment:</span> {refundModal.paymentNumber}
                </p>
                <p className="text-[13px] font-['Poppins',sans-serif] text-gray-700">
                  <span className="font-semibold">Order:</span> {refundModal.relatedOrderNumber}
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium font-['Poppins',sans-serif] text-gray-700 mb-2">
                  Refund Amount *
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min="0"
                  max={refundModal.amount}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter refund amount"
                />
                <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                  Maximum: ${refundModal.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium font-['Poppins',sans-serif] text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter reason for refund (e.g., Customer request, Damaged product, Wrong item)"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setRefundModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-[13px] font-['Poppins',sans-serif] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-[13px] font-['Poppins',sans-serif] font-medium transition-colors"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentList;
