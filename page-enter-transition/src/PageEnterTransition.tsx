/** @jsx jsx */
import React, {
    useState,
    useEffect,
    useMemo,
    useLayoutEffect,
    useCallback,
} from 'react'
import { jsx, css } from '@emotion/core'
import ColorScheme from 'color-scheme'
import { useRouter } from 'next/router'

export const makeStyles = ({ hue = 10, duration: DURATION }) => {
    function step(s, max = DURATION, steps = 5) {
        return max - s * (max / steps)
    }
    var scheme = new ColorScheme()
    const colors = scheme
        .from_hue(hue) // Start the scheme
        .scheme('analogic') // Use the 'triade' scheme, that is, colors
        // selected from 3 points equidistant around
        // the color wheel.
        .variation('light')
        .colors()
        .map((x) => '#' + x)
    // console.log(colors)
    return `
        .top-layer {
            z-index: 4000;
            position: absolute;
            width: 100vw;
            height: 100vh;
            top: -100%;
            left: 0;
            bottom: auto;
            right: 0;
            background: ${colors[0]};
            transition: transform ${DURATION}ms cubic-bezier(0.6, 0.05, 0.4, 1);
            /* opacity: 0.8; */
        }
        .top-layer.active {
            transform: translateY(200vh);
        }
        .top-layer--2 {
            background: ${colors[1]};

            transition-delay: ${step(1)}ms;
        }
        .top-layer--3 {
            background: ${colors[2]};

            transition-delay: ${step(2)}ms;
        }
        .top-layer--4 {
            background: ${colors[3]};

            transition-delay: ${step(3)}ms;
        }
        .top-layer--5 {
            background: ${colors[4]};

            transition-delay: ${step(4)}ms;
        }
    `
}

const CONTAINER_CLASS = 'transition-container'

export const PageEnterTransition = ({ hue = 200, duration = 300 }) => {
    // const setActiveThrottled = useCallback(throttle(setActive, 40), [setActive])
    const router = useRouter()

    const styles = useMemo(() => makeStyles({ hue, duration }), [hue, duration])
    const html = `
        <div class="${CONTAINER_CLASS}">
            <style type="text/css">
            ${styles}
            </style>
            <div class="top-layer"></div>
            <div class="top-layer top-layer--2"></div>
            <div class="top-layer top-layer--3"></div>
            <div class="top-layer top-layer--4"></div>
            <div class="top-layer top-layer--5"></div>
        <div/>
    `
    useLayoutEffect(() => {
        document.body.insertAdjacentHTML('beforeend', html)
        return () => {
            const nodes = document.getElementsByClassName(CONTAINER_CLASS)
            if (nodes.length) {
                document.body.removeChild(nodes[0])
            }
        }
    }, [])

    const animate = useCallback(() => {
        const layerClass = '.top-layer'
        var layers = document.querySelectorAll(layerClass)
        layers.forEach((layer) => {
            layer.classList.toggle('active')
        })
    }, [])

    useEffect(() => {
        // alert(path)
        const handler = () => {
            animate()
        }
        router.events.on('routeChangeStart', handler)
        // Router.events.on('routeChangeCompleted', () => {
        //     setActive(false)
        // })
        return () => {
            return router.events.off('routeChangeStart', handler)
        }
    }, [])

    return null
}
