import React, { useState, CSSProperties } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import { mdx } from '@mdx-js/react'
import { Box, Button, useClipboard, useColorMode } from '@chakra-ui/core'
import * as ReactIcons from 'react-icons/md'
import { Flex, Stack, Divider } from '@chakra-ui/core'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { Resizable } from 're-resizable'
import { useDokzConfig } from '../provider'
import { Playground } from './Playground'
export { Playground } from './Playground'

// const highlightStyle = {
//   padding: 20,
//   fontSize: 14,
//   overflow: "auto",
//   lineHeight: "1.5",
//   fontFamily: "Menlo,monospace",
// };

export const Code = ({ children, className, live, ...rest }) => {
    // console.log({rest, live})
    const { colorMode } = useColorMode()
    let { prismTheme, playgroundScope } = useDokzConfig()

    const code = children.trim()
    const language = className && className.replace(/language-/, '')
    const { onCopy, hasCopied } = useClipboard(code)

    if (live) {
        return (
            <Playground
                scope={{
                    ...playgroundScope,
                    mdx,
                }}
                className={className}
                theme={prismTheme[colorMode]}
                children={children}
                {...rest}
            />
        )
    }
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
                        pt='30px'
                        borderRadius='8px'
                        as='pre'
                        className={className}
                        style={{ ...style }}
                        overflowX='auto'
                    >
                        <Box opacity={.6} fontSize='14px' position='absolute' right='40px' top='10px'>
                            {language}
                        </Box>
                        <CopyButton
                            onClick={onCopy}
                            hasCopied={hasCopied}
                            position='absolute'
                            top='10px'
                            right='10px'
                        />
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line, key: i })}>
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
            size='18px'
            as={hasCopied ? FiCheck : FiCopy}
            {...props}
        />
    )
}
