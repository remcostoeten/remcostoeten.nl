import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAnalyticsEvents } from '../hooks/useAnalytics';
import type { AnalyticsFilters } from '../types';

interface EventsTableProps {
  filters?: AnalyticsFilters;
}

export const EventsTable: React.FC<EventsTableProps> = ({ filters }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  const { 
    data: eventsData, 
    isLoading, 
    error 
  } = useAnalyticsEvents(currentPage, pageSize, filters);

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      page_view: 'bg-blue-100 text-blue-800',
      button_click: 'bg-green-100 text-green-800',
      project_view: 'bg-purple-100 text-purple-800',
      contact_form_submission: 'bg-orange-100 text-orange-800',
      scroll_depth: 'bg-yellow-100 text-yellow-800',
      session_start: 'bg-gray-100 text-gray-800',
      external_link_click: 'bg-red-100 text-red-800',
    };
    
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      page_view: 'Page View',
      button_click: 'Button Click',
      project_view: 'Project View',
      contact_form_submission: 'Form Submission',
      scroll_depth: 'Scroll Depth',
      session_start: 'Session Start',
      external_link_click: 'External Link',
    };
    
    return labels[eventType] || eventType;
  };

  const formatEventData = (eventType: string, data: any) => {
    if (!data || typeof data !== 'object') return null;
    
    switch (eventType) {
      case 'button_click':
        return data.buttonText ? `Button: ${data.buttonText}` : null;
      case 'project_view':
        return data.projectTitle ? `Project: ${data.projectTitle}` : null;
      case 'scroll_depth':
        return data.depth ? `Depth: ${data.depth}%` : null;
      case 'contact_form_submission':
        return data.success ? 'Success' : 'Failed';
      case 'external_link_click':
        return data.url ? `Link: ${data.url}` : null;
      case 'session_start':
        return data.timezone ? `Timezone: ${data.timezone}` : null;
      default:
        return null;
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Detailed view of all analytics events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            Error loading events data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>
          Detailed view of all analytics events
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-3">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              ))}
            </div>
          </div>
        ) : !eventsData?.events || eventsData.events.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No events found for the selected filters
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsData.events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge 
                          className={getEventTypeColor(event.eventType)}
                          variant="secondary"
                        >
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {event.page === '/' ? 'Home' : (event.page || 'Unknown')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatEventData(event.eventType, event.data) || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500 font-mono">
                          {event.sessionId?.slice(0, 8) || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm">
                            {format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(event.timestamp), 'yyyy')}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {eventsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                  {Math.min(currentPage * pageSize, eventsData.total)} of{' '}
                  {eventsData.total} events
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, eventsData.totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 
                        ? i + 1 
                        : currentPage >= eventsData.totalPages - 2
                        ? eventsData.totalPages - 4 + i
                        : currentPage - 2 + i;
                        
                      if (pageNum < 1 || pageNum > eventsData.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= eventsData.totalPages}
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
