/* eslint-disable react/no-array-index-key */
import React, { CSSProperties, ReactElement } from 'react'
import { SkeletonThemeContext } from './SkeletonThemeContext'
import { SkeletonStyleProps } from './SkeletonStyleProps'

const defaultEnableAnimation = true

// For performance & cleanliness, don't add any inline styles unless we have to
function styleOptionsToCssProperties({
    baseColor,
    highlightColor,

    width,
    height,
    borderRadius,
    circle,

    direction,
    duration,
    enableAnimation = defaultEnableAnimation,
}: SkeletonStyleProps & { circle: boolean }): CSSProperties {
    const style: CSSProperties & Record<`--${string}`, string> = {}

    if (direction === 'rtl') style['--animation-direction'] = 'reverse'
    if (typeof duration === 'number') style['--animation-duration'] = `${duration}s`
    if (!enableAnimation) style['--pseudo-element-display'] = 'none'

    if (typeof width === 'string' || typeof width === 'number') style.width = width
    if (typeof height === 'string' || typeof height === 'number') style.height = height

    if (typeof borderRadius === 'string' || typeof borderRadius === 'number')
        style.borderRadius = borderRadius

    if (circle) style.borderRadius = '50%'

    if (typeof baseColor !== 'undefined') style['--base-color'] = baseColor
    if (typeof highlightColor !== 'undefined') style['--highlight-color'] = highlightColor

    return style
}

export interface SkeletonProps extends SkeletonStyleProps {
    count?: number
    wrapper?: React.FunctionComponent

    className?: string
    containerClassName?: string
    containerTestId?: string

    circle?: boolean
    style?: CSSProperties
}

export function Skeleton({
    count = 1,
    wrapper: Wrapper,

    className: customClassName,
    containerClassName,
    containerTestId,

    circle = false,

    style: styleProp,
    ...originalPropsStyleOptions
}: SkeletonProps): ReactElement {
    const contextStyleOptions = React.useContext(SkeletonThemeContext)

    const propsStyleOptions = { ...originalPropsStyleOptions }

    // DO NOT overwrite style options from the context if `propsStyleOptions`
    // has properties explicity set to undefined
    for (const [key, value] of Object.entries(originalPropsStyleOptions)) {
        if (typeof value === 'undefined') {
            delete propsStyleOptions[key as keyof typeof propsStyleOptions]
        }
    }

    // Props take priority over context
    const styleOptions = {
        ...contextStyleOptions,
        ...propsStyleOptions,
        circle,
    }

    // `styleProp` has the least priority out of everything
    const style = {
        ...styleProp,
        ...styleOptionsToCssProperties(styleOptions),
    }

    let className = 'react-loading-skeleton'
    if (customClassName) className += ` ${customClassName}`

    const inline = styleOptions.inline ?? false

    const elements: ReactElement[] = []

    // Without the <br />, the skeleton lines will all run together if
    // `width` is specified
    for (let i = 0; i < count; i++) {
        const skeletonSpan = (
            <span className={className} style={style} key={i}>
                &zwnj;
            </span>
        )

        if (inline) {
            elements.push(skeletonSpan)
        } else {
            elements.push(
                <React.Fragment key={i}>
                    {skeletonSpan}
                    <br />
                </React.Fragment>
            )
        }
    }

    return (
        <span
            className={containerClassName}
            data-testid={containerTestId}
            aria-live="polite"
            aria-busy={styleOptions.enableAnimation ?? defaultEnableAnimation}
        >
            {Wrapper
                ? elements.map((el, i) => <Wrapper key={i}>{el}</Wrapper>)
                : elements}
        </span>
    )
}
