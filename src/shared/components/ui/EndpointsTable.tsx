import React from 'react';
import { Icon } from "@iconify/react";

export interface EndpointRow {
  id: string;
  name: string;
  method: string;
  url: string;
  folder?: string;
}

interface EndpointsTableProps {
  rows: EndpointRow[];
  getFolderName: (folderId?: string) => string;
}

export const EndpointsTable: React.FC<EndpointsTableProps> = ({
  rows,
  getFolderName,
}) => {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'PATCH':
        return 'bg-orange-100 text-orange-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-70 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Method
            </th>
            <th scope="col" className="px-6 py-3">
              Path
            </th>
            <th scope="col" className="px-6 py-3">
              Folder
            </th>
            <th scope="col" className="px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="bg-white dark:bg-gray-80">
              <td
                colSpan={5}
                className="px-6 py-8 text-center text-gray-400 dark:text-gray-500"
              >
                No endpoints found in this collection
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="bg-white border-b dark:bg-gray-80 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                  {row.name}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getMethodColor(row.method)}`}>
                    {row.method}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {row.url}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {getFolderName(row.folder)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded p-1 transition-all duration-200 inline-flex items-center justify-center"
                    title="View endpoint details"
                  >
                    <Icon
                      icon="material-symbols:more-vert"
                      className="w-4 h-4"
                    />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EndpointsTable;
