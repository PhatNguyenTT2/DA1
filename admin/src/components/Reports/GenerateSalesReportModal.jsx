import { useState, useEffect } from 'react';
import reportService from '../../services/reportService';

export const GenerateSalesReportModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    periodType: 'month',
    startDate: '',
    endDate: '',
    format: 'json',
    includeCustomerBreakdown: false,
    includeProductBreakdown: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fill dates based on periodType
  useEffect(() => {
    if (isOpen) {
      handlePeriodTypeChange(formData.periodType);
    }
  }, [isOpen]);

  const handlePeriodTypeChange = (type) => {
    const now = new Date();
    let start, end;

    switch (type) {
      case 'today':
        start = end = now.toISOString().split('T')[0];
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0).toISOString().split('T')[0];
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      case 'custom':
        start = end = '';
        break;
      default:
        start = end = '';
    }

    setFormData(prev => ({
      ...prev,
      periodType: type,
      startDate: start,
      endDate: end,
      title: prev.title || `Sales Report - ${new Date().toLocaleDateString()}`
    }));
  };

  const calculateDaysDifference = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end date
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setError('Report title is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Start date and end date are required');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reportData = {
        title: formData.title.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        format: formData.format,
        parameters: {
          includeCustomerBreakdown: formData.includeCustomerBreakdown,
          includeProductBreakdown: formData.includeProductBreakdown
        }
      };

      const response = await reportService.generateSalesReport(reportData);

      if (onSuccess) {
        onSuccess(response);
      }

      alert(response.message || 'Sales report generated successfully!');
      onClose();
    } catch (err) {
      console.error('Error generating sales report:', err);
      setError(err.error || err.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-[20px] font-semibold font-['Poppins',sans-serif] text-[#212529]">
              Generate Sales Report
            </h2>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
              Create a comprehensive sales report for the specified period
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-[13px]">
              {error}
            </div>
          )}

          {/* Report Title */}
          <div>
            <label className="block text-[13px] font-medium font-['Poppins',sans-serif] text-[#212529] mb-2">
              Report Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Sales Report - January 2025"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Period Type - Quick Select */}
          <div>
            <label className="block text-[13px] font-medium font-['Poppins',sans-serif] text-[#212529] mb-2">
              Period
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' },
                { value: 'custom', label: 'Custom' }
              ].map(period => (
                <button
                  key={period.value}
                  type="button"
                  className={`px-4 py-2 rounded-lg border text-[12px] font-['Poppins',sans-serif] transition-colors ${formData.periodType === period.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={() => handlePeriodTypeChange(period.value)}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium font-['Poppins',sans-serif] text-[#212529] mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium font-['Poppins',sans-serif] text-[#212529] mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preview Selected Period */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-[12px] text-blue-800 font-['Poppins',sans-serif]">
                📅 Report period: <strong>{formData.startDate}</strong> to <strong>{formData.endDate}</strong>
                <span className="ml-2 text-blue-600">
                  ({calculateDaysDifference(formData.startDate, formData.endDate)} days)
                </span>
              </p>
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-[13px] font-medium font-['Poppins',sans-serif] text-[#212529] mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['json', 'pdf', 'excel', 'csv'].map(format => (
                <button
                  key={format}
                  type="button"
                  className={`px-4 py-2 rounded-lg border text-[12px] font-['Poppins',sans-serif] uppercase transition-colors ${formData.format === format
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={() => handleChange('format', format)}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <label className="block text-[13px] font-medium font-['Poppins',sans-serif] text-[#212529] mb-3">
              Additional Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeCustomerBreakdown}
                  onChange={(e) => handleChange('includeCustomerBreakdown', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[13px] font-['Poppins',sans-serif] text-gray-700">
                  Include customer breakdown
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeProductBreakdown}
                  onChange={(e) => handleChange('includeProductBreakdown', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[13px] font-['Poppins',sans-serif] text-gray-700">
                  Include product breakdown
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-[13px] font-['Poppins',sans-serif] font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-[13px] font-['Poppins',sans-serif] font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2V14M8 14L11 11M8 14L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
