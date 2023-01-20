import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as H from 'history';
import { useHref, useLocation, useMatch, useNavigate, NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PathMatch } from 'react-router';

const isModifiedEvent = (event: React.MouseEvent<any>) =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

interface LinkContainerProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: H.LocationDescriptor<any>;
  replace?: boolean;
  onClick?: (e: React.MouseEvent<any>) => void;
  innerRef?: (e: any) => void;
  activeClassName?: string;
  activeStyle?: React.CSSProperties;
  strict?: boolean;
  exact?: boolean;
  state?: any;
  isActive?: boolean | ((m: PathMatch | null, l: H.Location<any>) => boolean);
}

export function LinkContainer({
  children,
  onClick,
  replace, // eslint-disable-line no-unused-vars
  to,
  activeClassName,
  className,
  activeStyle,
  style,
  isActive: getIsActive,
  state,
  // eslint-disable-next-line comma-dangle
  ...props
}: LinkContainerProps) {

  const path = typeof to === 'object' ? to.pathname || '' : to;
  const navigate = useNavigate();
  const href = useHref(typeof to === 'string' ? { pathname: to } : to);
  const match = useMatch(path);
  const location = useLocation();
  const child = React.Children.only(children) as React.ReactElement;

  const isActive = !!(getIsActive
    ? typeof getIsActive === 'function'
      ? getIsActive(match, location)
      : getIsActive
    : match);

  const handleClick = (event: React.MouseEvent) => {
    if (child?.props.onClick) {
      child.props.onClick(event);
    }

    if (onClick) {
      onClick(event);
    }

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore right clicks
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      navigate(to, {
        replace,
        state,
      });
    }
  };

  return React.cloneElement(child, {
    ...props,
    className: [
      className,
      child.props.className,
      isActive ? activeClassName : null,
    ]
      .join(' ')
      .trim(),
    style: isActive ? { ...style, ...activeStyle } : style,
    href,
    onClick: handleClick,
  });
}

LinkContainer.defaultProps = {
  replace: false,
  activeClassName: 'active',
  onClick: null,
  className: null,
  style: null,
  activeStyle: null,
  isActive: null,
};
