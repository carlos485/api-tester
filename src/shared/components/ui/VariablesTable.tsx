import React from 'react';
import { InputV2, NativeSelect, type NativeSelectOption } from '@/shared/components/ui';
import { Icon } from "@iconify/react";

export interface VariableRow {
  id: string;
  name: string;
  value: string;
  description: string;
  environment: string;
  enabled: boolean;
}

interface VariablesTableProps {
  rows: VariableRow[];
  onRowChange: (id: string, field: keyof VariableRow, value: string | boolean) => void;
  onDeleteRow: (id: string) => void;
  environmentOptions: NativeSelectOption[];
}

export const VariablesTable: React.FC<VariablesTableProps> = ({
  rows,
  onRowChange,
  onDeleteRow,
  environmentOptions,
}) => {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-70 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Variable
            </th>
            <th scope="col" className="px-6 py-3">
              Value
            </th>
            <th scope="col" className="px-6 py-3">
              Environment
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
                  placeholder={index === rows.length - 1 ? "Add new variable" : ""}
                />
              </td>
              <td className="px-6 py-4">
                <InputV2
                  variant="ghost"
                  value={row.value}
                  onChange={(value) => onRowChange(row.id, 'value', typeof value === 'string' ? value : value.target.value)}
                  placeholder=""
                />
              </td>
              <td className="px-6 py-4">
                <NativeSelect
                  value={row.environment || "GLOBAL"}
                  onChange={(value) => onRowChange(row.id, 'environment', value)}
                  options={environmentOptions}
                />
              </td>
              <td className="px-6 py-4">
                <InputV2
                  variant="ghost"
                  value={row.description}
                  onChange={(value) => onRowChange(row.id, 'description', typeof value === 'string' ? value : value.target.value)}
                  placeholder="Add description..."
                />
              </td>
              <td className="px-6 py-4 text-right">
                {rows.filter(r => r.name.trim() || r.value.trim()).length >= 2 && (row.name.trim() || row.value.trim()) && (
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 rounded p-1 transition-all duration-200 inline-flex items-center justify-center"
                    title="Delete variable"
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

export default VariablesTable;
