import React from 'react';
import '../../styles/Table.css';

const Table = ({ columns, data, onEdit, onDelete, actions = true }) => {
  // Determinar si actions es un array de acciones personalizadas o un booleano
  const hasCustomActions = Array.isArray(actions) && actions.length > 0;
  const showActions = actions === true || hasCustomActions;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
            {showActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? column.render(row) : row[column.field]}
                  </td>
                ))}
                {showActions && (
                  <td className="actions-cell">
                    {hasCustomActions ? (
                      // Renderizar acciones personalizadas
                      actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          className={`btn-action btn-${action.variant || 'primary'}`}
                          onClick={() => action.onClick(row)}
                          title={typeof action.label === 'function' ? action.label(row) : action.label}
                        >
                          {typeof action.label === 'function' ? action.label(row) : action.label}
                        </button>
                      ))
                    ) : (
                      // Renderizar acciones por defecto (onEdit, onDelete)
                      <>
                        {onEdit && (
                          <button 
                            className="btn-action btn-edit" 
                            onClick={() => onEdit(row)}
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            className="btn-action btn-delete" 
                            onClick={() => onDelete(row)}
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (showActions ? 1 : 0)} className="no-data">
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
