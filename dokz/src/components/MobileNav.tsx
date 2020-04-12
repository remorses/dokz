import {
    Drawer,
    DrawerBody,
    IconButton,
    useDisclosure,
    DrawerOverlay,
    DrawerContent,
    Stack,
} from '@chakra-ui/core'
import React, { useEffect } from 'react'
import { MdDehaze } from 'react-icons/md'
import { SideNav } from './SideNav'
import { useRouter } from 'next/router'

const useRouteChanged = (callback) => {
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = (url) => {
            callback()
            console.log('App is changing to: ', url)
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [router.events, callback])
}

const MobileNav = (props) => {
    const { isOpen, onToggle, onClose } = useDisclosure()
    useRouteChanged(onClose)

    return (
        <>
            <IconButton
                display={{ sm: 'inline-flex', md: 'none' }}
                aria-label='Navigation Menu'
                fontSize='20px'
                variant='ghost'
                icon={MdDehaze}
                onClick={onToggle}
                marginRight='-16px'
            />
            <Drawer
                size='xs'
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent height='100vh' overflowY='scroll' >
                    <DrawerBody p={0}>
                        <Stack  >
                            <SideNav {...props} />
                        </Stack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default MobileNav
