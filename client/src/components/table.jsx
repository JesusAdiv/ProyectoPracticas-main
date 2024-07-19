import React, { useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table"
import { CiSearch } from "react-icons/ci";
import { Input } from "@nextui-org/react";

const Table = ({data, columns, esVistaExtraccion}) => {

    const [sorting, setSorting] = useState([])
    const [filtering, setFiltering] = useState("")

    const tabla = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { sorting, globalFilter:filtering },
        onSortingChange: setSorting,
        onGlobalFilterChange: setFiltering
    });

    return (
        <div className='flex flex-col w-full p-2'>

            {
            !esVistaExtraccion &&
             (
            
             <div className='py-2 w-96'>
                <Input placeholder="Ingresa algun dato de la persona" startContent={<CiSearch className='fill-black'/>}
                value={filtering}
                onChange={e => setFiltering(e.target.value)}>
                    
                </Input>
             </div>
             )
            }
            <table className="text-left text-md font-light dark:text-white py-2">
                <thead className="font-medium dark:border-white/10 bg-secondary-100">
                    {tabla.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {
                                headerGroup.headers.map(header => (
                                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                        <div>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {
                                                { 'asc': "  ↑", 'desc': "  ↓" }[header.column.getIsSorted() ?? null]
                                            }
                                        </div>
                                    </th>

                                ))
                            }
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {
                        tabla.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {
                                    row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="border-b border-neutral-200 dark:border-white/10 py-1">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }

                </tbody>
            </table>
        </div>
    )
}

export default Table