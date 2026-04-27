import React, { ReactNode } from 'react';
import '../../styles/Table.css';

export interface Column<T> {
  header: string;
  field?: keyof T | string;
  render?: (row: T) => ReactNode;
}

export interface CustomAction<T> {
  label: string | ((row: T) => string);
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'edit' | 'delete';
  show?: (row: T) => boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: boolean | CustomAction<T>[];
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  actions = true
}: TableProps<T>) => {
  const hasCustomActions = Array.isArray(actions) && actions.length > 0;
  const showActions = actions === true || hasCustomActions;

  return (
    <div className="table-container overflow-x-auto shadow-sm rounded-xl border border-gray-100 bg-white">
      <table className="data-table w-full text-left border-collapse">
        <thead className="bg-gray-50/50">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                {column.header}
              </th>
            ))}
            {showActions && <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50/30 transition-colors group">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-5 py-4 text-sm text-gray-600 font-medium">
                    {column.render ? column.render(row) : (column.field ? (row as any)[column.field] : null)}
                  </td>
                ))}
                {showActions && (
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {hasCustomActions ? (
                        (actions as CustomAction<T>[]).map((action, actionIndex) => {
                          if (action.show && !action.show(row)) {
                            return null;
                          }
                          const label = typeof action.label === 'function' ? action.label(row) : action.label;
                          return (
                            <button
                              key={actionIndex}
                              className={`btn-action btn-${action.variant || 'primary'} px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95`}
                              onClick={() => action.onClick(row)}
                              title={label}
                            >
                              {label}
                            </button>
                          );
                        })
                      ) : (
                        <>
                          {onEdit && (
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              onClick={() => onEdit(row)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                          )}
                          {onDelete && (
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              onClick={() => onDelete(row)}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (showActions ? 1 : 0)} className="px-5 py-10 text-center text-gray-400 italic">
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;