import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, Download, Settings2, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  currentPage?: number;
  onExport?: () => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  rowClassName?: string;
  defaultVisibleColumns?: string[];
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onSort,
  onPageChange,
  totalPages = 1,
  currentPage = 1,
  onExport,
  searchable = true,
  onSearch,
  rowClassName,
  defaultVisibleColumns,
}: DataTableProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    defaultVisibleColumns && defaultVisibleColumns.length > 0
      ? defaultVisibleColumns
      : columns.map((c) => c.key)
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key: string) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {searchable && (
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
        )}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter((col) => visibleColumns.includes(col.key))
                .map((column) => (
                  <TableHead key={column.key}>
                    {column.sortable ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 px-2"
                          onClick={() => handleSort(column.key)}
                        >
                          {column.label}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="-ml-1 px-1">
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-popover">
                            <DropdownMenuItem
                              onClick={() => {
                                setSortConfig({ key: column.key, direction: 'asc' });
                                onSort?.(column.key, 'asc');
                              }}
                            >
                              Sort A→Z / Low→High
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSortConfig({ key: column.key, direction: 'desc' });
                                onSort?.(column.key, 'desc');
                              }}
                            >
                              Sort Z→A / High→Low
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={row.id || idx} className={rowClassName}>
                  {columns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((column) => (
                      <TableCell key={column.key}>
                        {column.render
                          ? column.render(row)
                          : String((row as any)[column.key] || '-')}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
