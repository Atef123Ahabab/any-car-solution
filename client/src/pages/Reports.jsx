import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import '../Styles/styles/Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  // Form state for creating reports
  const [reportForm, setReportForm] = useState({
    reportType: 'other',
    title: '',
    description: '',
    severity: 'medium',
    incidentDate: '',
    carId: '',
    bookingId: '',
    location: {
      address: '',
      city: '',
      state: ''
    }
  });

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Fetch user's cars and bookings for dropdowns
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userRole === 'owner') {
          const carsResponse = await fetch(`${API_BASE_URL}/api/cars/owner/${userId}`);
          const carsData = await carsResponse.json();
          setCars(carsData.cars || []);
        }
        
        const bookingsResponse = await fetch(`${API_BASE_URL}/api/bookings/user/${userId}`);
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userId && userRole !== 'admin') {
      fetchUserData();
    }
  }, [userId, userRole]);

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/reports?userId=${userId}&userRole=${userRole}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      } else {
        setError(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [userId, userRole]);

  // Handle form submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    try {
      const reportData = {
        ...reportForm,
        reporterId: userId,
        incidentDate: reportForm.incidentDate || null,
        carId: reportForm.carId || null,
        bookingId: reportForm.bookingId || null
      };

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Report submitted successfully!');
        setShowCreateModal(false);
        setReportForm({
          reportType: 'other',
          title: '',
          description: '',
          severity: 'medium',
          incidentDate: '',
          carId: '',
          bookingId: '',
          location: { address: '', city: '', state: '' }
        });
        fetchReports();
      } else {
        alert(data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    }
  };

  // Handle admin status update
  const handleStatusUpdate = async (reportId, newStatus, adminNotes = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
          processedBy: userId,
          userRole
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Report ${newStatus} successfully!`);
        fetchReports();
        setShowDetailsModal(false);
      } else {
        alert(data.message || 'Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Failed to update report status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_review': return 'status-review';
      case 'approved': return 'status-approved';
      case 'declined': return 'status-declined';
      case 'resolved': return 'status-resolved';
      default: return 'status-pending';
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'low': return 'severity-low';
      case 'medium': return 'severity-medium';
      case 'high': return 'severity-high';
      case 'critical': return 'severity-critical';
      default: return 'severity-medium';
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports</h1>
        {userRole !== 'admin' && (
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Submit New Report
          </button>
        )}
      </div>

      <div className="reports-grid">
        {reports.length === 0 ? (
          <div className="no-reports">
            <p>No reports found.</p>
            {userRole !== 'admin' && (
              <p>Click "Submit New Report" to create your first report.</p>
            )}
          </div>
        ) : (
          reports.map(report => (
            <div key={report._id} className="report-card">
              <div className="report-header">
                <h3>{report.title}</h3>
                <div className="report-badges">
                  <span className={`status-badge ${getStatusBadgeClass(report.status)}`}>
                    {report.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`severity-badge ${getSeverityBadgeClass(report.severity)}`}>
                    {report.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="report-info">
                <p><strong>Type:</strong> {report.reportType.replace('_', ' ')}</p>
                <p><strong>Submitted:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                {userRole === 'admin' && (
                  <p><strong>Reporter:</strong> {report.reporterId?.name} ({report.reporterId?.userType})</p>
                )}
                {report.carId && (
                  <p><strong>Car:</strong> {report.carId.year} {report.carId.make} {report.carId.model}</p>
                )}
              </div>
              
              <div className="report-description">
                <p>{report.description.substring(0, 150)}...</p>
              </div>
              
              <div className="report-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowDetailsModal(true);
                  }}
                >
                  View Details
                </button>
                
                {userRole === 'admin' && report.status === 'pending' && (
                  <div className="admin-actions">
                    <button 
                      className="btn-success"
                      onClick={() => handleStatusUpdate(report._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleStatusUpdate(report._id, 'declined')}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content report-modal">
            <h2>Submit New Report</h2>
            <form onSubmit={handleSubmitReport}>
              <div className="form-group">
                <label>Report Type</label>
                <select 
                  value={reportForm.reportType}
                  onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})}
                  required
                >
                  <option value="damage">Vehicle Damage</option>
                  <option value="accident">Accident</option>
                  <option value="theft">Theft</option>
                  <option value="maintenance">Maintenance Issue</option>
                  <option value="customer_complaint">Customer Complaint</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                  placeholder="Brief description of the issue"
                  required
                  maxLength="200"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="Detailed description of what happened..."
                  required
                  rows="4"
                  maxLength="2000"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Severity</label>
                  <select 
                    value={reportForm.severity}
                    onChange={(e) => setReportForm({...reportForm, severity: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Incident Date (Optional)</label>
                  <input 
                    type="date"
                    value={reportForm.incidentDate}
                    onChange={(e) => setReportForm({...reportForm, incidentDate: e.target.value})}
                  />
                </div>
              </div>

              {cars.length > 0 && (
                <div className="form-group">
                  <label>Related Car (Optional)</label>
                  <select 
                    value={reportForm.carId}
                    onChange={(e) => setReportForm({...reportForm, carId: e.target.value})}
                  >
                    <option value="">Select a car...</option>
                    {cars.map(car => (
                      <option key={car._id} value={car._id}>
                        {car.year} {car.make} {car.model}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {bookings.length > 0 && (
                <div className="form-group">
                  <label>Related Booking (Optional)</label>
                  <select 
                    value={reportForm.bookingId}
                    onChange={(e) => setReportForm({...reportForm, bookingId: e.target.value})}
                  >
                    <option value="">Select a booking...</option>
                    {bookings.map(booking => (
                      <option key={booking._id} value={booking._id}>
                        Booking {booking._id.substring(0, 8)}... - {new Date(booking.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content report-details-modal">
            <h2>Report Details</h2>
            
            <div className="report-details">
              <div className="detail-header">
                <h3>{selectedReport.title}</h3>
                <div className="report-badges">
                  <span className={`status-badge ${getStatusBadgeClass(selectedReport.status)}`}>
                    {selectedReport.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`severity-badge ${getSeverityBadgeClass(selectedReport.severity)}`}>
                    {selectedReport.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="detail-info">
                <p><strong>Type:</strong> {selectedReport.reportType.replace('_', ' ')}</p>
                <p><strong>Submitted:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                {userRole === 'admin' && (
                  <p><strong>Reporter:</strong> {selectedReport.reporterId?.name} ({selectedReport.reporterId?.email})</p>
                )}
                {selectedReport.incidentDate && (
                  <p><strong>Incident Date:</strong> {new Date(selectedReport.incidentDate).toLocaleDateString()}</p>
                )}
                {selectedReport.carId && (
                  <p><strong>Related Car:</strong> {selectedReport.carId.year} {selectedReport.carId.make} {selectedReport.carId.model}</p>
                )}
              </div>

              <div className="detail-description">
                <h4>Description</h4>
                <p>{selectedReport.description}</p>
              </div>

              {selectedReport.adminNotes && (
                <div className="admin-notes">
                  <h4>Admin Notes</h4>
                  <p>{selectedReport.adminNotes}</p>
                  {selectedReport.processedBy && (
                    <p><small>Processed by: {selectedReport.processedBy.name} on {new Date(selectedReport.processedAt).toLocaleString()}</small></p>
                  )}
                </div>
              )}

              {userRole === 'admin' && selectedReport.status === 'pending' && (
                <div className="admin-actions-detailed">
                  <h4>Admin Actions</h4>
                  <div className="action-buttons">
                    <button 
                      className="btn-success"
                      onClick={() => {
                        const notes = prompt('Add admin notes (optional):');
                        handleStatusUpdate(selectedReport._id, 'approved', notes || '');
                      }}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn-warning"
                      onClick={() => {
                        const notes = prompt('Add admin notes (optional):');
                        handleStatusUpdate(selectedReport._id, 'in_review', notes || '');
                      }}
                    >
                      Mark In Review
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => {
                        const notes = prompt('Add admin notes (required for decline):');
                        if (notes) {
                          handleStatusUpdate(selectedReport._id, 'declined', notes);
                        } else {
                          alert('Admin notes are required when declining a report.');
                        }
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
