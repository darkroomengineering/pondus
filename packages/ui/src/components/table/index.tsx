import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
	children: ReactNode
}

/**
 * Table component for data display
 *
 * @example
 * ```tsx
 * <Table>
 *   <Table.Header>
 *     <Table.Row>
 *       <Table.Head>Name</Table.Head>
 *       <Table.Head>Count</Table.Head>
 *     </Table.Row>
 *   </Table.Header>
 *   <Table.Body>
 *     <Table.Row>
 *       <Table.Cell>Item</Table.Cell>
 *       <Table.Cell>123</Table.Cell>
 *     </Table.Row>
 *   </Table.Body>
 * </Table>
 * ```
 */
export function Table({ className, children, ...props }: TableProps) {
	return (
		<div className="w-full overflow-auto">
			<table
				className={cn('w-full text-sm', className)}
				{...props}
			>
				{children}
			</table>
		</div>
	)
}

function TableHeader({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return (
		<thead className={cn('border-b border-[var(--border)]', className)} {...props}>
			{children}
		</thead>
	)
}

function TableBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return (
		<tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
			{children}
		</tbody>
	)
}

function TableRow({ className, children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
	return (
		<tr
			className={cn(
				'border-b border-[var(--border)] transition-colors hover:bg-[var(--card-hover)]',
				className
			)}
			{...props}
		>
			{children}
		</tr>
	)
}

function TableHead({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
	return (
		<th
			className={cn(
				'h-10 px-4 text-left align-middle font-medium text-[var(--muted)]',
				className
			)}
			{...props}
		>
			{children}
		</th>
	)
}

function TableCell({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
	return (
		<td
			className={cn('px-4 py-3 align-middle text-[var(--foreground)]', className)}
			{...props}
		>
			{children}
		</td>
	)
}

Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell
