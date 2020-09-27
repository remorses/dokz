import {
    Box,
    Button,
    Divider,
    Stack,
    useClipboard,
    useColorMode,
} from '@chakra-ui/core'
import flatten from 'lodash/fp/flatten'
import { Resizable } from 're-resizable'
import React, {
    CSSProperties,
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from 'react'
import Frame from 'react-frame-component'
import {
    LiveEditor,
    LiveError,
    LivePreview,
    LiveProvider,
    LiveProviderProps,
} from 'react-live'
import { useDokzConfig } from '../provider'
import { CopyButton } from './Code'
import { mdx } from '@mdx-js/react'
import { CODE_FONT } from './support'



export const Playground = ({
    className,
    children = null as ReactNode,
    code,
    scope,
    iframe = false,
    previewEnabled = true,
    ...rest
}) => {
    let { prismTheme } = useDokzConfig()
    const [editorCode, setEditorCode] = useState(code)
    const { colorMode } = useColorMode()
    const language = className && className.replace(/language-/, '')
    const [showCode, setShowCode] = useState(!previewEnabled)
    const { onCopy, hasCopied } = useClipboard(editorCode)
    const [width, setWidth] = React.useState('100%')
    const [_, forceRender] = useState('')
    const resizableProps = getResizableProps(width, setWidth)

    const BUTTON_BG = colorMode === 'light' ? 'gray.100' : 'whiteAlpha.200'

    const liveProviderProps: LiveProviderProps = {
        theme: prismTheme[colorMode],
        language,

        code: editorCode,
        // transformCode: (code) => '/** @jsx mdx */' + code,
        scope: { ...scope, mdx },
        // noInline: true,
        // ...props,
    }

    const handleCodeChange = useCallback(
        (newCode) => setEditorCode(newCode.trim()),
        [setEditorCode],
    )

    const editorBar = (
        <>
            <Stack
                spacing='20px'
                h='auto'
                w='100%'
                isInline
                flexDir='row'
                align='center'
                bg={{ light: 'white', dark: 'gray.700' }[colorMode]}
                p='10px'
            >
                <Box h='1' flex='1' />
                <Button
                    transition='background 300ms'
                    bg={!showCode ? BUTTON_BG : 'transparent'}
                    onClick={() => setShowCode(false)}
                    size='sm'
                >
                    Preview
                </Button>
                <Button
                    transition='background 300ms'
                    bg={showCode ? BUTTON_BG : 'transparent'}
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
    const livePreview = (
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
    )
    return (
        <Box my='20px' {...rest}>
            <Resizable
                {...resizableProps}
                handleComponent={{ right: <HandleComponent height='100%' /> }}
            >
                <LiveProvider {...(liveProviderProps as any)}>
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
                        <Stack
                            maxWidth='100%'
                            height='100%'
                            spacing='0px'
                            flex='1'
                        >
                            {previewEnabled && editorBar}
                            <Stack
                                flex='1'
                                maxW='100%'
                                minW='100%'
                                display={!showCode ? 'block' : 'none'}
                            >
                                {iframe ? (
                                    <IframeWrapper onMount={forceRender}>
                                        {livePreview}
                                    </IframeWrapper>
                                ) : (
                                    livePreview
                                )}
                            </Stack>
                            {showCode && (
                                <LiveEditor
                                    onChange={handleCodeChange}
                                    style={liveEditorStyle}
                                />
                            )}
                            {<LiveError style={liveErrorStyle} />}
                        </Stack>
                    </Stack>
                </LiveProvider>
            </Resizable>
        </Box>
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
    fontSize: '0.9em',
    overflowX: 'auto',
    margin: 0,
    fontFamily: CODE_FONT,
    overflow: 'hidden',
    // padding: '20px',
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
            bg={{ light: 'gray.100', dark: 'gray.700' }[colorMode]}
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
        height: 'auto',
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

function getEmotionStyle() {
    const css = flatten(
        [
            ...(document.querySelectorAll('[data-emotion]') as any),
        ].map(({ sheet }) => [...sheet.cssRules].map((rules) => rules.cssText)),
    ).join('\n')
    const style = document.createElement('style')
    style.type = 'text/css'
    style.appendChild(document.createTextNode(css))
    style.setAttribute('EmotionExtractedCss', 'true')
    return style
}

const CLEAR_PADDING = `<style> body { padding: 0; margin: 0; width: 100%; height: auto !important; }  </style>`
const INITIAL_IFRAME_CONTENT = `<!DOCTYPE html><html><head> ${CLEAR_PADDING} </head><body><div></div></body></html>`

interface IFrame {
    node: HTMLIFrameElement
}

export const IframeWrapper = ({ children, onMount, style = {}, ...rest }) => {
    const [height, setHeight] = useState(0)
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
    /**
     * Because <iframe> serves content in an isolated browsing context (document environment),
     * Styles in parent browsing context will not be available to <iframe> content,
     * we need to manually copy styles from parent browsing context to <iframe> browsing context
     */

    const copyStyles = (ref: React.RefObject<any>) => {
        const iFrameNode = ref.current?.node
        if (!iFrameNode?.contentDocument?.body) {
            return
        }
        // Copy <link> elements

        const links = Array.from(document.getElementsByTagName('link'))
        links.forEach((link) => {
            if (link.rel === 'stylesheet') {
                iFrameNode.contentDocument.head.appendChild(
                    link.cloneNode(true),
                )
            }
        })

        // Copy <style> elements
        const styles = Array.from(document.head.getElementsByTagName('style'))
        styles.push(getEmotionStyle())
        styles.forEach((style) => {
            iFrameNode.contentDocument.head.appendChild(style.cloneNode(true))
        })
    }
    useEffect(() => {
        // copyStyles(iframeRef)
        handleResize(iframeRef)
    }, [children])
    useEffect(() => {
        onMount()
    }, [])
    return (
        <Frame
            style={{
                ...style,
                width: '100%',
                height,
            }}
            ref={iframeRef}
            initialContent={INITIAL_IFRAME_CONTENT}
            onLoad={() => {
                copyStyles(iframeRef)
                handleResize(iframeRef)
            }}
        >
            {children}
        </Frame>
    )
}

const sleep = (t) => new Promise((r) => setTimeout(r, t))
