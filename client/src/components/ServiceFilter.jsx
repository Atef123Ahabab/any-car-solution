import React, { useState } from 'react';
import '../Styles/styles/ServiceFilter.css';

const ServiceFilter = ({ onFilterChange, services = [] }) => {
  const [filters, setFilters] = useState({
    serviceType: '',
    status: '',
    dateRange: ''
  });

  const serviceTypes = [
    { value: '', label: 'All Services' },
    { value: 'oilChange', label: 'Oil Change' },
    { value: 'tireReplacement', label: 'Tire Replacement' },
    { value: 'engineDiagnostics', label: 'Engine Diagnostics' },
    { value: 'batteryReplacement', label: 'Battery Replacement' },
    { value: 'brakeRepair', label: 'Brake Repair' },
    { value: 'transmissionService', label: 'Transmission Service' },
    { value: 'airConditioningRepair', label: 'Air Conditioning Repair' },
    { value: 'suspensionCheck', label: 'Suspension Check' },
    { value: 'carWashDetailing', label: 'Car Wash/Detailing' },
    { value: 'generalMaintenance', label: 'General Maintenance' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'declined', label: 'Declined' }
  ];

  const dateRanges = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      serviceType: '',
      status: '',
      dateRange: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <div className="service-filter">
      <div className="filter-header">
        <h3>Filter Services</h3>
        {getActiveFilterCount() > 0 && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All ({getActiveFilterCount()})
          </button>
        )}
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="serviceType">Service Type</label>
          <select
            id="serviceType"
            value={filters.serviceType}
            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
          >
            {serviceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="dateRange">Date Range</label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-summary">
        <span className="results-count">
          {services.length} service{services.length !== 1 ? 's' : ''} found
        </span>
      </div>
    </div>
  );
};

export default ServiceFilter;
