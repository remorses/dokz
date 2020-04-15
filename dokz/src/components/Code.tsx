import React, { useState, CSSProperties } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import { mdx } from '@mdx-js/react'
import * as Chakra from '@chakra-ui/core'
import * as ReactIcons from 'react-icons/md'
import { Flex, Stack, Divider } from '@chakra-ui/core'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { Resizable } from 're-resizable'
import { useDokzConfig } from '../provider'

const { Box, Button, useClipboard, useColorMode } = Chakra

export const liveEditorStyle: CSSProperties = {
    fontSize: 14,
    overflowX: 'auto',
    margin: 0,
    fontFamily: 'Menlo,monospace',
    overflow: 'hidden',
    padding: '20px',
}

// const highlightStyle = {
//   padding: 20,
//   fontSize: 14,
//   overflow: "auto",
//   lineHeight: "1.5",
//   fontFamily: "Menlo,monospace",
// };

export const liveErrorStyle: CSSProperties = {
    fontFamily: 'Menlo, monospace',
    fontSize: 14,
    padding: '1em',
    overflowX: 'auto',
    color: 'white',
    backgroundColor: 'red',
}

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
                    ...Chakra,
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

const CopyButton = (props) => {
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

export const Playground = ({
    className,
    theme,
    children,
    scope,
    mountStylesheet = false,
    previewEnabled = true,
    ...props
}) => {
    const [editorCode, setEditorCode] = useState(children.trim())
    const language = className && className.replace(/language-/, '')
    const [showCode, setShowCode] = useState(!previewEnabled)
    const { onCopy, hasCopied } = useClipboard(editorCode)
    const [width, setWidth] = React.useState('100%')
    const resizableProps = getResizableProps(width, setWidth)
    const liveProviderProps = {
        theme,
        language,
        code: editorCode,
        transformCode: (code) => '/** @jsx mdx */' + code,
        scope,
        // noInline: true,
        ...props,
    }

    const handleCodeChange = (newCode) => setEditorCode(newCode.trim())

    const editorBar = (
        <>
            <Stack
                spacing='20px'
                h='auto'
                w='100%'
                isInline
                flexDir='row'
                align='center'
                p='10px'
            >
                <Box h='1' flex='1' />
                <Button
                    variant={!showCode ? 'solid' : 'unstyled'}
                    onClick={() => setShowCode(false)}
                    size='sm'
                >
                    preview
                </Button>
                <Button
                    variant={showCode ? 'solid' : 'unstyled'}
                    onClick={() => setShowCode(true)}
                    size='sm'
                >
                    Code
                </Button>
                <CopyButton
                    hasCopied={hasCopied}
                    style={{ strokeWidth: '2px' }}
                    onClick={onCopy}
                />
            </Stack>
            <Divider m='0' />
        </>
    )

    return (
        <Resizable
            {...resizableProps}
            handleComponent={{ right: <HandleComponent height='100%' /> }}
        >
            <LiveProvider {...liveProviderProps}>
                <Stack
                    w='100%'
                    borderWidth='1px'
                    // borderColor='inherit'
                    borderRadius='8px'
                    overflow='hidden'
                    shadow='lg'
                    spacing='0px'
                    isInline
                >
                    <Stack spacing='0px' flex='1'>
                        {previewEnabled && editorBar}
                        {!showCode && (
                            <Box
                                as={LivePreview}
                                fontFamily='body'
                                p='0px'
                                w='100%'
                                overflow='hidden'
                                // {...props}
                            />
                        )}
                        {showCode && (
                            <LiveEditor
                                onChange={handleCodeChange}
                                style={liveEditorStyle}
                            />
                        )}
                        <LiveError style={liveErrorStyle} />
                    </Stack>
                </Stack>
            </LiveProvider>
        </Resizable>
    )
}

const HandleComponent = (props) => {
    const { colorMode } = useColorMode()
    return (
        <Stack
            width='20px'
            py='10px'
            align='center'
            justify='center'
            borderWidth='1px'
            // borderColor='gray.300'
            bg={{ light: 'gray.100', dark: 'gray.800' }[colorMode]}
            borderRadius='0 4px 4px 0'
            {...props}
        >
            <Box
                width='8px'
                height='40px'
                borderLeft='2px solid'
                borderRight='2px solid'
                borderColor='gray.300'
            />
        </Stack>
    )
}

const getResizableProps = (width, setWidth) => ({
    minWidth: 260,
    maxWidth: '100%',
    size: {
        width: width,
        height: 'auto',
    },
    style: {
        margin: 0,
        marginRight: 'auto',
    },
    enable: {
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
    },
    onResizeStop: (e, direction, ref) => {
        setWidth(ref.style.width)
    },
})
