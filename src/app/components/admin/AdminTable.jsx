import { TableAction } from "@/app/components/admin/extra/Common";
import FieldPurpose from "@/app/components/admin/extra/FieldPurpose.jsx";
import { useDeleteApi, usePutApi } from "@/app/lib/apicallHooks";
import "@/app/styles/admin/admin_table.scss";
import {
  calculateAgeInDaysOfLeads,
  formatDate,
} from "@/app/utils/usefullFunction/usedFunction";
import { Checkbox, Switch } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { withSwal } from "react-sweetalert2";
import { FilePreviewTable } from "@/app/components/admin/extra/FilePreview";

const DraggableRow = ({ row, index, moveRow, children }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: "ROW",
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "ROW",
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      // Get the bounding rectangle of the hovered element
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  // Use callback ref to properly compose drag and drop refs for React 19
  const setRef = useCallback((node) => {
    ref.current = node;
    drag(drop(node));
  }, [drag, drop]);

  return (
    <tr
      ref={setRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        backgroundColor: isDragging ? "#f0f0f0" : "transparent",
        transition: "background-color 0.2s ease",
      }}
    >
      {children}
    </tr>
  );
};

const AdminTable = ({
  swal,
  All_Table_Extra_Field = [],
  formDetails = [],
  setShow_sort_box = () => { },
  HandleSearch = () => { },
  ISACTIVE_PUT_URL,
  EDIT_LINK,
  VIEW_LINK,

  DELETE_DOC_URL,
  isView = false,
  SettingList = [],
  isSetting = false,
  showBlogMessage = false,
  showAction = true,
  Access_Permissions = { create: true, delete: true, edit: true, view: true },
  rowsPerPage = 25,
  currentPage = 0,
  onRowsReorder,
  // Multi-select props
  selectedItems = [],
  onSelectItem = () => { },
  onSelectAll = () => { },
  showMultiSelect = false,
}) => {
  const [rows, setRows] = useState([]);
  const { doPut: isActive_doPut } = usePutApi(ISACTIVE_PUT_URL);
  const { doDelete } = useDeleteApi();

  // Update rows when formDetails changes
  useEffect(() => {
    setRows(formDetails);
  }, [formDetails]);

  // Calculate select all state using useMemo to prevent recalculation during render
  const { selectAll, indeterminate } = React.useMemo(() => {
    const hasItems = formDetails.length > 0;
    const allSelected = selectedItems.length === formDetails.length && hasItems;
    const someSelected = selectedItems.length > 0 && selectedItems.length < formDetails.length;

    return {
      selectAll: allSelected,
      indeterminate: someSelected
    };
  }, [selectedItems.length, formDetails.length]);

  const [draggedRowsChanged, setDraggedRowsChanged] = useState(false);

  const moveRow = useCallback((fromIndex, toIndex) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      const [movedRow] = updatedRows.splice(fromIndex, 1);
      updatedRows.splice(toIndex, 0, movedRow);

      // Notify parent component about reordering
      if (onRowsReorder) {
        onRowsReorder(updatedRows);
      }

      // Mark that rows have been dragged
      setDraggedRowsChanged(true);

      return updatedRows;
    });
  }, [onRowsReorder]);

  // Handle showing sort box when rows are dragged
  useEffect(() => {
    if (draggedRowsChanged) {
      setShow_sort_box(true);
      setDraggedRowsChanged(false);
    }
  }, [draggedRowsChanged, setShow_sort_box]);

  const [sortValueChanged, setSortValueChanged] = useState(false);

  const sortThisByValue = (e, id) => {
    setSortValueChanged(true);
  };

  // Handle showing sort box when sort values change
  useEffect(() => {
    if (sortValueChanged) {
      setShow_sort_box(true);
      setSortValueChanged(false);
    }
  }, [sortValueChanged, setShow_sort_box]);

  const set_is_active = (e, id) => {
    if (!Access_Permissions.edit) {
      swal.fire({ icon: "error", title: "Access denied!" });
      return;
    }
    isActive_doPut({ object_id: id, isActive: e.target.checked });
  };

  const deleteHandler = (id) => {
    if (!Access_Permissions.delete) {
      swal.fire({ icon: "error", title: "Access denied!" });
      return;
    }

    swal
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        cancelButtonColor: "#08569c",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          doDelete(`${DELETE_DOC_URL}/${id}`, {}, HandleSearch);
        }
      });
  };

  const isActionPermission =
    Access_Permissions.edit || Access_Permissions.delete || isSetting;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="admin-table-section">
        <table className="admin-table desktop-table">
          <thead>
            <tr className="table-Heading">

              <th>
                {showMultiSelect && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    displayFlex: 'center',
                    gap: '4px',
                    padding: '4px 0'
                  }}>
                    <Checkbox
                      checked={selectAll}
                      onChange={onSelectAll}
                      indeterminate={indeterminate}

                    />
                    <p> S.No</p>
                  </div>
                )}

              </th>

              {All_Table_Extra_Field.map((field) => {
                if (field.field === "isActive" && !Access_Permissions.edit)
                  return null;

                return (
                  <th key={field.field}>
                    <span className="table-info">
                      {field.Printvalue}
                      <FieldPurpose Purpose={field?.FieldPurpose} />
                    </span>
                  </th>
                );
              })}

              {showAction && isActionPermission && (
                <th className="action-th">Action</th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <DraggableRow
                key={row._id}
                row={row}
                index={rowIndex}
                moveRow={moveRow}
              >

                <td style={{ cursor: "grab" }}>

                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                    {showMultiSelect && (

                      <Checkbox
                        checked={selectedItems.includes(row._id)}
                        onChange={() => onSelectItem(row._id)}
                        size="small"
                      />

                    )}
                    <span style={{ fontSize: "18px", color: "#999" }}>⋮⋮</span>
                    {currentPage * rowsPerPage + rowIndex + 1}
                  </span>
                </td>

                {All_Table_Extra_Field.map((field) => {
                  const value = row[field.field];
                  const cellKey = `${row._id}-${field.field}`;

                  if (field.field === "sort") {
                    return (
                      <td key={cellKey}>
                        <input
                          type="number"
                          defaultValue={value}
                          onChange={(e) => sortThisByValue(e, row._id)}
                        />
                      </td>
                    );
                  }

                  if (field.field === "isActive") {
                    if (!Access_Permissions.edit) return null;
                    return (
                      <td key={cellKey}>
                        <Switch
                          defaultChecked={value}
                          onChange={(e) => set_is_active(e, row._id)}
                        />
                      </td>
                    );
                  }

                  // Handle media type (replaces old file type)
                  if (field.type === "media") {
                    return (
                      <FilePreviewTable cellKey={cellKey} row={row} value={value} />
                    );
                  }

                  // Handle date type with different formats based on date_type
                  if (field.type === "date") {
                    if (!value) return <td key={cellKey}>N/A</td>;

                    // Handle different date types
                    switch (field.date_type) {
                      case 'datetime-local':
                        // Format: "2024-01-15T14:30"
                        return <td key={cellKey}>{formatDate(value)}</td>;

                      case 'time':
                        // Format: "14:30"
                        return <td key={cellKey}>{value}</td>;

                      case 'month':
                        // Format: "2024-01"
                        if (value.includes('-')) {
                          const [year, month] = value.split('-');
                          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          return <td key={cellKey}>{monthNames[parseInt(month) - 1]} {year}</td>;
                        }
                        return <td key={cellKey}>{value}</td>;

                      case 'week':
                        // Format: "2024-W03"
                        return <td key={cellKey}>{value}</td>;

                      case 'date':
                      default:
                        // Format: "2024-01-15"
                        return <td key={cellKey}>{formatDate(value)}</td>;
                    }
                  }

                  if (field.type === "lead_age") {
                    return (
                      <td key={cellKey}>
                        {calculateAgeInDaysOfLeads(value)}
                      </td>
                    );
                  }

                  // Handle relation type - display the label field
                  if (field.type === "relation") {
                    if (!value) {
                      return <td key={cellKey}>N/A</td>;
                    }

                    // ✅ If value is an array (multiple relations)
                    if (Array.isArray(value)) {
                      const displayValue = value
                        .map((item) => {
                          if (typeof item === "object") {
                            return (
                              item?.[field.getOptionLabel] ||
                              item?.displayName ||
                              item?.name ||
                              item?._id
                            );
                          }
                          return item;
                        })
                        .join(", ");

                      return <td key={cellKey}>{displayValue || "N/A"}</td>;
                    }

                    // ✅ If value is a single populated object
                    if (typeof value === "object") {
                      const displayValue =
                        value?.[field.getOptionLabel] ||
                        value?.displayName ||
                        value?.name ||
                        value?._id;

                      return <td key={cellKey}>{displayValue || "N/A"}</td>;
                    }

                    // ✅ If value is just an ID string
                    return <td key={cellKey}>{value}</td>;
                  }


                  // Handle enumeration type - display as comma-separated for multiple
                  if (field.type === "enumeration") {
                    if (Array.isArray(value)) {
                      return <td key={cellKey}>{value.join(", ")}</td>;
                    }
                    return <td key={cellKey}>{value ?? "N/A"}</td>;
                  }

                  // Handle boolean type
                  if (field.type === "boolean") {
                    return <td key={cellKey}>{value === true ? "Yes" : value === false ? "No" : "N/A"}</td>;
                  }

                  return (
                    <td key={cellKey}>{value ?? "N/A"}</td>
                  );
                })}

                {showAction && isActionPermission && (
                  <td>
                    <TableAction
                      // Access_Permissions = { create: true, delete: true, edit: true, view: true },
                      isEdit={Access_Permissions?.edit}
                      isCreate={Access_Permissions?.create}
                      isView={isView}
                      isDelete={Access_Permissions?.delete}
                      deleteHandler={deleteHandler}
                      editLink={EDIT_LINK}
                      viewLink={VIEW_LINK}
                      _id={row._id}
                      isSetting={isSetting}
                      SettingList={SettingList}
                      showBlogMessage={showBlogMessage}
                      data={row}
                    />
                  </td>
                )}
              </DraggableRow>
            ))}
          </tbody>
        </table>
      </div>
    </DndProvider>
  );
};

export default withSwal((props) => <AdminTable {...props} />);
