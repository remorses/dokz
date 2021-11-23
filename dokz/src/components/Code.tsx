

import { css, jsx } from '@emotion/react'
import { Box, useClipboard, useColorMode } from '@chakra-ui/react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import React, { useEffect } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import { useDokzConfig } from '../provider'
import { CODE_FONT } from './support'

export const Code = ({
    children,
    className,
    hideLinesNumbers = false,
    ...rest
}) => {
    // console.log({rest, live})
    const { colorMode } = useColorMode()
    let { prismTheme } = useDokzConfig()

    const code = typeof children === 'string' ? children.trim() : ''
    const language = className && className.replace(/language-/, '')
    const { onCopy, hasCopied } = useClipboard(code)

    useOldPlaygroundWarning(rest)

    return (
        <Box position='relative'>
            <Highlight
                {...defaultProps}
                theme={prismTheme[colorMode]}
                code={code}
                language={language}
            >
                {({
                    className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps,
                }) => (
                    <Box
                        p='20px'
                        // pt='30px'
                        borderRadius='8px'
                        as='pre'
                        fontFamily={CODE_FONT}
                        fontSize='0.9em'
                        className={'dokz codeContainer ' + className}
                        style={{ ...style }}
                        // boxShadow='0 0 10px 20px rgba(0,0,0,0.01)'
                        shadow='sm'
                        overflowX='auto'
                    >
                        <Box
                            className='dokz hiddenInPrint'
                            opacity={0.6}
                            fontSize='0.9em'
                            position='absolute'
                            right='40px'
                            top='8px'
                        >
                            {language}
                        </Box>
                        <CopyButton
                            className='dokz hiddenInPrint'
                            onClick={onCopy}
                            hasCopied={hasCopied}
                            position='absolute'
                            top='10px'
                            right='10px'
                        />
                        <Box
                            flexShrink={0}
                            overflow='visible'
                            // direction='column'
                            // spacing='0'
                            // p='20px'
                            // pt='30px'
                            // borderRadius='8px'
                            as='pre'
                            fontFamily={CODE_FONT}
                            // fontSize='0.9em'
                            // style={{ ...style }}
                            // overflowX='auto'
                            fontWeight='500'
                            className={className}
                            style={style}

                            // {...rest}
                        >
                            {tokens.map((line, i) => (
                                <div
                                    key={i}
                                    {...getLineProps({ line, key: i })}
                                >
                                    {!hideLinesNumbers && (
                                        <Box
                                            d='inline-block'
                                            userSelect='none'
                                            position='absolute'
                                            left='0px'
                                            textAlign='right'
                                            minW='40px'
                                            opacity={0.4}
                                            pr='40px'
                                            pl='20px'
                                        >
                                            {i + 1}
                                        </Box>
                                    )}
                                    <Box display='inline-block' w='50px' />
                                    {line.map((token, key) => (
                                        <span
                                            key={key}
                                            {...getTokenProps({ token, key })}
                                        />
                                    ))}
                                </div>
                            ))}
                        </Box>
                    </Box>
                )}
            </Highlight>
        </Box>
    )
}

export const CopyButton = ({ hasCopied, ...props }) => {
    return (
        <Box
            cursor='pointer'
            m='0'
            style={{
                strokeWidth: '2px',
            }}
            opacity={0.7}
            boxSize='1em'
            as={hasCopied ? FiCheck : FiCopy}
            {...props}
        />
    )
}

function useOldPlaygroundWarning(rest) {
    useEffect(() => {
        if (!!rest.live) {
            console.warn(
                'To use the playground now you must import the explicitly playground component!\nread more at http://localhost:3000/docs/general/preview-react-components',
            )
        }
    }, [])
}
