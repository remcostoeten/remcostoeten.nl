import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

interface TopPagesTableProps {
  data: Array<{
    page: string;
    views: number;
  }>;
  loading: boolean;
}

export const TopPagesTable: React.FC<TopPagesTableProps> = ({ 
  data, 
  loading 
}) => {
  const getPageDisplayName = (page: string) => {
    const pageNames: Record<string, string> = {
      '/': 'Home',
      '/projects': 'Projects',
      '/contact': 'Contact',
      '/about': 'About',
      '/timeline': 'Timeline',
      '/timezone-demo': 'Timezone Demo',
    };
    
    return pageNames[page] || page;
  };

  const totalViews = data.reduce((sum, page) => sum + page.views, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>
            Most visited pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>
            Most visited pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No page data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>
          Most visited pages
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right w-20">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((page, index) => {
              const percentage = totalViews > 0 ? (page.views / totalViews) * 100 : 0;
              
              return (
                <TableRow key={page.page}>
                  <TableCell className="font-medium text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {getPageDisplayName(page.page)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {page.page}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {page.views.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-gray-600">
                      {percentage.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {data.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No pages visited yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
