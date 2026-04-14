import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Filter, X, ArrowUpDown, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { AdminCourseRun } from '@/pages/AdminCourses';

interface CourseRunFiltersProps {
  courseRuns: AdminCourseRun[];
  onFilterChange: (filtered: AdminCourseRun[]) => void;
}

type SortField = 'title' | 'course' | 'start_date' | 'end_date' | 'price' | 'location' | 'trainer';
type SortOrder = 'asc' | 'desc';

const CourseRunFilters: React.FC<CourseRunFiltersProps> = ({ courseRuns, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [startDateFrom, setStartDateFrom] = useState<Date | undefined>();
  const [startDateTo, setStartDateTo] = useState<Date | undefined>();
  const [sortField, setSortField] = useState<SortField>('start_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Get unique courses
  const uniqueCourses = Array.from(
    new Set(courseRuns.map(run => run.course?.title).filter(Boolean))
  ).sort();

  // Get unique trainers
  const uniqueTrainers = Array.from(
    new Set(
      courseRuns.flatMap(run => run.trainers?.map(t => t.full_name) || [])
    )
  ).sort();

  const applyFilters = () => {
    let filtered = [...courseRuns];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(run =>
        run.title?.toLowerCase().includes(search) ||
        run.course?.title?.toLowerCase().includes(search) ||
        run.location?.toLowerCase().includes(search)
      );
    }

    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(run => run.course?.title === selectedCourse);
    }

    // Trainer filter
    if (selectedTrainer !== 'all') {
      filtered = filtered.filter(run =>
        run.trainers?.some(t => t.full_name === selectedTrainer)
      );
    }

    // Visibility filter
    if (selectedVisibility !== 'all') {
      filtered = filtered.filter(run => run.visibility === selectedVisibility);
    }

    // Date range filter
    if (startDateFrom) {
      filtered = filtered.filter(run => {
        if (!run.start_date) return false;
        return new Date(run.start_date) >= startDateFrom;
      });
    }

    if (startDateTo) {
      filtered = filtered.filter(run => {
        if (!run.start_date) return false;
        return new Date(run.start_date) <= startDateTo;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'course':
          aValue = a.course?.title?.toLowerCase() || '';
          bValue = b.course?.title?.toLowerCase() || '';
          break;
        case 'start_date':
          aValue = a.start_date ? new Date(a.start_date).getTime() : 0;
          bValue = b.start_date ? new Date(b.start_date).getTime() : 0;
          break;
        case 'end_date':
          aValue = a.end_date ? new Date(a.end_date).getTime() : 0;
          bValue = b.end_date ? new Date(b.end_date).getTime() : 0;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'location':
          aValue = a.location?.toLowerCase() || '';
          bValue = b.location?.toLowerCase() || '';
          break;
        case 'trainer':
          aValue = a.trainers?.[0]?.full_name?.toLowerCase() || '';
          bValue = b.trainers?.[0]?.full_name?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    onFilterChange(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCourse, selectedTrainer, selectedVisibility, startDateFrom, startDateTo, sortField, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCourse('all');
    setSelectedTrainer('all');
    setSelectedVisibility('all');
    setStartDateFrom(undefined);
    setStartDateTo(undefined);
    setSortField('start_date');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm || selectedCourse !== 'all' || selectedTrainer !== 'all' || 
    selectedVisibility !== 'all' || startDateFrom || startDateTo;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filters & Sort</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search title, course, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Course Filter */}
        <div>
          <Label htmlFor="course-filter">Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger id="course-filter">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {uniqueCourses.map((course) => (
                <SelectItem key={course} value={course!}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trainer Filter */}
        <div>
          <Label htmlFor="trainer-filter">Trainer</Label>
          <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
            <SelectTrigger id="trainer-filter">
              <SelectValue placeholder="All Trainers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trainers</SelectItem>
              {uniqueTrainers.map((trainer) => (
                <SelectItem key={trainer} value={trainer}>
                  {trainer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visibility Filter */}
        <div>
          <Label htmlFor="visibility-filter">Visibility</Label>
          <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
            <SelectTrigger id="visibility-filter">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div>
          <Label>Start Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDateFrom ? format(startDateFrom, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDateFrom}
                onSelect={setStartDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To */}
        <div>
          <Label>Start Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDateTo ? format(startDateTo, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDateTo}
                onSelect={setStartDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Sort By */}
        <div>
          <Label htmlFor="sort-field">Sort By</Label>
          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger id="sort-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="start_date">Start Date</SelectItem>
              <SelectItem value="end_date">End Date</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="trainer">Trainer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div>
          <Label htmlFor="sort-order">Sort Order</Label>
          <Button
            id="sort-order"
            variant="outline"
            className="w-full"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {courseRuns.length} course run(s)
      </div>
    </div>
  );
};

export default CourseRunFilters;
