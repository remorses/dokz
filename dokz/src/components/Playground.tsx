import React, { useState, CSSProperties, useEffect, Fragment } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import { mdx } from '@mdx-js/react'
import { Box, Button, useClipboard, useColorMode } from '@chakra-ui/core'
import * as ReactIcons from 'react-icons/md'
import { Flex, Stack, Divider } from '@chakra-ui/core'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { Resizable } from 're-resizable'
import { useDokzConfig } from '../provider'
import Frame from 'react-frame-component'
import IframeResizer from 'iframe-resizer-react'

import { CopyButton } from './Code'
const CLEAR_PADDING = `<style> body { padding: 0; margin: 0; width: 100% }  </style>`
const INITIAL_IFRAME_CONTENT = `<!DOCTYPE html><html><head> ${CLEAR_PADDING} </head><body><div></div></body></html>`

export const Playground = ({
    className,
    theme,
    children,
    scope,
    iframe = true,
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
                    maxWidth='100%'
                    borderWidth='1px'
                    // borderColor='inherit'
                    borderRadius='8px'
                    overflow='hidden'
                    height='auto'
                    shadow='lg'
                    spacing='0px'
                    isInline
                >
                    <Stack maxWidth='100%' spacing='0px' flex='1'>
                        {previewEnabled && editorBar}
                        {!showCode && (
                            <Box
                                // height='auto'
                                display='block'
                                // minHeight='100%'
                                width='100%'
                                maxWidth='100%'
                                as={iframe ? IframeWrapper : Fragment}
                            >
                                <Box
                                    as={LivePreview}
                                    fontFamily='body'
                                    p='0px'
                                    height='auto'
                                    w='100%'
                                    maxWidth='100%'
                                    overflow='hidden'
                                    // {...props}
                                />
                            </Box>
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

const liveErrorStyle: CSSProperties = {
    fontFamily: 'Menlo, monospace',
    fontSize: 14,
    padding: '1em',
    overflowX: 'auto',
    color: 'white',
    backgroundColor: 'red',
}

const liveEditorStyle: CSSProperties = {
    fontSize: 14,
    overflowX: 'auto',
    margin: 0,
    fontFamily: 'Menlo,monospace',
    overflow: 'hidden',
    padding: '20px',
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

interface IFrame {
    node: HTMLIFrameElement
}

export const IframeWrapper = ({ children, style, ...rest }) => {
    const [height, setHeight] = useState(500)
    const iframeRef: React.RefObject<IFrame> = React.createRef()
    const handleResize = (iframe: React.RefObject<IFrame>) => {
        if (
            iframe.current &&
            iframe.current.node.contentDocument &&
            iframe.current.node.contentDocument.body.scrollHeight !== 0
        ) {
            setHeight(iframe.current.node.contentDocument.body.scrollHeight)
        }
    }
    useEffect(() => handleResize(iframeRef), [children])
    return (
        <Frame
            style={{
                ...style,
                height,
            }}
            ref={iframeRef}
            initialContent={INITIAL_IFRAME_CONTENT}
            onLoad={() => handleResize(iframeRef)}
        >
            {children}
        </Frame>
    )
}
