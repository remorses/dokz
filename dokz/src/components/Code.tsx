/** @jsx jsx */

import { css, jsx } from '@emotion/core'
import { Box, useClipboard, useColorMode } from '@chakra-ui/core'
import Highlight, { defaultProps } from 'prism-react-renderer'
import React, { useEffect } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import { useDokzConfig } from '../provider'
import { CODE_FONT } from './support'

export const Code = ({ children, className, ...rest }) => {
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
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line, key: i })}>
                                <Box
                                    userSelect='none'
                                    display='inline-block'
                                    // position='absolute'
                                    textAlign='right'
                                    minW='40px'
                                    opacity={0.4}
                                    pr='30px'
                                >
                                    {i + 1}
                                </Box>
                                {line.map((token, key) => (
                                    <span
                                        key={key}
                                        {...getTokenProps({ token, key })}
                                    />
                                ))}
                            </div>
                        ))}
                    </Box>
                )}
            </Highlight>
        </Box>
    )
}

export const CopyButton = (props) => {
    const { hasCopied } = props
    return (
        <Box
            cursor='pointer'
            m='0'
            style={{
                strokeWidth: '2px',
            }}
            opacity={0.7}
            size='1.1em'
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
