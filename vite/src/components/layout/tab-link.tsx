'use client'

/**
 * Navbar link components. TabLink is a single tab in the tab bar (active tab
 * gets a 2px bottom indicator). NavbarPrimaryLink is the primary CTA pill.
 */

import React from 'react'
import { Link } from '../link.tsx'
import type { TabItem } from '../../site-data.ts'
import type { HolocronConfig } from '../../config.ts'
import { Icon, resolveIconColor } from '../icon.tsx'
import { GitHubStars } from './github-stars.tsx'

export function TabLink({ tab, isActive }: { tab: TabItem; isActive: boolean }) {
  const isExternal = tab.href.startsWith('http')
  const tabClassName = 'slot-tab no-underline inline-flex items-center gap-1.5 font-[475] [font-family:var(--font-sans)] transition-colors duration-150'
  const tabStyle = {
    color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
  }
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) {
      e.currentTarget.style.color = 'var(--foreground)'
      const indicator = e.currentTarget.querySelector<HTMLElement>('[data-tab-indicator]')
      if (indicator) {
        indicator.style.backgroundColor = 'var(--muted-foreground)'
      }
    }
  }
  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) {
      e.currentTarget.style.color = 'var(--muted-foreground)'
      const indicator = e.currentTarget.querySelector<HTMLElement>('[data-tab-indicator]')
      if (indicator) {
        indicator.style.backgroundColor = 'transparent'
      }
    }
  }
  const indicator = (
    <div
      data-tab-indicator
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '2px',
        backgroundColor: isActive ? 'var(--foreground)' : 'transparent',
        borderRadius: '1px',
        transition: 'background-color 0.15s ease',
      }}
    />
  )

  return (
    <Link
      href={tab.href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={tabClassName}
      style={tabStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Icon icon={tab.icon} size={14} color={resolveIconColor(tab.iconColor)} />
      {tab.label}
      {isExternal && <span className='opacity-50'>↗</span>}
      {indicator}
    </Link>
  )
}

/** Primary navbar CTA: filled rounded pill (desktop navbar + mobile drawer). */
export function NavbarPrimaryLink({
  primary,
  githubStars,
}: {
  primary: NonNullable<HolocronConfig['navbar']['primary']>
  githubStars: Promise<Record<string, number>> | undefined
}) {
  const isExternal = primary.href.startsWith('http')
  return (
    <Link
      href={primary.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={primary.label}
      className='slot-navbar-primary no-underline inline-flex h-7.5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground/8 px-3.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-foreground/12 active:translate-y-px'
    >
      <Icon icon={primary.icon} size={14} color={resolveIconColor(primary.iconColor)} />
      <span>{primary.label}</span>
      {primary.type === 'github' && githubStars && <GitHubStars starsPromise={githubStars} href={primary.href} />}
    </Link>
  )
}
