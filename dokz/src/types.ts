export type DokzTableOfContents = {
    depth: number
    slug?: string
    title?: string
    children: DokzTableOfContents[]
}
