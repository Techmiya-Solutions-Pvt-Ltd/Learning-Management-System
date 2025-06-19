import React, { useState, useEffect } from 'react';
import { fetchJobs1 } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const JOBS_PER_PAGE = 6;

export const OffCampusJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    country: 'all',
    remote: false,
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Convert filters to API format
      const apiFilters = {
        country: filters.country === 'all' ? '' : filters.country,
        remote: filters.remote,
        search: filters.search
      };
      const data = await fetchJobs1(apiFilters);
      setJobs(data);
      setCurrentPage(1); // Reset to first page on filter change
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Load jobs when component mounts and when filters change
  useEffect(() => {
    loadJobs();
  }, []); // Empty dependency array to run only on mount

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters when the Apply button is clicked
  const handleApplyFilters = () => {
    loadJobs();
  };

  // Pagination Logic
  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const startIdx = (currentPage - 1) * JOBS_PER_PAGE;
  const currentJobs = jobs.slice(startIdx, startIdx + JOBS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              name="search"
              placeholder="Job title or company"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          <div>
            <Label htmlFor="country">Country</Label>
            <Select 
              value={filters.country} 
              onValueChange={(value) => handleSelectChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                name="remote"
                checked={filters.remote}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, remote: checked }))
                }
              />
              <Label htmlFor="remote">Remote Only</Label>
            </div>
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleApplyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading && <div className="text-center py-8">Loading jobs...</div>}

      {!loading && jobs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No jobs found matching your criteria
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentJobs.map(job => (
          <Card key={job._id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start mb-4">
                {job.employer_logo && (
                  <img
                    src={job.employer_logo}
                    alt={job.employer_name}
                    className="w-16 h-16 object-contain mr-4"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold">{job.job_title}</h3>
                  <p className="text-gray-600">{job.employer_name}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Location:</span> {job.formatted_location}
                  {job.job_is_remote && (
                    <Badge className="ml-2">Remote</Badge>
                  )}
                </p>

                {job.formatted_salary && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Salary:</span> {job.formatted_salary}
                  </p>
                )}

                <p className="text-gray-500 text-sm">
                  Posted {job.days_ago === 0 ? 'today' : `${job.days_ago} days ago`}
                </p>
              </div>

              <div className="line-clamp-3 text-gray-700 mb-4">
                {job.job_description}
              </div>

              <a
                href={job.job_apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Apply Now
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* Simplified Pagination Controls - Only Previous, Current, Next */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          
          <Button variant="default" className="pointer-events-none">
            {currentPage}
          </Button>
          
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};