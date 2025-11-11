import React from 'react';
import { InputV2 } from '@/shared/components/ui';
import { Icon } from "@iconify/react";

export interface EnvironmentRow {
  id: string;
  name: string;
  baseUrl: string;
  description: string;
}

interface EnvironmentsTableProps {
  rows: EnvironmentRow[];
  onRowChange: (id: string, field: keyof EnvironmentRow, value: string) => void;
  onDeleteRow: (id: string) => void;
}

export const EnvironmentsTable: React.FC<EnvironmentsTableProps> = ({
  rows,
  onRowChange,
  onDeleteRow,
}) => {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-70 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Environment
            </th>
            <th scope="col" className="px-6 py-3">
              Base URL
            </th>
            <th scope="col" className="px-6 py-3">
              Description
            </th>
            <th scope="col" className="px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className="bg-white border-b dark:bg-gray-80 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-4">
                <InputV2
                  variant="ghost"
                  value={row.name}
                  onChange={(value) => onRowChange(row.id, 'name', typeof value === 'string' ? value : value.target.value)}
                  placeholder={index === rows.length - 1 ? "Add new environment" : ""}
                  widthClass='w-full'
                />
              </td>
              <td className="px-6 py-4">
                <InputV2
                  variant="ghost"
                  value={row.baseUrl}
                  onChange={(value) => onRowChange(row.id, 'baseUrl', typeof value === 'string' ? value : value.target.value)}
                  placeholder="https://api.example.com"
                  widthClass='w-full'
                />
              </td>
              <td className="px-6 py-4">
                <InputV2
                  variant="ghost"
                  value={row.description}
                  onChange={(value) => onRowChange(row.id, 'description', typeof value === 'string' ? value : value.target.value)}
                  placeholder="Add description..."
                  widthClass='w-full'
                />
              </td>
              <td className="px-6 py-4 text-right">
                {rows.filter(r => r.name.trim() || r.baseUrl.trim()).length >= 2 && (row.name.trim() || row.baseUrl.trim()) && (
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 rounded p-1 transition-all duration-200 inline-flex items-center justify-center"
                    title="Delete environment"
                  >
                    <Icon
                      icon="line-md:trash"
                      className="w-4 h-4"
                    />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnvironmentsTable;
