import {
    Button,
    Checkbox,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
    SortDescriptor,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@nextui-org/react'
import { gql } from 'graphql-request'
import { useFetch } from '../fetcher'
import { useRef, useState } from 'react'

export default function Dashboard() {
    const [fakeLoading, setFakeLoading] = useState(false)
    const [searchDesriptor, setSearchDesriptor] = useState<SortDescriptor | undefined>()
    const [editingRow, setEditingRow] = useState(null as number | null)

    const requestMiners = gql`
        query Miners {
            getMiners {
                miners {
                    id
                    model
                    hashrate
                    id
                    createdAt
                    updatedAt
                    coolingType
                    miningCoin
                    miningAlgorithm
                    isTopMiner
                    hashrate
                    image
                    manufacturer
                    status
                    minTradeCount
                    title
                    weight
                    powerConsumption
                }
                columns
                columnsLocalized
            }
        }
    `
    const { data, loading } = useFetch<{
        getMiners: {
            miners: {
                id: string
                model: string
                hashrate: number
                createdAt: string
                updatedAt: string
                coolingType: string
                miningCoin: string
                miningAlgorithm: string
                isTopMiner: boolean
                image: string
                manufacturer: string
                status: string
                minTradeCount: number
                title: string
                weight: number
                powerConsumption: number
            }[]
            columns: string[]
            columnsLocalized: string[]
        }
    }>({
        document: requestMiners,
    })
    type Row = NonNullable<typeof data>['getMiners']['miners'][number]

    const renderCell = (row: Row, columnKey: keyof Row, i) => {
        const thisEditing = i === editingRow

        switch (columnKey) {
            case 'isTopMiner': {
                return <Chip color={row[columnKey] ? 'success' : 'danger'}>{row[columnKey] ? 'Топ-майнер' : '-'}</Chip>
            }
            case 'Действия' as any: {
                return (
                    <div className="flex gap-1">
                        {!editingRow ? (
                            <Button
                                onClick={() => {
                                    setEditingRow(i)
                                }}
                            >
                                РЕД.
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    setEditingRow(null)
                                }}
                            >
                                X
                            </Button>
                        )}
                    </div>
                )
            }
            default: {
                if (thisEditing) {
                    return <Input defaultValue={row[columnKey]?.toString()} />
                } else {
                    return row[columnKey]
                }
            }
        }
    }

    if (searchDesriptor && data) {
        data['originalRows'] ??= data.getMiners.miners
        data.getMiners.miners = data['originalRows'].toSorted((a, b) => {
            // const colIndex = data.titles.indexOf(searchDesriptor.column?.toString()!)
            // if (colIndex === -1) return 0
            // const aVal = a[colIndex + 1]
            // const bVal = b[colIndex + 1]
            // if (aVal === bVal) return 0
            // const score = searchDesriptor.direction === 'ascending' ? 1 : -1
            // if (!isNaN(aVal) && !isNaN(bVal)) {
            //     return (aVal - bVal) * score
            // }
            // return aVal.toString().localeCompare(bVal.toString()) * score
        })
    }

    const columns = data?.getMiners.columns ? ['Действия', ...data?.getMiners.columns] : []
    return (
        <div className="flex flex-col items-center justify-center min-h-[100vh]">
            {/* <div className="max-w-[100vw]"> */}
            <div className="w-full">
                <div className="min-h-[400px]">
                    {loading ? (
                        <div>
                            <Spinner />
                        </div>
                    ) : (
                        <Table
                            isStriped
                            isHeaderSticky
                            onSortChange={x => {
                                console.log(x)
                                setFakeLoading(true)
                                setTimeout(() => {
                                    setFakeLoading(false)
                                    setSearchDesriptor(x)
                                })
                            }}
                        >
                            <TableHeader>
                                {columns.map(x => (
                                    <TableColumn key={x} allowsSorting allowsResizing>
                                        {data!.getMiners.columnsLocalized[data!.getMiners.columns.indexOf(x)]! ?? x}
                                    </TableColumn>
                                ))}
                            </TableHeader>
                            <TableBody items={data?.getMiners.miners ?? []} isLoading={loading || fakeLoading}>
                                {row => (
                                    <TableRow
                                        key={row.id}
                                        style={
                                            {
                                                // red with opacity 0.3
                                                // background: highlightCell === String(row.id) ? 'rgba(142, 255, 111, 0.283)' : undefined,
                                            }
                                        }
                                    >
                                        {columnKey => (
                                            <TableCell key={columnKey}>{renderCell(row, columnKey as any, data!.getMiners.miners.indexOf(row))}</TableCell>
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
            <Divider className="my-4" />
            <EditingPanel />
        </div>
    )
}

const EditingPanel = () => {
    const requestFields = gql`
        query Fields {
            getMinerEditor {
                fields {
                    name
                    type
                    label
                    choices
                    required
                    multiline
                    disabled
                    disabledReason
                }
                categories {
                    name
                    values
                }
            }
        }
    `

    const editingData = useRef<Record<string, any>>()

    const { data, loading } = useFetch<{
        getMinerEditor: {
            fields: {
                name: string
                type: string
                label: string
                choices?: string[]
                required?: boolean
                multiline?: boolean
                disabled?: boolean
                disabledReason?: string
            }[]
            categories: {
                name: string
                values: string[]
            }[]
        }
    }>({
        document: requestFields,
    })

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
            <h4 className="font-medium text-medium">Редактирование майнера</h4>
            <div className="flex flex-wrap gap-4">
                {(data?.getMinerEditor.categories ?? []).map(({ name, values }) => (
                    <div key={name} className="flex flex-col">
                        <h4 className="font-medium text-medium mb-2">{name}</h4>
                        <div className="flex flex-wrap gap-4 items-center">
                            {values.map(key => {
                                const {
                                    name,
                                    type,
                                    label,
                                    choices,
                                    required = true,
                                    multiline,
                                    disabled,
                                    disabledReason,
                                } = data?.getMinerEditor.fields.find(x => x.name === key)!
                                return (
                                    <div key={key} className="flex flex-col">
                                        {choices ? (
                                            <Select
                                                label={label}
                                                className="min-w-[200px]"
                                                defaultSelectedKeys={new Set([editingData[key] ?? choices[0]])}
                                                onSelectionChange={keys => {
                                                    const newVal = [...keys][0] as string
                                                    editingData[key] = newVal
                                                }}
                                                isRequired={required}
                                                items={choices.map(x => ({ label: x, value: x }))}
                                                disabled={disabled}
                                                errorMessage={disabledReason}
                                            >
                                                {x => {
                                                    return <SelectItem key={x.value}>{x.label}</SelectItem>
                                                }}
                                            </Select>
                                        ) : type === 'boolean' ? (
                                            <Checkbox
                                                defaultSelected={editingData[key]}
                                                onValueChange={e => (editingData[key] = e)}
                                                required={required}
                                                disabled={disabled}
                                                // errorMessage={disabledReason}
                                            >
                                                {label}
                                            </Checkbox>
                                        ) : (
                                            <Input
                                                label={label}
                                                type={type === 'string' ? 'text' : type}
                                                defaultValue={editingData[key]}
                                                onChange={e => (editingData[key] = e.target.value)}
                                                required={required}
                                                // multiline={multiline}
                                                disabled={disabled}
                                                errorMessage={disabledReason}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
