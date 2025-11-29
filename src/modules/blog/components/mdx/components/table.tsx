/**
 * @name Table
 * @description Renders a table from MDX table data structure. Converts MDX table data format into semantic HTML table elements.
 */
interface TableProps {
    data: {
        headers: string[]
        rows: string[][]
    }
}

export function Table({ data }: TableProps) {
    let headers = data.headers.map((header, index) => <th key={index}>{header}</th>)
    let rows = data.rows.map((row, index) => (
        <tr key={index}>
            {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
            ))}
        </tr>
    ))

    return (
        <table>
            <thead>
                <tr>{headers}</tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    )
}

