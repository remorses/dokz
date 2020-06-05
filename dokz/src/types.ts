export type DoczTableOfContents = {
    depth: number
    slug?: string
    title?: string
    children: DoczTableOfContents[]
}
