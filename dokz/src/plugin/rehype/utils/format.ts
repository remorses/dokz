import * as prettier from 'prettier'

export const formatter = (code: string) => {
    try {
        return prettier.format(code, {
            parser: 'babel',
            semi: false,
            singleQuote: true,
            trailingComma: 'all',
        } as any)
    } catch (e) {
        console.error('could not format code, ' + String(e))
        return code
    }
}
