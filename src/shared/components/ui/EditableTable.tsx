import React from 'react';
import { VariableHighlightedInput, InputV2 } from '@/shared/components/ui';

export interface EditableRow {
  id: string;
  enabled: boolean;
  name: string;
  value: string;
  description: string;
}

interface EditableTableProps {
  rows: EditableRow[];
  onRowChange: (id: string, field: keyof EditableRow, value: string | boolean) => void;
  onDeleteRow: (id: string) => void;
  availableVariables?: Record<string, string>;
}

export const EditableTable: React.FC<EditableTableProps> = ({
  rows,
  onRowChange,
  onDeleteRow,
  availableVariables = {},
}) => {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-70 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                title="Toggle all"
              />
            </th>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Value
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
                <div className="flex items-center me-4">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    className="w-4 h-4 text-green-500 bg-gray-100 border-gray-300 rounded-sm focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    onChange={(e) => onRowChange(row.id, 'enabled', e.target.checked)}
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <InputV2
                  variant="ghost"
                  value={row.name}
                  onChange={(value) => onRowChange(row.id, 'name', value)}
                  placeholder={index === rows.length - 1 ? "Name" : ""}
                />
              </td>
              <td className="px-6 py-4">
                <VariableHighlightedInput
                  value={row.value}
                  onChange={(value) => onRowChange(row.id, 'value', value)}
                  placeholder={index === rows.length - 1 ? "Value" : ""}
                  className="block w-full"
                  availableVariables={availableVariables}
                />
              </td>
              <td className="px-6 py-4">
                <InputV2
                  variant="ghost"
                  value={row.description}
                  onChange={(value) => onRowChange(row.id, 'description', value)}
                  placeholder={index === rows.length - 1 ? "Description" : ""}
                />
              </td>
              <td className="px-6 py-4 text-right">
                {rows.filter(r => r.name.trim() || r.value.trim()).length >= 2 && (row.name.trim() || row.value.trim()) && (
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    className="font-medium text-red-600 dark:text-red-500 hover:underline"
                  >
                    Delete
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

export default EditableTable;
