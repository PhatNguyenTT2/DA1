import api from './api';

/**
 * Report Service
 * Handles all report-related API calls
 */
const reportService = {
  /**
   * Get all reports with filters
   * @param {Object} params - Query parameters (page, limit, reportType)
   * @returns {Promise} Reports list with pagination
   */
  getReports: async (params = {}) => {
    try {
      console.log('[reportService] Fetching reports with params:', params);
      const response = await api.get('/reports', { params });
      console.log('[reportService] Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[reportService] Error fetching reports:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get report by ID
   * @param {string} id - Report ID
   * @returns {Promise} Report details
   */
  getReportById: async (id) => {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Generate sales report
   * @param {Object} data - Report parameters (startDate, endDate, title, parameters)
   * @returns {Promise} Generated report
   */
  generateSalesReport: async (data) => {
    try {
      console.log('[reportService] Generating sales report:', data);
      const response = await api.post('/reports', {
        reportType: 'sales',
        title: data.title,
        period: {
          startDate: data.startDate,
          endDate: data.endDate
        },
        format: data.format || 'json',
        parameters: data.parameters || {}
      });
      console.log('[reportService] Sales report generated:', response.data);
      return response.data;
    } catch (error) {
      console.error('[reportService] Error generating sales report:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Generate purchase report
   * @param {Object} data - Report parameters
   * @returns {Promise} Generated report
   */
  generatePurchaseReport: async (data) => {
    try {
      console.log('[reportService] Generating purchase report:', data);
      const response = await api.post('/reports', {
        reportType: 'purchase',
        title: data.title,
        period: {
          startDate: data.startDate,
          endDate: data.endDate
        },
        format: data.format || 'json',
        parameters: data.parameters || {}
      });
      return response.data;
    } catch (error) {
      console.error('[reportService] Error generating purchase report:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Generate inventory report
   * @param {Object} data - Report parameters
   * @returns {Promise} Generated report
   */
  generateInventoryReport: async (data) => {
    try {
      console.log('[reportService] Generating inventory report:', data);
      const response = await api.post('/reports', {
        reportType: 'inventory',
        title: data.title,
        period: {
          startDate: data.startDate,
          endDate: data.endDate
        },
        format: data.format || 'json',
        parameters: data.parameters || {}
      });
      return response.data;
    } catch (error) {
      console.error('[reportService] Error generating inventory report:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Generate profit report
   * @param {Object} data - Report parameters
   * @returns {Promise} Generated report
   */
  generateProfitReport: async (data) => {
    try {
      console.log('[reportService] Generating profit report:', data);
      const response = await api.post('/reports', {
        reportType: 'profit',
        title: data.title,
        period: {
          startDate: data.startDate,
          endDate: data.endDate
        },
        format: data.format || 'json',
        parameters: data.parameters || {}
      });
      return response.data;
    } catch (error) {
      console.error('[reportService] Error generating profit report:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete report
   * @param {string} id - Report ID
   * @returns {Promise} Delete confirmation
   */
  deleteReport: async (id) => {
    try {
      console.log('[reportService] Deleting report:', id);
      const response = await api.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('[reportService] Error deleting report:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Format reports for display in the table
   * @param {Array} reports - Raw reports from API
   * @returns {Array} Formatted reports
   */
  formatReportsForDisplay: (reports) => {
    if (!reports || !Array.isArray(reports)) {
      console.warn('[reportService] formatReportsForDisplay received invalid input:', reports);
      return [];
    }

    return reports.map(report => ({
      id: report.id || report._id,
      reportNumber: report.reportNumber,
      reportType: report.reportType,
      title: report.title,
      status: report.status,
      periodStart: report.period?.startDate,
      periodEnd: report.period?.endDate,
      periodDuration: report.periodDuration || 0,
      generatedAt: report.generatedAt,
      generatedBy: report.generatedBy?.username || 'N/A',
      generatedById: report.generatedBy?.id || report.generatedBy?._id,
      format: report.format,
      summary: report.summary || {},
      fileUrl: report.fileUrl,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }));
  }
};

export default reportService;
