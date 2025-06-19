import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Search, Edit, Archive, RefreshCw, Mail, Phone, Building, User, Calendar, Link, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getHRs, archiveHR, updateHR, addHR } from '@/services/api';
import { Textarea } from '@headlessui/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@headlessui/react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from 'react-day-picker';

interface HR {
  linkedin: string;
  position: string;
  company_description: string;
  company_name: string;
  mobile: string;
  _id: string;
  id: number;
  hrname: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined?: string | null;
  last_login?: string | null;
  password?: string;
  is_archived?: boolean;
}

export const HRs: React.FC = () => {
  const [hrData, setHRData] = useState<HR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<HR>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [dateJoinedFilter, setDateJoinedFilter] = useState<DateRange | undefined>();
  const [lastLoginFilter, setLastLoginFilter] = useState<DateRange | undefined>();

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const fetchHRs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHRs();
      if (Array.isArray(data)) {
        setHRData(data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load HR data');
      toast.error('Failed to load HR data');
      setHRData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHRs();
  }, [fetchHRs]);

  const handleArchive = async (id: string) => {
    try {
      if (!window.confirm("Are you sure to archive this HR?")) return;
      await archiveHR(id);
      toast.success("HR archived successfully");
      fetchHRs();
      
    } catch (err) {
      toast.error("Failed to archive HR");
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const startEditing = (hr: HR) => {
    setEditingId(hr._id);
    setEditForm({
      hrname: hr.hrname,
      email: hr.email,
      first_name: hr.first_name,
      last_name: hr.last_name,
      is_active: hr.is_active,
      mobile: hr.mobile,
      company_name: hr.company_name,
      company_description: hr.company_description,
      position: hr.position,
      linkedin: hr.linkedin
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    try {
      await updateHR(id, editForm);
      toast.success("HR updated successfully");
      cancelEditing();
      fetchHRs();
    } catch (err) {
      toast.error("Failed to update HR");
    }
  };

  const handleAddHR = async () => {
    try {
      await addHR(editForm);
      toast.success("HR added successfully");
      fetchHRs();
      setEditForm({});
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to add HR");
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setNameSearch('');
    setEmailSearch('');
    setPhoneSearch('');
    setStatusFilter('all');
    setCompanyFilter('all');
    setPositionFilter('all');
    setDateJoinedFilter(undefined);
    setLastLoginFilter(undefined);
  };

  const filteredHRs = hrData.filter(hr => {
    // Combined search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!(
        hr.hrname?.toLowerCase().includes(search) ||
        hr.email?.toLowerCase().includes(search) ||
        hr.first_name?.toLowerCase().includes(search) ||
        hr.last_name?.toLowerCase().includes(search) ||
        hr.mobile?.toLowerCase().includes(search) ||
        hr.id?.toString().includes(search) ||
        hr.company_name?.toLowerCase().includes(search) ||
        hr.position?.toLowerCase().includes(search)
      )) {
        return false;
      }
    }
    
    // Individual search filters
    if (nameSearch && !(
      hr.first_name?.toLowerCase().includes(nameSearch.toLowerCase()) ||
      hr.last_name?.toLowerCase().includes(nameSearch.toLowerCase()) ||
      hr.hrname?.toLowerCase().includes(nameSearch.toLowerCase())
    )) return false;
    
    if (emailSearch && !hr.email?.toLowerCase().includes(emailSearch.toLowerCase())) return false;
    
    if (phoneSearch && !hr.mobile?.includes(phoneSearch)) return false;
    
    // Status filter
    if (statusFilter === 'active' && !hr.is_active) return false;
    if (statusFilter === 'inactive' && hr.is_active) return false;
    
    // Company filter
    if (companyFilter !== 'all' && hr.company_name !== companyFilter) return false;
    
    // Position filter
    if (positionFilter !== 'all' && hr.position !== positionFilter) return false;
    
    // Date joined filter
    if (dateJoinedFilter?.from || dateJoinedFilter?.to) {
      const joinedDate = hr.date_joined ? new Date(hr.date_joined) : null;
      if (!joinedDate) return false;
      if (dateJoinedFilter.from && joinedDate < dateJoinedFilter.from) return false;
      if (dateJoinedFilter.to && joinedDate > new Date(dateJoinedFilter.to.setHours(23, 59, 59, 999))) return false;
    }
    
    // Last login filter
    if (lastLoginFilter?.from || lastLoginFilter?.to) {
      const loginDate = hr.last_login ? new Date(hr.last_login) : null;
      if (!loginDate) return false;
      if (lastLoginFilter.from && loginDate < lastLoginFilter.from) return false;
      if (lastLoginFilter.to && loginDate > new Date(lastLoginFilter.to.setHours(23, 59, 59, 999))) return false;
    }
    
    return true;
  });

  // Get unique values for filter dropdowns
  const uniqueCompanies = Array.from(new Set(hrData.map(h => h.company_name).filter(Boolean)));
  const uniquePositions = Array.from(new Set(hrData.map(h => h.position).filter(Boolean)));

  const toggleActiveStatus = async (hr: HR) => {
    try {
      const newStatus = !hr.is_active;
      await updateHR(hr._id, { is_active: newStatus });
      toast.success(`HR marked as ${newStatus ? 'Active' : 'Inactive'}`);
      
      // Update local state immediately
      setHRData(prev => prev.map(item => 
        item._id === hr._id ? { ...item, is_active: newStatus } : item
      ));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'HR';
  };

  return (
    <div className="page-container p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">HR Management</h1>
        <p className="text-muted-foreground mt-1">View and manage HR users</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-4 w-full">
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {showFilters && (
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Reset Filters
            </Button>
          )}
          
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, company..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchHRs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>Add New HR</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New HR</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <Input name="hrname" value={editForm.hrname || ''} onChange={handleEditChange} placeholder="Username" />
                <Input name="password" value={editForm.password || ''} onChange={handleEditChange} placeholder="Password" type="password" />
                <Input name="email" value={editForm.email || ''} onChange={handleEditChange} placeholder="Email" />
                <Input name="first_name" value={editForm.first_name || ''} onChange={handleEditChange} placeholder="First Name" />
                <Input name="last_name" value={editForm.last_name || ''} onChange={handleEditChange} placeholder="Last Name" />
                <Input name="mobile" value={editForm.mobile || ''} onChange={handleEditChange} placeholder="Mobile" />
                <Input name="company_name" value={editForm.company_name || ''} onChange={handleEditChange} placeholder="Company Name" />
                <Input name="position" value={editForm.position || ''} onChange={handleEditChange} placeholder="Position" />
                <Input name="linkedin" value={editForm.linkedin || ''} onChange={handleEditChange} placeholder="LinkedIn URL" />
                <div className="md:col-span-2">
                  <Textarea 
                    name="company_description" 
                    value={editForm.company_description || ''} 
                    onChange={handleEditChange}
                    placeholder="Company Description"
                  />
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={editForm.is_active || false}
                    onChange={handleEditChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="is_active">Active</label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddHR}>Add HR</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border dark:border-gray-800">
          {/* Individual Search Filters */}
          <div>
            <label className="block text-sm font-medium mb-1">Name Search</label>
            <Input
              placeholder="Search by name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Search</label>
            <Input
              placeholder="Search by email..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Search</label>
            <Input
              placeholder="Search by phone..."
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select 
              onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
              value={statusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <Select 
              onValueChange={setCompanyFilter}
              value={companyFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {uniqueCompanies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Position Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <Select 
              onValueChange={setPositionFilter}
              value={positionFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {uniquePositions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Joined Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Date Joined</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateJoinedFilter?.from ? (
                    dateJoinedFilter.to ? (
                      <>
                        {format(dateJoinedFilter.from, 'MMM dd, y')} -{' '}
                        {format(dateJoinedFilter.to, 'MMM dd, y')}
                      </>
                    ) : (
                      format(dateJoinedFilter.from, 'MMM dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateJoinedFilter?.from}
                  selected={dateJoinedFilter}
                  onSelect={setDateJoinedFilter}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Last Login Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Last Login</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {lastLoginFilter?.from ? (
                    lastLoginFilter.to ? (
                      <>
                        {format(lastLoginFilter.from, 'MMM dd, y')} -{' '}
                        {format(lastLoginFilter.to, 'MMM dd, y')}
                      </>
                    ) : (
                      format(lastLoginFilter.from, 'MMM dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={lastLoginFilter?.from}
                  selected={lastLoginFilter}
                  onSelect={setLastLoginFilter}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHRs.length > 0 ? (
            filteredHRs.map((hr) => (
              <Card key={hr._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitials(hr.first_name, hr.last_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{hr.hrname}</CardTitle>
                      <div className="text-sm text-muted-foreground">{hr.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      {editingId !== hr._id && (
                        <Switch
                          checked={hr.is_active}
                          onChange={() => toggleActiveStatus(hr)}
                        />
                      )}
                      <Badge variant={hr.is_active ? "default" : "destructive"}>
                        {hr.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEditing(hr)}>
                          <Edit className="mr-2 w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(hr._id)}>
                          <Archive className="mr-2 w-4 h-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {editingId === hr._id ? (
                          <div className="flex space-x-2 mt-3">
                            <Input
                              name="first_name"
                              value={editForm.first_name || ''}
                              onChange={handleEditChange}
                              placeholder="First Name" 
                            />
                            <Input
                              name="last_name"
                              value={editForm.last_name || ''}
                              onChange={handleEditChange}
                              placeholder="Last Name" 
                            />
                          </div>
                        ) : (
                          `${hr.first_name || ''} ${hr.last_name || ''}`.trim() || 'N/A'
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {editingId === hr._id ? (
                          <Input 
                            name="mobile" 
                            value={editForm.mobile || ''} 
                            onChange={handleEditChange} 
                            placeholder="Mobile Number"
                          />
                        ) : hr.mobile || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {editingId === hr._id ? (
                          <Input 
                            name="company_name" 
                            value={editForm.company_name || ''} 
                            onChange={handleEditChange} 
                            placeholder="Company Name"
                          />
                        ) : hr.company_name || 'N/A'}
                      </span>
                    </div>
                    {(hr.company_description || editingId === hr._id) && (
                      <div className="flex items-start">
                        <Building className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                        <span className="text-sm">
                          {editingId === hr._id ? (
                            <Input 
                              name="company_description" 
                              value={editForm.company_description || ''} 
                              onChange={handleEditChange} 
                              placeholder="Company Description"
                            />
                          ) : hr.company_description || 'N/A'}
                        </span>
                      </div>
                    )}
                    {(hr.position || editingId === hr._id) && (
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {editingId === hr._id ? (
                            <Input 
                              name="position" 
                              value={editForm.position || ''} 
                              onChange={handleEditChange} 
                              placeholder="Position"
                            />
                          ) : hr.position || 'N/A'}
                        </span>
                      </div>
                    )}
                    {(hr.linkedin || editingId === hr._id) && (
                      <div className="flex items-center">
                        <Link className="mr-2 h-4 w-4 text-muted-foreground" />
                        {editingId === hr._id ? (
                          <Input 
                            name="linkedin" 
                            value={editForm.linkedin || ''} 
                            onChange={handleEditChange} 
                            placeholder="LinkedIn URL"
                          />
                        ) : (
                          <a href={hr.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Joined: {formatDate(hr.date_joined)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Last login: {formatDate(hr.last_login)}</span>
                    </div>
                  </div>
                </CardContent>
                {editingId === hr._id && (
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
                    <Button onClick={() => saveEdit(hr._id)}>Save</Button>
                  </CardFooter>
                )}
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">No HR users found.</div>
          )}
        </div>
      )}
    </div>
  );
};