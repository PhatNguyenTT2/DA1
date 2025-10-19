import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Breadcrumb } from '../../components/Breadcrumb';
import { GenerateSalesReportModal } from '../../components/Reports';
import reportService from '../../services/reportService';

const SalesReports = () => {
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Sales', href: null },
  ];

  // State management
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reportService.getReports({
        reportType: 'sales',
        page: pagination.page,
        limit: pagination.limit,
        sort: '-createdAt'
      });

      if (response && response.reports) {
        const formattedReports = reportService.formatReportsForDisplay(response.reports);
        setReports(formattedReports);

        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total,
            pages: response.pagination.pages
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.error || err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pagination.page, pagination.limit]);

  // Handle generate success
  const handleGenerateSuccess = (response) => {
    console.log('Report generated:', response);
    fetchReports();
  };

  // Handle delete report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await reportService.deleteReport(reportId);
      alert('Report deleted successfully');
      fetchReports();
    } catch (err) {
      console.error('Error deleting report:', err);
      alert(err.error || 'Failed to delete report');
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-semibold font-['Poppins',sans-serif] text-[#212529]">
                Sales Reports
              </h1>
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mt-1">
                Generate and view sales performance reports
              </p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[13px] font-['Poppins',sans-serif] font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Generate New Report
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && reports.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading reports</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Reports List */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px]">
                      Report Number
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px]">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px]">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px]">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px]">
                      Generated By
                    </th>
                    <th className="px-6 py-3 text-center text-[11px] font-medium font-['Poppins',sans-serif] text-[#212529] uppercase tracking-[0.5px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`hover:bg-gray-50 transition-colors ${index !== reports.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-medium font-['Poppins',sans-serif] text-blue-600">
                          {report.reportNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-['Poppins',sans-serif] text-[#212529]">
                          {report.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[12px] font-['Poppins',sans-serif] text-gray-600">
                          {report.periodStart ? new Date(report.periodStart).toLocaleDateString() : 'N/A'}
                          {' - '}
                          {report.periodEnd ? new Date(report.periodEnd).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-[11px] font-['Poppins',sans-serif] text-gray-500 mt-1">
                          {report.periodDuration} days
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold font-['Poppins',sans-serif] uppercase ${getStatusBadge(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-[13px] font-semibold font-['Poppins',sans-serif] text-[#212529]">
                          ${(report.summary?.totalRevenue || 0).toFixed(2)}
                        </p>
                        <p className="text-[11px] font-['Poppins',sans-serif] text-gray-500 mt-1">
                          {report.summary?.orderCount || 0} orders
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[12px] font-['Poppins',sans-serif] text-gray-600">
                          {report.generatedBy}
                        </p>
                        <p className="text-[11px] font-['Poppins',sans-serif] text-gray-500 mt-1">
                          {report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => console.log('View report:', report.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Report"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            onClick={() => console.log('Download report:', report.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Report"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M2 11V12C2 12.5304 2.21071 13.0391 2.58579 13.4142C2.96086 13.7893 3.46957 14 4 14H12C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 4H14M5.5 4V2.5C5.5 2.23478 5.60536 1.98043 5.79289 1.79289C5.98043 1.60536 6.23478 1.5 6.5 1.5H9.5C9.76522 1.5 10.0196 1.60536 10.2071 1.79289C10.3946 1.98043 10.5 2.23478 10.5 2.5V4M12.5 4V13C12.5 13.2652 12.3946 13.5196 12.2071 13.7071C12.0196 13.8946 11.7652 14 11.5 14H4.5C4.23478 14 3.98043 13.8946 3.79289 13.7071C3.60536 13.5196 3.5 13.2652 3.5 13V4H12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {reports.length === 0 && (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">
                  No reports yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 font-['Poppins',sans-serif]">
                  Get started by generating your first sales report
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowGenerateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[13px] font-['Poppins',sans-serif]"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">
                  Showing page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-[12px] font-['Poppins',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded text-[12px] font-['Poppins',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <GenerateSalesReportModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSuccess={handleGenerateSuccess}
      />
    </Layout>
  );
};

export default SalesReports;
