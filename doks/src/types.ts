export type DoksTableOfContents = {
    index: number
    endIndex: number
    map: {
        depth: number
        children: {
            type: 'text'
            value: string
            id: string
            depth: number
            position: any
        }[]
    }[]
}
