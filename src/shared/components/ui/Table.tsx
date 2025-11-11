import React from 'react';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  className?: string;
}

export interface TableRow {
  [key: string]: React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
}

export const Table: React.FC<TableProps> = ({ columns, data, className = '' }) => {
  return (
    <div className={`relative overflow-x-auto shadow-md sm:rounded-lg ${className}`}>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-70 dark:text-gray-400">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 ${column.className || ''}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr className="bg-white dark:bg-gray-80">
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-400 dark:text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-white border-b dark:bg-gray-80 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
